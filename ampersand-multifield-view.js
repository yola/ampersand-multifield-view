'use strict';

var find = require('lodash.find');
var View = require('ampersand-view');

var MultiFieldView = View.extend({
  /* jshint maxlen: false */
  template: [
    '<div>',
      '<p class="label" data-hook="label"></p>',
      '<div data-hook="multi-message-container" class="message message-below message-error">',
        '<p data-hook="multi-message-text"></p>',
      '</div>',
      '<div data-hook="multifields"></div>',
    '</div>'
  ].join(''),
  /* jshint maxlen: 80 */

  bindings: {
    'label': [
      {
        hook: 'label'
      },
      {
        type: 'toggle',
        hook: 'label'
      }
    ],
    'message': {
      type: 'text',
      hook: 'multi-message-text'
    },
    'showMessage': {
      type: 'toggle',
      hook: 'multi-message-container'
    }
  },

  props: {
    label: ['string', true, ''],
    message: ['string', true, ''],
    name: 'string',
    shouldValidate: ['boolean', true, false]
  },

  derived: {
    showMessage: {
      deps: ['message', 'shouldValidate'],
      fn: function() {
        return this.shouldValidate && this.message;
      }
    }
  },

  initialize: function(spec) {
    if (!spec || !spec.name) {
      throw new Error('must pass in a name');
    }

    this.beforeSubmit = spec.beforeSubmit || this.beforeSubmit;
    this.fields = spec.fields || this.fields || [];
    this.name = spec.name;
    this.tests = spec.tests || this.tests || [];
    this.validCallback = spec.validCallback || function() {};
    this.value = this.startingValue = spec.value || {};

    this.fields.forEach(function(field) {
      field.parent = this;
    }, this);

    this.updateValid();
  },

  render: function() {
    this.renderWithTemplate(this);
    this.fieldContainerEl = this.queryByHook('multifields');

    this.fields.forEach(function(field) {
      this.renderField(field, true);
    }, this);

    this.setValue(this.value);
    this.updateValid(true);
    return this;
  },

  renderField: function(fieldView, renderInProgress) {
    if (fieldView.rendered || !this.fieldContainerEl) {
      return this;
    }

    if (!this.rendered && !renderInProgress) {
      return this;
    }

    fieldView.render();
    this.fieldContainerEl.appendChild(fieldView.el);
  },

  isValid: function() {
    var fieldsValid =  this.fields.every(function(field) {
      return field.valid;
    });

    return fieldsValid && !this.runTests();
  },

  runTests: function() {
    var errMsg = '';

    this.tests.some(function(test) {
      errMsg = test.call(this, this.value) || '';
      return errMsg;
    }, this);

    this.message = errMsg;
    return errMsg;
  },

  setValid: function(now, forceFire) {
    var prev = this.valid;

    this.valid = now;

    if (prev !== now || forceFire) {
      this.validCallback(now);
    }
  },

  updateValid: function(forceFire) {
    var valid = this.isValid();
    this.setValid(valid, forceFire);
    return valid;
  },

  setValue: function(value, skipValidation) {
    var fields = this.fields;
    var findField = function(name) {
      var field = find(fields, {
        name: name
      });

      if (!field) {
        throw new Error('Field ' + name + ' not found');
      }

      return field;
    };

    Object.keys(value).forEach(function(k) {
      var field = findField(k);
      field.setValue(value[k], !field.required);
    });

    this.shouldValidate = !skipValidation;
  },

  update: function(field) {
    this.trigger('change:' + field.name, field);

    if (field.valid) {
      this.updateValid();
    } else {
      this.setValid(false);
    }

    this.value[field.name] = field.value;

    if (this.parent) {
      this.parent.update(this);
    }
  },

  remove: function() {
    this.fields.forEach(function(field) {
      field.remove();
    });

    View.prototype.remove.apply(this, arguments);
  },

  reset: function() {
    this.setValue(this.startingValue, true);
    this.fields.forEach(function(field) {
      if(field.reset) {
        field.reset();
      }
    });
  },

  clear: function() {
    this.shouldValidate = false;

    this.fields.forEach(function(field) {
      if(field.clear) {
        field.clear();
      } else {
        field.setValue(null);
      }
    });
  },

  beforeSubmit: function() {
    this.fields.forEach(function(field) {
      if (field.beforeSubmit) {
        field.beforeSubmit();
      }
    });
    this.shouldValidate = true;
    this.runTests();
  }
});

module.exports = MultiFieldView;
