/* jshint node: true, devel: true */

'use strict';

require('dotenv').config(); // A simple ".env" file with credential: APP_ID=xxx \n APP_SECRET=yyyyyy

const
    bodyParser           = require('body-parser'),
    express              = require('express'),
    favicon              = require('serve-favicon'),
    app                  = express(),
    http                 = require('http').Server(app),
    api                  = require('./api');

const
	PORT = 3000,
    oneMonth = 86400000 * 30;

app.set('port', PORT);
app.set('trust proxy', 1);
app.set('view engine', 'ejs'); // npm install ejs -g

///////////////////////////// Middleware /////////////////////////////

//app.use(express.static(__dirname + '/public'));
app.use(favicon('./public/img/favicon.ico'));
app.use(bodyParser.json());

///////////////////////////// Server Routes /////////////////////////////

app.get('/epg-channels/', function(req, res) {
    res.json(api.CHANNELS);
});

app.get('/epg-programme/', function(req, res) {

    var options = {
        // timeStamp: timeStamp,
        // channel: findChannel,
        // genres: findGenres,
        // recherche: findRecherche,
        // character: findCharacter,
        // ...
        limit:       500,
        recherche:   req.param('title') || '',
        longSummary: req.param('summary') || '',
        page:        parseInt(req.param('page')) || 1
    };

    api.getEpgPayload(function(programmes, total) {
        res.setHeader('X-total', total || 0);
        res.json(programmes);
    }, options);
});

app.get('/epg/*', function(req, res) { // https://bytel.tv/node/epg/144650041

    if (!req.params || !req.params['0']) { // req.params { '0': '145860879' }
        return res.status(200).send('Il manque le paramètre "eventId" dans l\'URL');
    }
    
    api.getEpgMovie(function(payload) {
        if (!payload || !payload.programInfo) {
            payload = {};
            res.status(404);
        }
    
        payload.thumb = 'https://api.bbox.fr/v1.3/public/magick/?eventId='+payload.eventId;

        //app.set('etag', false);
        res.setHeader('Cache-Control', 'public, max-age='+oneMonth);
        res.render('fiche_programme', payload);
        
    }, parseInt(req.params['0'])); // req.params['0'] == eventId
});

///////////////////////////// INDEX /////////////////////////////

app.use('/', function(req, res) {
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Index</title>
  </head>
  <body>
    <div class="container">
        <div class="row">
            <h1>Index for sample API Cloud APP(</h1>
            <p>Channels list:
            <br />
            <a href="./epg-channels">./epg-channels</a></p>
            <p>TV Programmes list:
            <br />
            <a href="./epg-programme">./epg-programme</a></p>
        </div>
    </div>
  </body>
</html>`);
});

///////////////////////////// 404 ! /////////////////////////////

app.use(function(req, res) { // Handle 404 error
    res
        .status(404)
        .send(`<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>404</title>
  </head>
  <body>
    <div class="container">
        <div class="row">\
            <h1>404: Page not Found :(</h1>\
            <br />\
            <h4>Retour à l'<a href="https://127.0.0.1:${PORT}">Accueil</a></h4>\
        </div>
    </div>
  </body>
</html>`);
});

///////////////////////////// Start Server App /////////////////////////////

http.listen(PORT, function() {
    console.log('App.js is running on https://127.0.0.1:'+ PORT);
});