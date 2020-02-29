import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import pdfjslib from 'pdfjs-dist'

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

    if (!node) throw new Error('Wrong day');

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
    if (!node.includes(m.format('D/M'))) throw new Error('Wrong day');

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
    const header = $(`.menu_header h3:contains(${currentDay})`).first();
    if (header.length === 0) throw new Error('Wrong day');

    const content = $(header).parents('thead').siblings('tbody')[0];
    return $(content).find('.td_title').map((_, el) => $(el).text().trim()).get();
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getNamdo = async () => {
  const m = moment();
  try {
    const result = await fetch('http://namdo.se/meny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $(`.fdm-section-${m.format('dddd').replace('å', 'a').replace('ö', 'o')}-${m.week() % 2 === 0 ? 'jamn' : 'ojamn'}`)
    if (node.length === 0) throw new Error('Wrong day');

    const titles = $(node).find('.fdm-item-title');
    const descriptions = $(node).find('.fdm-item-content p');
    if (titles.length !== descriptions.length) throw new Error('Parsing length mismatch!');
    
    const content = [];
    titles.each((i, el) => {
      content[i] = { title: $(el).text(), description: $(descriptions[i]).text() };
    })

    return content;
  } catch (err) {
    console.log(err);
    return { error: err.toString() }
  }
};

const getVariation = async () => {
  const m = moment();
  try {
    const result = await fetch(`https://www.nyavariation.se/files/matsedel/${m.format('YYYY')}/v-${m.week()}.pdf`);
    if (!result.ok) throw new Error('Menu not found for current week');

    const loadingTask = pdfjslib.getDocument(await result.arrayBufferI());
    return await loadingTask.promise.then(async doc => {
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.filter(val => val.str.trim() !== '').map(val => val.str).join('');
      
      const today = m.format('dddd');
      const tomorrow = m.add(1, 'day').format('dddd');
      let list = text.slice(text.toLowerCase().indexOf(today), text.toLowerCase().indexOf(tomorrow)).split('•');
      if (list[list.length - 1].includes('svampsoppa') || list[list.length - 1].includes('Vi bjuder')) { // lol
        list = list.slice(0, list.length - 1);
      }

      return list.slice(1);
    }, err => {
      return { error: err.toString() };
    });
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getCurryrepublic = async () => {
  throw new Error('Not implemented');
};

const getP2 = async () => {
  const m = moment();
  try {
    const result = await fetch('https://www.restaurangp2.se/lunch');
    const body = await result.text();
    const $ = cheerio.load(body);

    if($('.week_number').text().split(' ')[1] !== m.week()) throw new Error('Wrong week')

    const node = $(`#${m.format('dddd')}`);
    if (node.length === 0) throw new Error('Wrong day')
    const courses = $(node).find('tr');
    
    return courses.map((_, el) => {
      const arr = $(el).find('p').map((i, child) => $(child).text()).get();
      if (arr.length !== 3) throw new Error('Parsing failed');
      return { category: arr[0], food: arr[1], price: arr[2] };
    }).get();
  } catch (err) {
    console.log(err);
    return { error: err.toString() };
  }
};

const getGlasklart = async () => {
  throw new Error('Not implemented');
};

const getÅrstiderna = async () => {
  throw new Error('Not implemented');
};

app.get('/scrape', async (req, res, next) => {
  const results = await Promise.all([
    getMiamarias(),
    getSpill(),
    getDocpiazza(),
    getKolga(),
    getNamdo(),
    getVariation(),
    getP2()
  ]);
  const answer = { 
    mimarias: results[0],
    spill: results[1],
    docpiazza: results[2],
    kolga: results[3],
    namndo: results[4],
    variation: results[5],
    P2: results[6]
  };

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