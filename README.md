### You-Lister - Youtube Playlist Scrapper

- Scrap youtube playlists without using Youtube API
- Made for study purposes, I'm not responsible for bad usages.

#### Youtube:
Scrap youtube playlists and returns the id, name and url of each video
- For playlists lower than 100 videos use fast: true
- For playlists bigger than 100 videos use fast: false or remove it

#### Spotify:
Scrap spotify playlists and returns the id, name and url of the equivalent youtube video
- It was made to convert spotify to youtube playlist

#### How to
    npm i you-lister

```javascript
const { Youtube, Spotify } = require('you-lister')

const playlistDebugger = "https://www.youtube.com/playlist?list=PL8H85HKySx23uHki_zJvAuqKZG8CaKdUz";

let youtubeTest = new Youtube({
  url: playlistDebugger, // Link of the video
  details: ['id', 'name', 'url'], // All the possible properties
  fast: true // For playlist with 100 or less videos, false (default) make a full scrap for bigger playlists.
})

async function youtubeFTest () {
  let aux = await youtubeTest.scrap();

  console.log(aux);
  /*
    [ { id: 'h9tbbXRpVPY',
    name:
     'Will Smith - Fresh Prince Of Bel Air (Le Boeuf Remix) (Lyrics)',
    url:
     'https://www.youtube.com/playlist?list=PL8H85HKySx23uHki_zJvAuqKZG8CaKdUzh9tbbXRpVPY' },...
  */
}

youtubeFTest();

const spotifyPlaylistDebugger = "https://open.spotify.com/playlist/37i9dQZF1DWTkIwO2HDifB";

let spotifyTest = new Spotify({
  url: spotifyPlaylistDebugger, // Link of spotify playlist
  details: ['id', 'name', 'url', 'originalName'] // All the possible properties
})

async function spotifyFTest () {
  let aux = await spotifyTest.scrap();

  console.log(aux);
  /*
  [ { id: 'SJeLBYdCTIs',
    name: 'Sintonia - Uma série original Netflix e KondZilla',
    url: 'https://youtube.com/watch?v=SJeLBYdCTIs',
    originalName:
     'Sintonia (Uma Serie Original Netflix Sintonia Kondzilla) MC Doni ' },...
  */
}

spotifyFTest();
```
##End