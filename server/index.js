import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import compression from 'compression';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(compression());
app.use(cors());

app.use(express.static(path.join(path.resolve(), 'build')));

moment.locale('sv'); // Set global locale to Swedish

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
    return { error: err.toString() };
  }
};

const getSpill = async () => {
  const m = moment();
  try {
    const result = await fetch('https://restaurangspill.se/');
    const body = await result.text();
    const $ = cheerio.load(body, { decodeEntities: false });

    let node = $('h3').first().html();
    if (!node.includes(m.format('D/M'))) throw new Error('Parsing failed');

    const text = node.slice(node.indexOf(m.format('D/M')) + m.format('D/M').length).trim(); // Remove up to and including date from string
    //return text.split(/\s{2,}/); // Split on 2 or more blankspaces
    return text.split('<br>').filter(el => el !== '').map(el => el.trim()); // Split on breaklines, remove empty results and trim the rest
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getDocpiazza = async () => {
  const m = moment();
  const answer = [];
  try {
    const result = await fetch('http://malmo.kyparn.se/doc-piazza');
    const body = await result.text();
    const $ = cheerio.load(body);
  
    const headers = $('[id^=lunch] div header small');
    const node = $('[id^=lunch] div ul').toArray();

    if($(headers[1].firstChild).text().toLowerCase() !== m.format('dddd')) throw new Error('Wrong day');

    node.forEach((el, i) => {
      const titles = $(el).find('li div p strong');
      const descriptions = $(el).find('li div div p');
      let content = [];
      if (titles.length !== descriptions.length) throw new Error('Parsing failed');
      for (let j = 0; j < titles.length; j++) {
        content[j] = { title: $(titles[j]).text(), description: $(descriptions[j]).text() }
      }
      answer[i] = { header: $(headers[i + 1].firstChild).text(), contents: content };
    });
    return answer;
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getKolga = async () => {
  const m = moment();
  try {
    const result = await fetch('https://kolga.gastrogate.com/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const currentDay = m.format('dddd D').charAt(0).toUpperCase() + m.format('dddd D').slice(1);
    const header = $(`.menu_header h3:contains(${currentDay})`)
    if (header.length !== 1) throw new Error('Current day not found');

    const content = $(header[0]).parents('thead').siblings('tbody')[0];
    return $(content).find('.td_title').map((_, el) => $(el).text().trim()).get();
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getNamdo = async () => {
  throw new Error('Not implemented');
};

const getVariation = async () => {
  throw new Error('Not implemented');
};

const getCurryrepublic = async () => {
  throw new Error('Not implemented');
};

const getP2 = async () => {
  throw new Error('Not implemented');
};

const getGlasklart = async () => {
  throw new Error('Not implemented');
};

const getÅrstiderna = async () => {
  throw new Error('Not implemented');
};

app.get('/scrape', async (req, res, next) => {
  const results = await Promise.all([getMiamarias(), getSpill(), getDocpiazza(), getKolga()]);
  const answer = { mimarias: results[0], spill: results[1], docpiazza: results[2], kolga: results[3] };

  res.send(answer);
});

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', '../build/index.html'));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: 'Something went wrong in express server', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).send({ message: `Route ${req.originalUrl} (${req.method}) not found` });
});


const port = process.env.APP_SERVER_PORT || 8081
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});