import React, { useState } from 'react';
import type { Sighting } from '../types/sighting';

interface SightingCardProps {
  sighting: Sighting;
  onCorroborate?: (sightingId: string) => void;
  onEdit?: (sighting: Sighting) => void;
}

const SightingCard: React.FC<SightingCardProps> = ({ 
  sighting, 
  onCorroborate,
  onEdit 
}) => {
  const [hasCorroborated, setHasCorroborated] = useState(false);

  const handleCorroborate = () => {
    if (!hasCorroborated && onCorroborate) {
      onCorroborate(sighting.id);
      setHasCorroborated(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  return (
    <div className="max-w-sm p-3 text-sm text-gray-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-gray-800">{sighting.title}</div>
        {onEdit && (
          <button
            onClick={() => onEdit(sighting)}
            className="text-xs text-violet-600 hover:text-violet-700"
          >
            Edit
          </button>
        )}
      </div>
      
      <div className="mb-2 space-y-1 text-[12px] text-gray-600">
        <div>Location: {sighting.location}</div>
        {sighting.zipCode && <div>ZIP: {sighting.zipCode}</div>}
        <div>Time: {formatDate(sighting.time)}</div>
      </div>
      
      {sighting.description && (
        <p className="mb-3 text-[13px]">{sighting.description}</p>
      )}
      
      {sighting.imageUrls && sighting.imageUrls.length > 0 && (
        <div className="mb-3">
          <div className="text-[12px] font-semibold text-gray-700 mb-1">
            Images ({sighting.imageUrls.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {sighting.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Sighting ${index + 1}`}
                className="h-12 w-12 rounded object-cover border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between border-t border-gray-200 pt-2">
        <div className="text-[12px] text-gray-600">
          {sighting.corroborationCount} {sighting.corroborationCount === 1 ? 'person' : 'people'} saw this too
        </div>
        {onCorroborate && (
          <button
            onClick={handleCorroborate}
            disabled={hasCorroborated}
            className={`rounded px-2 py-1 text-[12px] font-semibold transition ${
              hasCorroborated
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {hasCorroborated ? 'Confirmed' : 'I saw this too!'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SightingCard;
