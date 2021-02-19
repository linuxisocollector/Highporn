#!/usr/bin/env node

const clear = require('clear')
const chalk = require('chalk')
const figlet = require('figlet')
const puppeteer = require('puppeteer');
const m3u8stream = require('m3u8stream')
const fs = require('fs');
const miniget = require('miniget');
const { DownloaderHelper } = require('node-downloader-helper');



let url = process.argv[2];
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
 function humanFileSize(bytes, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;
  
    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }
  
    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;
  
    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
    return bytes.toFixed(dp) + ' ' + units[u];
  }
(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
            width: 1820,
            height: 1080
        },
        executablePath: "/usr/bin/chromium",
        env: false
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    urls_handeld = [];

    try {
        page.on('request', async (request) => {
            if(request.url().includes('anyhentai')) {
                var out_object = {};
                out_object.headers = request.headers();
                out_object.url = request.url();
                urls_handeld.push(out_object);
                request.respond(request.redirectChain().length
                ? { body: '' } // prevent 301/302 redirect
                : { status: 404 } // prevent navigation by js
              )
          
            } else  {
                request.continue();
            }
        });
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.evaluate(() => {
            let elements = document.getElementsByClassName('playlist_scene');
            for (var i = 1; i < (elements.length - 1); i++) {
                let element = elements[i];
                setTimeout(() => { element.click() }, i * 2000);
            }

        })
        console.log("Waiting for all Scenes to be loaded");
        await delay(12000);
        console.log("Waiting finished");
        dls = [];
        let element = await page.$("h3.big-title-truncate");
        const title = await page.evaluate(element => element.textContent, element);

        var key = 0;
        urls_handeld.forEach(element => {
            delete element.headers.range;
            console.log({
                headers: element.headers
            });
            console.log(title);
            console.log(title+key);
            const dl = new DownloaderHelper(element.url, 'downloads/',{
                headers: element.headers,
                fileName: title+key+".mp4",
                httpsRequestOptions: {rejectUnauthorized: false}
            });
            dl.on('progress.throttled', stats => {
                const progress = stats.progress.toFixed(1);
                const speed = humanFileSize(stats.speed);
                const downloaded = humanFileSize(stats.downloaded);
                const total = humanFileSize(stats.total);
                const name = stats.name;
                console.log(`${name} ${speed}/s - ${progress}% [${downloaded}/${total}]`);
            })
            dls.push(dl.start());
            key++;
        });
        await Promise.allSettled(dls);
        await browser.close();
    } catch(error) {
        console.log(error);
        await browser.close();
    } 
  })();