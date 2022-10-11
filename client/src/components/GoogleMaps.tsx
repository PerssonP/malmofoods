import React from 'react';
import { GoogleMap, LoadScriptNext, Marker, InfoBox, OverlayView, Polygon } from '@react-google-maps/api';
import { Box, CircularProgress, Grid } from '@mui/material';
import { red } from '@mui/material/colors';
import { FlashlightOnRounded } from '@mui/icons-material';
import { Room } from '@mui/icons-material';

import { Pin2 } from '../components/Pin';

type MapsProps = {
  pins: {
    [key: string]: {
      name: string;
      lat: number;
      lng: number;
      ref: React.MutableRefObject<null>,
    }
  }
}

const showSelected = (element: any) => {
  //el.classList.toggle(classes.selected);
  setTimeout(() => {
    //el.classList.toggle(classes.selected);
  }, 1500);

  element.scrollIntoView({ behavior: 'smooth' });
};

export const Maps = ({ pins }: MapsProps) => (
  <Box sx={{ height: '800px', width: '100%' }}>
    <LoadScriptNext googleMapsApiKey={import.meta.env.VITE_MAPS_KEY}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={{ lat: 55.6126202, lng: 12.9864192 }}
        zoom={16}
        options={{
          disableDefaultUI: false,
          styles: [
            {
              featureType: 'poi',
              stylers: [
                { visibility: 'off' }
              ]

            }
          ]
        }}
      >
          {Object.values(pins).map((pin) => (
            <Pin2
              position={{ lat: pin.lat, lng: pin.lng }}
              handleClick={() => showSelected(pin.ref)}
            />
          ))}
      </GoogleMap>
    </LoadScriptNext>
  </Box>
)

