# Model-View-Controller

## You should also read

* AngularJS in Chrome packaged app tutorial

* AngularJS tutorial

Note: Chrome packaged apps don't enforce any specific framework or programming style. This section and some other parts of this tutorial, however, uses the AngularJS framework. Most of the code from this section was copied, with small changes, from the AngularJS tutorial. 

## Create a simple view using AngularJS

1. Download the [Angular script](http://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js)

1. Change your index.html to use a simple Angular sample:
        
        <html ng-app ng-csp>
          <head>
            <script src="angular.min.js"></script>
            <link rel="stylesheet" href="todo.css">
          </head>
          <body>
            <h2>Todo</h2>
            <div>
              <ul>
                <li>
                  {{todoText}}
                </li>
              </ul>
              <input type="text" ng-model="todoText"  size="30"
                     placeholder="type your todo here">
            </div>
          </body>
        </html>


## Add a Controller

The previous sample, although interesting, is not exactly useful. Let's transform it into a real Todo list, instead of a simple Todo item. We will create a controller (todo.js) and make some small changes in the index.html:

1. Add the controller.js file:

        function TodoCtrl($scope) {
          $scope.todos = [
            {text:'learn angular', done:true},
            {text:'build an angular Chrome packaged app', done:false}];
         
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

1. Change index.html file:

        <html ng-app ng-csp>
          <head>
            <script src="angular.min.js"></script>
            <script src="controller.js"></script>
            <link rel="stylesheet" href="todo.css">
          </head>
          <body>
            <h2>Todo</h2>
            <div ng-controller="TodoCtrl">
              <span>{{remaining()}} of {{todos.length}} remaining</span>
              [ <a href="" ng-click="archive()">archive</a> ]
              <ul>
                <li ng-repeat="todo in todos">
                  <input type="checkbox" ng-model="todo.done">
                  <span class="done-{{todo.done}}">{{todo.text}}</span>
                </li>
              </ul>
              <form ng-submit="addTodo()">
                <input type="text" ng-model="todoText" size="30"
                       placeholder="add new todo here">
                <input class="btn-primary" type="submit" value="add">
              </form>
            </div>
          </body>
        </html>

Note how the data, stored in an array inside the controller, binds to the view and is automatically updated when it is changed by the controller.

Takeaways: 

* Packaged apps are offline first, so the recommended way to include third-party scripts is to download and package them inside your app.

* You can use any framework you want, as long as it complies with Content Security Policies and other restrictions that Chrome packaged apps are enforced to follow.

* MVC frameworks make your life easier. Use them, specially if you want to build a non-trivial application.

