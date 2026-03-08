import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_code, amount, line_items, customer_email, customer_name, cancel_url, success_url } = await req.json()

    if (!order_code || !amount) {
      throw new Error('Missing required fields: order_code or amount.')
    }

    const paymongoSecretKey = Deno.env.get('PAYMONGO_SECRET_KEY')
    if (!paymongoSecretKey) {
      throw new Error('Server error: Payment gateway is not configured properly.')
    }

    const paymongoItems = line_items.map((item: any) => ({
      name: item.name,
      quantity: item.qty,
      amount: Math.round(item.price * 100),
      currency: 'PHP',
    }))

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Basic ' + btoa(paymongoSecretKey + ':')
      },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            cancel_url: cancel_url || `${req.headers.get("origin")}/DivisionDesigns/order-forms?cancel=true`,
            line_items: paymongoItems,
            payment_method_types: ['gcash', 'grab_pay', 'paymaya', 'card', 'qrph'],
            reference_number: order_code,
            success_url: success_url || `${req.headers.get("origin")}/DivisionDesigns/order-forms?success=true`,
            billing: {
              name: customer_name,
              email: customer_email
            },
            description: `Payment for Order ${order_code}`
          }
        }
      })
    };

    const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options)
    const data = await response.json()

    if (!response.ok) {
      console.error('Paymongo API error:', data)
      throw new Error(`Paymongo error: ${data.errors?.[0]?.detail || 'Unknown error'}`)
    }

    return new Response(
      JSON.stringify({ checkout_url: data.data.attributes.checkout_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
