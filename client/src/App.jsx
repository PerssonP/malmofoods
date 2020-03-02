import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@material-ui/core'
import GoogleMapReact from 'google-map-react';


const Test = ({ text }) => <div>{text}</div>

function App() {
  const [data, setData] = useState('Loading...')


  useEffect(() => {
    const getData = async () => {
      const result = await fetch('/scrape');
      const body = await result.json();
      console.log(body)
      setData(JSON.stringify(body));
    };

    getData();
  }, [])
  return (
    <>
      <CssBaseline />
      <main>
        {`${data}`}
        <div style={{ height: '200px', width: '500px' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyDbGGbzKd9xYlaw3V3efl262q-xz5fUtw0' }}
            center={{ lat: 55.6126202, lng: 12.9864192 }}
            defaultZoom={11}
          >
            <Test 
              lat={55.6126202}
              lng={12.9864192}
              text='My Marker'
            />
          </GoogleMapReact>
        </div>
      </main>
    </>
  );
}

export default App;
