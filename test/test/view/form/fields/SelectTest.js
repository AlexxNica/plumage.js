/*global QUnit:true, module:true, test:true, asyncTest:true, expect:true*/
/*global start:true, stop:true, ok:true, equal:true, notEqual:true, deepEqual:true*/

define([
  'jquery',
  'underscore',
  'backbone',
  'sinon',
  'test/environment',
  'test/EventLog',
  'example/ExampleData',
  'view/form/fields/Select',
  'example/model/Post',
  'collection/DataCollection'
], function($, _, Backbone, sinon, Environment, EventLog, ExampleData, Select,
    Post, DataCollection) {


  //use Environment to mock ajax
  module('Select', _.extend(new Environment(), {
    setup: function() {
      Environment.prototype.setup.apply(this, arguments);
    }
  }));

  function createView(options) {
    options = options || {};
    return new Select(_.extend({
      valueAttr: 'category',
      listValueAttr: 'name',
      el: $('<div></div>'),
      template: '<div></div>',
    }, options));
  }

  test('Attribute params work', function() {
    var view = createView({
      noSelectionText: 'no selection',
      listValueAttr: 'name',
      listLabelAttr: 'label'
    });
    var model = new Post();
    var listModel = new DataCollection(ExampleData.CATEGORIES);
    view.setModel(model);
    view.setListModel(listModel);

    var data = view.getTemplateData();
    var itemData = view.getItemData(view.listModel.at(0));

    equal(itemData.label, ExampleData.CATEGORIES[0].label, 'should get label attribute');
    equal(itemData.value, ExampleData.CATEGORIES[0].name, 'should get value attribute');

    equal(data.hasSelection, false, 'should not have selection');
  });

  test('Updates on model change', function() {
    var view = createView();
    var model = new Post();
    var listModel = new DataCollection(ExampleData.CATEGORIES);
    view.setModel(model);
    view.setListModel(listModel);
    view.render();

    sinon.spy(view, 'updateValueFromModel');
    model.set('category', 'bar');
    ok(view.updateValueFromModel.calledOnce, 'should update on model change');

    sinon.spy(view, 'render');
    listModel.at(0).set('hidden', true);
    ok(view.render.calledOnce, 'should update on list model change');
  });

  test('defaultToFirst', function() {
    var view = createView({defaultToFirst: true});
    var model = new Post();
    var listModel = new DataCollection([], {url: 'foo'});

    view.setModel(model);
    view.setListModel(listModel);
    equal(view.getValue(), '', 'should not use default if listModel is not loaded');

    this.ajaxResponse = {results: ExampleData.CATEGORIES};
    listModel.load();
    equal(view.getValue(), listModel.at(0).get('name'), 'set value to default after listModel load');

    view.setValue('');
    view.setListModel(listModel);
    equal(view.getValue(), listModel.at(0).get('name'), 'set value to default after listModel load');
  });

  test('listRelationship', function() {
    var view = createView({defaultToFirst: true, listRelationship: 'categories'});
    var model = new Post(ExampleData.POST_WITH_CATEGORIES);
    view.setModel(model);

    ok(view.listModel === model.getRelated('categories'));
  });
});