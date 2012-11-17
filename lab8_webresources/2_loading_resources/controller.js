const PLACEHOLDER_IMAGE = "loading.gif";

function TodoCtrl($scope) {

  // Notice that chrome.storage.sync.get is asynchronous
  chrome.storage.sync.get('todolist', function(value) {
    // The $apply is only necessary to execute the function inside Angular scope
    $scope.$apply(function() {
      $scope.load(value);
    });
  });

  var defaultDropText = "Or drop files here...";
  $scope.dropText = defaultDropText;

  // on dragOver, we will change the style and text accordingly, depending on 
  // the data being transfered
  var dragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var valid = e.dataTransfer && e.dataTransfer.types 
      && ( e.dataTransfer.types.indexOf('Files') >= 0 
        || e.dataTransfer.types.indexOf('text/uri-list') >=0 )
    $scope.$apply(function() {
      $scope.dropText = valid ? "Drop files and remote images and they will become Todos"
          : "Can only drop files and remote images here";
      $scope.dropClass = valid ? "dragging" : "invalid-dragging";
    });
  }

  // reset style and text to the default
  var dragLeave = function(e) {
    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
    });
  }

  // on drop, we create the appropriate TODOs using dropped data
  var drop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    var hasImage = false;
    var newTodos = [];
    if (e.dataTransfer.types.indexOf('Files') >= 0) {
      var files = e.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        var text = files[i].name+', '+files[i].size+' bytes';
        newTodos.push({text:text, done:false, file: files[i]});
      }
    } else { // uris
      var uri=e.dataTransfer.getData("text/uri-list");
      var todo = {text:uri, done:false, uri: uri};
      if (/\.png$/.test(uri) || /\.jpg$/.test(uri)) {
        hasImage = true;
        todo.validImage = true;
        todo.imageUrl = PLACEHOLDER_IMAGE;
      }
      newTodos.push(todo);
    }

    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
      for (var i = 0; i < newTodos.length; i++) {
        $scope.todos.push(newTodos[i]);
      }
      if (hasImage) $scope.loadImages();
      $scope.save();
    });
  }

  // for each image with no imageUrl, start a new loader
  $scope.loadImages = function() {
    for (var i=0; i<$scope.todos.length; i++) {
      var todo=$scope.todos[i];
      if (todo.validImage && todo.imageUrl===PLACEHOLDER_IMAGE) {
        loadImage(todo.uri, function(blob_uri, requested_uri) {
          $scope.$apply(function(scope) {
            for (var k=0; k<scope.todos.length; k++) {
              if (scope.todos[k].uri==requested_uri) {
                scope.todos[k].imageUrl = blob_uri;
              }
            }
          });
        });
      }
    }
  };

  document.body.addEventListener("dragover", dragOver, false);
  document.body.addEventListener("dragleave", dragLeave, false);
  document.body.addEventListener("drop", drop, false);

  // If there is saved data in storage, use it. Otherwise, bootstrap with sample todos
  $scope.load = function(value) {
    if (value && value.todolist) {
      // ObjectURLs are revoked when the document is removed from memory,
      // so we need to reload all images.
      for (var i=0; i<value.todolist.length; i++) {
        value.todolist[i].imageUrl = PLACEHOLDER_IMAGE;
      }
      $scope.todos = value.todolist;
      $scope.loadImages();
    } else {
      $scope.todos = [
        {text:'learn angular', done:true},
        {text:'build an angular app', done:false}];
    }
  } 

  $scope.save = function() {
    chrome.storage.sync.set({'todolist': $scope.todos});
  };

  $scope.addTodo = function() {
    $scope.todos.push({text:$scope.todoText, done:false});
    $scope.todoText = '';
  };

  $scope.showUri = function(uri) {
    var webview=document.querySelector("webview");
    webview.src=uri;
  };

  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
  $scope.archive = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };

}


var newTodoInput = null;

var clearInitialState = function() {
  chrome.storage.local.set({'newtodo': null});
}

var setInitialState = function() {
  chrome.storage.local.get('newtodo', function(data) {
    if (newTodoInput && data && data.newtodo) {
      newTodoInput.value = data.newtodo;
      newTodoInput.focus();
    }
  });
};

window.addEventListener('load', function() {
  var saveTransientState = function() {
    chrome.storage.local.set({'newtodo': newTodoInput.value});
  };
  newTodoInput = document.querySelector('input[type="text"]');
  newTodoInput.addEventListener('keypress' , function() {
    saveTransientState();    
  })
});

