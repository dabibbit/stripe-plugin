var express = require('express');
var StripeInboundBridge = require(__dirname+'/bridge.js');
var StripeInboundBridgeController = require(__dirname+'/bridge_controller.js');

function StripeInboundBridgePlugin(options) {
  var router = new express.Router();
  var controller = new StripeInboundBridgeController({
    gatewayd: options.gatewayd,
    stripeApiKey: options.stripeApiKey
  });
  router.post('/', controller.create.bind(controller));
  return router;
}

module.exports = StripeInboundBridgePlugin;

