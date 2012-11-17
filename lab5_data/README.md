# Manage Data

## You should also read
[Chrome packaged app - Manage data docs](http://developer.chrome.com/apps/app_storage.html)

## Save your TODOs in the cloud

The sample from Lab 3 uses a static array of TODOs, and every time your app is restarted, the changes are lost. In this section, we will save every change in the Chrome Sync Storage, which is an area where you can storage *small things* that automatically syncs to the cloud if you are online and logged in Chrome. Otherwise, it just saves locally.

Note: Chrome Sync Storage is not intended to be used as a generic database. There are several restrictions on the amount of information you can save on it, so it is more appropriate to save settings and other small chunks of data. 

1. Request permission to use storage in your manifest.json:
    ``` json
    {
      ... ,
      "permissions": ["storage"]
    }
    ```

2. Change your controller.js and, instead of a static list, get the TODO list from the syncable storage:
    ``` Javascript
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
    ```

3. In the HTML, call save() whenever the data changes. There are many other ways of doing this in Angular, like using $watchers on the scope. The one used here makes the save() calls explicit.
    ``` html
    ...
           [ <a href="" ng-click="archive() || save()">archive</a> ]
    ...
                <input type="checkbox" ng-model="todo.done" ng-change="save()">
    ...
           <form ng-submit="addTodo() || save()">
    ...
    ```

## Handle drag-and-dropped files and URLs

Suppose you want to create TODOs associated with local files and/or URLs. The natural way of doing it is to accept dropped items. It is pretty simple to add drag-and-drop support in a Chrome packaged app using the standard HTML5 Drag-and-Drop API.


1. In controller.js, add code to handle the events of dragover, dragleave and drop:
    ``` Javascript
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
    ```

2. To make all the area of the window accept the drop event and still work on the same scope, let's move the Angular scope definition from the div to the body in the index.html file. Also, let's associate the body's CSS class with the Angular controller's class, so we can change the class directly in the scope and have it automatically changed in the DOM:
    ``` html
    <body ng-controller="TodoCtrl" ng-class="dropClass">
    <!-- remember to remove the ng-controller attribute from the div where it was before -->
    ```

3. Add a message placeholder to warn the user that some types of dragging are not allowed:
    ``` html
    <div>
     {{dropText}}
    </div>
    ```

4. Add appropriate styling for the `dragging` and `invalid-dragging` CSS classes in `todo.css`. Here we used a green or red background color animation:
    ``` css
    @-webkit-keyframes switch-green {
      from { background-color: white;} to {background-color: rgb(163, 255, 163);}
    }
    @-webkit-keyframes switch-red {
      from { background-color: white;} to {background-color: rgb(255, 203, 203);}
    }
    .dragging {
      -webkit-animation: switch-green 0.5s ease-in-out 0 infinite alternate;
    }

    .invalid-dragging {
      -webkit-animation: switch-red 0.5s ease-in-out 0 infinite alternate;
    }
    ```


# Challenge:
The current code only saves the file reference, but it doesn't open the file. Using the [HTML5 Filesystem API](http://www.html5rocks.com/en/tutorials/file/filesystem/), save the file contents in a sandboxed filesystem. When the TODO item is archived, remove the corresponding file from the sandboxed filesystem. Add an "open" link on each TODO that has an associated file and, when the item is clicked and the file exists in the sandboxed filesystem, use the Chrome packaged app [Filesystem extension](http://developer.chrome.com/apps/fileSystem.html) to request an writable FileEntry from the user and save the file data from the sandboxed filesystem into that entry.

> Tip: managing file entries using the raw HTML5 Filesystem API is not trivial. You might want to use a wrapper library, like Eric Bidelman's [filer.js](https://github.com/ebidel/filer.js)


# Takeaways: 

* Use chrome.storage.sync to save small data that you need to be sync'ed among devices, like configuration options, application state, etc. The sync is automatic, as long as the same user is logged into Chrome on all devices.

* Chrome packaged apps support almost all HTML5 APIs, such as drag and drop. HTML Filesystem API is also completely supported, and you also have some extra features from the Chrome packaged app's Filesystem API extension, like asking the user to pick files on her local disk for read and write. The vanilla HTML5 Filesystem API only allow access to a sandboxed filesystem.

