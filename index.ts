import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import compression from 'compression';
import cors from 'cors';
import useragent from 'express-useragent';
import NodeCache from 'node-cache';
import type { ErrorRequestHandler } from 'express';
import { data } from 'cheerio/lib/api/attributes';

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

const cache = new NodeCache({ stdTTL: 86400 }); // TTL: 24h

moment.locale('sv'); // Set global locale to Swedish

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

const setInCache = (input: { name: string, data: unknown }) => {
  cache.set(input.name, { date: moment().format('YYYY-MM-DD'), content: input });
}

const getFromCache = (key: string): { date: string; content: any } => {
  const data = cache.get(key);
  if (data) return data as { date: string; content: unknown };
  return { date: '', content: null };
}

const getMiamarias = async (force: boolean): Promise<{ name: 'miamarias', data: ArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getMiamarias>>;
  try {
    if (force !== true) {
      const cacheData = getFromCache('miamarias');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

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
      const cacheData = getFromCache('spill');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'spill', data: { error: error.message } };
    else answer = { name: 'spill', data: { error: String(error) } };
    return answer;
  }
};

const getKolga = async (force: boolean): Promise<{ name: 'kolga', data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getKolga>>;
  try {
    if (force !== true) {
      const cacheData = getFromCache('kolga');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

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
      const cacheData = getFromCache('namdo');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

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
      const cacheData = getFromCache('variation');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

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
      const cacheData = getFromCache('p2');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
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

    setInCache(answer);

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'p2', data: { error: error.message } };
    else answer = { name: 'p2', data: { error: String(error) } };
    return answer;
  }
};

const getDockanshamnkrog = async (force: boolean): Promise<{ name: 'dockanshamnkrog', data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getDockanshamnkrog>>;
  try {
    if (force !== true) {
      const cacheData = getFromCache('dockanshamnkrog');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
    }
    
    const result = await fetch('http://dockanshamnkrog.se/lunchmeny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const menu = $('h2:contains(Lunch)').parent();
    const week = menu.children(':contains(VECKA)');
    if (!week.text().trim().endsWith(m.week().toString())) {
      throw new Error('Wrong week');
    }

    const day = menu.children(`p:contains(${m.format('dddd')[0].toUpperCase() + m.format('dddd').slice(1)})`)

    if (day.text() === '') throw new Error('Day not found');
    
    answer = {
      name: 'dockanshamnkrog',
      data: {
        info: [
          day.text().split('\n')[1]
        ]
      }
    }
    
    setInCache(answer);

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'dockanshamnkrog', data: { error: error.message } };
    else answer = { name: 'dockanshamnkrog', data: { error: String(error) } };
    return answer;
  }
};

const getStoravarvsgatan6 = async (force: boolean): Promise<{ name: 'storavarvsgatan6', data: SimpleArrayData | ErrorData }> => {
  const m = moment();
  let answer: Awaited<ReturnType<typeof getStoravarvsgatan6>>;
  try {
    if (force !== true) {
      const cacheData = getFromCache('storavarvsgatan6');
      if (cacheData.date === m.format('YYYY-MM-DD')) return cacheData.content;
    }

    const result = await fetch('https://storavarvsgatan6.se/meny.html');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('p:contains("Veckans meny")').first();
    if (Number(weekNode.text().trim().split('.').pop()) !== m.week()) throw new Error('Weekly menu not yet posted');
    
    const weekDayNode = weekNode.siblings(`p:contains(${m.format('dddd')[0].toUpperCase() + m.format('dddd').slice(1)})`);
    const menu = [];
    let row = weekDayNode.next();
    while (row.text().trim() !== '') {
      menu.push(row.text());
      row = row.next();
    }

    answer = {
      name: 'storavarvsgatan6',
      data: {
        info: menu
      }
    };

    setInCache(answer);

    return answer;
  } catch (error) {
    console.log(error);
    if (error instanceof Error) answer = { name: 'storavarvsgatan6', data: { error: error.message } };
    else answer = { name: 'storavarvsgatan6', data: { error: String(error) } };
    return answer;
  }
}

const getThaisushiforyou = async (force: boolean): Promise<{ name: 'thaisushiforyou', data: ErrorData }> => ({ name: 'thaisushiforyou', data: { error: 'Not implemented' } });

const getCurryrepublic = async (force: boolean): Promise<{ name: 'curryrepublik', data: ErrorData }> => ({ name: 'curryrepublik', data: { error: 'Not implemented' } });

const getDocksideBurgers = async (force: boolean): Promise<{ name: 'docksideburgers', data: SimpleArrayData | ErrorData }> => ({ name: 'docksideburgers', data: { info: ['Burgare', 'Månadens burgare'] } });

const getLaziza = async (force: boolean): Promise<{ name: 'laziza', data: SimpleArrayData | ErrorData }> => ({ name: 'laziza', data: { info: ['Libanesisk buffé'] } });

app.get('/scrape', async (req, res, next) => {
  const force = req.query.forceAll === 'true';

  const answer = (await Promise.all([
    getMiamarias(force),
    getSpill(force),
    getKolga(force),
    getNamdo(force),
    getVariation(force),
    getP2(force),
    getDockanshamnkrog(force),
    getStoravarvsgatan6(force),
    getThaisushiforyou(force),
    getCurryrepublic(force),
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