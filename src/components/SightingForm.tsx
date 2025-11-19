import React, { useState } from 'react';
import type { Sighting } from '../types/Sighting.ts';

interface SightingFormProps {
  lat: string;
  lng: string;
  timestamp: string;
  onSubmit: (data: { 
    title: string; 
    description: string; 
    images?: File[]; 
    zipCode: string;
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
  const [zipCode, setZipCode] = useState(existingSighting?.zipCode || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      title: title.trim() || 'ICE Sighting',
      description: description.trim() || 'No additional information',
      images: imageFiles.length > 0 ? imageFiles : undefined,
      zipCode: zipCode.trim(),
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[350px] p-2.5 font-sans text-sm text-gray-900"
    >
      <h3 className="mb-4 text-base font-semibold text-gray-800">
        {existingSighting ? 'Edit ICE Sighting' : 'New ICE Sighting'}
      </h3>

      <div className="mb-2.5">
        <label className="mb-[3px] block text-[12px] font-bold">
          Title:
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ICE Sighting"
          className="w-full rounded border border-gray-200 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-2.5">
        <label className="mb-[3px] block text-[12px] font-bold">
          Location:
        </label>
        <input
          type="text"
          value={`${lat}, ${lng}`}
          readOnly
          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-2.5">
        <label className="mb-[3px] block text-[12px] font-bold">
          ZIP Code:
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(event) => setZipCode(event.target.value)}
          placeholder="Enter ZIP code"
          className="w-full rounded border border-gray-200 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-2.5">
        <label className="mb-[3px] block text-[12px] font-bold">
          Time:
        </label>
        <input
          type="text"
          value={timestamp}
          readOnly
          className="w-full rounded border border-gray-200 bg-gray-50 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-2.5">
        <label className="mb-[3px] block text-[12px] font-bold">
          Description:
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe what you saw..."
          className="h-[80px] w-full resize-y rounded border border-gray-200 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-4">
        <label className="mb-[3px] block text-[12px] font-bold">
          Images (optional):
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full rounded border border-gray-200 px-1.5 py-[6px] text-[12px] file:mr-3 file:rounded file:border-0 file:bg-violet-600 file:px-2.5 file:py-1.5 file:text-[12px] file:font-semibold file:text-white"
        />
        {imageFiles.length > 0 && (
          <div className="mt-2 text-[12px] text-gray-600">
            {imageFiles.length} file(s) selected
          </div>
        )}
      </div>

      <div className="flex gap-2.5">
        <button
          type="submit"
          className="flex-1 rounded bg-violet-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded border border-gray-200 bg-gray-100 px-4 py-2 text-[12px] font-bold text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SightingForm;
