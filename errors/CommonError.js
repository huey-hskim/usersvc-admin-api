if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function (isDev) {
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        if (!isDev && key === 'stack') {
          return;
        }
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true
  });
}

class CommonError extends Error {
  constructor(props) {
    super(props);

    this.name = CommonError.name;
    this.code = 500;
    this.stack = new Error().stack;

    if (props === undefined){
      this.message = this.name;
    } else if (typeof props === 'string') {
      this.message = props;
    } else {
      this.message = props.message || this.name;
      this.data = props.data || null;
    }
  }

  getData() {
    return this.data;
  }
}

module.exports = CommonError;
