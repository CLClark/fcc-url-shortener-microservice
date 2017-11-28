// server.js

// init project
var express = require('express');
var app = express();
var crypto = require("crypto");
var fs = require('fs');
var json = require('./urlmap.json');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));


//app.get("/new/:toShorten", function (request, response) {
app.use("/new/", function (request, response, next) {
  //receive request and extract the given url
  var reqIn = request.originalUrl.slice(5).toLowerCase();
  //call next() for index page

  //check if it already exists
  //route requests out of this middleware
  let jArray = json.urls;
  if(reqIn.substring(0,4) !== "http"){
    
    //send an error-rific JSON obj
    response.json(({
      "error" : "URL Invalid"
    }));
  } 
  else{
    let flagToFire = true;
    //iterate through the JSON map      
    for (let urlObj of jArray){
        //console.log(jArray.length + "asdf");
      if(reqIn == urlObj.old_url.toLowerCase()){ //if the request already exists as a .old_url
        //output the existing mapping (JSON)      & stop searching
        console.log("iterated through jArray, found it already exists");
        flagToFire = false;
        response.json(jfyer( urlObj.old_url, ("https://" + request.hostname + "/" + urlObj.new_url) ));        
      }
    }
    if (flagToFire == true){
      var id = crypto.randomBytes(6).toString('hex');    //generates 12 chars
      //then, attach to it the given 'long' url 
      var objToPush = { "old_url" : request.originalUrl.slice(5) , "new_url" : id };
      console.log(objToPush.old_url + "obj to push .old");
      //push the new redirect mapping to urlmap.json
      json.urls.push(objToPush);
      //console.log(objToPush);      

      fs.writeFile('/util/app/urlmap.json', json, function(){
        //send the response      
        response.json(
          jfyer( objToPush.old_url, ("https://" + request.hostname + "/" + objToPush.new_url))
        );
      });      
    }
  }
});

//method for requests sent to new url
app.use(function (req, res, next){
  var toFind = req.originalUrl.toLowerCase().slice(1);
  let wait = false; 
  if(req.originalUrl == "/" || req.originalUrl == ""){
    res.sendFile(__dirname + '/views/index.html');
    console.log(toFind + "If statement Suceeds | " + req.originalUrl);
    wait = true;
  };  
  
  if(wait == false){
    let jArray = json.urls;  
    //console.log(toFind + "request original url | " + req.originalUrl);

    //let wait = false;  
    for (let urlObj of jArray){
      //console.log(urlObj.old_url + " $old v new$ " + toFind)
      let toCheck = urlObj.new_url;
      console.log(toCheck +" | " + toFind); //each object in json array
      if(toFind == toCheck){
        //output the existing mapping (JSON)      & stop searching
        console.log("FOUND in jArray");      
        return res.redirect(urlObj.old_url);       
      }
    }
    res.redirect("/");
    //if ( wait == false ){next();}
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

function findIt(urlObj){
  return urlObj.old_url;
}

//simplify the response calls
function jfyer (longOne, shortOne){  
  var jOut = { "original_url": longOne, "short_url": shortOne};  
  var stringOut = JSON.stringify(jOut);   
  //return stringOut;
  return jOut;
}

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});