import React, { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SightingForm from './SightingForm.tsx';
import { createPinMarker } from './Pin.tsx';
import SightingCard from './SightingCard.tsx';
import type { Sighting } from '../types/Sighting.ts';
import { useSightings, addSighting, corroborateSighting, useAuthState } from '../utilities/firebase.ts';

// Extend the Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

interface MapsProps {
  className?: string;
}

const Maps: React.FC<MapsProps> = ({ className = "w-full h-full" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const infoWindow = useRef<any>(null);
  const markers = useRef<Map<string, any>>(new Map());
  const infoWindowRoot = useRef<Root | null>(null);
  const [sightings, sightingsLoading] = useSightings();
  const { user } = useAuthState();
  const [mapLibraries, setMapLibraries] = useState<{ AdvancedMarkerElement: any; PinElement: any } | null>(null);

  const addICESightingMarker = (
    sighting: Sighting,
    AdvancedMarkerElement: any,
    PinElement: any
  ) => {
    // Parse location string to get lat/lng
    const [lat, lng] = sighting.location.split(', ').map(Number);
    const position = { lat, lng };

    const marker = createPinMarker({
      position,
      AdvancedMarkerElement,
      PinElement,
      map: mapInstance.current!,
      onClick: () => {
        if (infoWindow.current) {
          infoWindow.current.close();
          
          const container = document.createElement('div');
          const root = createRoot(container);
          root.render(
            <SightingCard
              sighting={sighting}
              onCorroborate={async (sightingId) => {
                if (user) {
                  await corroborateSighting(sightingId, user.uid);
                }
              }}
            />
          );
          infoWindow.current.setContent(container);
          infoWindow.current.open(mapInstance.current!, marker);
        }
      },
      sightingData: sighting,
    });

    markers.current.set(sighting.id, marker);
  };

  const showSightingForm = (position: any, AdvancedMarkerElement: any, PinElement: any) => {
    const currentTime = new Date().toLocaleString();
    const lat = position.lat().toFixed(6);
    const lng = position.lng().toFixed(6);

    if (infoWindow.current) {
      if (infoWindowRoot.current) {
        infoWindowRoot.current.unmount();
        infoWindowRoot.current = null;
      }

      const container = document.createElement('div');
      const root = createRoot(container);
      infoWindowRoot.current = root;

      root.render(
        <SightingForm
          lat={lat}
          lng={lng}
          timestamp={currentTime}
          onSubmit={async ({ title, description, images, zipCode }) => {
            try {
              const sightingId = await addSighting({
                title,
                location: `${lat}, ${lng}`,
                zipCode,
                time: new Date(),
                description,
              }, images);

              infoWindow.current?.close();
              console.log('Sighting submitted:', {
                id: sightingId,
                location: `${lat}, ${lng}`,
                time: currentTime,
                title,
                description,
                zipCode,
                hasImages: !!(images && images.length > 0),
              });
            } catch (error) {
              console.error('Error submitting sighting:', error);
              alert('Failed to submit sighting. Please try again.');
            }
          }}
          onCancel={() => infoWindow.current?.close()}
        />
      );

      infoWindow.current.setContent(container);
      infoWindow.current.setPosition(position);
      infoWindow.current.open(mapInstance.current!);

      const closeListener = infoWindow.current.addListener('closeclick', () => {
        infoWindowRoot.current?.unmount();
        infoWindowRoot.current = null;
        closeListener?.remove?.();
      });
    }
  };

  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      const { Map, InfoWindow } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
      
      setMapLibraries({ AdvancedMarkerElement, PinElement });

      // Function to get user location with permission
      const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.log("Geolocation error:", error.message);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 600000 // 10 minutes
            }
          );
        });
      };

      // Try to get user's location first, fallback to Evanston
      let mapCenter = { lat: 42.0561, lng: -87.6746 }; // Default to Evanston
      let initialZoom = 10;

      try {
        const userLocation = await getUserLocation();
        mapCenter = userLocation;
        initialZoom = 15;
        console.log("Using user's location:", userLocation);
      } catch (error) {
        console.log("Using default location (Evanston):", error);
      }

      mapInstance.current = new Map(mapRef.current, {
        center: mapCenter,
        zoom: initialZoom,
        mapId: 'DEMO_MAP_ID',
        gestureHandling: 'greedy',
        streetViewControl: false, // Disable Pegman
        fullscreenControl: false, // Disable fullscreen button
        mapTypeControl: false, // Also disable map type control (optional)
        zoomControl: true, // Keep zoom controls
        rotateControl: false // Disable rotate control (optional)
      });

      infoWindow.current = new InfoWindow();

      mapInstance.current.addListener('click', (event: any) => {
        if (event.latLng) {
          showSightingForm(event.latLng, AdvancedMarkerElement, PinElement);
        }
      });

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  };

  useEffect(() => {
    // Wait for Google Maps to be loaded
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
      } else {
        // If Google Maps is not loaded yet, wait and try again
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();

    // Cleanup function
    return () => {
      // Clean up markers and map instance if needed
      markers.current.clear();
      mapInstance.current = null;
      infoWindowRoot.current?.unmount();
      infoWindow.current = null;
      infoWindowRoot.current = null;
    };
  }, []);

  // Effect to load sightings from Firebase and create markers
  useEffect(() => {
    if (!mapInstance.current || !mapLibraries || sightingsLoading) return;

    const { AdvancedMarkerElement, PinElement } = mapLibraries;

    // Clear existing markers that are no longer in the sightings list
    const currentSightingIds = new Set(sightings.map(s => s.id));
    markers.current.forEach((marker, id) => {
      if (!currentSightingIds.has(id)) {
        marker.map = null; // Remove marker from map
        markers.current.delete(id);
      }
    });

    // Add or update markers for all sightings
    sightings.forEach(sighting => {
      if (!markers.current.has(sighting.id)) {
        addICESightingMarker(sighting, AdvancedMarkerElement, PinElement);
      }
    });
  }, [sightings, sightingsLoading, mapLibraries]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className={className} />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-lg shadow-lg z-10 text-sm">
        Click on the map to add a pin for an ICE sighting.
      </div>
    </div>
  );
};

export default Maps;
