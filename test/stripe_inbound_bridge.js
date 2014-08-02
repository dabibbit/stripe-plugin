var assert = require('assert');
var http = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');
var StripeInboundBridgePlugin = require(__dirname+'/../src/plugin.js');
var StripeInboundBridge = require(__dirname+'/../src/bridge.js');
var stripeApiKey = process.env.STRIPE_API_KEY;
var stripe = require("stripe")(stripeApiKey);
var gatewayd = require('/Users/stevenzeiler/github/ripple/gatewayd/');

var createdToken, createdPolicy;

describe("Stripe Inbound Bridge", function() {

  before(function() {
    appServer = express();
    appServer.use(bodyParser.json());
    var plugin = new StripeInboundBridgePlugin({
      gatewayd: gatewayd,
      stripeApiKey: stripeApiKey
    });
    appServer.use('/bridges/stripe', plugin);
  });

  it("should bridge a stripe token to a ripple address", function(next) {

    stripe.tokens.create({
      card: {
        "number": '4242424242424242',
        "exp_month": 12,
        "exp_year": 2015,
        "cvc": '123'
      }
    }).then(function(token) {
      http(appServer)
        .post('/bridges/stripe')
        .send({
          stripeToken: token.id, 
          rippleAddress: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
          amount: 1
        })
        .expect(200)
        .end(function(error, response) { 
          assert(!error);
          assert(response.body.success);
          assert(response.body.deposit);
          assert(response.body.deposit.id > 0);
          next();
        });
    });
  });

  it("should get a stripe token from a credit card", function(next) {
    stripe.tokens.create({
      card: {
        "number": '4242424242424242',
        "exp_month": 12,
        "exp_year": 2015,
        "cvc": '123'
      }
    }).then(function(token) {
      createdToken = token;
      bridge = new StripeInboundBridge({
        stripeToken: token.id,
        rippleAddress: 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk',
        gatewayd: gatewayd,
        stripeApiKey: process.env.STRIPE_API_KEY
      });
      bridge.save(function(error, policy) {
        createdPolicy = policy;
        next();
      });
    });
  });

  it('should charge the card and record in gatewayd', function(next) {

    bridge.makeDeposit({
      amount: 1,
      token: createdToken.id,
      policy: createdPolicy
    }, function(error, deposit) {
      assert(!error);
      assert(deposit.id > 0);
      assert(deposit.uid);
      assert.strictEqual(deposit.amount, '1');
      assert.strictEqual(deposit.currency, 'USD');
      next();
    });
  });
  
});
