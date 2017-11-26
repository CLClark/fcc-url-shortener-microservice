// server.js

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/api/whoami", function (request, response) {
  var reqIn = request.ip; //string of ip
  //var accLang = request.acceptsLanguages();
  var accLang = request.get('Accept-Language');
  
  //parse header for software
  var uAgentStr = request.get('User-Agent');
  var regExp = /\((.*)\)/;
  var matches = regExp.exec(uAgentStr);  
  
  //header stuff
  var cOptions = {httpOnly: true };
  response.cookie('connect.sid','one-cookie-to-rule-them-all', cOptions);
  response.type('json');
  
  //send the response
  response.send(jfyer(reqIn, accLang, matches[1]));  
});

//make my own middleware
app.use( function ( request, response, next ){
  //do nothing

  next();
});


//simplify the response calls
function jfyer (ipAddy, langInfo, softWhat){  
  var jOut = { "ipaddress": ipAddy, "language": langInfo, "software": softWhat };  
  var stringOut = JSON.stringify(jOut);   
  return stringOut;
}

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
