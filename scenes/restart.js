

// this is a simple hack to restart css animation

var refresh_button = document.querySelector("#refresh");
refresh_button.addEventListener('click', function(){
  var app = document.querySelector("#app");
  var newone = app.cloneNode(true);
  app.parentNode.replaceChild(newone, app);
})


var restart_dot = document.querySelector("#restart");
restart_dot.addEventListener('click', function(){
  var app = document.querySelector("#appy");
  var newone = app.cloneNode(true);
  app.parentNode.replaceChild(newone, appy);
})
