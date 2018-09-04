'use strict';

var request   = require('request'),
    moment    = require('moment'),
    fs        = require('fs'),
    crypto    = require('crypto');

const db = false; // Print console log ?

module.exports = {

    rd: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getDefaultThumb: function(genre) {

        var rd = module.exports.rd;

        var name = '';
        switch (genre) {
            case 'Erotisme'             : name = 'adulte1'; break;
            case 'Mode'                 :
            case 'Gastronomie'          :
            case 'Décoration'           :
            case 'Art de vivre'         : name = 'artdevivre' + rd(1, 3); break;
            case 'Automobilisme'        : name = 'automobile' + rd(1, 2); break;
            case 'Basket-ball'          : name = 'basketball1'; break;
            case 'Musique classique'    : name = 'classique' + rd(1, 2); break;
            case 'Découvertes'          : name = 'decouverte' + rd(1, 3); break;
            case 'Loisirs'              :
            case 'Divertissement'       : name = 'divertissement1'; break;
            case 'Documentaire'         : name = 'documentaire1'; break;
            case 'Film'                 : name = 'film1'; break;
            case 'Football'             : name = 'football1'; break;
            case 'Equitation'           :
            case 'Hippisme'             : name = 'hippisme1'; break;
            case 'Humour'               : name = 'humour1'; break;
            case 'Journal'              :
            case 'Information'          : name = 'information' + rd(1, 5); break;
            case 'Manga'                :
            case 'Dessin animé'         :
            case 'Animation'            : name = 'jeunesse' + rd(1, 2); break;
            case 'Jeunesse'             : name = 'jeunesse' + rd(1, 3); break;
            case 'Jeu'                  : name = 'jeux1'; break;
            case 'Météo'                : name = 'meteo1'; break;
            case 'Clips'                :
            case 'Musique'              : name = 'musique' + rd(1, 2); break;
            case 'Animalier'            :
            case 'Nature'               : name = 'nature1'; break;
            case 'Poker'                : name = 'poker1'; break;
            case 'Rugby'                : name = 'rugby1'; break;
            case 'Santé'                : name = 'sante1'; break;
            case 'Sciences et technique': name = 'sciences1'; break;
            case 'Série'                : name = 'serie1'; break;
            case 'Société'              : name = 'societe' + rd(1, 2); break;
            case 'Sport'                : name = 'sport' + rd(1, 2); break;
            case 'Télé-achat'           : name = 'teleachat1'; break;
            case 'Téléfilm'             : name = 'telefilm1'; break;
            case 'Téléréalité'          : name = 'telerealite1'; break;
            case 'Tennis'               : name = 'tennis1'; break;
            case 'Théatre'              : name = 'theatre1'; break;
            default                     : name = 'autre' + rd(1, 5); break;
        }
        return name + '.jpg';
    },

    CHANNELS: {}, // The complete list of channel is stocked here because we need permanently the data for each programme
    XTOKEN: {},

    getToken: function(callback) { // TOKEN IS FOR 24Hours...
        if (db) console.log('getToken()');  

        var todayCache = moment().format('YYYYMMDDH'),
            cacheFile  = './temp/toktok-'+todayCache+'.json',
            docs       = null;
        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
        }
        catch (err) {
            //if (db) console.log('getToken() No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            //if (db) console.log('getToken() Results in cache', cacheFile);
            var h = moment().format('YYYYMMDDH');
            module.exports.XTOKEN[h] = docs;
            callback(module.exports.XTOKEN[h]);
            return;
        }

        var postData = {
            appId: process.env.APP_ID, // declared on the .env file
            appSecret: process.env.APP_SECRET // declared on the .env file
        };

        request({
                url    : 'https://api.bbox.fr/v1.3/security/token',
                method : 'POST',
                json   : postData,
                headers: {
                    'content-type': 'application/json'
                }
            },
            function(error, response) {
                if (error || !response.headers['x-token']) {
                    console.log('getToken() error...');
                    return callback();
                }
                var h = moment().format('YYYYMMDDH');
                module.exports.XTOKEN[h] = response.headers['x-token'];
                fs.writeFileSync(cacheFile, response.headers['x-token']);
                callback(module.exports.XTOKEN[h]);
        });
    },

    getEpgChannels: function(callback) {
        if (db) console.log('getEpgChannels()');

        // CACHE ???
        var todayCache = moment().format('YYYYMMDD'),
            cacheFile  = './temp/getEpgChannels-'+todayCache+'.json',
            docs       = null;

        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
            docs = JSON.parse(docs);
        }
        catch (err) {
            if (db) console.log('No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            if (db) console.log('Results in cache', cacheFile);
            module.exports.CHANNELS = docs;
            callback(docs);
            return;
        }

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getEpgChannels() noToken ???', module.exports.XTOKEN);
            return callback();
        }

        request({
                url    : 'https://api.bbox.fr/v1.3/media/channels?profil=adsl', // TNT TODO !!! ADD Canal + (34)
                method : 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-token': module.exports.XTOKEN[h]
                }
            },
            function(error, response, body) {
                if (error) {
                    console.log('getEpgChannels() response error', error);
                    return callback();
                }
                var data = null,
                    channels = {};
                try {
                    data = JSON.parse(body);
                }
                catch (err) {
                    console.log('getEpgChannels() JSON.parse error !', err);
                    return callback();
                }
                for (var i = 0, len = data.length; i < len; i++) {
                    channels[data[i].epgChannelNumber] = data[i];
                }
                fs.writeFileSync(cacheFile, JSON.stringify(channels));
                module.exports.CHANNELS = channels;
                callback(channels);
        });
    },

    getVod: function(callback, options) { // time, midDay, now, tomorrow, channel, genre, recherche
        if (db) console.log('getVod()');

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getVod() noToken ???', module.exports.XTOKEN);
            return callback();
        }

        // BUILD URL

        var urlParams = 'https://api.bbox.fr/v1.3/media/vod/?mode=simple';

        if (options.parentalGuidance)
            urlParams += '&parentalGuidance='+options.parentalGuidance;
        else
            urlParams += '&parentalGuidance=1,2,3,4';    
        if (options.recherche)
            urlParams += '&title=' + encodeURIComponent(options.recherche);
        if (options.genres)
            urlParams += '&genres=' + encodeURIComponent(options.genres.join(','));
        if (options.page)
            urlParams += '&page=' + options.page;
        if (options.limit)
            urlParams += '&limit=' + options.limit;

        if (db) console.log('urlParams ---> ', urlParams);

        request({
                url    : urlParams, // profil=adsl
                method : 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-token': module.exports.XTOKEN[h]
                }
            },
            function(error, response, body) {
                if (error) {
                    console.log('getVod() response error', error);
                    return callback();
                }
                var total = 0;
                try {
                    body = JSON.parse(body);
                    total = response.headers['x-total'] || 0; // be Carefull node is shit with header : ['X-total'] become ['x-total']
                }
                catch (err) {
                    console.log('getVod() JSON.parse error !', err);
                    body = [];
                    total = 0;
                }
                callback(body, total);
            }
        );
    },

    getEpg: function(callback, options) { // time, midDay, now, tomorrow, channel, genre, recherche...
        if (db) console.log('getEpg()');

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getEpg() noToken ???', module.exports.XTOKEN);
            return callback();
        }

        // BUILD URL

        var urlParams = 'https://api.bbox.fr/v1.3/media/live/?mode=simple';

        if (options.timeStamp) {
            if (options.week) 
                urlParams += '&period=6';
            else if (options.we)
                urlParams += '&startTime='+options.timeStamp+'&endTime='+moment(options.timeStamp).add(2, 'days').toISOString();  // WE de 2 jours
            else if (options.midDay) {
                urlParams += '&startTime='+options.timeStamp+'&endTime='+moment(options.timeStamp).add(3/*textUtils.midDayDuration[options.midDay]*/, 'hours').toISOString();  // matin midi soir -> add 3 hours
            }
            else if (options.now || options.time) 
                urlParams += '&startTime='+options.timeStamp+'&endTime='+options.timeStamp;
            else // if (options.channel || options.recherche || options.tomorrow || options.genre) 
                urlParams += '&startTime='+options.timeStamp+'&endTime='+moment(options.timeStamp).add(1, 'days').toISOString(); 
        }
        else urlParams += '&period=6';

        if (options.channel || options.channel === 0)
            urlParams += '&epgChannelNumber=' + options.channel;
        if (options.genres)
            urlParams += '&genres=' + encodeURIComponent(options.genres.join(','));
        if (options.tnt && !options.channel)
            urlParams += '&profil=tnt';
        if (options.character)
            urlParams += '&character=' + encodeURIComponent(options.character);
        if (options.recherche)
            urlParams += '&title=' + encodeURIComponent(options.recherche);
        if (options.longSummary)
            urlParams += '&longSummary=' + encodeURIComponent(options.longSummary);
        
        if (options.page)
            urlParams += '&page=' + options.page;
        if (options.limit)
            urlParams += '&limit=' + options.limit;

        if (db) console.log('urlParams ---> ', urlParams); // // https://api.bbox.fr/v1.3/media/live/?period=6&mode=full&profil=tnt&genres=Nature,Jeunesse

        request({
                url    : urlParams, // profil=adsl
                method : 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-token': module.exports.XTOKEN[h]
                }
            },
            function(error, response, body) {
                if (error) {
                    console.log('getEpg() response error', error);
                    return callback();
                }
                var total = 0;

                try {
                    body = JSON.parse(body);
                    total = response.headers['x-total'] || 0; // be Carefull node is shit with header : ['X-total'] become ['x-total']
                }
                catch (err) {
                    console.log('getEpg() JSON.parse error !', err);
                    body = [];
                    total = 0;
                }
                callback(body, total);
            }
        );
    },

    getEpgProgramme: function(callback, eventId) {
        if (db) console.log('getEpgProgramme(eventId)', eventId);

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getEpgProgramme() noToken ???');
            return callback();
        }

        var urlParams = 'https://api.bbox.fr/v1.3/media/live/'+eventId+'/?mode=full';
        if (db) console.log('urlParams ---> ', urlParams);

        request({
                url    : urlParams, // profil=adsl
                method : 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-token': module.exports.XTOKEN[h]
                }
            },
            function(error, response, body) {
                if (error) {
                    console.log('getEpgProgramme() response error', error);
                    return callback();
                }
                try {
                    body = JSON.parse(body);
                }
                catch (err) {
                    console.log('getEpgProgramme() JSON.parse error !', err);
                    return callback([]);
                }
                if (body.programInfo && body.programInfo.character && body.programInfo.character.length) { // Order characters list
                    var charLists    = {},
                    charListsStr = '';

                    body.programInfo.character.map(function(val) {
                        if (!charLists[val.function]) charLists[val.function] = [];
                        charLists[val.function].push('<a href="'+val.bioUrl+'" class="blue-text text-lighten-1" target="_blank" title="Fiche info">'+val.firstName+' '+val.lastName+'</a>');
                    });

                    for (var key in charLists) {
                        charListsStr += '<span>'+key + (key != 'Scénario' && charLists[key].length > 1 ? 's' : '') + ' :</span> '+charLists[key].sort().join(', ')+'<br />';
                    }
                    charLists = null;
                    body.programInfo.characterLists = charListsStr;
                }
                callback(body);
        });
    },

    getVodProgramme: function(callback, productId) {
        if (db) console.log('getVodProgramme(productId)', productId);

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getVodProgramme() noToken ???');
            return callback();
        }

        var urlParams = 'https://api.bbox.fr/v1.3/media/vod/?mode=full&ids='+productId;
        if (db) console.log('urlParams ---> ', urlParams);

        request({
                url    : urlParams, // profil=adsl
                method : 'GET',
                headers: {
                    'content-type': 'application/json',
                    'x-token': module.exports.XTOKEN[h]
                }
            },
            function(error, response, body) {
                if (error) {
                    console.log('getVodProgramme() response error', error);
                    return callback();
                }
                try {
                    body = JSON.parse(body);
                }
                catch (err) {
                    console.log('getVodProgramme() JSON.parse error !', err);
                    return callback([]);
                }
                callback(body[0] || {});
        });
    },

    // AGREGATE ////////////////////////////////////////////////////////////////////

    getVodPayload: function(callback, options) {
        if (db) console.log('getVodPayload(options)', options);

        // CACHE ???
        var optionsCache = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex'), // 9b74c9897bac770ffc029102a200c5de
            todayCache   = moment().format('YYYYMMDD'),
            cacheFile    = './temp/getVodPayload-'+todayCache+'-'+optionsCache+'.json',
            docs         = null,
            total        = null;

        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
            docs = JSON.parse(docs);

            total = fs.readFileSync(cacheFile + '-total', 'UTF-8');
            total = parseInt(total);
        }
        catch (err) {
            if (db) console.log('No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            if (db) console.log('Results in cache', cacheFile);
            callback(docs, total);
            return;
        }

        var withToken = function(token) {
           module.exports.getVod(function(programmes, total) {
                try {
                    fs.writeFileSync(cacheFile, JSON.stringify(programmes));
                    fs.writeFileSync(cacheFile + '-total', total);
                }
                catch (err) {
                    if (db) console.log('getVodPayload() Json error ?');
                }
                callback(programmes, total);
            }, options);
        };

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getVodPayload() no xtoken...');
            module.exports.getToken(withToken);
        }
        else withToken(module.exports.XTOKEN[h]);
    },

    getEpgPayload: function(callback, options) { // time, midDay, now, tomorrow, channel, genre, recherche
        if (db) console.log('getEpgPayload(options)', options);

        // CACHE ???
        var optionsCache = crypto.createHash('md5').update(JSON.stringify(options)).digest('hex'), // 9b74c9897bac770ffc029102a200c5de
            todayCache   = moment().format('YYYYMMDD'),
            cacheFile    = './temp/getEpgPayload-'+todayCache+'-'+optionsCache+'.json',
            docs         = null,
            total        = null;

        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
            docs = JSON.parse(docs);

            total = fs.readFileSync(cacheFile + '-total', 'UTF-8');
            total = parseInt(total);
        }
        catch (err) {
            if (db) console.log('No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            if (db) console.log('Results in cache', cacheFile);
            callback(docs, total);
            return;
        }

        var withToken = function(token) {
            module.exports.getEpgChannels(function(channels) {
                module.exports.getEpg(function(programmes, total) {
                    try {
                        fs.writeFileSync(cacheFile, JSON.stringify(programmes));
                        fs.writeFileSync(cacheFile + '-total', total);
                    }
                    catch (err) {
                        if (db) console.log('getEpgPayload() Json error ?');
                    }
                    callback(programmes, total);
                }, options);
            });
        };

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) {
            console.log('getEpgPayload() no xtoken...');
            module.exports.getToken(withToken);
        }
        else withToken(module.exports.XTOKEN[h]);
    },

    getEpgMovie: function(callback, eventId) {
        if (db) console.log('getEpgMovie(eventId)', eventId);

        var cacheFile  = './temp/getEpgMovie-'+eventId+'.json',
            docs = null;

        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
            docs = JSON.parse(docs);
        }
        catch (err) {
            if (db) console.log('No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            if (db) console.log('Results in cache', cacheFile);
            callback(docs);
            return;
        }

        var withToken = function(token) {

            module.exports.getEpgChannels(function(channels) {

                module.exports.getEpgProgramme(function(programmes) {

                    moment.locale('fr');
                    if (programmes && programmes.programInfo) {
                        programmes.programInfo.duration = (programmes.programInfo.duration ?  parseInt(moment.duration(programmes.programInfo.duration).asMinutes(), 10)+'min' : '');
                        programmes.thumb = programmes.media && programmes.media.length && programmes.media[0].url && programmes.media[0].mediaTypeCode == 300 ? programmes.media[0].url : 'https://bytel.tv/node/img/themes/' + module.exports.getDefaultThumb(programmes.genre && programmes.genre.length ? programmes.genre[0] : null);
                        programmes.channelName = channels[programmes.epgChannelNumber] ? channels[programmes.epgChannelNumber].name : '';
                        programmes.channelLogo = channels[programmes.epgChannelNumber] ? channels[programmes.epgChannelNumber].logo : '';
                        programmes.time = moment(programmes.startTime).format('dddd HH[h]mm');
                        programmes.time = programmes.time.substr(0, 1).toUpperCase() + programmes.time.substr(1, programmes.time.length);

                        fs.writeFileSync(cacheFile, JSON.stringify(programmes));

                        callback(programmes);
                    }
                    else callback({});
                }, eventId);
            });
        };

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) module.exports.getToken(withToken);
        else withToken(module.exports.XTOKEN[h]);
    },

    getVodMovie: function(callback, productId) {
        if (db) console.log('getEpgMovie(productId)', productId);

        var cacheFile  = './temp/getVodMovie-'+productId+'.json',
            docs = null;

        try {
            docs = fs.readFileSync(cacheFile, 'UTF-8');
            docs = JSON.parse(docs);
        }
        catch (err) {
            if (db) console.log('No cache', cacheFile);
            docs = null;
        }
        if (docs) {
            if (db) console.log('Results in cache', cacheFile);
            callback(docs);
            return;
        }

        var withToken = function(token) {
            //if (db) console.log('getEpgChannels callback programmes : ', channels);
            module.exports.getVodProgramme(function(programmes) {
                //if (db) console.log('getEpgTonight callback programmes'); // : ', programmes);
                if (programmes && programmes.runtime) {
                    moment.locale('fr');
                    programmes.runtime = parseInt(moment.duration(programmes.runtime, 'seconds').asMinutes()) + ' min';
                }
                fs.writeFileSync(cacheFile, JSON.stringify(programmes));
                callback(programmes || {});
            }, productId);
        };

        var h = moment().format('YYYYMMDDH');
        if (!module.exports.XTOKEN[h]) module.exports.getToken(withToken);
        else withToken(module.exports.XTOKEN[h]);
    },

    init: function() {
        // if (db) console.log('init()');
        module.exports.getToken(function(token) {
            //if (db) console.log('getToken callback token : ', token);
            module.exports.getEpgChannels(function(channels) {
                //if (db) console.log('getEpgChannels callback programmes : ', channels);
            });
        });
    }

};

module.exports.init(); // Start init