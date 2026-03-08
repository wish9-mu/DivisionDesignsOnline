import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

console.log("Paymongo webhook function started")

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Webhook payload received:", JSON.stringify(payload))

    // Handle checkout session completion
    if (payload?.data?.attributes?.type === 'checkout_session.payment.paid') {
      const checkoutData = payload.data.attributes.data.attributes
      const reference_number = checkoutData.reference_number

      if (reference_number) {
        // Use service role key since webhooks don't have user authentication
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data, error } = await supabaseAdmin
          .from('orders')
          .update({ status: 'Paid' })
          .eq('order_code', reference_number)
          .select()

        if (error) {
          console.error('Error updating order status:', error)
          throw error
        }

        console.log(`Order ${reference_number} marked as Paid`)
      }
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
