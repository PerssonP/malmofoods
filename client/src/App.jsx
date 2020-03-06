import React, { useState, useEffect, useRef } from 'react';
import { CssBaseline, makeStyles, Grid, Button } from '@material-ui/core';
import GoogleMapReact from 'google-map-react';

import Pin from './components/Pin';
import { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu } from './components/Menus';

import miamariasIcon from './images/miamarias.png';
import spillIcon from './images/spill.png';
import docpiazzaIcon from './images/docpiazza.png';
import kolgaIcon from './images/kolga.png';
import variationIcon from './images/variation.png';

const useStyles = makeStyles(theme => ({

}));

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState(null);

  const miaRef = useRef(null);
  const spillRef = useRef(null);
  const docPiazzaRef = useRef(null);
  const kolgaRef = useRef(null);
  const variationRef = useRef(null);
  const namdoRef = useRef(null);

  const getData = async force => {
    const result = await fetch(`/scrape${force ? '?forceAll=true' : ''}`);
    const body = await result.json();
    console.log(body);
    setData(body);
  };

  useEffect(() => {
    getData();
  }, []);

  const recheck = async () => {
    getData(true);
  };

  return (
    <>
      <CssBaseline />
      <main>
        <div style={{ height: '800px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyDbGGbzKd9xYlaw3V3efl262q-xz5fUtw0' }}
            center={{ lat: 55.6126202, lng: 12.9864192 }}
            defaultZoom={16}
          >
            <Pin
              lat={55.613306}
              lng={12.992183}
              text='MiaMarias'
              handleClick={() => miaRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
            <Pin
              lat={55.612801}
              lng={12.988404}
              text='Spill'
              handleClick={() => spillRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
            <Pin
              lat={55.614333}
              lng={12.989664}
              text='Doc Piazza'
              handleClick={() => docPiazzaRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
            <Pin
              lat={55.612290}
              lng={12.998474}
              text='Kolga'
              handleClick={() => kolgaRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
            <Pin
              lat={55.607990}
              lng={12.981666}
              text='Variation'
              handleClick={() => variationRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
            <Pin
              lat={55.604493}
              lng={12.997683}
              text='Nam Do'
              handleClick={() => kolgaRef.current.scrollIntoView({ behavior: 'smooth' })}
            />
          </GoogleMapReact>
        </div>
        <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
          <Grid item xs={2}>
            <ArrayMenu header={'Mia Marias'} url={'http://www.miamarias.nu/'} icon={miamariasIcon} data={data?.miamarias} ref={miaRef} />
          </Grid>
          <Grid item xs={2}>
            <SimpleArrayMenu header={'Spill'} url={'https://restaurangspill.se/'} icon={spillIcon} data={data?.spill} ref={spillRef} />
          </Grid>
          <Grid item xs={2}>
            <SegmentedMenu header={'Doc Piazza'} url={'http://malmo.kyparn.se/doc-piazza'} icon={docpiazzaIcon} data={data?.docpiazza} ref={docPiazzaRef} />
          </Grid>
          <Grid item xs={2}>
            <SimpleArrayMenu header={'Kolga'} url={'https://kolga.gastrogate.com/lunch/'} icon={kolgaIcon} data={data?.kolga} ref={kolgaRef} />
          </Grid>
          <Grid item xs={2}>
            <SimpleArrayMenu header={'Variation'} url={'https://www.nyavariation.se/matsedel'} icon={variationIcon} data={data?.variation} ref={variationRef} />
          </Grid>
          <Grid item xs={2}>
            <ArrayMenu  header={'Nam Do'} url={'http://namdo.se/meny/'} icon={''} data={data?.namdo} ref={namdoRef} />
          </Grid>
        </Grid>
        <Grid container justify='flex-end'>
          <Button onClick={recheck}>Force recheck</Button>
        </Grid>
      </main>
    </>
  );
};



export default App;
