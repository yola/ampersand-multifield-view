'use strict';

var find = require('lodash.find');
var View = require('ampersand-view');

var MultiFieldView = View.extend({
  template: [
    '<div>',
      '<p class="label" data-hook="label"></p>',
      '<div data-hook="multifields"></div>',
    '</div>'
  ].join(''),

  bindings: {
    'label' : [
      {
        hook: 'label'
      },
      {
        type: 'toggle',
        hook: 'label'
      }
    ]
  },

  props: {
    fields: {
      type: 'array',
      required: true,
      allowNull: false,
    },

    label: ['string', true, ''],
    name: 'string'
  },

  initialize: function(spec) {
    if (!spec || !spec.name) {
      throw new Error('must pass in a name');
    }

    this.value = spec.value || {};
    this.name = spec.name;
    this.valid = true;
    this.validCallback = spec.validCallback || function() {};

    if (!this.fields) {
      throw new Error('must have an array of fields');
    }

    this.fields.forEach(function(field) {
      field.parent = this;
    }, this);
  },

  render: function() {
    this.renderWithTemplate(this);
    this.fieldContainerEl = this.queryByHook('multifields');

    this.fields.forEach(function(field) {
      this.renderField(field, true);
    }, this);

    this.setValue(this.value);
    this.checkValid(true);

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

  setValid: function(now, forceFire) {
    var prev = this.valid;

    this.valid = now;

    if(prev !== now || forceFire) {
      this.validCallback(now);
    }
  },

  checkValid: function(forceFire) {
    var valid = this.fields.every(function(field) {
      return field.valid;
    });

    this.setValid(valid, forceFire);
    return valid;
  },

  setValue: function(value) {
    var fields = this.fields;
    var findField = function(name) {
      var field = find(fields, {name: name});

      if (!field) {
        throw new Error('Field ' + name + ' not found');
      }

      return field;
    };

    Object.keys(value).forEach(function(k) {
      var field = findField(k);
      field.setValue(value[k], !field.required);
    });
  },

  update: function(field) {
    this.trigger('change:' + field.name, field);

    if (field.valid) {
      this.checkValid();
    } else {
      this.setValid(false);
    }

    this.value[field.name] = field.value;

    if(this.parent) {
      this.parent.update(this);
    }
  },

  remove: function() {
    this.fields.forEach(function(field) {
      field.remove();
    });

    View.prototype.remove.apply(this, arguments);
  },

  beforeSubmit: function() {
    this.fields.forEach(function(field) {
      if (field.beforeSubmit) {
        field.beforeSubmit();
      }
    });
  }
});

module.exports = MultiFieldView;
