import type { Sighting } from '../types/Sighting.ts';
import { CATEGORY_COLORS } from '../types/Sighting.ts';

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
  sightingData,
}: PinProps) => {
  const iceIcon = document.createElement('div');
  iceIcon.className = 'h-3 w-3 rounded-full bg-white';

  const pinColor = sightingData?.category 
    ? CATEGORY_COLORS[sightingData.category].pin 
    : '#ef4444';

  const pin = new PinElement({
    glyph: iceIcon,
    background: pinColor,
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
