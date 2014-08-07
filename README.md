## Stripe Gatewayd Inbound Bridge Plugin

Inbound bridge from credit card networks to ripple via Stripe and gatewayd

## Usage ##

    -> Gatewaydfile
  
    var SripeInboundBridgePlugin = require('stripe-gatewayd-inbound-bridge-plugin');

    module.exports = function(gatewayd) {

      gatewayd.server.user('/stripe', new StripeInboundBridgePlugin({
        stripeApiKey: gatewayd.config.get('STRIPE_API_KEY')
        gatewayd: gatewayd
      }));
    }

Register with Stripe to obtain API credentials, and add them to your gatewayd's config/config.json file.

Then in your web site embed the [Stripe Checkout Widget](https://stripe.com/docs/tutorials/checkout),
which will return to you a token when a user enters their credit card information.

Post that token to the gatewayd server at the route you configured:

    POST /stripe/bridges
    
    request:
    {
      token: 'stripeTokenFromForm',
      rippleAddress: 'aValidRippleAddress',
      amount: 2.50
    }

    response:
    {
      success: true,
      deposit: {
        ... a gatewayd deposit object ...
        currency: 'USD',
        amount: '2.5',
      }
    }

By posting the token to gatewayd through the stripe inbound bridge plugin, details about the customer,
the credit card, and the payment will be saved in gatewayd's sql database, and a deposit will be
enqueued, ultimately ending as a payment on the ripple network. 

