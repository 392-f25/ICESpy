import type { Sighting } from '../types/sighting';

interface PinProps {
  position: { lat: number; lng: number };
  AdvancedMarkerElement: any;
  PinElement: any;
  map: any;
  onClick: () => void;
  sightingData?: Sighting;
}

export const createPinMarker = ({
  position,
  AdvancedMarkerElement,
  PinElement,
  map,
  onClick,
}: PinProps) => {
  const iceIcon = document.createElement('div');
  iceIcon.className = 'h-3 w-3 rounded-full bg-black';

  const pin = new PinElement({
    glyph: iceIcon,
    background: '#ff0000ff',
    borderColor: '#000000ff'
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    content: pin.element,
    title: 'ICE Sighting'
  });

  marker.addListener('click', onClick);

  return marker;
};

export default createPinMarker;
