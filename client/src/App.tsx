import React, { useState, useEffect, useRef } from 'react';
import { Button, Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // TODO: Replace with import from @mui/material when stable

import { Maps } from './components/GoogleMaps';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from './components/Menus';

type Menu = {
  name: string;
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
};

type SracpedMenu = {
  data: [any, React.Dispatch<React.SetStateAction<any>>];
  dataSource: string;
} & Menu;

export type ArrayMenu = {
  variant: 'Array';
} & SracpedMenu;

export type SimpleArrayMenu = {
  variant: 'SimpleArray';
} & SracpedMenu;

export type ObjectMenu = {
  variant: 'Object';
} & SracpedMenu;

export type SegmentedMenu = {
  variant: 'Segmented';
} & SracpedMenu;

export type HyperlinkMenu = {
  variant: 'Hyperlink';
  text: string;
  href: string;
} & Menu;

const App = () => {
  const menus: { [key: string]: ArrayMenu | SimpleArrayMenu | ObjectMenu | SegmentedMenu | HyperlinkMenu } = {
    miamarias: {
      name: 'Mia Marias',
      variant: 'Array',
      url: 'http://www.miamarias.nu/',
      icon: '/icons/miamarias.png',
      lat: 55.613306,
      lng: 12.992183,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/miamarias',
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
      data: useState<any>(null),
      dataSource: '/api/spill',
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
      data: useState<any>(null),
      dataSource: '/api/kolga',
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
      data: useState<any>(null),
      dataSource: '/api/variation',
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
      data: useState<any>(null),
      dataSource: '/api/p2',
      ref: useRef<HTMLDivElement>(null),
    },
    dockanshamnkrog: {
      name: 'Dockans Hamnkrog',
      variant: 'SimpleArray',
      url: 'http://dockanshamnkrog.se',
      icon: '/icons/dockanshamnkrog.png',
      lat: 55.615186,
      lng: 12.988838,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/dockanshamnkrog',
      ref: useRef<HTMLDivElement>(null)
    },
    curryrepublik: {
      name: 'Curry Republik',
      variant: 'Hyperlink',
      url: 'https://www.wokkitchen.se',
      text: 'Meny på FB',
      href: 'https://www.facebook.com/curryrepublik/menu',
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
      data: useState<any>(null),
      dataSource: '/api/namdo',
      icon: '/icons/namdo.svg'
    },
    docksideburgers: {
      name: 'Dockside Burgers',
      variant: 'SimpleArray',
      url: 'https://www.docksideburgers.se',
      icon: '/icons/lol.png',
      lat: 55.614418,
      lng: 12.990020,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/docksideburgers',
      ref: useRef<HTMLDivElement>(null),
    },
    storavarvsgatan6: {
      name: 'Stora Varvsgatan 6',
      variant: 'SimpleArray',
      url: 'https://storavarvsgatan6.se',
      icon: '/icons/storavarvsgatan6.png',
      lat: 55.612501,
      lng: 12.991662,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/storavarvsgatan6',
      ref: useRef<HTMLDivElement>(null),
    },
    laziza: {
      name: 'Laziza Dockan',
      variant: 'SimpleArray',
      url: 'https://www.laziza.se',
      icon: '/icons/laziza.webp',
      lat: 55.614113,
      lng: 12.988982,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/laziza',
      ref: useRef<HTMLDivElement>(null),
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
    },
    thapthim: {
      name: 'Thap Thim',
      variant: 'Array',
      url: 'https://thapthim.se/',
      icon: '/icons/thapthim.png',
      lat: 55.6119874494682,
      lng: 12.981234241631247,
      selected: useState<boolean>(false),
      data: useState<any>(null),
      dataSource: '/api/thapthim',
      ref: useRef<HTMLDivElement>(null),
    }
  };

  const updateData = async (menu: SracpedMenu, force: boolean = false) => {
    const result = await fetch(`${menu.dataSource}?force=${force}`);
    const body = await result.json();
    menu.data[1](body);
  } 

  useEffect(() => {
    recheck(false);
  }, []);

  const recheck = (force: boolean) => {
    for (const menu of Object.values(menus)) {
      if (menu.variant !== 'Hyperlink') updateData(menu, force);
    }
  };

  return (
    <Box
      component='main'
      sx={{
        display: 'grid',
        minHeight: '100vh',
        grid: `
        'map' min-content
        'menus' min-content
        'gap' auto
        'buttons' min-content`
      }}
    >
      <Maps pins={menus} />
      <Grid
        container
        spacing={2}
        sx={{
          margin: '0'
        }}
      >
        {Object.keys(menus).map((key) => {
          const menu = menus[key];

          return (
            <Grid
              key={key}
              sx={{
                width: '317.156px'
              }}
            >
              {(() => {
                switch (menu.variant) {
                  case 'Array':
                    return (
                      <ArrayMenu
                        header={menu.name}
                        url={menu.url}
                        icon={menu.icon}
                        showSelected={menu.selected[0]}
                        data={menu.data[0]}
                        ref={menu.ref}
                      />
                    );
                  case 'SimpleArray':
                    return (
                      <SimpleArrayMenu
                        header={menu.name}
                        url={menu.url}
                        icon={menu.icon}
                        showSelected={menu.selected[0]}
                        data={menu.data[0]}
                        ref={menu.ref}
                      />
                    );
                  case 'Object':
                    return (
                      <ObjectMenu
                        header={menu.name}
                        url={menu.url}
                        icon={menu.icon}
                        showSelected={menu.selected[0]}
                        data={menu.data[0]}
                        ref={menu.ref}
                      />
                    );
                  case 'Segmented':
                    return (
                      <SegmentedMenu
                        header={menu.name}
                        url={menu.url}
                        icon={menu.icon}
                        showSelected={menu.selected[0]}
                        data={menu.data[0]}
                        ref={menu.ref}
                      />
                    )
                  case 'Hyperlink':
                    return (
                      <HyperlinkMenu
                        header={menu.name}
                        url={menu.url}
                        icon={menu.icon}
                        showSelected={menu.selected[0]}
                        href={menu.href}
                        text={menu.text}
                        ref={menu.ref}
                      />
                    );
                }
              })()}
            </Grid>
          )
        })}
      </Grid>
      <Grid
        container
        justifyContent='flex-end'
        sx={{ gridArea: 'buttons' }}
      >
        <Button variant='contained' onClick={() => recheck(false)}>Recheck all</Button>
        <Button variant='contained' onClick={() => recheck(true)}>Recheck all (force)</Button>
      </Grid>
    </Box>
  );
};

export default App;