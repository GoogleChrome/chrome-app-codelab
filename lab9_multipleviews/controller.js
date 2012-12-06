function TodoCtrl($scope) {

  // Notice that chrome.storage.sync.get is asynchronous
  chrome.storage.sync.get('todolist', function(value) {
    // The $apply is only necessary to execute the function inside Angular scope
    $scope.$apply(function() {
      $scope.load(value);
    });
  });


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


  // Once the main window is created create the drop area. 
  chrome.app.window.create('droparea.html',
    {id: 'dropArea', width: 200, height: 200 },
    function(dropWin) {
      dropWin.contentWindow.$parentScope = $scope; 
    });
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


