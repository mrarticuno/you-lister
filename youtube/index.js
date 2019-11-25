const got = require('got');
const cheerio = require('cheerio');
const _ = require('lodash');
class Youtube {
    constructor (data) {
      this.url = (data.url || '');
      this.details = (data.details || []);
      this.fast = (data.fast || false);
    }

    async scrap () {
        let ret = [];
        if (this.fast) {
            ret = await this.fastScrap();
        } else {
            ret = await this.fullScrap();
        }

        if (this.details.length > 0) {
          ret = _.map(ret.playlist, (object) => {
            return _.pick(object, this.details);
          });
        }
        return ret;
    }

    async fullScrap () {
        const puppeteer = require('puppeteer');
        // Set up browser and page.
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        page.setViewport({ width: 1280, height: 1080 });

        // Navigate to the demo page.
        await page.goto(this.url, {"waitUntil" : "networkidle0"});
        
        console.time("Scrap");
        const items = await this.scrapeInfiniteScrollItems(page);
        console.timeEnd("Scrap");
        console.log('finish')
        
        // Close the browser.
        await browser.close();
        return items;
    }

    extractItems () {
        const items = [];
        const extractedElements = document.querySelectorAll('ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer');
        for (let element of extractedElements) {
            let named = element.innerText.split('\n');
            let linkedObj = element.querySelector('div#content.style-scope.ytd-playlist-video-renderer > a').href;
            if (named[3] !== undefined) {
                items.push({ id: linkedObj.substring(linkedObj.indexOf("watch?v=") + 8, linkedObj.indexOf("&list")), name: `${named[4].replace(/['"]+/g, '')} - ${named[3].replace(/['"]+/g, '')}`, url: linkedObj.substring(0, linkedObj.indexOf("&list")) });
            } else if (named[1] !== undefined && !named[1].includes('Deleted video') && !named[1].includes('Private video')) {
                items.push({ id: linkedObj.substring(linkedObj.indexOf("watch?v=") + 8, linkedObj.indexOf("&list")), name: `${named[1].replace(/['"]+/g, '')}`, url: linkedObj.substring(0, linkedObj.indexOf("&list")) });
            }
        }
        return items;
    }

    async shouldWait () {
        let value = document.querySelectorAll('paper-spinner');
        if (value.length > 0) {
          value = value[0].getAttribute("active");
          if (value !== null && value !== undefined) {
            return true;
          }
        }
        return false;
    }

    async scrollToBottom (page) {
        if (await page.evaluate(this.shouldWait)) {
          // console.log('waiting')
          await this.scrollToBottom(page);
        } else {
          const distance = 1500; // should be less than or equal to window.innerHeight
          if (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
            await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
            // console.log('scrolling')
            await this.scrollToBottom(page);
          } 
          await page.waitFor(100);
          if (await page.evaluate(this.shouldWait)) {
            // console.log('waiting again')
            await this.scrollToBottom(page);
          }
        }
    }

    async scrapeInfiniteScrollItems(page) {
        let items = [];
        try {
          // console.time("Scrapping");
          await this.scrollToBottom(page);
          // console.timeEnd("Scrapping");
          // console.time("Extracting");
          items = await page.evaluate(this.extractItems);
          // console.timeEnd("Extracting");
        } catch(e) {
            console.log(e)
        }
        return items;
    }

    async fastScrap () {
      const tag = {
        name: 'data-title',
        url: 'data-video-id',
        id: 'data-video-id'
      };
      let res = await got(this.url)
      const $ = cheerio.load(res.body);
      const thumb = $('tr');
      const arr = {
        playlist: []
      };
      const opt = Object.keys(tag);

      const prefixUrl = (holder, marks) => holder === 'url' ? `${this.url}${marks}` : marks;
      const getDuration = el => {
        const raw = $(el).find('.timestamp').text().split(':');
        return (parseInt(raw[0], 10) * 60) + parseInt(raw[1], 10);
      };

      const multipleDetails = Array.isArray(opt);

      arr.playlist = thumb.map((index, el) => {
        if (multipleDetails) {
          return opt.reduce((prev, holder) => {
            prev[holder] = prefixUrl(holder, holder === 'duration' ? getDuration(el) : el.attribs[tag[holder]]);
            return prev;
          }, {});
        }
        if (opt === 'duration') {
          return getDuration(el);
        }
        return prefixUrl(opt, el.attribs[tag[opt]]);
      }).get();
      return arr;
    }
}
  
  module.exports = Youtube;
  
