// server.js
// where your node app starts

var express = require('express');
var chrono = require('chrono-node');
var app = express();

app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

//could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.get("/:timeIn", function (request, response){
  response.type('json');
  
  //implentation logic, first check if it's unix time
  var timeIn = (parseInt(request.params.timeIn)*1000); //unix convert-from
  var toCheck = new Date(timeIn);  
  var toParse = request.params.timeIn.toLowerCase(); //Unprocessed String
  
  var options = { 
          //timeZone: 'UTC', 
          //timeZoneName: 'short',
          weekday: 'short',
          month: 'long',
          year: 'numeric',
          day: 'numeric',
          //hour: '2-digit',
          //minute: '2-digit'          
        };
  
  //easy condition - compare Date method ms getter to the parsed timeIn
  if(toCheck.getTime() == timeIn){ 
    response.send(jfyer((timeIn/1000),toCheck.toLocaleDateString('en-US',options))); //unix convert-to
  }
  //natural language check
  else{
    //pass results of parseDate into callback
    syncMaker(toParse, function cb(gottenBack){
      //check if parseDate returned a good object
      //weekday, year, month, day, hour, minute, second
      if (gottenBack !== null ){        
        var unixOut = (gottenBack.getTime()/1000); //unix convert-to
        var natLOut = gottenBack.toLocaleDateString('en-US',options);
        response.send(jfyer(unixOut,natLOut));
      }      
      else{
        response.send(jfyer(null,null));
      }
    });        
  }    
});

//sync the calls and response
function syncMaker(whatToParse, next){
  var dateObjOne = chrono.parseDate(whatToParse);    
  //pass results of chrono-node into callback
  next(dateObjOne);
}

//simplify the response calls
function jfyer (unix, nlang){  
  var jOut = { "unix": unix, "natural-language": nlang };
  var stringOut = JSON.stringify(jOut);   
  return stringOut;
}

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


