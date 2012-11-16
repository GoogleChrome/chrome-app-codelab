Lab 7 - User Identity
=====================

Most modern applications are attached to the web to synchronise data.  When you are synchronising data you need to identify who the user is.  Chrome apps come with an identity API that makes it easy to integrate with any service that supports OAuth or other methods.

1.  Built in - Google Auth.
2.  Third Party Authentication (Twitter etc)

*Note*: Apps with authentication requrie the experiemental tag and cannot be uploaded to the Chrome Web Store [You can choose to skip this lab]

Integrating with Goolge
-----------------------

    "oauth2": {
        "client_id": "503955758982.apps.googleusercontent.com",
        "scopes": ["https://www.googleapis.com/auth/userinfo.profile"]
    }


Intergrating with a 3rd Party Service (FourSquare)
-----------------------------------------------

OAuth is normally really hard.  For full integration example, check out our [Foursquare demo](https://github.com/GoogleChrome/chrome-app-samples/tree/master/appsquare).  Chrome Apps have a dedicated API for lauching the authentication flow to any 3rd party service called `launchWebAuthFlow`

If you choose to interface with a non-Google party, your app will recieve the OAuth token via the URL query string, it uses the storage API to persist it.

When running it unpacked, your app will normally have a different ID depending on where it is loaded from (the unpacked extension ID is a hash of the path on disk). However, this will result in the auth API not working, since the redirect URL will be different. To force the unpacked app to have the same ID, add this key and value to manifest.json:

"key": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnyZBBnfu+qNi1x5C0YKIob4ACrA84HdMArTGobttMHIxM2Z6aLshFmoKZa/pbyQS6D5yNywr4KM/llWiY2aV2puIflUxRT8SjjPehswCvm6eWQM+r3mB755m48x+diDl8URJsX4AJ3pQHnKWEvitZcuBh0GTfsLzKU/BfHEaH7QIDAQAB"
(this is a base 64 encoded version of the app's public key)

Because we are accessing foursquare's API, you will also need to add `https://foursquare.com/*` to your `manifest.json`'s `permissions` array. 

The key must be removed before uploading it to the store.

Now let's get into the nitty gritty.

Create a file called `foursquare.js` in to your application and add the following code:

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

Now there is a lot going on in this (it is OAuth after all), but the critical part of the Chrome Process is the method called `launchAuthFlow` this will open a new Window that is isolated from your application (no one can query on inspect it) and handle the authentication part.

What is happening under the hood is as follows:

* Finally, the user is directed to the callback URL which Chrome is listening out for and it will fire the callback event registered in your `launchAuthFlow` call.  The `launchAuthFlow` recieves the URL that was the final redirect target from the authentication flow which in nearly all cases includes the information your app will need to identify the user - in our case the Access Token (which then needs to be exchanged.  The joys of OAuth).

This is really cool (at least Paul Kinlan thinks so).  We have a wrapper to Foursquare's authentication mechanism, and a way to call the API.  Now that we can do this, we really really need to be able to do something useful with it.

So in your `TODO` Javascript file, we need to hook up the API.

Lets create a button for Sign-in.

    <button id="signing">Sign-in</button>

Now we need to make this button do something.  Luckily Angular lets us do some cool stuff here, all we need to do is add items to the model that contains todos.

    var onSuccess = function(data) { };

    var onError = function(data) { };
    foursquare.getRecentCheckins(onSuccess, onError);

We will leave it up to the reader to make sure that every time the app is loaded, the new Data is fetched. (Hint, chrome.app.onLaunched evevent).

Now, after all this, you might argue, why is putting locations into my Todo list important if I had already been to the place.  My answer would be: that is a good question. ;) - but you got to see the Chrome Identity API in action.
