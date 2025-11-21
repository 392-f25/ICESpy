import React, { useEffect, useState } from 'react';
import type { Sighting } from '../types/Sighting.ts';
import { getAddressFromCoords } from './Address.tsx';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface SightingFormProps {
  lat: string;
  lng: string;
  timestamp: Date;
  onSubmit: (data: {
    title: string;
    location: string;
    time: Date;
    description: string;
    images?: File[];
  }) => void;
  onCancel: () => void;
  existingSighting?: Sighting;
}

// Updated Zod schema to match your form structure
const sightingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  time: z.string().refine((s) => {
    const d = new Date(s);
    return !isNaN(d.getTime());
  }, "Date must match format: 11/20/2025, 6:17 PM"),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  images: z.array(z.instanceof(File)).optional()
});

type SightingFormData = z.infer<typeof sightingSchema>;

const SightingForm = ({
  lat,
  lng,
  timestamp,
  onSubmit,
  onCancel,
  existingSighting,
}: SightingFormProps) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<string>(`${lat}, ${lng}`);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SightingFormData>({
    resolver: zodResolver(sightingSchema),
    defaultValues: {
      title: 'ICE Sighting',
      location: `${lat}, ${lng}`,
      time: timestamp.toLocaleString(),
      description: existingSighting?.description || '',
      images: []
    }
  });

  // Watch for description changes to display character count
  const description = watch('description');

  const onFormSubmit = (data: SightingFormData) => {
    const timeToDate = new Date(data.time);
    onSubmit({
      title: data.title,
      location: data.location,
      time: timeToDate,
      description: data.description || 'No additional information',
      images: imageFiles.length > 0 ? imageFiles : undefined,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImageFiles(fileArray);
      setValue('images', fileArray);
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
        const fullAddress = `${fetchedAddress}, ${fetchedZip}`;
        setLocation(fullAddress);
        setValue('location', fullAddress);
      } catch (error) {
        console.error('Failed to fetch address:', error);
        const fallbackLocation = `${lat}, ${lng}`;
        setLocation(fallbackLocation);
        setValue('location', fallbackLocation);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [lat, lng, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="w-[280px] p-2 font-sans text-sm text-gray-900"
    >
      <h3 className="mb-2 text-sm font-semibold text-gray-800">
        {existingSighting ? 'Edit ICE Sighting' : 'New ICE Sighting'}
      </h3>

      {/* Location Field */}
      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Location:
        </label>
        <input
          type="text"
          {...register('location')}
          value={loading ? 'Loading address...' : location}
          readOnly
          className="w-full rounded border border-gray-200 bg-gray-50 px-1 py-1 text-[11px]"
        />
        {errors.location && (
          <p className="mt-1 text-[10px] text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Time Field */}
      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Time:
        </label>
        <input
          type="text"
          {...register('time')}
          className="w-full rounded border border-gray-200 bg-gray-50 px-1 py-1 text-[11px]"
        />
        {errors.time && (
          <p className="mt-1 text-[10px] text-red-600">{errors.time.message}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="mb-2">
        <label className="mb-1 block text-[11px] font-bold">
          Description:
        </label>
        <textarea
          {...register('description')}
          placeholder="Describe what you saw..."
          rows={2}
          className={`w-full resize-none rounded border px-1 py-1 text-[11px] ${
            errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        />
        <div className="mt-1 flex justify-between">
          {errors.description && (
            <p className="text-[10px] text-red-600">{errors.description.message}</p>
          )}
          <p className="text-[10px] text-gray-500 ml-auto">
            {description?.length || 0}/500
          </p>
        </div>
      </div>

      {/* Images Field */}
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

      {/* Submit Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 rounded px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition focus:outline-none focus:ring-1 focus:ring-violet-500 ${
            isSubmitting 
              ? 'bg-violet-400 cursor-not-allowed' 
              : 'bg-violet-600 hover:bg-violet-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded border border-gray-200 bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SightingForm;