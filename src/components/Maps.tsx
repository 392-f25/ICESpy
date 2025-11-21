import React, { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SightingForm from './SightingForm.tsx';
import { createPinMarker } from './Pin.tsx';
import SightingCard from './SightingCard.tsx';
import type { Sighting } from '../types/Sighting.ts';
import { dbPush, dbRef, dbServerTimestamp, realtimeDb, listenToSightings } from '../utilities/firebase';

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
  const markers = useRef<any[]>([]);
  const infoWindowRoot = useRef<Root | null>(null);
  const [sightings, setSightings] = useState<Map<string, Sighting>>(new Map());
  // track loaded firebase keys in a ref so updates don't trigger rerenders
  const loadedFirebaseSightingsRef = useRef<Set<string>>(new Set());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [newSightingNotification, setNewSightingNotification] = useState<string | null>(null);

  // Helper function to create and setup React components in InfoWindow
  const renderInInfoWindow = (component: React.ReactElement, position?: any) => {
    if (!infoWindow.current) return;

    // Clean up existing root
    if (infoWindowRoot.current) {
      infoWindowRoot.current.unmount();
      infoWindowRoot.current = null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    infoWindowRoot.current = root;

    root.render(component);
    infoWindow.current.setContent(container);
    
    if (position) {
      infoWindow.current.setPosition(position);
    }
    
    infoWindow.current.open(mapInstance.current!);

    // Setup cleanup listener
    const closeListener = infoWindow.current.addListener('closeclick', () => {
      infoWindowRoot.current?.unmount();
      infoWindowRoot.current = null;
      closeListener?.remove?.();
    });
  };

  // Helper function to generate unique ID
  const generateSightingId = () => 
    `sighting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Helper function to update sighting corroboration
  const handleCorroboration = (sightingId: string) => {
    setSightings(prev => {
      const updated = new Map(prev);
      const existingSighting = updated.get(sightingId);
      if (existingSighting) {
        updated.set(sightingId, {
          ...existingSighting,
          corroborationCount: existingSighting.corroborationCount + 1
        });
      }
      console.log(`Total sightings: ${updated.size}`);
      return updated;
    });
  };

  // Function to create marker from Firebase sighting data
  const createMarkerFromFirebaseData = async (firebaseSighting: any) => {
    if (!mapInstance.current || !window.google?.maps) {
      console.log('Map or Google Maps not ready');
      return;
    }

    try {
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");
      
      // Create position from lat/lng
      const position = new window.google.maps.LatLng(firebaseSighting.lat, firebaseSighting.lng);
      
      // Convert Firebase data to our Sighting format
      const sighting: Sighting = {
        id: firebaseSighting.id || firebaseSighting.firebaseKey,
        title: firebaseSighting.title || 'ICE Sighting',
        location: firebaseSighting.location || `${firebaseSighting.lat}, ${firebaseSighting.lng}`,
        time: firebaseSighting.submittedAt ? new Date(firebaseSighting.submittedAt) : new Date(),
        description: firebaseSighting.description,
        imageUrls: firebaseSighting.imageUrls || undefined,
        corroborationCount: firebaseSighting.corroborationCount || 0
      };

      await addICESightingMarker(position, AdvancedMarkerElement, PinElement, sighting);
      
      console.log('Created marker for Firebase sighting:', sighting.id);
    } catch (error) {
      console.error('Error creating marker from Firebase data:', error);
    }
  };

  const addICESightingMarker = async (
    position: any,
    AdvancedMarkerElement: any,
    PinElement: any,
    sighting: Sighting
  ) => {
    const marker = createPinMarker({
      position,
      AdvancedMarkerElement,
      PinElement,
      map: mapInstance.current!,
      onClick: () => {
        if (infoWindow.current) {
          infoWindow.current.close();
          
          renderInInfoWindow(
            <SightingCard
              sighting={sighting}
              onCorroborate={handleCorroboration}
            />
          );
        }
      },
      sightingData: sighting,
    });

    markers.current.push(marker);
    setSightings(prev => new Map(prev.set(sighting.id, sighting)));
  };

  const showSightingForm = (position: any, AdvancedMarkerElement: any, PinElement: any) => {
    const currentTime = new Date();
    const lat = position.lat().toFixed(6);
    const lng = position.lng().toFixed(6);

    renderInInfoWindow(
      <SightingForm
        lat={lat}
        lng={lng}
        timestamp={currentTime}
        onSubmit={({ title, description, images, location }) => {
          const sightingId = generateSightingId();

          const sighting: Sighting = {
            id: sightingId,
            title,
            location,
            time,
            description,
            imageUrls: images ? images.map(file => URL.createObjectURL(file)) : undefined,
            corroborationCount: 0
          };

          dbPush(dbRef(realtimeDb, 'sightings'), {
            id: sightingId,
            title,
            description,
            location,
            lat: position.lat(),
            lng: position.lng(),
            submittedAt: dbServerTimestamp(),
            imageCount: images?.length ?? 0,
          }).catch((error: unknown) => {
            console.error('Failed to save sighting:', error);
          });

          addICESightingMarker(position, AdvancedMarkerElement, PinElement, sighting);
          infoWindow.current?.close();
          
          console.log('Sighting submitted:', {
            location: `${lat}, ${lng}`,
            time: currentTime,
            title,
            description,
            address: location,
            hasImages: !!(images && images.length > 0),
          });
        }}
        onCancel={() => infoWindow.current?.close()}
      />,
      position
    );
  };


  // Setup realtime listener once map is initialized. This will load existing sightings
  // (initial snapshot) and then handle new sightings as they arrive.
  const setupRealtimeListener = () => {
    if (unsubscribeRef.current) return; // already listening

    console.log('Setting up real-time Firebase sightings listener from setupRealtimeListener...');
    let isInitialLoad = true;

    unsubscribeRef.current = listenToSightings((firebaseSightings) => {
      console.log('Firebase listener callback received', firebaseSightings.length, 'sightings');

      firebaseSightings.forEach((firebaseSighting: any) => {
        const sightingKey = firebaseSighting.firebaseKey || firebaseSighting.id;

        if (!loadedFirebaseSightingsRef.current.has(sightingKey)) {
          // create marker for this sighting
          createMarkerFromFirebaseData(firebaseSighting);
          loadedFirebaseSightingsRef.current.add(sightingKey);

          // show notification only after initial load
          if (!isInitialLoad) {
            const location = firebaseSighting.location || `${firebaseSighting.lat?.toFixed(4)}, ${firebaseSighting.lng?.toFixed(4)}`;
            setNewSightingNotification(`New sighting reported: ${firebaseSighting.title || 'ICE Sighting'} at ${location}`);
            setTimeout(() => setNewSightingNotification(null), 5000);
          }
        }
      });

      if (isInitialLoad) {
        isInitialLoad = false;
        console.log('Initial Firebase sightings loaded');
      }
    });
  };
  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      const { Map, InfoWindow } = await window.google.maps.importLibrary("maps");
      const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

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

      // start listening to Firebase sightings once the map is ready
      setupRealtimeListener();

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
      markers.current = [];
      mapInstance.current = null;
      infoWindowRoot.current?.unmount();
      infoWindow.current = null;
      infoWindowRoot.current = null;
      console.log(`Cleaned up map with ${sightings.size} sightings`);
    };
  }, []);

  // realtime listener is started from `setupRealtimeListener()` after the map is ready

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className={className} />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white py-2 px-4 rounded-lg shadow-lg z-10 text-sm">
        Click on the map to add a pin for an ICE sighting.
      </div>
      
      {/* New sighting notification */}
      {newSightingNotification && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg z-20 text-sm max-w-md text-center animate-pulse">
          <div className="font-semibold mb-1">🚨 Real-time Update</div>
          <div>{newSightingNotification}</div>
        </div>
      )}
    </div>
  );
};

export default Maps;
