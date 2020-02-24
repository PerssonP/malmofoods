import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';

const app = express();

const getMiamarias = async () => {
  const m = moment();
  try {
    const result = await fetch('http://www.miamarias.nu/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const h5arr = $('h5').toArray();

    const node = h5arr.find(el => {
      if (el.firstChild === null) return false;
      return el.firstChild.data.includes(m.format('D/M'));
    })

    if (!node) throw new Error('Parsing failed');

    const parse = $(node.parentNode).find('span').toArray().map(el => el.firstChild.data).filter(val => !!val);
    return { 'fish': parse[1], 'meat': parse[2], 'veg': parse[3] };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}

const getSpill = async () => {
  const m = moment();
  try {
    const result = await fetch('https://restaurangspill.se/');
    const body = await result.text();
    const $ = cheerio.load(body);

    let node = $('h3').first().text();
    if (!node.includes(m.format('D/M'))) throw new Error('Parsing failed');

    const text = node.slice(node.indexOf(m.format('D/M')) + m.format('D/M').length).trim();
    return text.split(/\s{2,}/); // Split on 2 or more blankspaces
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}

app.get('/scrape', async (req, res, next) => {
  const results = await Promise.all([getMiamarias(), getSpill()]);
  const answer = { mimarias: results[0], spill: results[1] };

  res.send(answer);
})


app.listen('8081');