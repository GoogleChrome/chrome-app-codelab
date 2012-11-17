function TodoCtrl($scope) {
  chrome.storage.sync.get('todolist', function(value) {
    $scope.$apply(function() {
      $scope.load(value);
    });
  });

  var defaultDropText = "Or drop files here...";
  $scope.dropText = defaultDropText;
  
  var dragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var valid = e.dataTransfer && e.dataTransfer.types 
      && e.dataTransfer.types.indexOf('Files') >= 0
    $scope.$apply(function() {
      $scope.dropText = valid ? "Drop files and they will become Todos"
          : "Can only drop files here";
      $scope.dropClass = valid ? "dragging" : "invalid-dragging";
    });
  }

  var dragLeave = function(e) {
    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
    });
  }

  var drop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    var files = e.dataTransfer.files;

    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
      for (var i = 0; i < files.length; i++) {
        var text = files[i].name+', '+files[i].size+' bytes';
        $scope.todos.push({text:text, done:false, file: files[i]});
      }
      $scope.save();
    });
  }

  document.body.addEventListener("dragover", dragOver, false);
  document.body.addEventListener("dragleave", dragLeave, false);
  document.body.addEventListener("drop", drop, false);

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
