import React from 'react';

interface SightingCardProps {
  lat: string;
  lng: string;
  info: string;
}

const SightingCard: React.FC<SightingCardProps> = ({ lat, lng, info }) => {
  return (
    <div className="max-w-xs text-sm text-gray-900">
      <div className="font-semibold text-gray-800">ICE Sighting</div>
      <div className="text-[12px] text-gray-600">
        Location: {lat}, {lng}
      </div>
      <p className="mt-2">{info}</p>
    </div>
  );
};

export default SightingCard;
