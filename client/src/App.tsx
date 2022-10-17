import React, { useState, useEffect, useRef } from 'react';
import { Grid, Button } from '@mui/material';

import { Maps } from './components/GoogleMaps';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from './components/Menus';

type ArrayMenu = {
  name: string;
  variant: 'Array';
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
}

type SimpleArrayMenu = {
  name: string;
  variant: 'SimpleArray';
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
}

type ObjectMenu = {
  name: string;
  variant: 'Object';
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
}

type SegmentedMenu = {
  name: string;
  variant: 'Segmented';
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
}

type HyperlinkMenu = {
  name: string;
  variant: 'Hyperlink';
  url: string;
  icon: string;
  text: string;
  href: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
}

const App = () => {
  const [data, setData] = useState<any>(null);

  const menus: { [key: string]: ArrayMenu | SimpleArrayMenu | ObjectMenu | SegmentedMenu | HyperlinkMenu } = {
    miamarias: {
      name: 'Mia Marias',
      variant: 'Array',
      url: 'http://www.miamarias.nu/',
      icon: '/icons/miamarias.png',
      lat: 55.613306,
      lng: 12.992183,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    spill: {
      name: 'Spill',
      variant: 'SimpleArray',
      url: 'https://restaurangspill.se/',
      icon: '/icons/spill.png',
      lat: 55.612801,
      lng: 12.988404,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    docpiazza: {
      name: 'Doc Piazza',
      variant: 'Hyperlink',
      url: 'https://www.facebook.com/docpiazza',
      icon: '/icons/docpiazza.png',
      text: 'Meny på FB',
      href: 'https://www.facebook.com/docpiazza',
      lat: 55.614333,
      lng: 12.989664,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    kolga: {
      name: 'Kolga',
      variant: 'SimpleArray',
      url: 'https://kolga.gastrogate.com/',
      icon: '/icons/kolga.png',
      lat: 55.612290,
      lng: 12.998474,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    variation: {
      name: 'Variation',
      variant: 'SimpleArray',
      url: 'https://www.nyavariation.se',
      icon: '/icons/variation.png',
      lat: 55.607990,
      lng: 12.981666,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    p2: {
      name: 'P2',
      variant: 'Array',
      url: 'https://www.restaurangp2.se',
      icon: '/icons/p2.png',
      lat: 55.614380,
      lng: 12.988521,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    dockanshamnkrog: {
      name: 'Dockans Hamnkrog',
      variant: 'SimpleArray',
      url: 'http://dockanshamnkrog.se',
      lat: 55.615186,
      lng: 12.988838,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/dockanshamnkrog.png'
    },
    curryrepublik: {
      name: 'Curry Republik',
      variant: 'SimpleArray',
      url: 'https://www.wokkitchen.se',
      lat: 55.611586,
      lng: 12.980412,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/lol.png'
    },
    namdo: {
      name: 'Nam Do',
      variant: 'Array',
      url: 'http://namdo.se',
      lat: 55.604493,
      lng: 12.997683,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/namdo.svg'
    },
    docksideburgers: {
      name: 'Dockside Burgers',
      variant: 'SimpleArray',
      url: 'https://www.docksideburgers.se',
      lat: 55.614418,
      lng: 12.990020,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/lol.png'
    },
    storavarvsgatan6: {
      name: 'Stora Varvsgatan 6',
      variant: 'SimpleArray',
      url: 'https://storavarvsgatan6.se',
      lat: 55.612501,
      lng: 12.991662,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/storavarvsgatan6.png'
    },
    laziza: {
      name: 'Laziza Dockan',
      variant: 'SimpleArray',
      url: 'https://www.laziza.se',
      lat: 55.614113,
      lng: 12.988982,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/laziza.webp'
    },
    thaisushiforyou: {
      name: 'Thai n Sushi for you',
      variant: 'SimpleArray',
      url: 'https://vhamnen.thainsushiforyou.se',
      lat: 55.614201,
      lng: 12.981888,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
      icon: '/icons/thaisushi.png'
    },
    mrsSaigon: {
      name: 'Mrs Saigon',
      variant: 'Hyperlink',
      url: 'https://www.mrs-saigon.se',
      icon: '/icons/mrssaigon.png',
      text: 'Oförändrande lunchmeny',
      href: 'https://www.mrs-saigon.se/meny/',
      lat: 55.603335,
      lng: 12.998333,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null)
    }
  };

  const getData = async (force: boolean) => {
    const result = await fetch(`/scrape${force ? '?forceAll=true' : ''}`);
    const body = await result.json();
    console.log(body);
    setData(body);
  };

  useEffect(() => {
    getData(false);
  }, []);

  const recheck = async (force: boolean) => {
    setData(null);
    getData(force);
  };

  return (
    <main>
      <Maps pins={menus} />
      <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
        {Object.keys(menus).map((key) => {
          const menu = menus[key];

          switch (menu.variant) {
            case 'Array':
              return (
                <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
                  <ArrayMenu
                    header={menu.name}
                    url={menu.url}
                    icon={menu.icon}
                    showSelected={menu.selected[0]}
                    data={data?.[key]}
                    ref={menu.ref}
                  />
                </Grid>
              );
            case 'SimpleArray':
              return (
                <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
                  <SimpleArrayMenu
                    header={menu.name}
                    url={menu.url}
                    icon={menu.icon}
                    showSelected={menu.selected[0]}
                    data={data?.[key]}
                    ref={menu.ref}
                  />
                </Grid>
              );
            case 'Object':
              return (
                <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
                  <ObjectMenu
                    header={menu.name}
                    url={menu.url}
                    icon={menu.icon}
                    showSelected={menu.selected[0]}
                    data={data?.[key]}
                    ref={menu.ref}
                  />
                </Grid>
              );
            case 'Segmented':
              return (
                <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
                  <SegmentedMenu
                    header={menu.name}
                    url={menu.url}
                    icon={menu.icon}
                    showSelected={menu.selected[0]}
                    data={data?.[key]}
                    ref={menu.ref}
                  />
                </Grid>
              )
            case 'Hyperlink':
              return (
                <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
                  <HyperlinkMenu
                    header={menu.name}
                    url={menu.url}
                    icon={menu.icon}
                    showSelected={menu.selected[0]}
                    href={menu.href}
                    text={menu.text}
                    ref={menu.ref}
                  />
                </Grid>
              );
          }
        })}
      </Grid>
      <Grid container justifyContent='flex-end'>
        <Button variant='contained' onClick={() => recheck(false)}>Recheck</Button>
        <Button variant='contained' onClick={() => recheck(true)}>Recheck (force)</Button>
      </Grid>
    </main>
  );
};

export default App;