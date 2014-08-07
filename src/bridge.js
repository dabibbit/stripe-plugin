var stripe = require('stripe');
var crypto = require('crypto');
var random = function(){ return crypto.randomBytes(16).toString('hex'); };

function StripeInboundBridge(options) {
  this.stripeToken = options.stripeToken;
  this.rippleAddress = options.rippleAddress;
  this.gatewayd = options.gatewayd;
  this.stripe = stripe(options.stripeApiKey);
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
    self.gatewayd.api.registerUser({
      name: random(),
      password: random(),
      ripple_address: self.rippleAddress
    }, function(error, user) {
      if (error) {
        callback(error, null);
      } else {
        self.gatewayd.data.models.externalAccounts.findOrCreate({
          name: 'stripeCardToken',
          uid: this.stripeToken,
          user_id: user.id
        }).complete(callback);
      }
    });
  },
 
  makeDeposit: function(options, callback) {
    var self = this;
    self.stripe.charges.create({
      amount: options.amount * 100.0,
      currency: "USD",
      card: options.token,
      description: '$'+options.amount+' worth of XRP',
    }, function(error, charge){
      if (error) {
        callback(error, null);
      } else {
        self.gatewayd.data.models.externalTransactions.create({
          external_account_id: options.externalAccount.id,
          amount: options.amount / 0.006,
          currency: 'XRP',
          uid: charge.id,
          deposit: true,
          status: 'queued'
        }).complete(callback)
      }
    });
  }
}

module.exports = StripeInboundBridge;
