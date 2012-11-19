# Lab 6 - Lifecycle

Like everything in this world, apps have a lifecycle.  They are installed, launched, restarted, suspended when the system needs to free up resources and uninstalled.  This lab will show you the basics of the Chrome app lifecycle and how its heart, the event page (aka background script), is used.

## You should also read
[Manage App Lifecycle](http://developer.chrome.com/apps/app_lifecycle.html) in Chrome app docs

## The event page

The event page is one of the most important pieces of a Chrome app. It's responsible for what gets launched, when, and how. For example, if your app is an instant messenger, you might want your event page to only show a UI when there is a new notification.

For simpler apps, the event page listens to the app lifecycle events and reacts appropriately. There are two important lifecycle events, onLaunched and onRestarted.

## The onLaunched event and the chrome.app.window.create method

onLaunched is the most important event. It fires when the user clicks on your app's icon with the intent of launching it. For most simpler apps, the event page will listen for this event and open a window when it fires. See our `main.js` for the most common usage.

### Windows with IDs

The chrome.app.window.create method can associate an ID to the window being opened. Currently, the most interesting use for this is to restore a window's width, height and location and its associated Developer Tools window, if opened, when the app is launched. 

Execute your app as it is now, move and resize the window, close and restart it. The app will reopen in the original location, right? Now add a property `id` to the `main.js`, reload the app and test again:

``` js
chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html',
      {id: 'mainwindow', width: 500, height: 309});
  });
```

If your application requires, you can open more than one window.


## The onRestarted event

The onRestarted event is not as essential as onLaunched, but it might be relevant to certain types of apps. This event is executed when the app is restarted, for example, when Chrome quits, restarts, and the app is launched again. You can use this event to restore a transient state. 

For example, if your app has a form with several fields, you won't always want to save the partial form while the user is typing. If the user quits the app on purpose, she might not be interested keeping the partial data. If the Chrome runtime restarted for some reason other than by a user's intention, the user will want that data when the app is restarted.

Let's change our code to save the TODO input field in chrome.storage.local as the user types, only restoring it if the onRestarted event is triggered.

> Note: We learned about chrome.storage.sync before, but chrome.storage.local wasn't mentioned until now. Both have exactly the same syntax, but the semantics of chrome.storage.local is, as the name says, completely local. There's no attempt to synchronize or to save the data in the cloud.

* Event page: main.js
    ``` js
    chrome.app.runtime.onLaunched.addListener(function() {
      // normal launch initiated by the user, let's start clean.
      // note that this is not related to the persistent state, which is
      // appropriately handled in the window code.
      runApp(false);
    });

    chrome.app.runtime.onRestarted.addListener(function() {
      // if restarted, try to get the transient saved state
      runApp(true);
    });

    function runApp(readInitialState) {
      chrome.app.window.create('index.html',
        {id: 'mainwindow', width: 500, height: 309},
        // the create callback gets a reference to the AppWindow obj 
        function(win) {
          // when the callback is executed, the DOM is loaded but no script was
          // loaded yet. So, let's attach to the load event.
          win.contentWindow.addEventListener('load', function() {
            if (readInitialState) {
              win.contentWindow.setInitialState();
            } else {
              win.contentWindow.clearInitialState();
            }
          });
        });
    }
    ```

* Controller: controller.js
    ``` js
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
    }

    window.addEventListener('load', function() {
      var saveTransientState = function() {
        chrome.storage.local.set({'newtodo': newTodoInput.value});
      };
      newTodoInput = document.querySelector('input[type="text"]');
      newTodoInput.addEventListener('keypress' , function() {
        saveTransientState();    
      })
    })
    ```

# Takeaways: 

* The event page may continue to run even when your windows are closed. You can move logic that is shared among windows to the event page, as we will see in lab9.

