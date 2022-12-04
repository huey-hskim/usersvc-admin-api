function RunObject(name, options) {
  this.name = name;

  this.runflag            = false;
  this.lastActionTmStart  = null;
  this.lastActionTmEnd    = null;
  this.options            = options || {};

  return this;
}

RunObject.prototype.run = (that) => {
  if (that.runflag) {
    console.log(`Not finished prevent event : ${that.name}`);
    return false;
  }

  that.runflag            = true;
  that.lastActionTmStart  = new Date();

  return true;
};

RunObject.prototype.end = (that) => {
  that.runflag            = false;
  that.lastActionTmEnd    = new Date();
};

module.exports = {
  RunObject: RunObject
};