var StripeInboundBridge = require(__dirname+'/bridge.js');
var GatewaydError = require(__dirname+'/gatewayd_error.js');

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
      console.log('ERROR', bridge.toJSON());
      return response.status(500).send({
        success: false,
        error: bridge.toJSON()
      });
    }
    bridge.save(function(error, externalAccount) {
      if (error) {
        return response.status(500).send({
          success: false,
          error: error.toJSON()
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
            error: error.toJSON()
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
