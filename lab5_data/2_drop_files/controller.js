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

    var newTodos=[];
    if (e.dataTransfer.types.indexOf('Files') >= 0) {
      var files = e.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        var text = files[i].name+', '+files[i].size+' bytes';
        newTodos.push({text:text, done:false, file: files[i]});
      }
    } else { // uris
      var uri=e.dataTransfer.getData("text/uri-list");
      if (/\.png$/.test(uri)) {

      }
      newTodos.push({text:uri, done:false, uri: uri});
    }

    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
      for (var i = 0; i < newTodos.length; i++) {
        $scope.todos.push(newTodos[i]);
      }
      $scope.save();
    });
  }

  document.body.addEventListener("dragover", dragOver, false);
  document.body.addEventListener("dragleave", dragLeave, false);
  document.body.addEventListener("drop", drop, false);

  // If there is saved data in storage, use it. Otherwise, bootstrap with sample todos
  $scope.load = function(value) {
    if (value && value.todolist) {
      $scope.todos = value.todolist;
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
