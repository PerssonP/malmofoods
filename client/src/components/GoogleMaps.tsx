import React from 'react';
import { GoogleMap, LoadScriptNext, Marker, InfoBox, OverlayView } from '@react-google-maps/api';
import { Box, CircularProgress, Grid } from '@mui/material';
import { red } from '@mui/material/colors';
import { FlashlightOnRounded } from '@mui/icons-material';
import { Room } from '@mui/icons-material';

import Pin from '../components/Pin';

export const Maps = ({ pins }) => (
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
          <InfoBox position={{ lat: 55.613306, lng: 12.992183 }}>
            <Pin />
          </InfoBox>
          <Marker
           position={{ lat: 55.612801, lng: 12.988404 }} />

      </GoogleMap>
    </LoadScriptNext>
  </Box>
)

