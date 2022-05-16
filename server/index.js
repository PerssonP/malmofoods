const express = require('express');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const moment = require('moment');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const pdfjslib = require('pdfjs-dist');
const fs = require('fs');
const useragent = require('express-useragent');

const app = express();

app.use(compression());
app.use(cors());
app.use(useragent.express());

app.use('/*', (req, res, next) => {
  if (req.useragent.browser === 'IE') {
    res.send('Please use a real browser..').status(400);
  } else {
    next();
  }
});

app.use(express.static(path.join(path.resolve(), 'build')));

moment.locale('sv'); // Set global locale to Swedish

const getFile = path => {
  try {
    const data = fs.readFileSync(path);
    const file = JSON.parse(data);
    return file;
  } catch (err) {
    console.log(err);
    return {};
  }
};

const getMiamarias = async force => {
  const m = moment();
  const answer = { name: 'miamarias', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/miamarias.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('http://www.miamarias.nu/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const h5arr = $('h5').toArray();

    const node = h5arr.find(el => {
      if (el.firstChild === null) return false;
      return el.firstChild.data.includes(m.format('D/M'));
    });

    if (!node) throw new Error('Wrong day');

    const parse = $(node.parentNode).find('span').map((_, el) => $(el).text().trim()).toArray().filter(x => !!x).filter(x => !x.endsWith(' kr'));
    answer.data = [
      { title: 'Fisk', description: parse[0] },
      { title: 'Kött', description: parse[1] },
      { title: 'Veg', description: parse[2] }
    ];

    fs.writeFile('./files/miamarias.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getSpill = async force => {
  const m = moment();
  const answer = { name: 'spill', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/spill.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://restaurangspill.se/');
    const body = await result.text();
    const $ = cheerio.load(body, { decodeEntities: false });

    let node = $('h3').first().html();
    if (!node.includes(m.format('D/M'))) throw new Error('Wrong day');

    const text = node.slice(node.indexOf(m.format('D/M')) + m.format('D/M').length).trim(); // Remove up to and including date from string
    //const answer = text.split(/\s{2,}/); // Split on 2 or more blankspaces
    answer.data = text.split('<br>').filter(el => el !== '').map(el => el.trim()); // Split on breaklines, remove empty results and trim the rest
    
    fs.writeFile('./files/spill.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });
    
    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getDocpiazza = async force => {
  const m = moment();
  const enM = moment().locale('en');
  const answer = { name: 'docpiazza', data: [] };
  try {
    if (force !== true) {
      const file = getFile('./files/docpiazza.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://kyparn.se/ort/malmo/doc-piazza');
    const body = await result.text();
    const $ = cheerio.load(body);

    const headers = $('div.restaurang-content h2.rubrik');

    if (headers.length < 1) throw new Error('Parsing failed');
    if (!$(headers[0]).text().endsWith(m.week())) throw new Error('Wrong week');


    let weekday = moment.localeData('en').weekdays()[enM.weekday()];
    const titles = $(`div.${weekday.toLowerCase()} h3.rubrik`)
    const descriptions = $(`div.${weekday.toLowerCase()} p.beskrivning`).toArray();

    if (titles.length !== descriptions.length) throw new Error('Parsing failed');

    answer.data = titles.map((i, el) => ({ title: $(descriptions[i]).text(), description: $(el).text() })).toArray(); // Yes, title and description is reversed

    fs.writeFile('./files/docpiazza.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getKolga = async force => {
  const m = moment();
  const answer = { name: 'kolga', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/kolga.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://kolga.gastrogate.com/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const currentDay = m.format('dddd').charAt(0).toUpperCase() + m.format('dddd').slice(1);
    const header = $(`.menu_header h3:contains(${currentDay}):contains(${m.format('D')})`).first();
    if (header.length === 0) throw new Error('Wrong day');

    const content = $(header).parents('thead').siblings('tbody')[0];
    answer.data = $(content).find('.td_title').map((_, el) => $(el).text().trim()).get();

    fs.writeFile('./files/kolga.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getNamdo = async force => {
  const m = moment();
  const answer = { name: 'namdo', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/namdo.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('http://namdo.se/meny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $(`.fdm-section-${m.format('dddd').replace('å', 'a').replace('ö', 'o')}-${m.week() % 2 === 0 ? 'jamn' : 'ojamn'}`);
    if (node.length === 0) throw new Error('Wrong day');

    const titles = $(node).find('.fdm-item-title');
    const descriptions = $(node).find('.fdm-item-content p');
    if (titles.length !== descriptions.length) throw new Error('Parsing length mismatch!');
    
    answer.data = [];
    titles.each((i, el) => {
      answer.data[i] = { title: $(el).text(), description: $(descriptions[i]).text() };
    });

    fs.writeFile('./files/namdo.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getVariation = async force => {
  const m = moment();
  const answer = { name: 'variation', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/variation.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch(`https://www.nyavariation.se/files/matsedel/${m.format('YYYY')}/v-${m.week()}.pdf`);
    if (!result.ok) throw new Error('Menu not found for current week');

    const loadingTask = pdfjslib.getDocument(await result.arrayBuffer());
    answer.data = await loadingTask.promise.then(async doc => {
      const page = await doc.getPage(1);
      const textContent = await page.getTextContent();
      const text = textContent.items.filter(val => val.str.trim() !== '').map(val => val.str).join('');
      
      const today = m.format('dddd');
      const tomorrow = moment().add(1, 'day').format('dddd');
      let list = text.slice(text.toLowerCase().indexOf(today), text.toLowerCase().indexOf(tomorrow)).split('•');
      if (list[list.length - 1].includes('svampsoppa') || list[list.length - 1].includes('Vi bjuder')) { // lol
        list = list.slice(0, list.length - 1);
      }

      return list.slice(1);
    }, err => {
      throw err;
    });

    if (answer.length === 0) throw new Error('Wrong day!');

    fs.writeFile('./files/variation.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getP2 = async force => {
  const m = moment();
  const answer = { name: 'p2', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/p2.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://www.restaurangp2.se/lunch');
    const body = await result.text();
    const $ = cheerio.load(body);

    if($('.week_number').text().split(' ')[1] != m.week()) throw new Error('Wrong week');

    const node = $(`#${m.locale('en').format('dddd').toLowerCase()}`);
    if (node.length === 0) throw new Error('Wrong day');
    const courses = $(node).find('tr');
    
    answer.data = courses.map((_, el) => {
      const arr = $(el).find('p').map((i, child) => $(child).text()).get();
      if (arr.length !== 3) throw new Error('Parsing failed');
      return { title: arr[0], description: arr[1] };
    }).get();

    fs.writeFile('./files/p2.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getGlasklart = async force => {
  const m = moment();
  const answer = { name: 'glasklart', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/glasklart.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://glasklart.eu/sv/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('ul h2').first();
    if (!weekNode.text().endsWith(m.week())) throw new Error('Wrong week!');

    const h4 = weekNode.siblings('h4').toArray();
    const todayNode = $(h4.find(el => $(el).text().toLowerCase() === m.format('dddd')));
    if (todayNode.length !== 1) throw new Error('Wrong day!');

    const vegNode = $(h4[h4.length - 1]);

    answer.data = [
      { title: '', description: todayNode.next().text() },
      { title: vegNode.text(), description: vegNode.next().text() }
    ];

    fs.writeFile('./files/glasklart.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getÅrstiderna = async force => {
  const m = moment();
  const answer = { name: 'arstiderna', data: null };
  try {
    if (force !== true) {
      const file = getFile('./files/arstiderna.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('http://arstidernabythesea.se/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('.fy-content h3 span');
    if (!weekNode.text().endsWith(m.week())) throw new Error('Wrong week!');

    const today = m.format('dddd').charAt(0).toUpperCase() + m.format('dddd').slice(1);
    const tomorrow = moment().add(1, 'day').format('dddd');
    const todayNode = weekNode.parent().siblings(`:contains(${today})`);
    if (todayNode.length !== 1) throw new Error('Wrong day!');

    answer.data = [];
    let current = todayNode.next();
    while(current.text().toLowerCase() !== tomorrow && current.text().trim() !== '') {
      answer.data.push(current.text().slice(0, current.text().lastIndexOf(' ')).trim());
      current = current.next();
    }

    fs.writeFile('./files/arstiderna.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (err) {
    console.log(err);
    return { name: answer.name, data: { error: err.toString() } };
  }
};

const getStoraVarvsgatan = async force => ({ name: 'storaVarvsgatan', data: { error: 'Not implemented' } });

const getCurryRepublik = async force => ({ name: 'curryRepublik', data: { error: 'Not implemented' } });

const getThaiSushi = async force => ({ name: 'thaiSushi', data: { error: 'Not implemented' } });

app.get('/scrape', async (req, res, next) => {
  const force = req.query.forceAll === 'true';

  const answer = (await Promise.all([
    getMiamarias(force),
    getSpill(force),
    getDocpiazza(force),
    getKolga(force),
    getNamdo(force),
    getVariation(force),
    getP2(force),
    getGlasklart(force),
    getÅrstiderna(force),
    getStoraVarvsgatan(force),
    getCurryRepublik(force),
    getThaiSushi(force)
  ])).reduce((obj, curr) => {
    obj[curr.name] = curr.data;
    return obj;
  }, {});

  res.send(answer);
});

app.get('/*', function (req, res, next) {
  res.sendFile(path.join(__dirname, 'build', '../build/index.html'));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: 'Something went wrong in express server', error: err.message });
});

app.use((req, res, next) => {
  res.status(404).send({ message: `Route ${req.originalUrl} (${req.method}) not found` });
});


const port = process.env.APP_SERVER_PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});