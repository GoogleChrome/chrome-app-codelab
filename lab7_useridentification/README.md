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

You can integrate with Google services easily by using our enhanced OAuth2 flow.  

> Warning: Currently, this feature is only available to whitelisted apps which need to be enabled by a team in the US, so you might want to skip this for now.

1.  Add an oauth2 configuration to your manifest. The oauth2 scope defines the Google services that you want to interact with. The user will be prompted at install time regarding the services you intend to interact with. The oauth2 client ID is obtained from the [Google Developer console](http://developer.google.com/console).
    ``` js
    {
        ...,
        "oauth2": {
            "client_id": "yourappnumber.apps.googleusercontent.com",
            "scopes": ["https://www.googleapis.com/auth/userinfo.profile"]
        }
    }
    ```

2.  Start the authentication flow using [getAuthToken](http://developer.chrome.com/trunk/apps/experimental.identity.html#method-getAuthToken). We manage the rest.
    ```js
    chrome.experimental.identity.getAuthToken(function(token) { 
        if (token) {
            this.accessToken = token;
            // Store the token
        }
          
    }.bind(this)); 
    ```

## Integrating with a 3rd Party Service

Chrome apps have a dedicated API for lauching the authentication flow to any 3rd party service, called [launchWebAuthFlow](http://developer.chrome.com/trunk/apps/experimental.identity.html#method-launchWebAuthFlow).
To show how this flow works, we're going to update our sample to import [Google Tasks](https://developers.google.com/google-apps/tasks/) into the Todo list.

### Register with the provider
To register with a third-party provider, you need to follow whatever protocol they have to access their APIs.
Here we are treating the Google API as a third-party service and following Google's protocol for accessing their APIs.
(This also happens to be a handy way to get around the Google API whitelisting for the time being.)

1. Create a new project in the [Google API console](https://code.google.com/apis/console).
2. Activate the Tasks API on [Services](https://code.google.com/apis/console/b/0/?pli=1#project:399702396726:services).
3. Create a new OAuth2.0 client ID on API Access. Choose Web application and leave other fields unchanged.
4. Click to Edit settings for the newly created client ID.
5. In Authorized Redirect URLs, add "https://<YOURAPP_ID>.chromiumapp.org/",
replacing <YOURAPP_ID> with your app ID (the app's long alphanumeric ID in `chrome://extensions`).

### Add permissions

Update the [manifest.json](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/manifest.json) to include the "experimental" and Google API tasks endpoint permissions:
```json
{
     ... ,
     "permissions": ["storage", "experimental", "https://www.googleapis.com/tasks/*"]
}
```

### Add Google tasks to the Todo list
Soon your app will be able to import tasks from the Google Tasks API into the Todo list.
For this to work, your app needs a valid access token.
Once it has this token, it can call the Google Tasks API.
The app also needs a new button. When pressed, the user's Google tasks will appear in the Todo list.

1. Create a new file to authenticate access to the Google Tasks API: [gpapi_tasks.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/gapi_tasks.js).
This calls `launchWebFlow` and gets a valid access token for the Tasks API url indicated in the `manifest.json`

2. Add a new method to [controller.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/controller.js) that imports the Google tasks into the Todo list:
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

3. Replace line 109 in [controller.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/controller.js) with your new project's Client ID string, something like:
    ```js
    var clientId = "xxxxxxxxxxxxxx..apps.googleusercontent.com";
    ```
4. Update [index.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab7_useridentification/index.html) to include `gpapi_tasks.js` and add a new button to call `importFromGTasks`:
```html
<button ng-click="importFromGTasks()">import tasks from GTasks</button>
</html>
```

> Note: If you get stuck and want to see the app in action,
go to `chrome://extensions`, load the unpacked [lab7_useridentification](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab7_useridentification) app,
and launch the app from a new tab.

# What's next?

In [lab8_webresources](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab8_webresources),
you will learn how to load and show images from a remote URL.

> Note: Up until now, the code in each lab builds upon the previous lab code sample.
We've decided not to include the user identification code changes in the remainder of the lab since the `identity API` is still experimental (and you wouldn't be able to publish the sample code to the store).