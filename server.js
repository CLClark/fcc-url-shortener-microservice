// server.js

// init project
var express = require('express');
var app = express();
var json = require('./urlmap.json');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/new/:toShorten", function (request, response) {
  //receive request and extract the given url
  var reqIn = request.params.toShorten; //string of ip  
  //create a new "short" url
  //then, attach to it the given 'long' url 
  
  //redirect any 'gets' for short url to the saved 'long' url
    
  //random header stuff
  var cOptions = {httpOnly: true };
  response.cookie('connect.sid','one-cookie-to-rule-them-all', cOptions);
  response.type('json');
    
  //send the response
  response.send(jfyer( json.urls[0].old_url, json.urls[0].new_url ));  
});

//make my own middleware
app.use( function ( request, response, next ){
  //do nothing

  next();
});


//simplify the response calls
function jfyer (longOne, shortOne){  
  var jOut = { "original_url": longOne, "short_url": shortOne};  
  var stringOut = JSON.stringify(jOut);   
  return stringOut;
}

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
