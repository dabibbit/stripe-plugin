var stripeApiKey = process.env.STRIPE_API_KEY;
var stripe = require("stripe")(stripeApiKey);

describe("Stripe Token Generator", function() {

  it("should bridge a stripe token to a ripple address", function(next) {

    stripe.tokens.create({
      card: {
        "number": '4242424242424242',
        "exp_month": 12,
        "exp_year": 2015,
        "cvc": '123'
      }
    }).then(function(token) {
      console.log(token);
      next();
    });
  });
  
});
