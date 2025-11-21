import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Sighting } from '../types/Sighting.ts';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleCorroborate = () => {
    if (!hasCorroborated && onCorroborate) {
      onCorroborate(sighting.id);
      setHasCorroborated(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const nextImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev + 1) % sighting.imageUrls!.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev - 1 + sighting.imageUrls!.length) % sighting.imageUrls!.length);
    }
  };

  const hasImages = (sighting.imageUrls?.length ?? 0) > 0;
  const mainImage = hasImages ? sighting.imageUrls![selectedImageIndex] : undefined;

  return (
    <div className="max-w-sm overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {/* Image Gallery Section */}
      {hasImages && (
        <div className="relative">
          {/* Main Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <img
              src={mainImage}
              alt={`Sighting main ${selectedImageIndex + 1}`}
              className="h-full w-full object-cover"
            />
            {sighting.imageUrls!.length > 1 && (
              <>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {selectedImageIndex + 1} / {sighting.imageUrls!.length}
                </div>
                {/* Left Arrow */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                {/* Right Arrow */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-3 text-sm text-gray-900">
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
          <div>Time: {formatDate(sighting.time)}</div>
        </div>

        {sighting.description && (
          <p className="mb-3 text-[13px]">{sighting.description}</p>
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
    </div>
  );
};

export default SightingCard;