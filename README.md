## Stripe Gatewayd Inbound Bridge Plugin

Inbound bridge from credit card networks to ripple via Stripe and gatewayd

## Usage ##

The plugin in compatible with the Ripple Gateway Services spec, and implements
the hostmeta and webfinger standards, and provides the bridge payment quote,
bridge payment, and bridge payment status services.

    -> Gatewaydfile
  
    var SripeInboundBridgePlugin = require('stripe-gatewayd-inbound-bridge-plugin');

    module.exports = function(gatewayd) {

      gatewayd.server.use('/stripe', new StripeInboundBridgePlugin({
        stripeApiKey: gatewayd.config.get('STRIPE_API_KEY')
        gatewayd: gatewayd
      }));
    }

Register with Stripe to obtain API credentials, and add them to your gatewayd's config/config.json file.

Then in your web site embed the [Stripe Checkout Widget](https://stripe.com/docs/tutorials/checkout),
which will return to you a token when a user enters their credit card information.


### HOST META

### Webfinger

## Ripple Gateway Services

[Gateway Services Documenation](https://gist.github.com/BobWay/f48e682665c239e75b9a)

The plugin in compatible with the Ripple Gateway Services spec, and implements
the hostmeta and webfinger standards, and provides the bridge payment quote,
bridge payment, and bridge payment status services.

### Bridge Payment Quote


request:
```

GET /bridge/payments/quotes/stevenzeiler@ripple.com/5+USD
{
  "bridge_payments": [{
    "destination_address": "ripple:stevenzeiler",
    "destination_amount": {"amount":"100", "currency":"USD", "issuer":"r12345"},
    "required": {
      "source_address": "stripe:<stripe_token>"
    }
  }]
}
```

### Bridge Payment

Post that token to the gatewayd server at the route you configured:

request:

POST /bridge/payments
```
"bridge_payment": {
  "destination_address": "ripple:stevenzeiler",
  "destination_amount": {"amount":"100", "currency":"USD", "issuer":"r12345"},
  "source_address": "stripe:oi3lkn2lk3j34i3",
}
```

response:
```
{
  "success": true,
  "bridge_payment: {
    "gateway_transaction_id": "12345",
    "status": "pending",
    "destination_address": "ripple:stevenzeiler",
    "destination_amount": {"amount":"100", "currency":"USD", "issuer":"r12345"}
  }
}
```

### Bridge Payment Status

request:

```
GET /bridge/payments/:gateway_transaction_id/status
```

response:

```
{
  "success": true,
  "bridge_payment: {
    "gateway_transaction_id": "12345",
    "status": "pending"
  }
}
```

By posting the token to gatewayd through the stripe inbound bridge plugin, details about the customer,
the credit card, and the payment will be saved in gatewayd's sql database, and a deposit will be
enqueued, ultimately ending as a payment on the ripple network. 

