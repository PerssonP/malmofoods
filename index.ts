import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';
import useragent from 'express-useragent';
import type { ErrorRequestHandler } from 'express';

type SimpleArrayData = {
  info: string[];
}

type ArrayData = {
  info: {
    title: string;
    description: string;
  }[];
}

type ErrorData = {
  error: string;
}

const app = express();

app.use(compression());
app.use(cors());
app.use(useragent.express());

app.use('/*', (req, res, next) => {
  if (req.useragent?.browser === 'IE') {
    res.send('Please use a real browser').status(400);
  } else {
    next();
  }
});

app.use(express.static(new URL('./client/', import.meta.url).pathname));

moment.locale('sv'); // Set global locale to Swedish

const getFile = (path: string): { date: string, content: any } => {
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path).toString());
  } else {
    return { date: '', content: null };
  }
};

const getMiamarias = async (force: boolean): Promise<{ name: 'miamarias', data: ArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getMiamarias>>;
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

    const h5arr = $('h5.et_pb_toggle_title').toArray();

    const node = h5arr.find(el => {
      return $(el).text().includes(m.format('D/M'));
    });

    if (!node) throw new Error('Wrong day');

    const parse = $(node).parent().find('span').toArray().map((el) => $(el).text().trim()).filter(x => !!x).filter(x => !x.endsWith(' kr'));
    answer = {
      name: 'miamarias',
      data: {
        info: [
          { title: 'Fisk', description: parse[0] },
          { title: 'Kött', description: parse[1] },
          { title: 'Veg', description: parse[2] }
        ]
      }
    }

    fs.writeFile('./files/miamarias.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'miamarias', data: { error: error.message } };
    else answer = { name: 'miamarias', data: { error: String(error) } };
    return answer;
  }
};

const getSpill = async (force: boolean): Promise<{ name: 'spill'; data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getSpill>>;
  try {
    if (force !== true) {
      const file = getFile('./files/spill.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://restaurangspill.se/');
    const body = await result.text();
    const $ = cheerio.load(body);

    let node = $('#dagens .uppercase');
    let currentDay = node.text().split(',')[1].trim();
    if (currentDay != m.format('DD/M')) throw new Error('Wrong day');

    answer = {
      name: 'spill',
      data: {
        info: $(node).siblings().children().toArray().map((el) => $(el).text().trim()).filter(text => text !== '')
      }
    }

    fs.writeFile('./files/spill.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'spill', data: { error: error.message } };
    else answer = { name: 'spill', data: { error: String(error) } };
    return answer;
  }
};

const getDocpiazza = async (force: boolean): Promise<{ name: 'docpiazza', data: ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getDocpiazza>>;
  try {
    throw new Error('Meny saknas');
    /*
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

    return answer;*/
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'docpiazza', data: { error: error.message } };
    else answer = { name: 'docpiazza', data: { error: String(error) } };
    return answer;
  }
};

const getKolga = async (force: boolean): Promise<{ name: 'kolga', data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getKolga>>;
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
    answer = {
      name: 'kolga',
      data: {
        info: $(content).find('.td_title').map((_, el) => $(el).text().trim()).get()
      }
    }
    fs.writeFile('./files/kolga.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'kolga', data: { error: error.message } };
    else answer = { name: 'kolga', data: { error: String(error) } };
    return answer;
  }
};

const getNamdo = async (force: boolean): Promise<{ name: 'namdo', data: ArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getNamdo>>;
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
    const descriptions = $(node).find('.fdm-item-content');
    if (titles.length !== descriptions.length) throw new Error('Parsing length mismatch!');

    const data: ArrayData = { info: [] };
    titles.each((i, el) => {
      data.info[i] = { title: $(el).text(), description: $(descriptions[i]).text() };
    });

    answer = { name: 'namdo', data: data };

    fs.writeFile('./files/namdo.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'namdo', data: { error: error.message } };
    else answer = { name: 'namdo', data: { error: String(error) } };
    return answer;
  }
};

const getVariation = async (force: boolean): Promise<{ name: 'variation', data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getVariation>>;
  try {
    if (force !== true) {
      const file = getFile('./files/variation.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    const result = await fetch('https://www.nyavariation.se/matsedel');
    const body = await result.text();
    const $ = cheerio.load(body);

    let dayOfWeek = m.format('dddd').charAt(0).toUpperCase() + m.format('dddd').slice(1);

    let day = $(`h4:contains("${dayOfWeek}")`);
    if (!$(day)[0]) throw new Error('Wrong day!');

    let menu = $(day.parents()[2]).children()[2];
    let meals = $(menu).find('li').toArray().map((el) => $(el).text())
    answer = { name: 'variation', data: { info: ['Dagens buffé:', ...meals] } };

    fs.writeFile('./files/variation.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'variation', data: { error: error.message } };
    else answer = { name: 'variation', data: { error: String(error) } };
    return answer;
  }
};

const getP2 = async (force: boolean): Promise<{ name: 'p2'; data: ArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getP2>>;
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

    if ($('.week_number').text().split(' ')[1] !== m.week().toString()) throw new Error('Wrong week');

    const node = $(`#${m.locale('en').format('dddd').toLowerCase()}`);
    if (node.length === 0) throw new Error('Wrong day');
    const courses = $(node).find('tr');

    answer = {
      name: 'p2',
      data: {
        info: courses.map((_, el) => {
          const arr = $(el).find('p').map((i, child) => $(child).text()).get();
          if (arr.length < 2) throw new Error('Parsing failed');
          return { title: arr[0], description: arr[1] };
        }).get()
      }
    }

    fs.writeFile('./files/p2.json', JSON.stringify({ date: m.format('YYYY-MM-DD'), content: answer }), err => {
      if (err) throw err;
    });

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'p2', data: { error: error.message } };
    else answer = { name: 'p2', data: { error: String(error) } };
    return answer;
  }
};

const getGlasklart = async (force: boolean): Promise<{ name: 'glasklart', data: ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getGlasklart>>;
  answer = { name: 'glasklart', data: { error: 'Tillsvidare håller lunchrestaurangen stängt.' } };
  return answer;
  /*
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
  }*/
};

const getDockanshamnkrog = async (force: boolean): Promise<{ name: 'dockanshamnkrog', data: ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getDockanshamnkrog>>;
  try {
    throw new Error('Not implemented');
    /*
    if (force !== true) {
      const file = getFile('./files/arstiderna.json');
      if (file.date === m.format('YYYY-MM-DD')) {
        return file.content;
      }
    }

    
    const result = await fetch('http://dockanshamnkrog.se/lunchmeny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    let weekNode = $()
    

    
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

    return answer;*/
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'dockanshamnkrog', data: { error: error.message } };
    else answer = { name: 'dockanshamnkrog', data: { error: String(error) } };
    return answer;
  }
};

const getStoravarvsgatan = async (force: boolean): Promise<{ name: 'storavarvsgatan', data: ErrorData }> => ({ name: 'storavarvsgatan', data: { error: 'Not implemented' } });

const getThaisushiforyou = async (force: boolean): Promise<{ name: 'thaisushiforyou', data: ErrorData }> => ({ name: 'thaisushiforyou', data: { error: 'Not implemented' } });

const getCurryrepublic = async (force: boolean): Promise<{ name: 'curryrepublik', data: ErrorData }> => ({ name: 'curryrepublik', data: { error: 'Not implemented' } });

const getVhPizzeria = async (force: boolean): Promise<{ name: 'vhPizzeria', data: SimpleArrayData | ErrorData }> => ({ name: 'vhPizzeria', data: { info: ['Pizzabuffé'] } });

const getDocksideBurgers = async (force: boolean): Promise<{ name: 'docksideburgers', data: SimpleArrayData | ErrorData }> => ({ name: 'docksideburgers', data: { info: ['Burgare', 'Månadens burgare'] } });

const getLaziza = async (force: boolean): Promise<{ name: 'laziza', data: SimpleArrayData | ErrorData }> => ({ name: 'laziza', data: { info: ['Libanesisk buffé'] } });

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
    getDockanshamnkrog(force),
    getStoravarvsgatan(force),
    getThaisushiforyou(force),
    getCurryrepublic(force),
    getVhPizzeria(force),
    getDocksideBurgers(force),
    getLaziza(force)
  ])).reduce<{ [key: string]: SimpleArrayData | ArrayData | ErrorData }>((obj, curr) => {
    obj[curr.name] = curr.data;
    return obj;
  }, {});

  res.send(answer);
});

app.get('/*', function (req, res, next) {
  res.sendFile(new URL('./client/index.html', import.meta.url).pathname);
});



app.use(((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: 'Something went wrong in express server', error: err.message });
}) as ErrorRequestHandler);

app.use((req, res, next) => {
  res.status(404).send({ message: `Route ${req.originalUrl} (${req.method}) not found` });
});

const port = process.env.APP_SERVER_PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});