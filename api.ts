import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cheerio from 'cheerio';
import moment from 'moment';
import NodeCache from 'node-cache';
import he from 'he';
import puppeteer from 'puppeteer';

import { weekdayFirstUpper } from './momentUtil.js';

type SimpleArrayData = string[];

type ArrayData = {
  title: string;
  description: string;
}[];

type ObjectData = {
  [key: string]: string
};

type Menu = {
  name: string;
  data: SimpleArrayData | ArrayData | ObjectData
}

moment.locale('sv'); // Set global locale to Swedish;
const router = express.Router();

const cache = new NodeCache({ stdTTL: 86400 }); // TTL: 24h

const setInCache = (input: Menu) => {
  cache.set(input.name, { date: moment().format('YYYY-MM-DD'), content: input });
}

const getFromCache = (key: string): { date: string; content: Menu | null } => {
  const data = cache.get(key);
  if (data) return data as { date: string; content: Menu };
  return { date: '', content: null };
}

const sources: { [key: string]: (m: moment.Moment) => Promise<SimpleArrayData | ArrayData | ObjectData> } = {
  'miamarias': async (m) => {
    const result = await fetch('http://www.miamarias.nu/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const h5arr = $('h5.et_pb_toggle_title').toArray();

    const node = h5arr.find(el => {
      return $(el).text().includes(weekdayFirstUpper(m));
    });

    if (!node) throw new Error('Wrong day');

    const parse = $(node).parent().find('p').toArray()
      .map((el) => $(el).text().trim()) // Get all texts
      .filter((value, index, originalArray) =>
        !!value &&  // Remove empty texts
        !value.endsWith(' kr') && // Remove categories
        originalArray.slice(index + 1).indexOf(value) === -1 // Remove possible duplicates
      );

    const answer = {
      name: 'miamarias',
      data: [
        { title: 'Fisk', description: parse[0] },
        { title: 'Kött', description: parse[1] },
        { title: 'Veg', description: parse[2] }
      ]
    }

    setInCache(answer);
    return answer.data;
  },
  'spill': async (m) => {
    const result = await fetch('https://restaurangspill.se/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const section = $('h2:contains(Gängtappen)').parents()[2];
    const node = $(section).find('.uppercase');
    const currentDay = node.text().split(',')[1].trim();
    if (currentDay != m.format('DD/M')) throw new Error('Wrong day');

    const answer = {
      name: 'spill',
      data: $(node).siblings().children().toArray().map((el) => $(el).text().trim()).filter(text => text !== '')
    }

    setInCache(answer);
    return answer.data;
  },
  'kolga': async (m) => {
    const result = await fetch('https://kolga.gastrogate.com/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const header = $(`.menu_header h3:contains(${weekdayFirstUpper(m)}):contains(${m.format('D')})`).first();
    if (header.length === 0) throw new Error('Wrong day');

    const content = $(header).parents('thead').siblings('tbody')[0];
    const answer = {
      name: 'kolga',
      data: $(content).find('.td_title').map((_, el) => $(el).text().trim()).get()
    }

    setInCache(answer);
    return answer.data;
  },
  'p2': async (m) => {
    const result = await fetch('https://www.restaurangp2.se/lunch');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $(`#${m.locale('en').format('dddd').toLowerCase()}`);
    if (node.length === 0) throw new Error('Wrong day');
    const courses = $(node).find('tr');

    const answer = {
      name: 'p2',
      data: courses.map((_, el) => {
        const arr = $(el).find('p').map((i, child) => $(child).text()).get();
        if (arr.length < 2) throw new Error('Parsing failed');
        return { title: arr[0], description: arr[1] };
      }).get()
    }

    setInCache(answer);
    return answer.data;
  },
  'dockanshamnkrog': async (m) => {
    const result = await fetch('http://dockanshamnkrog.se/lunchmeny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const menu = $('h2:contains(Lunch)').parent();
    const week = menu.children(':contains(VECKA)');
    if (!week.text().trim().endsWith(m.week().toString())) {
      throw new Error('Wrong week');
    }

    const day = menu.children(`p:contains(${weekdayFirstUpper(m)})`)

    if (day.text() === '') throw new Error('Day not found');

    const answer = {
      name: 'dockanshamnkrog',
      data: [
        day.text().split('\n')[1]
      ]
    }

    setInCache(answer);
    return answer.data;
  },
  'namdo': async (m) => {
    const result = await fetch('http://namdo.se/meny/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $(`.fdm-section-${m.format('dddd').replace('å', 'a').replace('ö', 'o')}-${m.week() % 2 === 0 ? 'jamn' : 'ojamn'}`);
    if (node.length === 0) throw new Error('Wrong day');

    const titles = $(node).find('.fdm-item-title');
    const descriptions = $(node).find('.fdm-item-content');
    if (titles.length !== descriptions.length) throw new Error('Parsing length mismatch!');

    const answer = { name: 'namdo', data: [] as ArrayData };
    titles.each((i, el) => {
      answer.data.push({ title: $(el).text(), description: $(descriptions[i]).text() });
    });

    setInCache(answer);
    return answer.data;
  },
  'docksideburgers': async (m) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    try {
      const page = await browser.newPage();
      await page.goto('https://www.facebook.com/DocksideBurgers/');

      const element = await page.waitForSelector("::-p-xpath(//span[contains(., 'Månadens')])")
      const text = await element?.evaluate(e => e.textContent);

      await browser.close();
      return ['Från Docksides facebook:', text || ''];
    } catch (e) {
      await browser.close();
      throw e;
    }
  },
  'storavarvsgatan6': async (m) => {
    const result = await fetch('https://storavarvsgatan6.se/meny.html');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('p:contains("Veckans meny")').first();
    if (Number(weekNode.text().trim().split('.').pop()) !== m.week()) throw new Error('Weekly menu not yet posted');

    const weekDayNode = weekNode.siblings(`p:contains(${weekdayFirstUpper(m)})`);
    const menu: string[] = [];
    let row = weekDayNode.next();
    while (row.text().trim() !== '') {
      menu.push(row.text());
      row = row.next();
    }

    const answer = {
      name: 'storavarvsgatan6',
      data: menu
    };

    setInCache(answer);
    return answer.data;
  },
  'laziza': async () => {
    return ['Libanesisk buffé']  // todo
  },
  'thapthim': async (m) => {
    const result = await fetch('https://api.thapthim.se/?read=lunchinfo&store=vh');
    const json = await result.json() as any;

    const answer = {
      name: 'thapthim',
      data: [] as ArrayData
    }

    const weekly: any[] = json.weekexp.Veckans.filter((value: any) => !!value?.title);
    for (const meal of weekly) {
      answer.data.push({ title: meal.title, description: he.decode(meal.desc) })
    }

    const daily = json.weekexp[weekdayFirstUpper(m)]?.filter((value: any) => !!value?.title);

    if (!daily || daily.length === 0) throw new Error('Day not found')

    for (const meal of daily) {
      answer.data.push({ title: meal.title, description: he.decode(meal.desc) })
    }

    setInCache(answer);
    return answer.data;
  },
  'eatery': async (m) => {
    const result = await fetch('https://api.eatery.se/wp-json/eatery/v1/load');
    const json = await result.json() as any;

    const lunchmenuID = json.eateries["\/vastra-hamnen"].menues.lunchmeny;
    const title: string = json.menues[lunchmenuID].content.title;
    const content: string[] = json.menues[lunchmenuID].content.content.split('\n');    

    if (Number(title.split(' ').at(-1)) !== m.week()) throw new Error('Weekly menu not yet posted');

    const start = m.format('dddd').toUpperCase();
    const end = m.add(1, 'day').format('dddd').toUpperCase();
    const startIndex = content.findIndex(s => s.includes(start));
    const endIndex = content.findIndex(s => s.includes(end));

    if (startIndex === -1) throw new Error('Day not found');
    const menus = content.slice(startIndex + 1, endIndex !== -1 ? endIndex : undefined)
      .map(s => s.replace(/<\/?[^>]+(>|$)|(&nbsp;)/g, ''))
      .filter(s => s.trim());

    const answer = {
      name: 'eatery',
      data: menus
    };

    setInCache(answer);
    return answer.data;
  },
  'valfarden': async (m) => {
    const result = await fetch('https://valfarden.nu/dagens-lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('h2:contains(Vecka)');

    if (weekNode.text().split(' ')[1].trim() !== m.week().toString())
      throw new Error('Wrong week');

    const dayNodes = weekNode.siblings().toArray().map(e => $(e).text());

    const menu: string[] = [];
    let index = dayNodes.findIndex(n => n.startsWith(weekdayFirstUpper(m)));
    if (index === -1) throw new Error('Wrong day');
    index++;
    let node = dayNodes.at(index);
    const endString = weekdayFirstUpper(m.add(1, 'day'));
    while (node !== undefined && !node.startsWith(endString)) {
      node = node.trim();
      if (node !== '' && node !== '–') menu.push(node);
      index++;
      node = dayNodes.at(index);
    }

    const answer = {
      name: 'valfarden',
      data: menu
    };

    setInCache(answer);
    return answer.data;
  }
}

router.get('/api/:source', async (req, res, next) => {
  try {
    const m = moment();
    const source = req.params.source;
    if (req.query.force !== 'true') {
      const cacheData = getFromCache(source);
      if (cacheData.content !== null && cacheData.date === m.format('YYYY-MM-DD')) return res.send(cacheData.content.data);
    }

    const answer = await sources[source](m);
    return res.send(answer);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) return res.send({ error: `Error: ${error.message}` });
    else return res.send({ error: `Error: ${error}` });
  }
});

export default router;
