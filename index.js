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

const getDocpiazza = async () => {
  const answer = [];
  try {
    const result = await fetch('http://malmo.kyparn.se/doc-piazza');
    const body = await result.text();
    const $ = cheerio.load(body);
  
    const headers = $('[id^=lunch] div header small')
    const node = $('[id^=lunch] div ul').toArray();

    node.forEach((el, i) => {
      answer[i] = { header: headers[i + 1].firstChild.data, contents: [] };
      const titles = $(el).find('li div p strong')
      const descriptions = $(el).find('li div div p');
      if (titles.length !== descriptions.length) throw new Error('Parsing failed');
      for (let j = 0; j < titles.length; j++) {
        
      }
    });

    console.log(answer)
    return { 'ok': 'ok' }
  } catch (err) {
    console.log(err);
    return { error: err };
  }

}

app.get('/scrape', async (req, res, next) => {
  //const results = await Promise.all([getMiamarias(), getSpill()]);
  //const answer = { mimarias: results[0], spill: results[1] };

  getDocpiazza();

  res.send('ok');
})


app.listen('8081');