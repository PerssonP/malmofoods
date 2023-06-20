import React, { useState, useEffect, useRef } from 'react';
import { Button, Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // TODO: Replace with import from @mui/material when stable

import { Maps } from './components/GoogleMaps';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from './components/Menus';

import menusConfig from './menus.json';

export type Menu = {
  name: string;
  url: string;
  icon: string;
  lat: number;
  lng: number;
  selected: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  ref: React.RefObject<HTMLDivElement>;
};

type ScrapedMenu = {
  data: [any, React.Dispatch<React.SetStateAction<any>>];
  dataSource: string;
} & Menu;

type ArrayMenu = {
  variant: 'Array';
} & ScrapedMenu;

type SimpleArrayMenu = {
  variant: 'SimpleArray';
} & ScrapedMenu;

type ObjectMenu = {
  variant: 'Object';
} & ScrapedMenu;

type SegmentedMenu = {
  variant: 'Segmented';
} & ScrapedMenu;

type HyperlinkMenu = {
  variant: 'Hyperlink';
  text: string;
  href: string;
} & Menu;

const App = () => {
  const menus = menusConfig.map<ArrayMenu | SimpleArrayMenu | ObjectMenu | SegmentedMenu | HyperlinkMenu>((m: any) => {
    if (m.variant == 'Hyperlink') {
      return {
        name: m.name,
        variant: 'Hyperlink',
        url: m.url,
        icon: m.icon,
        lat: m.lat,
        lng: m.lng,
        text: m.text,
        href: m.href,
        selected: useState<boolean>(false),
        ref: useRef<HTMLDivElement>(null)
      }
    } else {
      return {
        name: m.name,
        variant: m.variant,
        url: m.url,
        icon: m.icon,
        lat: m.lat,
        lng: m.lng,
        dataSource: m.dataSource,
        data: useState<any>(null),
        selected: useState<boolean>(false),
        ref: useRef<HTMLDivElement>(null)
      }
    }
  });

  const updateData = async (menu: ScrapedMenu, force: boolean = false) => {
    menu.data[1](null);
    const result = await fetch(`${menu.dataSource}?force=${force}`);
    const body = await result.json();
    menu.data[1](body);
  }

  useEffect(() => {
    recheck(false);
  }, []);

  const recheck = (force: boolean) => {
    for (const menu of menus) {
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
      <Maps menus={menus} />
      <Grid
        container
        spacing={2}
        sx={{
          margin: '0'
        }}
      >
        {menus.map((menu) => {
          return (
            <Grid
              key={menu.name}
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
                        update={(e) => updateData(menu, e.shiftKey)} // If button is shift-clicked, send force = true
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
                        update={(e) => updateData(menu, e.shiftKey)}
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
                        update={(e) => updateData(menu, e.shiftKey)}
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
                        update={(e) => updateData(menu, e.shiftKey)}
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