# Lab 2 - Work with code

## Create your first Chrome app

There are three core pieces to any Chrome app:

* The manifest that descibes meta-information about your applicaiton: name, description, version number and how to launch your app
* The background script which sets up how your application responds to system events such as the user installing your app, the user launching your app and the system suspending your app
* The view (which is optional, but you normally need to show the user something)

Lets look at each of these components at their simplest level. 

1. In an empty directory (let's call it &lt;myappdir&gt;), create three files:
    * Manifest: [manifest.json](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab2_basic/manifest.json)

        ```json
        {
          "manifest_version": 2,
          "name": "My first app",
          "version": "1",
          "app": {
            "background": {
              "scripts": ["main.js"]
            }
          }
        }
        ```
    * Background script: [main.js](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab2_basic/main.js)
        ``` js
        chrome.app.runtime.onLaunched.addListener(function() {
            chrome.app.window.create('index.html',
              {width: 500, height: 309});
          });
        ```
    * User interface: [index.html](https://github.com/GoogleChrome/chrome-app-codelab/blob/master/lab2_basic/index.html)
        ```html
        <html>
          <head>
              <meta charset="utf-8">
              <title>Hello World</title>
          </head>
          <body>
              <h1>Hello, World!</h1>
          </body>
        </html>
        ```

1. Install and execute your sample app: 
    * Go to chrome://extensions.
    * Load unpacked extension...
    * Select the <myappdir> directory.
    * Open a new Chrome tab.
    * Click on the "My First App" icon.

## You should also read

* [Create Your First App](http://developer.chrome.com/trunk/apps/first_app.html)
* [chrome.app.runtime](http://developer.chrome.com/trunk/apps/app.runtime.html)
* [chrome.app.window](http://developer.chrome.com/trunk/apps/app.window.html)

## Debug, fix, and reload app.

>Tip: If you have enabled Developer mode in chrome://extensions, your apps can be inspected and debugged using the Chrome Developer Tools just like any standard web page:
>
>* Right-click on page, select Inspect Element.
>
>* For the background page which doesn't have UI, you can go to chrome://extensions and click on Inspect Views...


1. Change the text "Hello world" to "My first app" in index.html.

1. Change the main.js background script to create two windows instead of one. Don't bother to create another html. For now, you can open index.html on both.

1. After changing code, right-click on your app and select Reload App to reload the changed files. All Developer Tools windows will be reopened when you reload your app.

1. Launch the app in a new tab page. Move the top window and you will see the second window behind it. 

# Takeaways

* Chrome apps have three basic pieces. The first and foremost is the manifest.json, which describes your app, requests special permissions, defines important meta information and much more. The second part is the background script, which contains all logic not tied to a specific user interface. The last part is the user interface: HTML, CSS, JavaScripts related to the interface, images, etc.
* Chrome apps can be debugged just like standard web pages using the Chrome Developer Tools. But since an app doesn't have the Reload control of a browser, a Reload App option has been added when you run in Developer mode.

# What's next?

In [lab3_mvc](https://github.com/GoogleChrome/chrome-app-codelab/tree/master/lab3_mvc),
you will use the [AngluarJS framework](http://angularjs.org/) to build your app.
