const fs = require('fs');
const puppeteer = require('puppeteer');

// const playlistDebugger = "https://www.youtube.com/playlist?list=PL8H85HKySx23uHki_zJvAuqKZG8CaKdUz";
function extractItems() {
  const items = [];
  const extractedElements = document.querySelectorAll('ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer');
  for (let element of extractedElements) {
      let named = element.innerText.split('\n')
      let linkedObj = element.querySelector('div#content.style-scope.ytd-playlist-video-renderer > a').href
      if (named[3] !== undefined) {
        items.push({ id: linkedObj.substring(linkedObj.indexOf("watch?v=") + 8, linkedObj.indexOf("&list")), name: `${named[4].replace(/['"]+/g, '')} - ${named[3].replace(/['"]+/g, '')}`, url: linkedObj.substring(0, linkedObj.indexOf("&list")) });
      } else if (named[1] !== undefined && !named[1].includes('Deleted video') && !named[1].includes('Private video')) {
        items.push({ id: linkedObj.substring(linkedObj.indexOf("watch?v=") + 8, linkedObj.indexOf("&list")), name: `${named[1].replace(/['"]+/g, '')}`, url: linkedObj.substring(0, linkedObj.indexOf("&list")) });
      }
  }
  return items;
}

async function shouldWait() {
  let value = document.querySelectorAll('paper-spinner');
  if (value.length > 0) {
    value = value[0].getAttribute("active");
    if (value !== null && value !== undefined) {
      return true;
    }
  }
  return false;
}

async function scrollToBottom(page) {
  if (await page.evaluate(shouldWait)) {
    // console.log('waiting')
    await scrollToBottom(page);
  } else {
    const distance = 1500; // should be less than or equal to window.innerHeight
    if (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
      await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
    //   console.log('scrolling')
      await scrollToBottom(page);
    } 
    await page.waitFor(100);
    if (await page.evaluate(shouldWait)) {
    //   console.log('waiting again')
      await scrollToBottom(page);
    }
  }
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems
) {
  let items = [];
  try {
    // console.time("Scrapping");
    await scrollToBottom(page);
    // console.timeEnd("Scrapping");
    // console.time("Extracting");
    items = await page.evaluate(extractItems);
    // console.timeEnd("Extracting");
  } catch(e) { }
  return items;
}

async function scrap(playlist) {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 1080 });

  // Navigate to the demo page.
  await page.goto(playlist, {"waitUntil" : "networkidle0"});

  
  // Scroll and extract items from the page.
//   console.time("Scrap");
  const items = await scrapeInfiniteScrollItems(page, extractItems);
//   console.timeEnd("Scrap");
  // Save extracted items to a file.
  // fs.writeFileSync('./items.txt', items.length);
//   console.log('finish')
  
  // Close the browser.
  await browser.close();
  return items;
}

module.exports.scrap = scrap;
