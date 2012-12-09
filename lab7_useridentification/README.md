# Lab 7 - User Identity

Most modern applications are attached to the web to synchronize data. When synchronizing data, you need to identify who the user is.
Chrome apps come with an [identity API](http://developer.chrome.com/trunk/apps/experimental.identity.html) that makes it easy to integrate either with Google accounts or with any other service that supports OAuth.

1.  Built in - Google Authenticiation
2.  Third Party Authentication (Twitter, Foursquare, etc.)

## You should also read
[Identify User](http://developer.chrome.com/trunk/apps/app_identity.html) in Chrome app docs

> Note: Apps with authentication require the experimental permission in the manifest.json and, until they came out of experimental state, they cannot be uploaded to the Chrome Web Store.
If you prefer, you can choose to skip this lab.

## Authenticating with Google

We are working on a very easy integration flow for apps that authenticate with Google accounts. However, this flow is not yet available for general use. In the meantime, you may still use the third-party flow described below, even for Google services.

## Integrating with a thrid-party service

Chrome apps have a dedicated API for lauching the authentication flow to any third-party OAuth2 service, called [launchWebAuthFlow](http://developer.chrome.com/trunk/apps/experimental.identity.html#method-launchWebAuthFlow).
To show how this flow works, we're going to update our sample to import [Google Tasks](https://developers.google.com/google-apps/tasks/) into the Todo list.

### Register with the provider
To register with a third-party provider, in general you will need to register your application with the provider, and each provider has a different way of exposing that for you. In general, that will be available in a Developer or API section of your profile in the provider's website.

Here we are treating Google as a third-party service and following Google's own registration procedure for accessing its APIs.

1. Create a new project in the [Google API console](https://code.google.com/apis/console).
2. Activate the Tasks API on the Services secion.
3. Create a new OAuth2.0 client ID on API Access section. Select Web application and leave other fields unchanged.
4. Click on Edit settings for the newly created client ID.
5. In Authorized Redirect URLs, add `https://\<YOURAPP\_ID\>.chromiumapp.org/`,
replacing \<YOURAPP\_ID\> with your app ID (this is the app's long alphanumeric ID you can find in `chrome://extensions`).

### Add permissions

Update the [manifest.json](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/manifest.json) to include the "experimental" and Google API tasks endpoint permissions. Note that we also requested permission to make XHR requests to the Tasks service URL - for security reasons, you need explicit permission in the manifest for every URL you will call via XHR.
```json
{
     ... ,
     "permissions": ["storage", "experimental", "https://www.googleapis.com/tasks/*"]
}
```

### Add Google tasks to the Todo list
Now we are ready to authenticate the user and request his authorization so we can connect to the Tasks service and import his Google tasks into our Todo list. First, we will need to request an access token - which, at the first time will automatically present an authentication and authorization popup to the user.
Once we have this token, we can call the Google Tasks API.


1. Since this is time consuming and error prone, you can cheat and copy our JavaScript that handles the authentication to the Google Tasks API: [gpapi_tasks.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/gapi_tasks.js).
This script calls `launchWebFlow` and gets a valid access token for the specified client ID. This script also has simple JavaScript methods that, after authenticated, goes to the Tasks API and gets the user's task lists and the corresponding tasks.

2. Add a new method to the existing [controller.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/controller.js) that, using the methods from the previous step, authenticates the user and imports his Google tasks into the Todo list:
    ``` js
    $scope.importFromGTasks = function() {
      var api = new TasksAPI();
      var clientId = "<GET_YOURS_AT_https://code.google.com/apis/console>";
      api.authenticate(clientId, function() {
        api.getLists(function(result) {
          console.log(result);
          if (!result || !result.items || result.items.length==0) {
            throw "No task lists available";
          }
          var listId=result.items[0].id;
          api.getTasks(listId, function(tasks) {
            console.log(tasks);
            for (var j=0; j<tasks.items.length; j++) {
              $scope.$apply(function() {
                $scope.todos.push({text:tasks.items[j].title, done:tasks.items[j].status!="needsAction"});
              });
            }
          });
        });
      });
    }
    ```   

    >Note: replace the following line in the code above with your own project's Client ID that you got from the Google API Console. Should look like this:
    ```js
    var clientId = "xxxxxxxxxxxxxx.apps.googleusercontent.com";
    ```
Let's change The app also needs a new button. When pressed, the user's Google tasks will appear in the Todo list.

4. Now we just need a button that starts the import process. Update the `index.html` to include `gpapi\_tasks.js` and add a new button to call `importFromGTasks`:
```html
    <script src="gapi_tasks.js"></script>
    ...
    <button ng-click="importFromGTasks()">import tasks from GTasks</button>
```

> Note: If you get stuck and want to see the app in action,
go to `chrome://extensions`, load the unpacked [lab7_useridentification](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab7_useridentification) app,
and launch the app from a new tab.

# What's next?

In [lab8_webresources](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab8_webresources),
you will learn how to load and show images from a remote URL.

> Note: Up until now, the code in each lab builds upon the previous lab code sample.
We've decided not to include the user identification code changes in the remainder of the lab since the `identity API` is still experimental (and you wouldn't be able to publish the sample code to the store).
