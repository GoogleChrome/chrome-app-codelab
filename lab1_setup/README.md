# Lab 1 - Set up development environment

## Dependencies and prerequisites

* [Chrome Canary on Mac and Windows](https://tools.google.com/dlpage/chromesxs) and [Chromium Dev on Linux](http://www.chromium.org/getting-involved/dev-channel#TOC-Linux)

* Your preferred text editor. We have an under-development [Chrome apps plugin](http://chrome-api.storage.googleapis.com/index.html) for [Sublime](http://www.sublimetext.com).

## Set up Chrome

1. Make sure you are using Chrome Canary. Access `chrome://version` and check if there is a `canary` keyword at the end of the first line:<br>
![Checking Chrome version](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab1_setup/imgs/screenshot1.png)

1. Enable flags in `chrome://flags`
    * Experimental Extension APIs
    * Enable debugging for packed apps

1. Enable Developer mode in `chrome://extensions`:<br>
![Enabling developer mode](https://raw.github.com/GoogleChrome/chrome-app-codelab/master/lab1_setup/imgs/screenshot2.png)

## Set up workspace

If you don't have it yet, [install git](https://help.github.com/articles/set-up-git) and run 

```
    git clone git://github.com/GoogleChrome/chrome-app-codelab.git
```

Note: for the rest of this tutorial, we'll refer to the directory for the cloned git repository as &lt;tutorial&gt;.

