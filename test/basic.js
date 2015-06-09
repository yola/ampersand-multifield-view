'use strict';

var assign = require('lodash.assign');
var FieldView = require('./minimal-field-view');
var MultifieldView = require('../ampersand-multifield-view');
var sinon = require('sinon');
var suite = require('tape-suite');
var test = require('tape');
var viewConventions = require('ampersand-view-conventions');

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

var makeMultifield = function(specs) {
  var spec = assign(testSpecs(), specs);
  return new MultifieldView(spec);
};

test('it sets the fields\' values on render', function(t) {
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({value: value});
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

test('it updates its validity based on its fields', function(t) {
  var value = {field1: 'test'};
  var multifield = makeMultifield({value: value});
  multifield.render();

  t.equal(multifield.valid, false, 'with an invalid field');

  multifield.fields[1].setValue('anotherTest');

  t.equal(multifield.valid, true, 'when all fields are valid');
  t.end();
});

test('it can be created with a beforeSubmit function', function(t) {
  var cb = sinon.spy();

  var multifield = makeMultifield({beforeSubmit: cb});
  multifield.beforeSubmit();

  t.equal(cb.called, true, 'called custom beforeSubmit');
  t.end();
});

test('it handles its validCallback function', function(t) {
  var cb = sinon.spy();
  makeMultifield({validCallback: cb});

  t.equal(cb.called, true, 'sets and calls the validCallback');
  t.end();
});
