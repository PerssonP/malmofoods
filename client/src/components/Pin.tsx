import { IconButton, Tooltip } from '@mui/material';
import { Marker } from '@react-google-maps/api';

type PinProps = {
  position: {
    lat: number;
    lng: number;
  }
  handleClick?: () => void
}

export const Pin = ({ position, handleClick }: PinProps) => (
  <Marker
    position={position}
    icon={{
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: 'red',
      fillOpacity: 1
    }}
  />
);