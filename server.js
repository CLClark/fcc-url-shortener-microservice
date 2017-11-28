// server.js

// init project
var express = require('express');
var app = express();
var crypto = require("crypto");
var fs = require('fs');
var json = require('./urlmap.json');
var mongodb = require('mongodb');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//db connection
var MongoClient = mongodb.MongoClient;
var url = process.env.COMPLETE;

function connectAndDo( workToDo ){
  MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      console.log('Connection established to', url);
      workToDo();
      //Close connection
      db.close();
    }
  });
}

//app.get("/new/:toShorten", function (request, response) {
app.use("/new/", function (request, response, next) {
  //console.log('using one');
  //receive request and extract the given url
  var reqIn = request.originalUrl.slice(5).toLowerCase();
  //call next() for index page

  //check if it already exists
  //route requests out of this middleware
  //let jArray = json.urls;
  var flagToFire = true;
  if(reqIn.substring(0,4) !== "http"){    
    //send an error-rific JSON obj
    response.json(({
      "error" : "URL Invalid"
    }));
  } 
  else{           
    MongoClient.connect(url, function (err, db) {      
      
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {      
      
        //check if the doc already exists
      var docOut = db.collection('urlmap').findOne({
        old_url: reqIn
      }, function (err,doc){
        if(err){console.log("find error");}
        else if (doc !== null){
          console.log(doc);          
          response.json( jfyer(
            doc.old_url,
            ("https://" + request.hostname + "/" + doc.new_url) 
          ));
           console.log(flagToFire);
        }
        else{
          flagToFire = false;
        }
      });
      //Close connection
      db.close();
      }
    //if(flagToFire == false){     
    //}      
    });
  }
 
  if (flagToFire == false){
 
      var id = crypto.randomBytes(6).toString('hex');    //generates 12 chars
      //then, attach to it the given 'long' url 
      var docToPush = { old_url : request.originalUrl.slice(5) , new_url : id };
      console.log(docToPush.old_url + " obj to push .old");
      //push the new redirect mapping to mongo
      MongoClient.connect(url, function (err, db) {
        if (err) { console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
          db.collection('urlmap').insertOne(docToPush, function(err, result){
            //console.log(result);
            response.json(jfyer(
              docToPush.old_url,
              ("https://" + request.hostname + "/" + docToPush.new_url))
            );
          });          
        }
        db.close();
      });
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
  }
  else{
  //if(wait == false){
    MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      
      db.collection('urlmap').findOne({
        new_url: toFind
      }, function (error, doc){
        console.log("Found in mongoDB");        
        res.redirect(doc.old_url);      
      });      
    }
    db.close();       
    });    
    res.redirect("/");
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