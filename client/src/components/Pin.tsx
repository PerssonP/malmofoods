import { MarkerF } from '@react-google-maps/api';

type PinProps = {
  position: {
    lat: number;
    lng: number;
  }
  title: string;
  handleClick?: () => void
}

export const Pin = ({ position, title, handleClick }: PinProps) => (
  <MarkerF
    position={position}
    onClick={handleClick}
    options={{
      title: title
    }}
  />
);