var stripe = require("stripe")(process.env.STRIPE_API_KEY);

function StripeInboundBridge(options) {
  this.stripeToken = options.stripeToken;
  this.rippleAddress = options.rippleAddress;
  this.gatewayd = options.gatewayd;
  this.stripe = options.stripe;
  if (!options.stripeToken) {
    return new Error({
     field: 'stripeToken',
     message: 'invalid stripe token'
    });
  }
  if (!options.gatewayd.validator.isRippleAddress(options.rippleAddress)) {
    throw new Error({
      field: 'rippleAddress',
      message: 'invalid ripple address'
    });
  }
  return this;
}

StripeInboundBridge.prototype = {
  save: function(callback) {
    var self = this;
    var externalAccount; 
    this.gatewayd.data.models.externalAccounts.findOrCreate({
      name: 'stripeCardToken',
      uid: this.stripeToken 
    })
    .then(function(account) {
      externalAccount = account;
      return self.gatewayd.data.models.rippleAddresses.findOrCreate({
        address: self.rippleAddress
      })
    })
    .then(function(rippleAddress) {
      self.gatewayd.data.models.policies.findOrCreate({
        external_account_id: externalAccount.id,
        ripple_address_id: rippleAddress.id,
        name: 'stripeInbound'
      }).complete(callback);
    });
  },
 
  makeDeposit: function(options, callback) {
    var self = this;
    stripe.charges.create({
      amount: options.amount * 100.0,
      currency: "USD",
      card: options.token,
      description: '$'+options.amount+' worth of XRP',
    })
    .done(function(charge) {
      self.gatewayd.data.models.externalTransactions.create({
        external_account_id: options.policy.external_account_id,
        amount: options.amount,
        currency: 'USD',
        uid: charge.id,
        deposit: true
      }).complete(callback)
    });
  }
}

module.exports = StripeInboundBridge;
