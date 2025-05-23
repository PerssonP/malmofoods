import express from 'express';
import * as cheerio from 'cheerio';
import moment from 'moment';
import NodeCache from 'node-cache';
import he from 'he';

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

const getFromCache = (key: string): { date: string; content: Menu } | null => {
  const data = cache.get(key);
  if (data) return data as { date: string; content: Menu };
  return null;
}

const sources: { [key: string]: (m: moment.Moment) => Promise<SimpleArrayData | ArrayData | ObjectData> } = {
  'miamarias': async (m) => {
    if (m.day() < 1 || m.day() > 5)
      throw new Error('No menu available for current day of week'); 

    const result = await fetch('https://miamarias.nu/lunch/');
    const body = await result.text();
    const $ = cheerio.load(body);

    if (Number($('h2:contains(Meny vecka)').text().trim().split(' ').at(-1)) !== m.week())
      throw new Error('Wrong week');

    const menus = $('.e-n-tabs-content').children().toArray();
    const dishes = $(menus[m.day() - 1]).children().toArray();

    const data = [];
    for (let dish of dishes) {
      const content = $(dish).children().toArray();
      const title = $(content[0]).text().trim();
      const description = $(content[2]).text().trim();
      data.push({ title, description });
    }

    const answer = {
      name: 'miamarias',
      data
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
    const result = await fetch('https://www.restaurangp2.se');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $(`h3:contains("${weekdayFirstUpper(m)}")`)
    if (node.length === 0) throw new Error('Wrong day');

    const courses = node.parent().parent().parent().find('.lunchmeny_container');

    const answer = {
      name: 'p2',
      data: courses.map((_, el) => {
        const title = $(el).find('.lunch_title').text();
        const description = $(el).find('.lunch_desc').text();

        if (title.length == 0 || description.length == 0)
          throw new Error('Parsing failed');
        return { title, description };
      }).get()
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
    /*
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
    }*/
    throw new Error("Not implemented");
  },
  'storavarvsgatan6': async (m) => {
    const result = await fetch('https://storavarvsgatan6.se/meny.html');
    const body = await result.text();
    const $ = cheerio.load(body);

    const weekNode = $('p:contains("Meny")').first();
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
    // https://thatsup.website/storage/462/59069/V.21-MALM%C3%96-NY-.pdf
    const result = await fetch('https://api.eatery.se/wp-json/eatery/v1/load');
    const json = await result.json() as any;

    const lunchmenuID = json.eateries["\/vastra-hamnen"].menues.lunchmeny;
    const title: string = json.menues[lunchmenuID].content.title;
    const content: string[] = json.menues[lunchmenuID].content.content.split('\n');

    if (Number(title.match(/\d+/)?.[0]) !== m.week()) throw new Error('Weekly menu not yet posted');

    const start = m.format('dddd').toUpperCase();
    const end = m.add(1, 'day').format('dddd').toUpperCase();
    const startIndex = content.findIndex(s => s.includes(start));
    const endIndex = content.findIndex(s => s.includes(end));

    if (startIndex === -1) throw new Error('Day not found');
    const menus = content.slice(startIndex + 1, endIndex !== -1 ? endIndex : undefined)
      .map(s => s.replace(/<\/?[^>]+(>|$)|(&nbsp;)/g, '')).filter(s => s.trim()) // Clean and remove empty rows
      .map(s => s.replace(/&#(\d+);/g, (_, $1) => String.fromCharCode($1))); // Decode and replace charCodes, e.g. &#8221; => ”

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

    const firstDayNode = $('p:contains(Måndag)');
    if (firstDayNode.text().split(' ')[1].trim() !== moment().startOf('isoWeek').format('D/M'))
      throw new Error('Wrong week');

    const dayNodes = firstDayNode.siblings().toArray().map(e => $(e).text());
    dayNodes.unshift(firstDayNode.text())

    const menu: string[] = [];
    let index = dayNodes.findIndex(n => n.startsWith(weekdayFirstUpper(m)));
    if (index === -1) throw new Error('Wrong day');
    index++;
    let node = dayNodes.at(index);
    const endString = weekdayFirstUpper(m.add(1, 'day'));
    while (node !== undefined && !node.startsWith(endString)) {
      node = node.trim();
      if (!['', '–', '—'].includes(node)) menu.push(node);
      index++;
      node = dayNodes.at(index);
    }

    const answer = {
      name: 'valfarden',
      data: menu
    };

    setInCache(answer);
    return answer.data;
  },
  'ubatshallen': async (m) => {
    const result = await fetch('https://www.ubatshallen.se/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const mainNode = $('div .entry-content');
    const weekNbr = mainNode.children('h2:contains("Vecka")').text().trim().split(' ').at(-1);
    if (weekNbr === undefined || weekNbr !== m.week().toString())
      throw new Error('Wrong week');

    const node = mainNode.children(`div:contains(${weekdayFirstUpper(m)})`);
    if (node.length == 0)
      throw new Error('No menu found for current day');

    const food = node.text().split(/(Det gröna:)|(Husman:)|(Internationell:)/)
      .filter(x => !!x)
      .map((x, i) => {
        if (i % 2 == 1) return x.slice(0, -1);
        return x.trim();
      });
    food.shift();

    if (food.length !== 6)
      throw new Error('Parsing failed');

    const menu = [{ title: food[0], description: food[1] }, { title: food[2], description: food[3] }, { title: food[4], description: food[5] }];
    const answer = {
      name: 'ubatshallen',
      data: menu
    };

    setInCache(answer);
    return answer.data;
  },
  'misswang': async (m) => {
    const result = await fetch('https://misswang.se/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const node = $('#Lunch p');
    const menu = node.toArray()
      .map(e => $(e).text())
      .slice(1)
      .reduce<{ title: string, description: string }[]>((acc, curr, i) => {
        if (curr.match(/^\d.+$/)) {
          acc.push({ title: curr, description: '' })
        } else {
          acc.at(-1)!.description += curr;
        }
        return acc;
      }, []);

    const answer = {
      name: 'misswang',
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
      if (cacheData !== null && cacheData.date === m.format('YYYY-MM-DD')) {
        res.send(cacheData.content.data);
        return;
      }
    }

    res.send(await sources[source](m));
  } catch (error) {
    console.log(error);
    if (error instanceof Error)
      res.send({ error: `Error: ${error.message}` });
    else
      res.send({ error: `Error: ${error}` });
  }
});

export default router;
