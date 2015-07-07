# ampersand-multifield-view

[![build status][travis-image]][travis-url]

## purpose
A view module for intelligently applying an hierarchy to form data. `MultifieldView` gathers field views into a collection that can be treated as a single field view whose value is an object with keys and values corresponding to its sub-views' names and values. Works well with [ampersand-form-view][ampersand-form-view].

It does the following:

- Accepts a collection of views that implement the [form field view conventions][ampersand-form-conventions].
- Acts as a form field view and passes information about its fields to the parent form


## install

```
npm install ampersand-multifield-view
```

## example

```javascript
var MultiFieldView = require('ampersand-multifield-view');
var InputView = require('ampersand-input-view');

var AddressFieldView = MultiFieldView.extend({
  fields: [
    new InputView({
      name: 'address1',
      label: 'Address 1',
      placeholder: 'Address line 1',
      value: ''
    }),
    new InputView({
      name: 'address2',
      label: 'Address 2',
      placeholder: 'Address line 2',
      value: ''
    }),
    new InputView({
      name: 'city',
      label: 'City',
      placeholder: 'City',
      value: ''
    }),
    new InputView({
      name: 'state',
      label: 'State/Region',
      placeholder: 'State/Region',
      value: ''
    }),
    new InputView({
      name: 'zip',
      label: 'ZIP/Postal Code',
      placeholder: 'Postal Code',
      value: ''
    }),
  ]
});

module.exports = AddressFieldView
```

```javascript
var FormView = require('ampersand-form-view');
var AddressFieldView = require('./address-field-view');

module.exports = FormView.extend({
  fields: function() {
    return [
      new AddressView({
        name: 'address',
        label: 'address',
        value: {
          address1: '350 Fifth Avenue',
          address2: '',
          city: 'New York',
          state: 'NY',
          zip: '10118'
        }
      });
    ];
  }
});
```

## API Reference

### extend `AmpersandMultiFieldView.extend({ })`
Because this view is based on [ampersand-state][ampersand-state], it can be extended the same way to create your own **`MultiFieldView`** class.

**Note:** If you want to add your own version of a function (such as `initialize()`), remember you are overriding MultiFieldView's own functions. Thus, you should call the parent's functions manually:

```javascript
var AmpersandMultiFieldView = require('ampersand-multifield-view');

var MyCustomMultiField = AmpersandMultiFieldView.extend({
  initialize: function(spec) {
    // call its parent's initialize manually
    AmpersandMultiFieldView.prototype.initialize.call(this, spec);

    // do whatever else
  }
});
```

### constructor/initialize `new AmpersandMultiFieldView({opts})`
When creating an instance of `MultiFieldView`, you can pass initial values to be set to the state.

**opts**
- `name`: the field's `name` attribute's value. Used when reporting to parent form.
- `label`: the label for the views.
- `fields`: an array of form-vield views
- `value`: initial value to pass on to the MultiFieldView's forms. An object where the keys match the fields' `name` attributes.
- `template`: a custom template to use.
- `tests` (default `[]`): validation functions to run on the fields' values. See below.
- `beforeSubmit`: function called by [ampersand-form-view][ampersand-form-view] during submit.
- `validCallback`: function called whenever the `valid` property's value changes.

### render `AmpersandMultiFieldView.render()`
Renders the MultiFieldView. Called automatically when used within a parent [ampersand-form-view][ampersand-form-view].

### reset `AmpersandMultiFieldView.reset()`
Reset the fields' values to their starting value

### clear `AmpersandMultiFieldView.clear()`
Clears the fields' values

### template `AmpersandMultiFieldView.template`
This can be customized by using `extend` or by passing in a `template` on instantiation.

It can be a function that returns a string of HTML or DOM element -- or just an HTML string.

The resulting HTML should contain the following hooks:
- an element with a `data-hook="label"` attribute.
- an element with a `data-hook="multifields"` attribute where the fields are inserted.

### tests `AmpersandMultiFieldView.tests`
The test functions will be called in the context of the MultifieldView and receive the MultiFieldView's `value`.

The tests should return an error message if invalid and return either a falsy value or not return otherwise.

It's recommended that tests validatate the relationship of the fields. As an example, validate that when the address field has a value, that the zip code field does as well.

```javascript
var AmpersandMultiFieldView = require('ampersand-multifield-view');

var MyCustomMultiField = AmpersandMultiFieldView.extend({
  ...
  tests: [
    function(value) {
      var hasAddrOrZip = !!value.address1 || !!value.zip;
      var hasBoth = value.address && value.zip
      if (hasAddrOrZip && !hasBoth) {
        return 'An address and zip code must both be provided'
      }
    }
  ]
});
```

### beforeSubmit `AmpersandMultiFieldView.beforeSubmit()`
This function is called by [ampersand-form-view][ampersand-form-view] during submit and calls its fields' `beforeSubmit` functions.

**Note:** if you want to write your own version, be sure to call the parent to ensure the MultiFieldView's fields' `beforeSubmit` functions are calledd.

```javascript
var AmpersandMultiFieldView = require('ampersand-multifield-view');

var MyCustomMultiField = AmpersandMultiFieldView.extend({
  ...
  beforeSubmit: function() {
    // call its parent's beforeSubmit manually
    AmpersandMultiFieldView.prototype.beforeSubmit.call(this);

    // do whatever else
  }
});
```

### validCallback `AmpersandMultiFieldView.validCallback()`
A function that gets called, if it exists, when the field first loads and anytime the form changes from valid to invalid or vice versa.

## License

MIT

[ampersand-form-view]: https://github.com/AmpersandJS/ampersand-form-view
[ampersand-form-conventions]: http://ampersandjs.com/learn/forms
[ampersand-state]: http://ampersandjs.com/docs#ampersand-state
[travis-image]: https://travis-ci.org/yola/ampersand-multifield-view.svg?branch=master
[travis-url]: https://travis-ci.org/yola/ampersand-multifield-view
