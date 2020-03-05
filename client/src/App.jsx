import React, { useState, useEffect, useRef } from 'react';
import { CssBaseline, makeStyles, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Grid } from '@material-ui/core'
import GoogleMapReact from 'google-map-react';

import Pin from './components/Pin';

import miamarias from './images/miamarias.png';
import spill from './images/spill.png';
import docpiazza from './images/docpiazza.png';

const useStyles = makeStyles(theme => ({

}));

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState(null)

  const miaRef = useRef(null);
  const spillRef = useRef(null);
  const docPiazzaRef = useRef(null);

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
            defaultZoom={17}
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
          </GoogleMapReact>
        </div>
        <Grid container spacing={2} style={{ width: 'calc(100% - 5px)', margin: '5px' }}>
          <Grid item xs={2}>
            <Paper ref={miaRef}>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar alt='Mia Marias' src={miamarias} />
                  </ListItemAvatar>
                  <ListItemText primary={'Mia Marias'} />
                </ListItem>
                {data === null || data.miamarias.error !== undefined ?
                  <ListItem>
                    {data?.miamarias?.error ?? 'Loading...'}
                  </ListItem>
                  :
                  <>
                    <ListItem>
                      <ListItemText primary={`${data.miamarias.fish}`} secondary='Fisk' />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`${data.miamarias.meat}`} secondary='Kött' />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={`${data.miamarias.veg}`} secondary='Veg' />
                    </ListItem>
                  </>
                }
              </List>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper ref={spillRef} >
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar alt='Spill' src={spill} />
                  </ListItemAvatar>
                  <ListItemText primary={'Spill'} />
                </ListItem>
                {data === null || data.spill.error !== undefined ?
                  <ListItem>
                    {data?.spill?.error ?? 'Loading...'}
                  </ListItem>
                  :
                  <>
                    {data.spill.map((row, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={row} />
                      </ListItem>
                    ))}
                  </>
                }
              </List>
            </Paper>
          </Grid>
          <Grid item xs={2}>
            <Paper ref={docPiazzaRef} >
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar alt='docPiazza' src={docpiazza} />
                  </ListItemAvatar>
                  <ListItemText primary={'Doc Piazza'} />
                </ListItem>
                {data === null || data.docpiazza.error !== undefined ?
                  <ListItem>
                    {data?.docpiazza?.error ?? 'Loading...'}
                  </ListItem>
                  :
                  <>
                    {data.docpiazza.map((day, i) => (
                      <>
                        <ListItem key={i}>
                          <ListItemText primary={day.header} />
                        </ListItem>
                        <List>
                          {day.contents.map(content => (
                            <ListItem>
                              <ListItemText primary={content.title} secondary={content.description} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ))}
                  </>
                }
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
