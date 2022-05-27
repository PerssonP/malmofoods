import React, { useState, useEffect, useRef } from 'react';
import { CssBaseline, makeStyles, Grid, Button } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';

import Pin from './components/Pin';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from './components/Menus';

import miamariasIcon from './images/miamarias.png';
import spillIcon from './images/spill.png';
import docpiazzaIcon from './images/docpiazza.png';
import kolgaIcon from './images/kolga.png';
import variationIcon from './images/variation.png';
import p2Icon from './images/p2.png';
import glasklartIcon from './images/glasklart.svg';
import lolIcon from './images/lol.png';
import vhpIcon from './images/vhp.png';
import lazizaIcon from './images/laziza.webp';
import thaiSushiIcon from './images/thaisushi.png';
import mrsSaigonIcon from './images/mrsSaigon.png';
import dockanshamnkrogIcon from './images/dockanshamnkrog.png';

const useStyles = makeStyles(theme => ({
  selected: {
     animationName: '$pulse',
     animationDuration: '0.5s',
     animationIterationCount: 2,
     animationDelay: '0.5s'
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 3pt 2pt rgba(230, 0, 0, 0)'
    },
    '50%': {
      boxShadow: '0 0 3pt 2pt rgba(230, 0, 0, 0.75)'
    },
    '100%': {
      boxShadow: '0 0 3pt 2pt rgba(230, 0, 0, 0)'
    }
  },
  item: {
    minWidth: '300px',
    height: '100%'
  }
}));

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState(null);

  const pins = {
    miamarias: {
      name: 'Mia Marias',
      lat: 55.613306,
      lng: 12.992183,
      ref: useRef(null),
    },
    spill: {
      name: 'Spill',
      lat: 55.612801,
      lng: 12.988404,
      ref: useRef(null)
    },
    docPiazza: {
      name: 'Doc Piazza',
      lat: 55.614333,
      lng: 12.989664,
      ref: useRef(null)
    },
    kolga: {
      name: 'Kolga',
      lat: 55.612290,
      lng: 12.998474,
      ref: useRef(null)
    },
    variation: {
      name: 'Variation',
      lat: 55.607990,
      lng: 12.981666,
      ref: useRef(null)
    },
    namndo: {
      name: 'Nam Do',
      lat: 55.604493,
      lng: 12.997683,
      ref: useRef(null)
    },
    p2: {
      name: 'P2',
      lat: 55.614380,
      lng: 12.988521,
      ref: useRef(null)
    },
    glasklart: {
      name: 'Glasklart',
      lat: 55.614924,
      lng: 12.990561,
      ref: useRef(null)
    },
    dockanshamnkrog: {
      name: 'Dockans Hamnkrog',
      lat: 55.615186,
      lng: 12.988838,
      ref: useRef(null)
    },
    curryrepublik: {
      name: 'Curry Republik',
      lat: 55.611586,
      lng: 12.980412,
      ref: useRef(null)
    },
    vhp: {
      name: 'Västra Hamnens Pizzeria',
      lat: 55.616906,
      lng: 12.979608,
      ref: useRef(null)
    },
    dockside: {
      name: 'Dockside Burgers',
      lat: 55.614418,
      lng: 12.990020,
      ref: useRef(null)
    },
    storavarvsgatan: {
      name: 'Stora Varvsgatan 6',
      lat: 55.612501,
      lng: 12.991662,
      ref: useRef(null)
    }, 
    laziza: {
      name: 'Laziza Dockan',
      lat: 55.614113,
      lng: 12.988982,
      ref: useRef(null)
    },
    thaisushiforyou: {
      name: 'Thai n Sushi for you',
      lat: 55.614201,
      lng: 12.981888,
      ref: useRef(null)
    },
    mrsSaigon: {
      name: 'Mrs Saigon',
      lat: 55.603335,
      lng: 12.998333,
      ref: useRef(null)
    }
  };

  const getData = async force => {
    const result = await fetch(`/scrape${force ? '?forceAll=true' : ''}`);
    const body = await result.json();
    console.log(body);
    setData(body);
  };

  useEffect(() => {
    getData();
  }, []);

  const recheck = async (force) => {
    setData(null);
    getData(force);
  };

  const showSelected = el => {
    el.classList.toggle(classes.selected);
    setTimeout(() => {
      el.classList.toggle(classes.selected);
    }, 1500);

    el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <CssBaseline />
      <main>
        <div style={{ height: '800px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_KEY }}
            center={{ lat: 55.6126202, lng: 12.9864192 }}
            defaultZoom={16}
          >
            {Object.values(pins).map(value => (
              <Pin
                key={value.name}
                text={value.name}
                lat={value.lat}
                lng={value.lng}
                handleClick={() => showSelected(value.ref.current)}
              />
            ))}
          </GoogleMapReact>
        </div>
        <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'Mia Marias'} url={'http://www.miamarias.nu/'} icon={miamariasIcon} data={data?.miamarias} ref={pins.miamarias.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Spill'} url={'https://restaurangspill.se/'} icon={spillIcon} data={data?.spill} ref={pins.spill.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'Doc Piazza'} url={'https://www.facebook.com/docpiazza'} icon={docpiazzaIcon} data={data?.docpiazza} ref={pins.docPiazza.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Kolga'} url={'https://kolga.gastrogate.com/lunch/'} icon={kolgaIcon} data={data?.kolga} ref={pins.kolga.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Variation'} url={'https://www.nyavariation.se/matsedel'} icon={variationIcon} data={data?.variation} ref={pins.variation.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'P2'} url={'https://www.restaurangp2.se/lunch'} icon={p2Icon} data={data?.p2} ref={pins.p2.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'Glasklart'} url={'https://glasklart.eu/sv/lunch/'} icon={glasklartIcon} data={data?.glasklart} ref={pins.glasklart.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Dockans Hamnkrog'} url={'http://dockanshamnkrog.se/lunchmeny/'} icon={dockanshamnkrogIcon} data={data?.dockanshamnkrog} ref={pins.dockanshamnkrog.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Curry Republik'} url={'https://www.wokkitchen.se/curry_meny.html'} icon={lolIcon} data={data?.curryrepublik} ref={pins.curryrepublik.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'Nam Do'} url={'http://namdo.se/meny/'} icon={''} data={data?.namdo} ref={pins.namndo.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Västra Hamnens Pizzeria'} url={'http://www.vhpizzeria.se/'} icon={vhpIcon} data={['Pizzabuffé']} ref={pins.vhp.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Dockside Burgers'} url={'https://www.docksideburgers.se/'} icon={''} data={['Burgare', 'Månadens burgare']} ref={pins.dockside.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <ArrayMenu header={'Stora Varvsgatan 6'} url={'https://storavarvsgatan6.se/meny.html'} icon={''} data={data?.storavarvsgatan} ref={pins.storavarvsgatan.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Laziza Dockan'} url={'https://www.laziza.se/restaurang/'} icon={lazizaIcon} data={['Libanesisk buffé']} ref={pins.laziza.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <SimpleArrayMenu header={'Thai n Sushi for you'} url={'https://vhamnen.thainsushiforyou.se/'} icon={thaiSushiIcon} data={data?.thaisushiforyou} ref={pins.thaisushiforyou.ref} />
          </Grid>
          <Grid item xs={2} className={classes.item}>
            <HyperlinkMenu header={'Mrs Saigon'} url={'https://www.mrs-saigon.se/'} icon={mrsSaigonIcon} href={'https://www.mrs-saigon.se/menyer'} ref={pins.mrsSaigon.ref} />
          </Grid>
        </Grid>
        <Grid container justify='flex-end'>
          <Button onClick={() => recheck(false)}>Recheck</Button>
          <Button onClick={() => recheck(true)}>Recheck (force)</Button>
        </Grid>
      </main>
    </>
  );
};

export default App;
