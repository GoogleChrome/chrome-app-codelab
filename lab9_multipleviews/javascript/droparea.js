const PLACEHOLDER_IMAGE = "loading.gif";
const defaultDropText = "Or drop files here...";

var dropText = null;

window.addEventListener('DOMContentLoaded', function() {
  dropText = document.getElementById('dropText');
  dropText.innerText = defaultDropText;
});

  // on dragOver, we will change the style and text accordingly, depending on 
  // the data being transfered
  var dragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();
    var valid = isValid(e.dataTransfer);
    if (valid) {
      dropText.innerText="Drop files and remote images and they will become Todos";
      document.body.classList.add("dragging");
    } else {
      dropText.innerText="Can only drop files and remote images here";
      document.body.classList.add("invalid-dragging");
    }
  }

  var isValid = function(dataTransfer) {
    return dataTransfer && dataTransfer.types 
      && ( dataTransfer.types.indexOf('Files') >= 0 
        || dataTransfer.types.indexOf('text/uri-list') >=0 )
  }

  // reset style and text to the default
  var dragLeave = function(e) {
    dropText.innerText=defaultDropText;
    document.body.classList.remove('dragging');
    document.body.classList.remove('invalid-dragging');
  }

  // on drop, we create the appropriate TODOs using dropped data
  var drop = function(e, model) {
    e.preventDefault();
    e.stopPropagation();
    if (isValid(e.dataTransfer)) {
      if (e.dataTransfer.types.indexOf('Files') >= 0) {
        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
          var text = files[i].name+', '+files[i].size+' bytes';
          model.addTodo(text, false, {file: files[i]});
        }
      } else { // uris
        var uri = e.dataTransfer.getData("text/uri-list");
        var extras = { uri: uri };
        if (/\.png$/.test(uri) || /\.jpg$/.test(uri)) {
          hasImage = true;
          extras.validImage = true;
          extras.imageUrl = PLACEHOLDER_IMAGE;
        }
        model.addTodo(uri, false, extras);
      }
    }

    dragLeave();
  }
  

  window.setDragHandlers = function(model) {
    document.body.addEventListener("dragover", dragOver, false);
    document.body.addEventListener("dragleave", dragLeave, false);
    document.body.addEventListener("drop", function(e) {
        drop(e, model);
      }, false);
  }

