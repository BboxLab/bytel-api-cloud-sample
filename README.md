# Bytel API Cloud Sample

This project is an example app that use the API CLOUD (French TV programmes and VOD)

1. Ask you ask your credentials here : https://dev.bouyguestelecom.fr/nous-contacter/
2. Create a ".env" file in this repository with this inside :
```
# Credentials needed to authenticate the current App and grant a valid token
APP_ID=xxx-xxx
APP_SECRET=ABC123ABC123ABC123
```
3. Open a shell and type: `nodemon .\app.js`
4. Open your browser http://localhost:3000

# Welcome to BboxLab : BboxAPI on the Cloud

The dev. community for Bbox Open APIs: https://dev.bouyguestelecom.fr and https://github.com/BboxLab

**Documentation**: https://api.bbox.fr/doc/

**BasePath**: https://api.bbox.fr/v1.3/

All the requests are prepared here in a POSTMAN collection https://api.bbox.fr/doc/bytel_cloud_api.json.postman_collection . Don't forget to update with your "x-token" in the header of each request (Use your APP ID and APP Secret to get à 24h valid token).
You can contact Bouygues Telecom to obtain them: https://dev.bouyguestelecom.fr/dev/?page_id=51

The EPG (Electronic Program Guide) API is serving informations from now (today) to today + 6 days (period=6).
"Now" is period=0 and "today" is period=1
The start time from a day (period=1) of EPG is from 4am to 4am next day.
EPG data are erased from the server (Images ...) after 30 days

The main endpoint for this API is https://api.bbox.fr/v1.3/media/live .
For example you can ask: 

https://api.bbox.fr/v1.3/media/live?period=0 : All the programmes now on live for all channels
https://api.bbox.fr/v1.3/media/live?period=6 : All programmes for all channels for the next 6 days
https://api.bbox.fr/v1.3/media/live?epgChannelNumber=1 : All the programmes of a specific channel
a lot of others various parameters can be mixed too

Changelogs V1.3:

Full PDS (Plan Of Service) for channels with 5 "profils" and associated "PositionId" (ZapId) : ADSL, TNT, OTT, FTTH or CABLE
Added "/media/genres" endpoint to get genres and familly list
Modified "/media/live/epg" path with some optim for Android remote app (If you don't know, use /media/live)
Added new query string "character" and "genre" for "/media/live"
Added "profil" array to programme data response for various endpoints
Archive EPG data for 30 days (Programmes infos + medias)
Various bugs ¯\(ツ)/¯

**Disclaimer**: This API is in its early age and may vary and change. If you need some specific set of data we encourage you to contact us ! :)