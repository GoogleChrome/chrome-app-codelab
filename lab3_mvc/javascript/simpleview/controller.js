
/**

  A poor man's controller - a very simple module with basic MVC functionaliies

**/
(function(exports) {

  var TodoModel = function() {
    this.contents = '';
    this.listeners = [];
  }
  
  TodoModel.prototype.setContents = function(contents) {
    if (this.contents !== contents) {
      this.contents = contents;
      this.notifyListeners();
    }
  }

  TodoModel.prototype.bindToInput = function(input) {
    var _this = this;
    
    var eventHandler = function(e) {
      if (typeof(e.target.value) != 'undefined') {
        _this.setContents(e.target.value);
      }
    };

    input.addEventListener('keyup', eventHandler);
    input.addEventListener('change', eventHandler);
  }

  TodoModel.prototype.bindToView = function(view) {
    this.addListener(function(model) {
      if (view.setValue) {
        view.setValue(model.contents);
      } else {
        view.innerText=model.contents;
      }
    });
  }

  TodoModel.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  TodoModel.prototype.notifyListeners = function() {
    var this_ = this;
    this.listeners.forEach(function(listener) {
      listener(this_);
    });
  }

  exports.TodoModel = TodoModel;

})(window);


window.addEventListener('DOMContentLoaded', function() {

  var model = new TodoModel();
  var newTodo = document.getElementById('newTodo');
  var todoText = document.getElementById('todoText');

  model.bindToView(todoText);
  model.bindToInput(newTodo);
   
})

