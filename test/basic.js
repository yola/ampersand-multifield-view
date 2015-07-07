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

  t.notOk(multifield.valid, 'with an invalid field');

  multifield.fields[1].setValue('anotherTest');

  t.ok(multifield.valid, 'when all fields are valid');
  t.end();
});

test('it runs given validation tests', function(t) {
  var cb = sinon.spy();
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({value: value, tests: [cb]});
  multifield.render();

  t.ok(cb.called, 'tests were called');
  t.end();
});

test('it is not valid when a validation test fails', function(t) {
  var cb = sinon.spy(function() {
    return 'A failure';
  });

  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({tests: [cb], value: value});
  multifield.render();

  t.notOk(multifield.updateValid(), 'valid is false when a test fails');
  t.equal(multifield.message, 'A failure', 'sets the tests\'s error message');
  t.end();
});

test('it is valid when validation tests pass', function(t) {
  var cb = sinon.spy();
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({tests: [cb], value: value});
  multifield.render();

  t.ok(multifield.valid, 'valid is set to true');
  t.equal(multifield.message, '', 'error message is empty');
  t.end();
});

test('hides the error message when valid', function(t) {
  var cb = sinon.spy();
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({tests: [cb], value: value});

  multifield.render();

  var messageContainer = multifield.queryByHook('multi-message-container');
  var messageText = multifield.queryByHook('multi-message-text');
  var isHidden = messageContainer.style.display === 'none';

  t.ok(isHidden, 'message is hidden when view is valid');
  t.notOk(messageText.textContent, 'message is empty');
  t.end();
});

test('show the error message when a validation test fails', function(t) {
  var cb = sinon.spy(function() {
    return 'A failure';
  });
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({tests: [cb], value: value});

  multifield.render();

  var messageContainer = multifield.queryByHook('multi-message-container');
  var messageText = multifield.queryByHook('multi-message-text');
  var isHidden = messageContainer.style.display === 'none';

  t.notOk(isHidden, 'message is hidden when view is valid');
  t.equal(messageText.textContent, 'A failure', 'displays a message');
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

  t.ok(cb.called, 'sets and calls the validCallback');
  t.end();
});

test('it can reset its value', function(t) {
   var value = {field1: 'test', field2: 'test2'};
   var value2 = {field1: 'testReset', field2: 'testReset2'};
   var multifield = makeMultifield({value: value});

   multifield.render();
   multifield.setValue(value2);
   multifield.reset();

   t.deepEqual(multifield.value, value, 'resets to the starting value');
   t.end();
});

test('it can clear its value', function(t) {
  var value = {field1: 'test', field2: 'test2'};
  var multifield = makeMultifield({value: value});

  multifield.render();
  multifield.clear();

  value.field1 = null;
  value.field2 = null;

  t.deepEqual(multifield.value, value, 'nullifies the fields\' values');
  t.end();
});
