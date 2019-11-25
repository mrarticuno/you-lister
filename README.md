### You-Lister - Youtube Playlist Scrapper

- Scrap youtube playlists without using Youtube API
- Made for study purposes, I'm not responsible for bad usages.
- Uses puppeteer for scrap, so it's not lightweight due the youtube infinite scroll.
- For playlists with less than 100 videos better use [Youtube-playlist](https://www.npmjs.com/package/youtube-playlist "Youtube-playlist")

#### How to

    npm i you-lister

```javascript
const youLister = require('you-lister');
youLister.scrap('https://youtube.com...').then(response => {
	console.log(response);
    /*
	[ 
		{ 
			"name": Super nice video from youtube #1", 
			"url": "https://youtube.com..." 
		}
	]
	*/
})
```
###End