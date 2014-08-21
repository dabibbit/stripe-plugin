function GatewaydError(options) {
  this.message = options.message;  
  this.type = options.type;
}

GatewaydError.prototype = Object.create(Error.prototype);
GatewaydError.prototype.constructor = GatewaydError;
GatewaydError.prototype.toJSON = function() {
  return {
    message: this.message,
    type: this.type
  }
}

module.exports = GatewaydError;

