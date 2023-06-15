import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';
import NodeCache from 'node-cache';
import he from 'he';

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
      return $(el).text().includes(m.format('D/M'));
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

    let node = $('#dagens .uppercase');
    let currentDay = node.text().split(',')[1].trim();
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

    const currentDay = m.format('dddd').charAt(0).toUpperCase() + m.format('dddd').slice(1);
    const header = $(`.menu_header h3:contains(${currentDay}):contains(${m.format('D')})`).first();
    if (header.length === 0) throw new Error('Wrong day');

    const content = $(header).parents('thead').siblings('tbody')[0];
    const answer = {
      name: 'kolga',
      data: $(content).find('.td_title').map((_, el) => $(el).text().trim()).get()
    }

    setInCache(answer);

    return answer.data;
  },
  'variation': async (m) => {
    const result = await fetch('https://www.nyavariation.se/lunch_malmo/');
    const body = await result.text();
    const $ = cheerio.load(body);

    const dayOfWeek = m.format('dddd').charAt(0).toUpperCase() + m.format('dddd').slice(1);

    const day = $(`h4:contains("${dayOfWeek}")`);
    if (!$(day)[0]) throw new Error('Wrong day!');

    const ul = day.parents('.elementor-widget-wrap').first().find('.elementor-widget-container').last().find('ul').first();
    const meals = ul.children().toArray().map(el => $(el).text());
    const answer = { name: 'variation', data: ['Dagens buffé:', ...meals] };

    setInCache(answer);

    return answer.data;
  },
  'p2': async (m) => {
    const result = await fetch('https://www.restaurangp2.se/lunch');
    const body = await result.text();
    const $ = cheerio.load(body);

    if ($('.week_number').text().split(' ')[1] !== m.week().toString()) throw new Error('Wrong week');

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

    const day = menu.children(`p:contains(${m.format('dddd')[0].toUpperCase() + m.format('dddd').slice(1)})`)

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
  'docksideburgers': async () => {
    return ['Burgare', 'Månadens burgare']  // todo
  },
  'storavarvsgatan6': async (m) => {
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

    const currentDayKey = m.format('dddd')[0].toUpperCase() + m.format('dddd').slice(1);
    const daily = json.weekexp[currentDayKey]?.filter((value: any) => !!value?.title);

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
    
    const lunchmenuID = json.eateries["\/vastra-hamnen"].menues.lunchmeny
    const title = json.menues[lunchmenuID].content.title;
    const content = json.menues[lunchmenuID].content.content;

    if (Number(title.split(' ').at(-1)) !== m.week()) throw new Error('Weekly menu not yet posted');
    
    const $ = cheerio.load(content);
    const items = $(`p:contains(${m.format('dddd').toUpperCase()})`).text().split('\n');
    if (items.length < 1) throw new Error('No data found for day');

    const answer = {
      name: 'eatery',
      data: items.slice(1)
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