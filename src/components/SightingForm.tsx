import React, { useEffect, useState } from 'react';
import type { Sighting } from '../types/Sighting.ts';
import { getAddressFromCoords } from './Address.tsx';

interface SightingFormProps {
  lat: string;
  lng: string;
  timestamp: string;
  onSubmit: (data: { 
    title: string; 
    description: string; 
    images?: File[]; 
    location: string;
  }) => void;
  onCancel: () => void;
  existingSighting?: Sighting;
}

const SightingForm: React.FC<SightingFormProps> = ({
  lat,
  lng,
  timestamp,
  onSubmit,
  onCancel,
  existingSighting,
}) => {
  const [title, setTitle] = useState(existingSighting?.title || '');
  const [description, setDescription] = useState(existingSighting?.description || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<string>(`${lat}, ${lng}`);
  const [loading, setLoading] = useState<boolean>(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      title: title.trim() || 'ICE Sighting',
      description: description.trim() || 'No additional information',
      images: imageFiles.length > 0 ? imageFiles : undefined,
      location: location.trim(),
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  // Fetch address and zip code on component mount
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        const { address: fetchedAddress, zipCode: fetchedZip } = await getAddressFromCoords(
          parseFloat(lat), 
          parseFloat(lng)
        );
        setLocation(`${fetchedAddress}, ${fetchedZip}`);
      } catch (error) {
        console.error('Failed to fetch address:', error);
        setLocation(`${lat}, ${lng}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [lat, lng]);

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[280px] p-2 font-sans text-sm text-gray-900"
    >
      <h3 className="mb-2 text-sm font-semibold text-gray-800">
        {existingSighting ? 'Edit ICE Sighting' : 'New ICE Sighting'}
      </h3>

      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Location:
        </label>
        <input
          type="text"
          value={loading ? 'Loading address...' : location}
          onChange={(event) => setLocation(event.target.value)}
          className="w-full rounded border border-gray-200 bg-gray-50 px-1 py-1 text-[11px]"
        />
      </div>

      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Time:
        </label>
        <input
          type="text"
          value={timestamp}
          readOnly
          className="w-full rounded border border-gray-200 bg-gray-50 px-1 py-1 text-[11px]"
        />
      </div>

      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Description:
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what you saw..."
          rows={2}
          className="w-full resize-none rounded border border-gray-200 px-1 py-1 text-[11px]"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-bold">
          Images (optional):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full rounded border border-gray-200 px-1 py-1 text-[10px] file:mr-2 file:rounded file:border-0 file:bg-violet-600 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-white"
        />
        {imageFiles.length > 0 && (
          <div className="mt-1 text-[10px] text-gray-600">
            {imageFiles.length} file(s) selected
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded bg-violet-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SightingForm;
