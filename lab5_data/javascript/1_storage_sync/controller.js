/**

  A poor man's controller - a very simple module with basic MVC functionaliies

**/
(function(exports) {

  var nextId = 1;

  var TodoModel = function() {
    this.todos = {};
    this.listeners = [];
  }
  
  TodoModel.prototype.setTodos = function(todos) {
    this.todos = todos;
    var maxId = 0;
    for (var id in todos) {
      var idInt = parseInt(id);
      maxId = idInt > maxId ? idInt : maxId;
    }
    nextId = maxId + 1;
    this.notifyListeners('reset');
  }

  TodoModel.prototype.clearTodos = function() {
    this.todos = {};
    this.notifyListeners('removed');
  }

  TodoModel.prototype.archiveDone = function() {
    var oldTodos = this.todos;
    this.todos={};
    for (var id in oldTodos) {
      if ( ! oldTodos[id].isDone ) {
        this.todos[id] = oldTodos[id];
      }
    }
    this.notifyListeners('archived');
  }

  TodoModel.prototype.setTodoState = function(id, isDone) {
    if ( this.todos[id].isDone != isDone ) {
      this.todos[id].isDone = isDone;
      this.notifyListeners('stateChanged', id);
    }
  }

  TodoModel.prototype.addTodo = function(text, isDone) {
    var id = nextId++;
    this.todos[id]={'id': id, 'text': text, 'isDone': isDone};
    this.notifyListeners('added', id);
  }

  TodoModel.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  }

  TodoModel.prototype.notifyListeners = function(change, param) {
    var this_ = this;
    this.listeners.forEach(function(listener) {
      listener(this_, change, param);
    });
  }

  exports.TodoModel = TodoModel;

})(window);


window.addEventListener('DOMContentLoaded', function() {

  var model = new TodoModel();
  var form = document.querySelector('form');
  var archive = document.getElementById('archive');
  var list = document.getElementById('list');
  var todoTemplate = document.querySelector('#templates > [data-name="list"]');

  /**
   * When the form is submitted, we need to add a new todo and clear the input
   **/
  form.addEventListener('submit', function(e) {
    var textEl = e.target.querySelector('input[type="text"]');
    model.addTodo(textEl.value, false);
    textEl.value=null;
    e.preventDefault();
  });


  /**
   * A simple handler for the archive link
   **/
  archive.addEventListener('click', function(e) {
    model.archiveDone();
    e.preventDefault();
  });


  /**
   * Listen to changes in the model and trigger the appropriate changes in the view
   **/
  model.addListener(function(model, changeType, param) {
    if ( changeType === 'removed' || changeType === 'archived' || changeType === 'reset') {
      redrawUI(model);
    } else if ( changeType === 'added' ) {
      drawTodo(model.todos[param], list);
    } else if ( changeType === 'stateChanged') {
      updateTodo(model.todos[param]);
    }
    storageSave();
    updateCounters(model);
  });


  // If there is saved data in storage, use it. Otherwise, bootstrap with sample todos
  var storageLoad = function() {
    chrome.storage.sync.get('todolist', function(value) {
      if (value && value.todolist) {
        model.setTodos(value.todolist);
      } else {
        model.addTodo('learn Chrome Apps', true);
        model.addTodo('build a Chrome App', false);
      }
    });
  } 

  var storageSave = function() {
    chrome.storage.sync.set({'todolist': model.todos});
  };

  /**
   * Clean the current ToDo list and add elements again
   **/
  var redrawUI = function(model) {
    list.innerHTML='';
    for (var id in model.todos) {
      drawTodo(model.todos[id], list);
    }
  };

  /**
   * Deep clone a template node, set its ID and add it to the DOM container.
   * Add a listener to the newly added checkbox, so it can trigger the state flip
   * when the checkbox is clicked.
   **/
  var drawTodo = function(todoObj, container) {
    var el = todoTemplate.cloneNode(true);
    el.setAttribute('data-id', todoObj.id);
    container.appendChild(el);
    updateTodo(todoObj);
    var checkbox = el.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', function(e) {
      model.setTodoState(todoObj.id, e.target.checked);
    });
  }


  /**
   * Find the element corresponding to the given ToDo model object and update its
   * state and description from the model.
   */
  var updateTodo = function(model) {
    var todoElement = list.querySelector('li[data-id="'+model.id+'"]');
    if (todoElement) {
      var checkbox = todoElement.querySelector('input[type="checkbox"]');
      var desc = todoElement.querySelector('span');
      checkbox.checked = model.isDone;
      desc.innerText = model.text;
      desc.className = "done-"+model.isDone;
    }
  }

  /**
   * Recalculate total number of ToDos and remaining ToDos and update
   * appropriate elements in the DOM.
   **/
  var updateCounters = function(model) {
    var count = 0;
    var notDone = 0;
    for (var id in model.todos) {
      count++;
      if ( ! model.todos[id].isDone ) {
        notDone ++;
      }
    }
    document.getElementById('remaining').innerText = notDone;
    document.getElementById('length').innerText = count;
  }

  storageLoad();
   
});

