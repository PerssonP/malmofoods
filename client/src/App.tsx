import { useState, useEffect, useRef } from 'react';
import { Grid, Button } from '@mui/material';

import { Maps } from './components/GoogleMaps';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from './components/Menus';

const App = () => {
  const [data, setData] = useState<any>(null);

  const pins = {
    miamarias: {
      name: 'Mia Marias',
      lat: 55.613306,
      lng: 12.992183,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    spill: {
      name: 'Spill',
      lat: 55.612801,
      lng: 12.988404,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    docPiazza: {
      name: 'Doc Piazza',
      lat: 55.614333,
      lng: 12.989664,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    kolga: {
      name: 'Kolga',
      lat: 55.612290,
      lng: 12.998474,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    variation: {
      name: 'Variation',
      lat: 55.607990,
      lng: 12.981666,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    namndo: {
      name: 'Nam Do',
      lat: 55.604493,
      lng: 12.997683,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    p2: {
      name: 'P2',
      lat: 55.614380,
      lng: 12.988521,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    glasklart: {
      name: 'Glasklart',
      lat: 55.614924,
      lng: 12.990561,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    dockanshamnkrog: {
      name: 'Dockans Hamnkrog',
      lat: 55.615186,
      lng: 12.988838,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    curryrepublik: {
      name: 'Curry Republik',
      lat: 55.611586,
      lng: 12.980412,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    vhp: {
      name: 'Västra Hamnens Pizzeria',
      lat: 55.616906,
      lng: 12.979608,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    dockside: {
      name: 'Dockside Burgers',
      lat: 55.614418,
      lng: 12.990020,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    storavarvsgatan6: {
      name: 'Stora Varvsgatan 6',
      lat: 55.612501,
      lng: 12.991662,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    laziza: {
      name: 'Laziza Dockan',
      lat: 55.614113,
      lng: 12.988982,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    thaisushiforyou: {
      name: 'Thai n Sushi for you',
      lat: 55.614201,
      lng: 12.981888,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
    },
    mrsSaigon: {
      name: 'Mrs Saigon',
      lat: 55.603335,
      lng: 12.998333,
      selected: useState<boolean>(false),
      ref: useRef<HTMLDivElement>(null),
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

  const showSelected = (element: any) => {
    //el.classList.toggle(classes.selected);
    setTimeout(() => {
      //el.classList.toggle(classes.selected);
    }, 1500);

    element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        <Maps pins={pins} />
        <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <ArrayMenu header={'Mia Marias'} url={'http://www.miamarias.nu/'} icon='/icons/miamarias.png' showSelected={pins.miamarias.selected[0]} data={data?.miamarias} ref={pins.miamarias.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Spill'} url={'https://restaurangspill.se/'} icon='/icons/spill.png' showSelected={pins.spill.selected[0]} data={data?.spill} ref={pins.spill.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <ArrayMenu header={'Doc Piazza'} url={'https://www.facebook.com/docpiazza'} icon='/icons/docpiazza.png' showSelected={pins.docPiazza.selected[0]} data={data?.docpiazza} ref={pins.docPiazza.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Kolga'} url={'https://kolga.gastrogate.com/lunch/'} icon='/icons/kolga.png' showSelected={pins.kolga.selected[0]} data={data?.kolga} ref={pins.kolga.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Variation'} url={'https://www.nyavariation.se/matsedel'} icon='/icons/variation.png' showSelected={pins.variation.selected[0]} data={data?.variation} ref={pins.variation.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <ArrayMenu header={'P2'} url={'https://www.restaurangp2.se/lunch'} icon='/icons/p2.png' showSelected={pins.p2.selected[0]} data={data?.p2} ref={pins.p2.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <ArrayMenu header={'Glasklart'} url={'https://glasklart.eu/sv/lunch/'} icon='/icons/glasklart.svg' showSelected={pins.glasklart.selected[0]} data={data?.glasklart} ref={pins.glasklart.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Dockans Hamnkrog'} url={'http://dockanshamnkrog.se/lunchmeny/'} icon='/icons/dockanshamnkrog.png' showSelected={pins.dockanshamnkrog.selected[0]} data={data?.dockanshamnkrog} ref={pins.dockanshamnkrog.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Curry Republik'} url={'https://www.wokkitchen.se/curry_meny.html'} icon='/icons/lol.png' showSelected={pins.curryrepublik.selected[0]} data={data?.curryrepublik} ref={pins.curryrepublik.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <ArrayMenu header={'Nam Do'} url={'http://namdo.se/meny/'} icon={'/icons/namdo.svg'} showSelected={pins.namndo.selected[0]} data={data?.namdo} ref={pins.namndo.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Västra Hamnens Pizzeria'} url={'http://www.vhpizzeria.se/'} icon='/icons/vhp.png' showSelected={pins.vhp.selected[0]} data={data?.vhPizzeria} ref={pins.vhp.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Dockside Burgers'} url={'https://www.docksideburgers.se/'} icon='/icons/lol.png' showSelected={pins.dockside.selected[0]} data={data?.docksideburgers} ref={pins.dockside.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Stora Varvsgatan 6'} url={'https://storavarvsgatan6.se/meny.html'} icon='/icons/storavarvsgatan6.png' showSelected={pins.storavarvsgatan6.selected[0]} data={data?.storavarvsgatan6} ref={pins.storavarvsgatan6.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Laziza Dockan'} url={'https://www.laziza.se/restaurang/'} icon='/icons/laziza.webp' showSelected={pins.laziza.selected[0]} data={data?.laziza} ref={pins.laziza.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <SimpleArrayMenu header={'Thai n Sushi for you'} url={'https://vhamnen.thainsushiforyou.se/'} icon='/icons/thaisushi.png' showSelected={pins.thaisushiforyou.selected[0]} data={data?.thaisushiforyou} ref={pins.thaisushiforyou.ref} />
          </Grid>
          <Grid item xs={2} sx={{ minWidth: '300px', height: '100%' }}>
            <HyperlinkMenu header={'Mrs Saigon'} url={'https://www.mrs-saigon.se/'} icon='/icons/mrssaigon.png' href='https://www.mrs-saigon.se/menyer' showSelected={pins.mrsSaigon.selected[0]} ref={pins.mrsSaigon.ref} />
          </Grid>
        </Grid>

        <Grid container justifyContent='flex-end'>
          <Button variant='contained' onClick={() => recheck(false)}>Recheck</Button>
          <Button variant='contained' onClick={() => recheck(true)}>Recheck (force)</Button>
        </Grid>
      </main>
    </>
  );
};

export default App;