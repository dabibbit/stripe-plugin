var StripeInboundBridge = require(__dirname+'/bridge.js');

function StripeInboundBridgeController(options) {
  this.gatewayd = options.gatewayd;
  this.stripeApiKey = options.stripeApiKey;
}

StripeInboundBridgeController.prototype = {
  create: function(request, response) {
    var self = this;
    var bridge = new StripeInboundBridge({
      stripeApiKey: self.stripeApiKey,
      stripeToken: request.body.stripeToken,
      rippleAddress: request.body.rippleAddress,
      gatewayd: self.gatewayd
    });
    if (bridge instanceof Error) {
      console.log('ERROR', Error);
      return response.status(500).send({
        success: false,
        error: bridge.message
      });
    }
    bridge.save(function(error, externalAccount) {
      if (error) {
        return response.status(500).send({
          success: false,
          error: error
        });
      }
      bridge.makeDeposit({
        token: request.body.stripeToken,
        amount: request.body.amount,
        externalAccount: externalAccount
      }, function(error, deposit) {
        if (error) {
          response.status(500).send({
            success: false,
            error: error
          });
        } else {
          response.send({
            success: true,
            deposit: deposit
          });
        }
      });
    });
  }
};

module.exports = StripeInboundBridgeController;
