import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';

const app = express();


app.get('/scrape', async (req, res, next) => {
  try {
    const result = await fetch('http://www.miamarias.nu/');
    const body = await result.text();
    const $ = cheerio.load(body);
    console.log('hit')
    const h5arr = $('h5').toArray().map(el => el.firstChild === null ? undefined : el.firstChild.data)

    console.log(h5arr)

    res.send('k')
  } catch (err) {
    console.log(err);
  }
})

app.listen('8081');

