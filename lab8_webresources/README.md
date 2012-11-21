# Lab 8 - Web Resources

Chrome apps have a strict Content Security Policy which will not let the user execute code or load resources that are hosted remotely.

Many applications, however, need to be able to load and display content from a remote location. A News Reader, for example, needs to display remote content inline or load and show images from a remote URL.

## You should also read

* [Embed Content](http://developer.chrome.com/apps/app_external.html) in Chrome app docs

## Loading external web content into an element

Sites on the internet are inherently a security risk and rendering arbitrary web pages directly into your application with elevated privileges would be a potential source of exploits.

Chrome apps offer developers the ability to securely render third-party content in the `<webview>` tag. A WebView is like an iframe that you can control with greater flexibility and added security. It runs in a separate sandboxed process and can't communicate directly with the application.

> Tip: The WebView has a very simple API.  From your app you can:
> 
> *  Change the URL of the WebView.
> *  Navigate forwards and backward, stop loading and reload.
> *  Check if the WebView has finished loading and if it is possible, go back and forward in the history stack.

We will change our code to render the content of URLs dropped in the drag-and-drop operations in a WebView when the user clicks on a link.

1. Start by adding a WebView tag and a link to index.html:
    ```html
    <!-- in TODO item -->
    <a ng-show="todo.uri" href="" ng-click="showUri(todo.uri)">(view url)</a>

    <!-- at the bottom, below the end of body -->
    <webview></webview>
    ```

2. Request a new permission, "webview", in manifest.json:
    ```json
    "permissions": ["storage", "webview"]
    ```

3. Set an appropriate width and height to the webview tag in CSS (it has zero size by default).

4. Thanks to AngularJS, we now only need to add the `showUri` method to our controller.js and we're done:
    ```js
    $scope.showUri = function(uri) {
      var webview=document.querySelector("webview");
      webview.src=uri;
    };

Test your modified app. You should be able to click on the "view url" link on any dropped URL TODO item, and the corresponding web page will show in the webview. If it's not showing, inspect the page and check if you set the webview size appropriately.

## Loading external images

If you try to add an `<img>` tag to your index.html, and point its `src` attribute to any site on the web, the following exception is thrown in the console and the image isn't loaded:
> Refused to load the image 'http://angularjs.org/img/AngularJS-large.png' because it violates the following Content Security Policy directive: "img-src 'self' data: chrome-extension-resource:".

Chrome apps cannot load any external resource directly in the DOM, because of the [CSP restrictions](http://developer.chrome.com/apps/app_csp.html).

To avoid this restriction, you can use XHR requests, grab the blob corresponding to the remote file and use it appropriately. For example, `<img>` tags can use a blob URL. Let's change our application to show a small icon in the TODO list if the dropped URL represents an image:

1. Before you start firing XHR requests, you must request permissions. Since we want to allow users to drag and drop images from any server, we need to request permission to XHR to any URL. Change manifest.json:
    ```json
    "permissions": ["storage", "webview", "<all_urls>"]
    ```

2. Add to your project a placeholder image ![loading.gif](https://github.com/GoogleChrome/chrome-app-codelab/raw/master/lab8_webresources/2_loading_resources/loading.gif) that will be shown while we are loading the proper image.

3. Add the `<img>` tag to the TODO item on the index.html:
    ```html
    <img style="max-height: 48px; max-width: 120px;" ng-show="todo.validImage" ng-src="{{todo.imageUrl}}"></img>
    ```
    Notice that this element will only be shown when the validImage attribute of the TODO item is true.

4. Add the method loadImage (either in controller.js or in a separate script file as we did), that will start a XHR request and execute a callback with a Blob URL:
    ```js
    var loadImage = function(uri, callback) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function() {
        callback(window.webkitURL.createObjectURL(xhr.response), uri);
      }
      xhr.open('GET', uri, true);
      xhr.send();
    }
    ```

5. In the controller.js, add a new method that will search the scope.todolist looking for images that are not loaded yet:
    ```js
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
    ```

6. In the controller.js, drop() method, change the handling of URIs to appropriately detect a valid image. For simplicity sake, we only tested for png and jpg extensions. Feel free to have a better coverage in your code.
    ```js
    var uri=e.dataTransfer.getData("text/uri-list");
    var todo = {text:uri, done:false, uri: uri};
    if (/\.png$/.test(uri) || /\.jpg$/.test(uri)) {
      hasImage = true;
      todo.validImage = true;
      todo.imageUrl = PLACEHOLDER_IMAGE;
    }
    newTodos.push(todo);

    // [...] inside the $apply method, before save(), call the loadImages method:
    $scope.loadImages();
    ```

7. And, finally, we will change the load method to reset the Blob URLs, since Blob URLs don't span through sessions. Setting TODO's imageUrls to the PLACEHOLDER_IMAGE will force the loadImages method to request them again:
    ```js
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
    ```

Assuming no mistakes were made, you should now have a thumbnail of every image URL dropped into the TODO list app.

> The loadImage() method above is not the best solution for this problem, because it doesn't handle errors correctly and it could cache images in a local filesystem. We are working on a library that will be much more robust and easier to use.

# Takeaways: 

* The `<webview>` tag allows you to have a controlled browser inside your app. You can use it if you have part of your application that is not CSP compatible and you don't have resources to migrate it immediately, for example. One feature we didn't mention here is that WebViews can communicate with your app and vice-versa using asynchronous [pushMessages](http://developer.chrome.com/trunk/apps/pushMessaging.html).

* Loading resources like images from the web is not straightforward compared to a standard web page. But it's not too different from traditional native platforms, where you need to handle the resource download and, only when it is correctly downloaded, you can render it in the UI.
