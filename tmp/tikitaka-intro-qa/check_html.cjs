const { chromium } = require('/Users/terecal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const root = '/Users/terecal/pilot-project/sample-pkt-project';
(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const page = await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('file://'+root+'/output/pdf/tikitaka-app-introduction.html');
  await page.screenshot({path:root+'/tmp/tikitaka-intro-qa/html-desktop.png',fullPage:false});
  for(const id of ['design','libraries','agent','rag']){
    await page.locator('#'+id).screenshot({path:root+'/tmp/tikitaka-intro-qa/html-'+id+'.png'});
  }
  await page.locator('nav a[href="#rag"]').click();
  const navWorks = await page.evaluate(()=>location.hash==='#rag');
  await page.setViewportSize({width:390,height:844});
  await page.goto('file://'+root+'/output/pdf/tikitaka-app-introduction.html');
  await page.screenshot({path:root+'/tmp/tikitaka-intro-qa/html-mobile.png',fullPage:false});
  const result=await page.evaluate(()=>({sections:document.querySelectorAll('main section').length,navLinks:document.querySelectorAll('nav a').length,bodyWidth:document.body.scrollWidth,viewport:innerWidth,externalDependencies:document.querySelectorAll('script[src],link[rel="stylesheet"]').length}));
  console.log(JSON.stringify({...result,navWorks,errors}));
  await browser.close();
})();
