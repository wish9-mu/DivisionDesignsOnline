import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

console.log("Paymongo webhook function started")

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Webhook payload received:", JSON.stringify(payload))

    const eventType = payload?.data?.attributes?.type
    const checkoutData = payload?.data?.attributes?.data?.attributes
    const reference_number = checkoutData?.reference_number

    // Use service role key since webhooks don't have user authentication
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ── Payment succeeded ────────────────────────────────────────
    if (eventType === 'checkout_session.payment.paid') {
      if (!reference_number) {
        console.warn("No reference_number in paid event, skipping.")
      } else {
        // 1. Fetch the order so we know its line_items
        const { data: order, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('line_items, status')
          .eq('order_code', reference_number)
          .single()

        if (fetchError) {
          console.error('Error fetching order:', fetchError)
          throw fetchError
        }

        // 2. Deduct stock for each item (deferred until payment confirmed)
        if (order?.line_items && Array.isArray(order.line_items)) {
          for (const item of order.line_items) {
            const productId = item.id
            if (!productId) continue

            const { data: productData, error: stockFetchError } = await supabaseAdmin
              .from('products')
              .select('stock')
              .eq('id', productId)
              .single()

            if (stockFetchError) {
              console.error(`Error fetching stock for product ${productId}:`, stockFetchError)
              continue
            }

            const newStock = Math.max(0, (productData?.stock ?? 0) - (item.qty ?? 1))
            const { error: stockUpdateError } = await supabaseAdmin
              .from('products')
              .update({ stock: newStock })
              .eq('id', productId)

            if (stockUpdateError) {
              console.error(`Error updating stock for product ${productId}:`, stockUpdateError)
            }
          }
        }

        // 3. Mark order as Paid
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({ status: 'Paid' })
          .eq('order_code', reference_number)

        if (updateError) {
          console.error('Error updating order status to Paid:', updateError)
          throw updateError
        }

        console.log(`Order ${reference_number} marked as Paid, stock deducted.`)
      }

      // ── Payment failed or checkout session expired ────────────────
    } else if (
      eventType === 'checkout_session.payment.failed' ||
      eventType === 'checkout_session.expired'
    ) {
      if (!reference_number) {
        console.warn(`No reference_number in ${eventType} event, skipping.`)
      } else {
        const { data: order, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('line_items, status')
          .eq('order_code', reference_number)
          .single()

        if (fetchError) {
          console.error('Error fetching order for cancellation:', fetchError)
          throw fetchError
        }

        // Only cancel if still Pending (don't re-cancel or undo a Paid order)
        if (order?.status === 'Pending') {
          const { error: cancelError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Cancelled' })
            .eq('order_code', reference_number)

          if (cancelError) {
            console.error('Error updating order status to Cancelled:', cancelError)
            throw cancelError
          }

          console.log(`Order ${reference_number} marked as Cancelled (${eventType}).`)
        } else {
          console.log(`Order ${reference_number} already has status '${order?.status}', skipping cancellation.`)
        }
      }

    } else {
      console.log(`Unhandled event type: ${eventType}`)
    }

    // Paymongo expects a 200 OK response
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
