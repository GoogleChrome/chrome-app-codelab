# Lab 9 - Multiple Views

Unlike standard web apps, a Chrome app has complete control of its windows. It can create any number of windows at arbitrary screen locations, control the window's look and feel, minimize, maximize and much more.

In this lab, we will move the Drop area of our current application to another window. Here you can see how windows talk to each other and to the event page directly, synchronously, because they are all in the same thread.

1. Let's adapt our code then. Start by removing the droptext `<div>` from [index.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab9_multipleviews/index.html).

2. Create a new HTML with the drop area: [droparea.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab9_multipleviews/droparea.html)
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

3. Move all drop-related functionality from [controller.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab9_multipleviews/controller.js) to a new file, [droparea.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab9_multipleviews/droparea.js):
    ```js
    function DropCtrl($scope) {
      // move here the variable initializations for defaultDropText and $scope.dropText
      // move here the methods dragOver, dragLeave and drop
    }
    ```

4. In the existing controller.js, add the call to create a new window:
    ```js
    chrome.app.window.create('droparea.html',
      {id: 'dropArea', width: 200, height: 200 },
      function(dropWin) {
        dropWin.contentWindow.$parentScope = $scope; 
      });
    ```

And that's all. Thanks to the hierarchical scope support on Angular, the DropCtrl controller is a child of the TodoCtrl and inherits all the context of its parent.

To test, open the app, right-click, and select Reload App. Move the top view to the right, and you can see the additional view.

> Note: If you get stuck and want to see the app in action, go to `chrome://extensions`, load the unpacked [lab9_multipleviews](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab9_multipleviews), and launch the app from a new tab.

# Takeaway:

* Web developers usually have a mindset of one-window-per-webapp.
The Chrome app platform opens more possibilities for your creativity.
A document editor, for example, can have one window per opened document, a more natural metaphor for native-like apps.

# What's next?

In [lab_10_publishing](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab_10_publishing), we finish off with instructions on how to publish your app in the Chrome Web Store.