const handlebars = require('handlebars')

handlebars.registerHelper('ne', function(a, b) {
    return a != b;
  });

handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });
  
  handlebars.registerHelper('if_eq', function(a, b, opts) {
    if (a === b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });
  
  handlebars.registerHelper('unless_eq', function (a, b, opts) {
    if (a !== b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });
  
  handlebars.registerHelper('if_neither_eq', function(a, b, value, options) {
    if (a !== value && b !== value) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });


// Helper para la operación AND
handlebars.registerHelper('and', function() {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
  });
  
  // Helper para la operación NOT
  handlebars.registerHelper('not', function(value) {
    return !value;
  });
  
  // Helper para la operación de igualdad
  handlebars.registerHelper('eq', function(a, b) {
    return a === b;
  });
  
  // Helper para la operación OR
  handlebars.registerHelper('or', function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  });
 


  module.exports = handlebars.helpers;