Lab 8 - Web Resources
=====================

Chrome apps by default have a strict Content Security Policy, which by default will not let the user
execture code or load resources that are hosted remotely.

Many applications however, need to be able to load and display content from a remote location - a News Reader for example needs to display remote content inline, or load in images from a remote resource.

This lab deals with loading external pages in to the view.  To load external images see [Lab 8b](http://testing.com)

Sites on the internet are inheriently a security risk, and hosting this directly in an application that has elevated priviledges is
a large risk.

Chrome apps offer developers the ability to securely host 3rd party content in their apps using a tag called <webview>.  The WebView
is like an iframe that you have can control with greater flexibility and with added security - it runs in a seperate sandbox and can't communitate directly with the application.  For a complete example of the WebView in action please visit the [Chrome Apps Sample](http://github.com/GoogleChrome/chrome-apps-samples).

The WebView has a very simple API.  From your app you can:

*  Change the location of the page of the WebView 
*  Navigate forwards and backward in the view from your app

Let's see how we can integrate WebView in to our application.

... Todo ...

Add the following code to your index.html

    <webview id="mainView"></webview>

This gives us the view that we can use to display external content in our application.

Now we need to make it useful.  A great place to add this in is if we detect a URL in a TodoItem we can open the link in the context of our application rather than in a brand new browser.

The first step is to intercept the click on any link in our app.

Now that we have this, we need to load the link in to the view.

    var view = document.getElementyById("#mainView");
    view.src = url;
    
Notice that the view is not yet visible.  Add the following code to scroll it in to position.

    ... todo ...


