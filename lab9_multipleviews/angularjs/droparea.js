function DropCtrl($scope) {
  var defaultDropText = "Or drop files here...";
  $scope.dropText = defaultDropText;
  
  // on dragOver, we will change the style and text accordingly, depending on 
  // the data being transfered
  var dragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var valid = e.dataTransfer && e.dataTransfer.types 
      && ( e.dataTransfer.types.indexOf('Files') >= 0 
        || e.dataTransfer.types.indexOf('text/uri-list') >=0 )
    $scope.$apply(function() {
      $scope.dropText = valid ? "Drop files and remote images and they will become Todos"
          : "Can only drop files and remote images here";
      $scope.dropClass = valid ? "dragging" : "invalid-dragging";
    });
  };

  // on drop, we create the appropriate TODOs using dropped data
  var drop = function(e) {
    e.preventDefault();
    e.stopPropagation();

    var newTodos=[];
    if (e.dataTransfer.types.indexOf('Files') >= 0) {
      var files = e.dataTransfer.files;
      for (var i = 0; i < files.length; i++) {
        var text = files[i].name+', '+files[i].size+' bytes';
        newTodos.push({text:text, done:false, file: files[i]});
      }
    } else { // uris
      var uri=e.dataTransfer.getData("text/uri-list");
      if (/\.png$/.test(uri)) {

      }
      newTodos.push({text:uri, done:false, uri: uri});
    }

    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
      for (var i = 0; i < newTodos.length; i++) {
        // Access the main window
        $parentScope.todos.push(newTodos[i]);
      }
      $parentScope.save();
      $parentScope.$apply();
    });
  }

  var dragLeave = function(e) {
    $scope.$apply(function() {
      $scope.dropText = defaultDropText;
      $scope.dropClass = '';
    });
  };
  document.body.addEventListener("dragover", dragOver, false);
  document.body.addEventListener("dragleave", dragLeave, false);
  document.body.addEventListener("drop", drop, false);
};
