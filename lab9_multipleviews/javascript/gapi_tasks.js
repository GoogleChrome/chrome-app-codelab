(function(context) {

  TasksAPI = function() {
  }

  TasksAPI.prototype.authenticate = function(clientId, success) {
    var authUrl="https://accounts.google.com/o/oauth2/auth"+
      "?response_type=token"+
      "&client_id="+clientId+
      "&redirect_uri=https://"+chrome.runtime.id+".chromiumapp.org/"+
      "&scope=https://www.googleapis.com/auth/tasks.readonly";

    var identityDetails = {
      url: authUrl,
      interactive: true
    };
    
    var _this = this;

    chrome.experimental.identity.launchWebAuthFlow(identityDetails, function(responseUrl) {
      if (!/access_token=(.*?)&/.test(responseUrl)) {
        throw "Invaild response from oauth server: "+responseUrl;
      }
      _this.accessToken=RegExp.$1;

      if (success) success();

    });

  }

  TasksAPI.prototype.getLists = function(callback) {
    this.request("users/@me/lists", callback);
  }

  TasksAPI.prototype.getTasks = function(listId, callback) {
    this.request("lists/"+listId+"/tasks", callback);
  }

  TasksAPI.prototype.request = function(method, callback, args) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      if (callback) {
        callback(JSON.parse(xhr.response));
      }
    };

    var url="https://www.googleapis.com/tasks/v1/"+method+"?access_token="+this.accessToken;
    if (args) for (arg in args) {
      // TODO: urlescape arg and args[arg]
      url += "&"+arg+"="+args[arg];   
    }

    xhr.open("GET", url);
    xhr.send();
  }

  context.TasksAPI = TasksAPI;
})(window);
