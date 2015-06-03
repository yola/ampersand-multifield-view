'use strict';

var test = require('tape');
var suite = require('tape-suite');

var viewConventions = require('ampersand-view-conventions');
var FieldView = require('./minimal-field-view');
var MultifieldView = require('../ampersand-multifield-view');

var testSpecs = function() {
  var fields = [
    new FieldView({
      name: 'field1',
    }),
    new FieldView({
      name: 'field2',
    })
  ];

  return {name: 'Test', fields: fields};
};

viewConventions.view(suite.tape, MultifieldView, testSpecs());

viewConventions.formField(
  suite.tape,
  MultifieldView,
  testSpecs(),
  {field1: 'Hi', field2: 'Bye'}
);

var makeMultifield = function(value) {
  var spec = testSpecs();
  spec.value = value;
  return new MultifieldView(spec);
};

test('it sets the fields\' values on render', function(t) {
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield(value);
  multifield.render();

  t.deepEqual(multifield.value, value);
  t.end();
});

test('it updates its value when a field is set', function(t) {
  var multifield = makeMultifield();
  multifield.render();

  var value = {field1: 'test'};
  multifield.fields[0].setValue(value.field1);
  t.deepEqual(multifield.value, value, 'after first value');

  value.field2 = 'anotherTest';
  multifield.fields[1].setValue(value.field2);
  t.deepEqual(multifield.value, value, 'after second value');
  t.end();
});

test('it is invalid when one of its fields is invalid', function(t){
  var value = {field1: 'test'};
  var multifield = makeMultifield(value);
  multifield.render();

  t.equal(multifield.valid, false, 'when invalid');

  multifield.fields[1].setValue('anotherTest');

  t.equal(multifield.valid, true, 'when valid');
  t.end();
});
