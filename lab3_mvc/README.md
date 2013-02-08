# Lab 3 - Model-View-Controller

Whenever your application grows beyond a single script with a few dozen lines, it gets
harder and harder to manage without a good separation of roles among app components. One of the most common
models for structuring a complex application, no matter what language, is the Model-View-Controller (MVC) and
its variants, like Model-View-Presentation (MVP).

There are several frameworks to help apply [MVC concepts](http://developer.chrome.com/trunk/apps/app_frameworks.html) to a Javascript application, and most of them,
as long as they are CSP compliant, can be used in a Chrome App. We will use the [AngularJS](http://angularjs.org/) framework in parts of this tutorial, with a special focus on the framework in this section.

## You should also read

* [Build Apps with AngularJS](http://developer.chrome.com/apps/angular_framework.html) tutorial

* [AngularJS Todo](http://angularjs.org/) tutorial

> Note: Chrome apps don't enforce any specific framework or programming style. This section and additional parts of this tutorial use the AngularJS framework. Most of the code from this section was copied, with small changes, from the AngularJS Todo tutorial. 

## Create a simple view using AngularJS

1. Download the [Angular script](http://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js) and save it as [angular.min.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab3_mvc/angularjs/simpleview/angular.min.js).

1. Change your [index.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab3_mvc/angularjs/simpleview/index.html) to use a simple Angular sample:
    ```html
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
    ```

1. Add a simple stylesheet: [todo.css](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab3_mvc/angularjs/simpleview/todo.css)
   ```css
   body {
      font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
   }

   ul {
      list-style: none;
   }

   button, input[type=submit] {
      background-color: #0074CC;
      background-image: linear-gradient(top, #08C, #05C);
      border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
      text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
      color: white;
   }

   .done-true {
      text-decoration: line-through;
      color: grey;
   }
   ```

1. Check the results by reloading the app: open the app, right-click and select Reload App.

> Note: The ng-csp directive tells Angular to run in a "content security mode". You don't need this directive when using Angular v1.1.0+. We've included it here so that the sample works regardless of the Angular version in use.

## Add a Controller

The previous sample, although interesting, is not exactly useful. Let's transform it into a real Todo list, instead of a simple Todo item. We will create a controller (controller.js) and make some small changes in the index.html:

1. Add the [controller.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab3_mvc/angularjs/withcontroller/controller.js) file:
    ``` Javascript
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
    ```

1. Change [index.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab3_mvc/angularjs/withcontroller/index.html) file:
    ``` html
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
    ```

1. Check the results by reloading the app: open the app, right-click and select Reload App.

Note how the data, stored in an array inside the controller, binds to the view and is automatically updated when it is changed by the controller.

# Takeaways: 

* Chrome apps are offline first, so the recommended way to include third-party scripts is to download and package them inside your app.

* You can use any framework you want, as long as it complies with Content Security Policies and other restrictions that Chrome apps are enforced to follow.

* MVC frameworks make your life easier. Use them, specially if you want to build a non-trivial application.

# What's next?

Eventually in [lab4_testing](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab4_testing), you will test your app.
Right now this lab is a work-in-progress. [Please let us know what you need to test your apps](https://docs.google.com/a/google.com/forms/d/1x3309vpp-KTiHqZWOCQhjVrIWxkm0wEBp2IWMG2ywbU/viewform?id=1x3309vpp-KTiHqZWOCQhjVrIWxkm0wEBp2IWMG2ywbU).
You can then skip ahead to [lab5_data](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab5_data).
