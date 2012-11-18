# User Identity

## You should also read
[Identify User](http://developer.chrome.com/trunk/apps/app_identity.html) in Chrome app docs

## Authentication

Most modern applications are attached to the web to synchronize data. When synchronizing data, you need to identify who the user is. Chrome apps come with an [identity API](http://developer.chrome.com/trunk/apps/experimental.identity.html) that makes it easy to integrate either with Google accounts or with any other service that supports OAuth.

1.  Built in - Google Authenticiation
2.  Third Party Authentication (Twitter, Foursquare, etc.)

> Note: Apps with authentication require the experimental permission in the manifest.json and cannot be uploaded to the Chrome Web Store. If you prefer, you can choose to skip this lab.

## Integrating with Google

You can integrate with Google Services easily by using our enhanced OAuth2 flow.  

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

2.  Start the authentication flow. We manage the rest.
    ```js
    chrome.experimental.identity.getAuthToken(function(token) { 
        if (token) {
            this.accessToken = token;
            // Store the token
        }
          
    }.bind(this)); 
    ```

## Integrating with a 3rd Party Service (FourSquare)

OAuth is normally really hard. For a full integration example, check out our [Foursquare demo](https://github.com/GoogleChrome/chrome-app-samples/tree/master/appsquare). Chrome apps have a dedicated API for lauching the authentication flow to any 3rd party service, called `launchWebAuthFlow`.

If you choose to interface with a non-Google party, your app will receive the OAuth token via the URL query string. You can then use the storage APIs to persist it.

When running the app unpacked, your app will normally have a different ID depending on the directory it is loaded from (the unpacked extension ID is a hash of the path on disk). But the redirect URL used to configure your app with the provider is of the form:
    
    https://<appid>.chromiumapp.org/


So this will result in the auth API not working, since the redirect URL varies. To force the unpacked app to always have the same ID, add a `key` to your manifest.json. Since we will be accessing Foursquare API, we also need to request the appropriate permission:
```json
{
    ...,
    "key": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnyZBBnfu+qNi1x5C0YKIob4ACrA84HdMArTGobttMHIxM2Z6aLshFmoKZa/pbyQS6D5yNywr4KM/llWiY2aV2puIflUxRT8SjjPehswCvm6eWQM+r3mB755m48x+diDl8URJsX4AJ3pQHnKWEvitZcuBh0GTfsLzKU/BfHEaH7QIDAQAB",
    "permissions": ["https://foursquare.com/*"]
}
```

This key is a base64 encoded version of the app's public key. Remember, this key MUST be removed before uploading it to the Chrome Web Store.

Now let's get into the nitty gritty. Create a file called `foursquare.js` in your application and add the following code:
```js
 var foursquare = {};

 (function(api) {
     // See "Pure AJAX application" from
     // https://developer.foursquare.com/overview/auth
     var ACCESS_TOKEN_PREFIX = '#access_token=';

     var storage = chrome.storage.local;
     var ACCESS_TOKEN_STORAGE_KEY = 'foursquare-access-token';

     var getAccessToken = function(callback) {
     storage.get(ACCESS_TOKEN_STORAGE_KEY, function(items) {
         callback(items[ACCESS_TOKEN_STORAGE_KEY]);
         });
     }

     var setAccessToken = function(accessToken, callback) {
         var items = {};
         items[ACCESS_TOKEN_STORAGE_KEY] = accessToken;
         storage.set(items, callback);
     }

     var clearAccessToken = function(callback) {
         storage.remove(ACCESS_TOKEN_STORAGE_KEY, callback);
     }

     // Tokens state is not exposed via the API
     api.isSignedIn = function(callback) {
         getAccessToken(function(accessToken) {
             callback(!!accessToken);
         });
     };  

     api.signIn = function(appId, clientId, successCallback, errorCallback) {
         var redirectUrl = 'https://' + appId + '.chromiumapp.org/';
         var authUrl = 'https://foursquare.com/oauth2/authorize?' +
             'client_id=' + clientId + '&' +
             'response_type=token&' +
             'redirect_uri=' + encodeURIComponent(redirectUrl);
     
         chrome.experimental.identity.launchWebAuthFlow(
             {url: authUrl},
             function(responseUrl) {
                 if (chrome.extension.lastError) {
                     errorCallback(chrome.extension.lastError.message);
                     return;
                 }

                 var accessTokenStart = responseUrl.indexOf(ACCESS_TOKEN_PREFIX);

                 if (!accessTokenStart) {
                     errorCallback('Unexpected responseUrl: ' + responseUrl);
                     return;
                 }

                 var accessToken = responseUrl.substring(
                 accessTokenStart + ACCESS_TOKEN_PREFIX.length);

                 setAccessToken(accessToken, successCallback);
             }
         );
    };

    api.signOut = function(callback) {
      clearAccessToken(callback);
    };

    var apiMethod = function( path, postData, params, successCallback, errorCallback) {
         getAccessToken(function(accessToken) {
             var xhr = new XMLHttpRequest();
             xhr.onload = function() {
                successCallback(JSON.parse(xhr.responseText).response);
             }
             xhr.onerror = function() {
                errorCallback(xhr.status, xhr.statusText, JSON.parse(xhr.responseText));
             }

             var encodedParams = [];
             for (var paramName in params) {
                 encodedParams.push(encodeURIComponent(paramName) + '=' +
                 encodeURIComponent(params[paramName]));
             }
             xhr.open(
                 'GET',
                 'https://api.foursquare.com/v2/' + path + '?oauth_token=' +
                 encodeURIComponent(accessToken) + '&' + encodedParams.join('&'),
                 true);
             xhr.send(null);
         });
    }

    api.getRecentCheckins = apiMethod.bind(api, 'checkins/recent', undefined);
})(foursquare);
```

## Under the hood

There's a lot going on here (it's OAuth after all), but the critical part in the Chrome side is the method called `launchAuthFlow`. This handles the authentication part, and to ensure no one can query or inspect, it opens a new window isolated from your application.

Finally, the user is directed to the callback URL which Chrome is listening out for and it will fire the callback event registered in your `launchAuthFlow` call. The `launchAuthFlow` receives the final redirect target URL from the authentication flow. In nearly all cases, this URL includes the information your app will need to identify the user: the request token (which is used to get a valid access token... the joys of OAuth).

This is really cool. We have a wrapper to Foursquare's authentication mechanism, and a way to call the API. Now that we can do this, we really really need to be able to do something useful with it.

In your `TODO` Javascript file, we need to hook up the API.

Lets create a button for Sign-in.
    
```html
<button id="signing">Sign-in</button>
```

Now we need to make this button do something. Luckily Angular lets us do some cool stuff here. All we need to do is add items to the model that contains the todos.

```js
var onSuccess = function(data) { };
var onError = function(data) { };
foursquare.getRecentCheckins(onSuccess, onError);
```

We will leave it up to you to make sure that every time the app is loaded, the new data is fetched. (hint: chrome.app.runtime.onLaunched event).

After all this you might argue, "Why is putting locations into my Todo list important if I've already been to the place?"  That is a good question. ;) - but you got to see the Chrome Identity API in action.

