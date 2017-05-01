const express = require( 'express' )
    , app = express()
    , bodyParser = require( 'body-parser' )
    , manager = require( './manager.js' )
    , handlers = require( './handlers.js' )
    , utils = require( './utils.js' );

app.use( bodyParser.json() );

app.get( '/', ( req, res ) => {
  res.sendFile( __dirname + '/public/index.html' ); 
});
app.get( '/index.:filetype', ( req, res ) => {
  res.sendFile( __dirname + '/public/index.' + req.params.filetype );
});


app.get( '/write/', ( req, res ) => {
  res.sendFile( __dirname + '/public/write/index.html' );
});
app.get( '/write/index.:filetype', ( req, res ) => {
  res.sendFile( __dirname + '/public/write/index.' + req.params.filetype );
});

app.get( '/post/index.:filetype', ( req, res ) => {
  res.sendFile( __dirname + '/public/post/index.' + req.params.filetype );
});
app.get( '/post/:id/:title?', ( req, res ) => {
  res.sendFile( __dirname + '/public/post/hash/index.html' );
});

app.get( '/author/index.:filetype', ( req, res ) => {
  res.sendFile( __dirname + '/public/author/index.' + req.params.filetype );
});
app.get( '/author/:id/:title?', ( req, res ) => {
  res.sendFile( __dirname + '/public/author/hash/index.html' );
});


app.post( '/api/new/post', ( req, res ) => {

  res.setHeader( 'Content-type', 'application/json' );

  const ret = { succeeded: false }
      , error = handlers.consumeNewPost( req.body, ret );

  if( !error )
    ret.succeeded = true;
  else
    ret.error = error;

  res.end( JSON.stringify( ret ) );
});
app.post( '/api/new/author', ( req, res ) => {

  res.setHeader( 'Content-type', 'application/json' );

  const ret = { succeeded: false }
      , error = handlers.consumeNewAuthor( req.body, ret );

  if( !error )
    ret.succeeded = true;
  else
    ret.error = error;

  res.end( JSON.stringify( ret ) );
});

app.listen( 8080 );

manager.loadFromFile( __dirname + '/base.json' );

utils.timedLog( 'app started at 8080' );
setInterval( () => manager.saveToFile( __dirname + '/save.json' ), 1000*60 );
