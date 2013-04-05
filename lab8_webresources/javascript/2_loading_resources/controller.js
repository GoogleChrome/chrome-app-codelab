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

  TodoModel.prototype.addTodo = function(text, isDone, extras) {
    var id = nextId++;
    this.todos[id]={'id': id, 'text': text, 'isDone': isDone, 'extras': extras};
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


const PLACEHOLDER_IMAGE = "loading.gif";


(function(exports) {

  var defaultDropText = "Or drop files here...";

  var dropText = document.getElementById('dropText');
  dropText.innerText = defaultDropText;

  // on dragOver, we will change the style and text accordingly, depending on
  // the data being transfered
  var dragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var valid = isValid(e.dataTransfer);
    if (valid) {
      dropText.innerText="Drop files and remote images and they will become Todos";
      document.body.classList.add("dragging");
    } else {
      dropText.innerText="Can only drop files and remote images here";
      document.body.classList.add("invalid-dragging");
    }
  }

  var isValid = function(dataTransfer) {
    return dataTransfer && dataTransfer.types
      && ( dataTransfer.types.indexOf('Files') >= 0
        || dataTransfer.types.indexOf('text/uri-list') >=0 )
  }

  // reset style and text to the default
  var dragLeave = function(e) {
    dropText.innerText=defaultDropText;
    document.body.classList.remove('dragging');
    document.body.classList.remove('invalid-dragging');
  }

  // on drop, we create the appropriate TODOs using dropped data
  var drop = function(e, model) {
    e.preventDefault();
    e.stopPropagation();
    if (isValid(e.dataTransfer)) {
      if (e.dataTransfer.types.indexOf('Files') >= 0) {
        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
          var text = files[i].name+', '+files[i].size+' bytes';
          model.addTodo(text, false, {file: files[i]});
        }
      } else { // uris
        var uri = e.dataTransfer.getData("text/uri-list");
        var extras = { uri: uri };
        if (/\.png$/.test(uri) || /\.jpg$/.test(uri)) {
          hasImage = true;
          extras.validImage = true;
          extras.imageUrl = PLACEHOLDER_IMAGE;
        }
        model.addTodo(uri, false, extras);
      }
    }

    dragLeave();
  }

  exports.setDragHandlers = function(model) {
    document.body.addEventListener("dragover", dragOver, false);
    document.body.addEventListener("dragleave", dragLeave, false);
    document.body.addEventListener("drop", function(e) {
        drop(e, model);
      }, false);
  }

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
    if ( changeType === 'reset' ) {
      // let's invalidate all Blob URLs, since their lifetime is tied to the document's lifetime
      for (var id in model.todos) {
        if (model.todos[id].extras && model.todos[id].extras.validImage) {
          model.todos[id].extras.imageUrl = PLACEHOLDER_IMAGE;
        }
      }
    }

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
    if(/^http:\/\/|https:\/\//.test(todoObj.text)) {
      var showUrl = el.querySelector('a');
      showUrl.addEventListener('click', function(e) {
        e.preventDefault();
        var webview=document.querySelector("webview");
        webview.src=todoObj.text;
      });
      showUrl.style.display = 'inline';
    }
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

      // load image, if this ToDo has image data
      maybeStartImageLoader(todoElement, model);
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
  setDragHandlers(model);



  /**
   * On each keypress of text input, save contents to the local
   * storage. On browser restart (for browser upgrade, for example)
   * the method setInitialState is called and the saved value
   * restored.
   *
   * Added for Codelab 6
   **/
  var newTodoInput = document.querySelector('input[type="text"]');

  window.clearInitialState = function() {
    chrome.storage.local.set({'newtodo': null});
  }

  window.setInitialState = function() {
    chrome.storage.local.get('newtodo', function(data) {
      if (newTodoInput && data && data.newtodo) {
        newTodoInput.value = data.newtodo;
        newTodoInput.focus();
      }
    });
  };

  var saveTransientState = function() {
    chrome.storage.local.set({'newtodo': newTodoInput.value});
  };

  newTodoInput.addEventListener('keypress' , function() {
    saveTransientState();
  })


  /**
   * If the image has no imageUrl, start a new loader
   **/
  var maybeStartImageLoader = function(el, todo) {
    var img = el.querySelector('img');
    if (todo['extras'] && todo.extras.validImage && todo.extras.imageUrl) {
      if (todo.extras.imageUrl===PLACEHOLDER_IMAGE) {
        img.src = PLACEHOLDER_IMAGE;
        img.style.display = 'inline';
        window.loadImage(todo.extras.uri, function(blob_uri, requested_uri) {
          todo.extras.imageUrl = blob_uri;
          img.src = blob_uri;
        });
      } else {
        img.src = todo.extras.imageUrl;
        img.style.display = 'inline';
      }
    } else {
      img.style.display = 'none';
    }
  };


});

