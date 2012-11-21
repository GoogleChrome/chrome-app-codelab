Lab 10 - Publishing
===================

An app without users is just a piece of code. To get users, you need to distribute your application. All Chrome applications are distributed through the [Chrome Web Store](https://chrome.google.com/webstore). For those not familiar with the store, it provides several benefits to users and developers.

For users:

*  Added security: all apps and extensions are checked for Malware signals.
*  All apps are maintained with the latest version the developer has published.
*  Ratings and reviews provide a great way to see the quality of applications.

For developers:

*  You can upload your app once and know that it will be distributed to all users.
*  Payments and subscriptions are built in.
*  Your app is more discoverable to users.
*  Tools help you manage bugs and reviews from users.

The Chrome Web Store has a special [dashboard for Developers](https://chrome.google.com/webstore/developer/dashboard) that lets you upload new applications and update existing ones.

The functionality to upload new-style Chrome Apps has only just been enabled for developers. We need as much [feedback](https://docs.google.com/a/google.com/forms/d/1x3309vpp-KTiHqZWOCQhjVrIWxkm0wEBp2IWMG2ywbU/viewform?id=1x3309vpp-KTiHqZWOCQhjVrIWxkm0wEBp2IWMG2ywbU) as possible on the process.

The process of uploading apps is simple:

1.  Compress your applications root directory (the folder containing the manifest.json file).
2.  Visit the [dashboard](https://chrome.google.com/webstore/developer/dashboard) and click "Upload new application".
    ![Developer Dashboard](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab_10_publishing/imgs/developerdashboard.png)
3.  Find the file in your system.
    ![Developer Dashboard Upload](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab_10_publishing/imgs/upload.png)
    ![Developer Dashboard Find](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab_10_publishing/imgs/findfile.png)
4.  Upload.

You should see a screen that looks like this:

![Developer Dashboard Edit](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab_10_publishing/imgs/md.png)

Done.... Well not quite, nearly.

Now you need to upload the assets and extra meta information about your application before you can publish it to the world.  These include:

*  The icon to display in the store
*  The detailed description of your application; this will entice users to download your app
*  A screen-shot or video of your app (show the user what your app looks like)
*  The primary category where your app is listed
*  A small tile icon that will be displayed on the Chrome Web Store wall

There are many other fields, but the above items are mandatory.

If you are happy with everything, you can now publish your application to the public. If you are not quite ready, you can save the draft for later, or you can publish it to a group of testers.

![Developer Dashboard Publish](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab_10_publishing/imgs/publish.png)

Note: if anyone wants to create a tool that lets users quickly create all the required assets, developers would love you and I will love you long time.
