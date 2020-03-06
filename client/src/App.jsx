import React, { Fragment, useState, useEffect, useRef } from 'react';
import { CssBaseline, makeStyles, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Grid, Divider } from '@material-ui/core'
import GoogleMapReact from 'google-map-react';

import Pin from './components/Pin';

import miamariasIcon from './images/miamarias.png';
import spillIcon from './images/spill.png';
import docpiazzaIcon from './images/docpiazza.png';
import kolgaIcon from './images/kolga.png';

const useStyles = makeStyles(theme => ({

}));

const Menu = React.forwardRef(({ header, icon, children }, ref) => (
  <Paper ref={ref}>
    <List>
      <ListItem>
        <ListItemAvatar>
         <Avatar src={icon} />
        </ListItemAvatar>
        <ListItemText primary={header} />
      </ListItem>
      {children}
    </List>
  </Paper>
));

const SimpleArrayMenu = React.forwardRef(({ header, data, icon }, ref) => (
  <Menu header={header} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

const ArrayMenu = React.forwardRef(({ header, data, icon }, ref) => (
  <Menu header={header} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row.description} secondary={row.title} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

const ObjectMenu = React.forwardRef(({ header, data, icon }, ref) => (
  <Menu header={header} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {Object.keys(data).map(key => (
          <ListItem key={key}>
            <ListItemText primary={data[key]} secondary={key} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

const SegmentedMenu = React.forwardRef(({ header, data, icon }, ref) => (
  <Menu header={header} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map(segment => (
          <Fragment key={segment.header}>
            <Divider />
            <ListItem>
              <ListItemText primary={segment.header} />
            </ListItem>
            <Divider />
            {segment.contents.map(content => (
              <ListItem key={content.title}>
                <ListItemText primary={content.title} secondary={content.description} />
              </ListItem>
            ))}
          </Fragment>
        ))}
      </>
    } 
  </Menu>
));

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState(null)

  const miaRef = useRef(null);
  const spillRef = useRef(null);
  const docPiazzaRef = useRef(null);
  const kolgaRef = useRef(null)

  useEffect(() => {
    const getData = async () => {
      const result = await fetch('/scrape');
      const body = await result.json();
      console.log(body)
      setData(body);
    };

    getData();
  }, []);

  return (
    <>
      <CssBaseline />
      <main>
        {data === null ? 'Loading' : `${JSON.stringify(data)}`}
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
          </GoogleMapReact>
        </div>
        <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
          <Grid item xs={2}>
            <ArrayMenu header={'Mia Marias'} icon={miamariasIcon} data={data?.miamarias} ref={miaRef} />
          </Grid>
          <Grid item xs={2}>
            <SimpleArrayMenu header={'Spill'} icon={spillIcon} data={data?.spill} ref={spillRef} />
          </Grid>
          <Grid item xs={2}>
            <SegmentedMenu header={'Doc Piazza'} icon={docpiazzaIcon} data={data?.docpiazza} ref={docPiazzaRef} />
          </Grid>
          <Grid item xs={2}>
            <SimpleArrayMenu header={'Kolga'} icon={kolgaIcon} data={data?.kolga} ref={kolgaRef} />
          </Grid>
          <Grid item xs={2}>
            <Paper>
              <List>
                <ListItem>
                  Test
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper>
              <List>
                <ListItem>
                  Test
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </main>
    </>
  );
}



export default App;
