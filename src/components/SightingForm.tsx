import React, { useState } from 'react';

interface SightingFormProps {
  lat: string;
  lng: string;
  timestamp: string;
  onSubmit: (data: { info: string; image?: File }) => void;
  onCancel: () => void;
}

const SightingForm: React.FC<SightingFormProps> = ({
  lat,
  lng,
  timestamp,
  onSubmit,
  onCancel,
}) => {
  const [info, setInfo] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      info: info.trim() || 'No additional information',
      image: imageFile,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[300px] p-2.5 font-sans text-sm text-gray-900"
    >
      <h3 className="mb-4 text-base font-semibold text-gray-800">
        New ICE Sighting
      </h3>

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
          Information:
        </label>
        <textarea
          value={info}
          onChange={(event) => setInfo(event.target.value)}
          placeholder="Describe what you saw..."
          className="h-[60px] w-full resize-y rounded border border-gray-200 px-1.5 py-[6px] text-[12px]"
        />
      </div>

      <div className="mb-4">
        <label className="mb-[3px] block text-[12px] font-bold">
          Image (optional):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded border border-gray-200 px-1.5 py-[6px] text-[12px] file:mr-3 file:rounded file:border-0 file:bg-violet-600 file:px-2.5 file:py-1.5 file:text-[12px] file:font-semibold file:text-white"
        />
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
