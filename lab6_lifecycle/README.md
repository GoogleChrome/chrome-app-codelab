# Lifecycle

## You should also read
[Chrome packaged app - Manage App Lifecycle](http://developer.chrome.com/apps/app_lifecycle.html)

## The background page

The background page is one of the most important pieces of a Chrome packaged app. It is the single piece that is kept running even when your app has no windows shown. For example, if your app is a instant messenger, you might want to keep code running that only shows an UI when there is a new notification.

For simpler apps, the background page will simply lurk in the background, listen to the app lifecycle events and react appropriately. There are two important lifecycle events, onLaunched and onRestarted. 

## The onLaunched event and the chrome.app.window.create method

onLaunched is the most important event. It fires when the user clicks on your app's icon, with the intent of launching it. For most simpler apps, the background page will listen to this event and will open a window when it fires. See our `main.js` and you will see the most common usage of it.

### Windows with IDs

The chrome.app.window.create method can associate an ID to the window being opened. Currently, the most interesting use for this is to restore width, height and location of the window and of its associated Developer Tools window, if opened, when the app is launched. 

Execute your app as it is now, move and resize the window, close and restart it. It will reopen on the original location, right? Now add a property `id` to the `main.js`, reload the app and test again:

``` js
chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('index.html',
      {id: 'mainwindow', width: 500, height: 309});
  });
```

If your application requires, you can open more than one window.


## The onRestarted event

The onRestarted event is not as essential as onLaunched, but it might be relevant to certain types of apps. Instead of the onLaunched event, it is executed when the app is launched for the first time after being quit by a Chrome restart. You can use this event to restore a transient state. 

For example, if your app has a form with several fields, you not always want to save the partial form while the user is typing, because if the user quit the app on purpose, she might not be interested in having that partial data back later. However, if the Chrome runtime restarted for some reason other than by user's intention, it is desired to have that data back again when the app is restarted.

So, let's change our code to save the TODO input field in chrome.storage.local as the user types, and only restoring it if the onRestarted event is triggered.

> Note: We learned about chrome.storage.sync before, but chrome.storage.local wasn't mentioned til now. Both have exactly the same syntax, but the semantics of chrome.storage.local is, as the name says, completely local. There is no attempt to synchronize or to save the data in the cloud on chrome.storage.local.

* Background page: main.js
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

* The background page might be running even when your windows are closed. You can move logic that is shared among windows to the background page, as we will see in lab9.

