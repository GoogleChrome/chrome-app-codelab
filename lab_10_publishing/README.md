Lab 10 - Publishing
===================

An app without users is just a piece of code.  To get users you need to distribute your application.  All Chrome applications are distributed through the [Chrome Web Store](https://chrome.google.com/webstore).  For those not familar with the store, it provides several benefits to users and developers.

For users:

*  Added security, all apps and extensions are checked for Malware signals
*  All apps are maintained with the latest version the developer has published
*  A great way to see the quality of applications by looking at the ratings and reviews

For developers, the web store:

*  lets you upload your app once and know that it will be distributed to all users
*  payments and subscriptions built in
*  makes you more discoverable to users
*  offers tools to manage bugs and reviews from users

The Chrome Web Store has a special [dashboard for Developers](https://chrome.google.com/webstore/developer/dashboard) that lets you upload new applications and update existing applications.

The functionality to upload new-style Chrome Apps has only just been enabled for developers and we need as much feedback as possible on the process.

The process of uploading apps is simple:

1.  Compress your applications root directory (the folder containing the manifest.json file)
2.  Visit the [dashboard](https://chrome.google.com/webstore/developer/dashboard) and click "Upload new application".
    ![Developer Dashboard](https://raw.github.com/Meggin/chrome-apps-appcelerated/master/lab_10_publishing/imgs/developerdashboard.png)
3.  Find the file in your system.
    ![Developer Dashboard Upload](https://raw.github.com/Meggin/chrome-apps-appcelerated/master/lab_10_publishing/imgs/upload.png)
    ![Developer Dashboard Find](https://raw.github.com/Meggin/chrome-apps-appcelerated/master/lab_10_publishing/imgs/findfile.png)
4.  Upload.

You should see a screen that looks like this.

![Developer Dashboard Edit](https://raw.github.com/Meggin/chrome-apps-appcelerated/master/lab_10_publishing/imgs/md.png)

Done.... Well not quite, nearly.

Now you need to upload the assets and extra meta information about your application before you can publish it to the world.  These include:

*  The icon to display in the store
*  The detailed description on what your application is, this is the thing that can help entice users to download your app
*  A screen-shot or video of your app (show the user what your app looks like)
*  The primary category where your app is listed
*  A small tile icon that will be displayed on the Chrome Web Store wall.

There are many other fields, but the above items are mandatory.  

If you are happy with everything, you can now publish your application to the public.  If you are not quite ready, that is fine you can save the draft for later, or you can publish it to a group of testers.

![Developer Dashboard Publish](https://raw.github.com/Meggin/chrome-apps-appcelerated/master/lab_10_publishing/imgs/publish.png)

Note: If anyone wants to create a tool that lets users quickly create all the required assets, developers would love you and I will love you long time.
