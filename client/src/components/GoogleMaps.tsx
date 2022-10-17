import { GoogleMap, LoadScriptNext } from '@react-google-maps/api';
import { Box } from '@mui/material';

import { Pin } from '../components/Pin';
import type { ArrayMenu, SimpleArrayMenu, ObjectMenu, SegmentedMenu, HyperlinkMenu } from '../App';

type MapsProps = {
  pins: {
    [key: string]: ArrayMenu | SimpleArrayMenu | ObjectMenu | SegmentedMenu | HyperlinkMenu
  }
}

const showSelected = (pin: ArrayMenu | SimpleArrayMenu | ObjectMenu | SegmentedMenu | HyperlinkMenu) => {
  if (pin.ref.current === null) {
    console.log(`Element ref is null. This shouldn't happen`);
    return;
  }

  pin.selected[1](true);
  setTimeout(() => {
    pin.selected[1](false);
  }, 1500);

  pin.ref.current.scrollIntoView({ behavior: 'smooth' });
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
          <Pin
            key={pin.name}
            position={{ lat: pin.lat, lng: pin.lng }}
            title={pin.name}
            handleClick={() => showSelected(pin)}
          />
        ))}
      </GoogleMap>
    </LoadScriptNext>
  </Box>
);