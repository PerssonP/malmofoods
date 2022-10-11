import { IconButton, Tooltip } from '@mui/material';
import { Room } from '@mui/icons-material';
import { Marker } from '@react-google-maps/api';

type PinProps = {
  text: string;
  handleClick?: () => void
}

type PinProps2 = {
  position: {
    lat: number;
    lng: number;
  }
  handleClick?: () => void
}

export const Pin = ({ text, handleClick }: PinProps) => {
  return (
    <Tooltip title={text}>
      <IconButton
        color='secondary'
        onClick={handleClick}
        size='small'
        sx={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Room fontSize='large' />
      </IconButton>
    </Tooltip>
  );
};

export const Pin2 = ({ position, handleClick }: PinProps2) => (
  <Marker
    position={position}
    icon={{
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: 'red',
      fillOpacity: 1
    }}
  />
);