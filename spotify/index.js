const got = require('got');
const cheerio = require('cheerio');
const _ = require('lodash');
const util = require('util');
let crawler = require('youtube-crawler');
class Spotify {
    constructor (data) {
      this.url = (data.url || '');
      this.details = (data.details || []);
    }

    async scrap () {
        let ret = [];
        ret = await this.fastScrap();

        if (this.details.length > 0) {
          ret = _.map(ret, (object) => {
            return _.pick(object, this.details);
          });
        }
        return ret;
    }

    async processScrap (arr) {
      const craw = util.promisify(crawler);
      const newArray = [];
      const promises = arr.map(async (name, idx) => {
        let result = await craw(name);
        if (result.length > 0) {
          newArray.push({
            name: result[0].title,
            id: result[0].link.substring(result[0].link.indexOf("watch?v=") + 8, result[0].link.length),
            url: result[0].link,
            originalName: name
          })
        }
      });
      await Promise.all(promises);
      return newArray;
    }

    async fastScrap () {
      const arr = {
        playlist: []
      }
      let res = await got(this.url)
      const $ = cheerio.load(res.body);
      const artist = $('span.artists-albums');
      const listSpotify = artist.map((index, el) => {
        let names = []
        let tags = el.children
        names.push(tags.map(tag => {
          if (tag.name === 'a') {
            return tag.children[0].children[0].data
          }
        }).filter(x => x !== undefined))
        return names;
      }).get();

      listSpotify.forEach(subItem => {
        let finalName = ''
        while (subItem.length > 0) {
          finalName += `${subItem.pop()} ` 
        }
        arr.playlist.push(finalName)
      })
      
      // return arr.playlist;
      return await this.processScrap(arr.playlist);
    }
}
  
  module.exports = Spotify;
  
