# Multiple Views

Unlike standard web apps, a Chrome packaged app has complete control of its windows. It can create any number of windows at arbitrary screen locations, control the window's look and feel, minimize, maximize and many more. In this lab, we will only move the Drop are of our current application to another window. You will see with this code that windows can talk to each other and to the background page directly, synchronously, because they are all in the same thread.

1. Let's adapt our code then. Start by removing the droptext `<div>` from index.html and creating a new HTML with the drop area:
    ```html
    <html ng-app ng-csp>
      <head>
        <script src="angular.min.js"></script>
        <script src="droparea.js"></script>
        <link rel="stylesheet" href="todo.css">
        <title>File Drop</title>
      </head>
      <body ng-controller="DropCtrl" ng-class="dropClass">
        <h2>Drop Area</h2>
        <div>{{dropText}}</div>
      </body>
    </html>    
    ```
2. Move all drop-related functionality from controller.js to a new file, droparea.js:
    ```js
    function DropCtrl($scope) {
      // move to here the properties defaultDropText and $scope.dropText
      // move to here the methods dragOver, dragLeave and drop
    }
    ```

3. In the good and old controller.js, add the call to create a new window:
    ```js
    chrome.app.window.create('droparea.html',
      {id: 'dropArea', width: 200, height: 200 },
      function(dropWin) {
        dropWin.contentWindow.$parentScope = $scope; 
      });
    ```

And that's all. Thanks to the hierarchical scope support on Angular, the DropCtrl controller is a child of the TodoCtrl and inherits all the context of its parent.

# Takeaway:

* Web developers usually have a mindset of one-window-per-webapp. However, the Chrome packaged app platform opens more possibilities for your creativity. A document editor, for example, can have one window per open document, a more natural metaphor for apps that looks like native.
