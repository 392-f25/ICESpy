import React, { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import SightingForm from './SightingForm.tsx';
import { createPinMarker } from './Pin.tsx';
import SightingCard from './SightingCard.tsx';
import type { Sighting } from '../types/Sighting.ts';
import {
  dbPush,
  dbRef,
  dbServerTimestamp,
  incrementSightingUpvotes,
  realtimeDb,
  listenToSightings,
  useAuthState,
  uploadImage,
} from '../utilities/firebase';

// Extend the Window interface to include google
declare global {
  interface Window {
    google: any;
  }
}

interface MapsProps {
  className?: string;
}

const Maps: React.FC<MapsProps> = ({ className = 'w-full h-full' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const infoWindow = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const infoWindowRoot = useRef<Root | null>(null);
  const [sightings, setSightings] = useState<Map<string, Sighting>>(new Map());
  const sightingsRef = useRef<Map<string, Sighting>>(new Map());
  const [upvotedSightings, setUpvotedSightings] = useState<Set<string>>(new Set());
  const upvotedSightingsRef = useRef<Set<string>>(new Set());
  const upvoteStorageKeyRef = useRef<string>('upvotedSightings:guest');
  const [pendingUpvoteId, setPendingUpvoteId] = useState<string | null>(null);
  // track loaded firebase keys in a ref so updates don't trigger rerenders
  const loadedFirebaseSightingsRef = useRef<Set<string>>(new Set());
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [newSightingNotification, setNewSightingNotification] = useState<
    string | null
  >(null);
  const { user, isAuthenticated } = useAuthState();
  const isAuthenticatedRef = useRef<boolean>(false);

  const getSightingKey = (sighting: Pick<Sighting, 'id' | 'firebaseKey'>) =>
    sighting.firebaseKey || sighting.id;

  // Helper function to create and setup React components in InfoWindow
  const renderInInfoWindow = (
    component: React.ReactElement,
    position?: any
  ) => {
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

  useEffect(() => {
    sightingsRef.current = sightings;
  }, [sightings]);

  useEffect(() => {
    upvotedSightingsRef.current = upvotedSightings;
  }, [upvotedSightings]);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  useEffect(() => {
    const storageKey = user
      ? `upvotedSightings:${user.uid}`
      : 'upvotedSightings:guest';

    upvoteStorageKeyRef.current = storageKey;

    try {
      const stored = typeof window !== 'undefined'
        ? window.localStorage.getItem(storageKey)
        : null;

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const parsedSet = new Set<string>(parsed);
          setUpvotedSightings(parsedSet);
          upvotedSightingsRef.current = parsedSet;
          return;
        }
      }

      setUpvotedSightings(new Set());
      upvotedSightingsRef.current = new Set();
    } catch (error) {
      console.error('Failed to load upvoted sightings from storage:', error);
      setUpvotedSightings(new Set());
      upvotedSightingsRef.current = new Set();
    }
  }, [user]);

  const persistUpvotedSightings = (nextSet: Set<string>) => {
    upvotedSightingsRef.current = nextSet;
    setUpvotedSightings(nextSet);

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          upvoteStorageKeyRef.current,
          JSON.stringify(Array.from(nextSet))
        );
      }
    } catch (error) {
      console.error('Failed to persist upvoted sightings:', error);
    }
  };

  const handleUpvote = async (sighting: Sighting) => {
    const sightingKey = getSightingKey(sighting);
    if (!sightingKey) return;

    if (!user) {
      console.warn('User must be signed in to upvote');
      return;
    }

    if (upvotedSightingsRef.current.has(sightingKey)) {
      return;
    }

    try {
      setPendingUpvoteId(sightingKey);
      const newCount = await incrementSightingUpvotes(sightingKey);

      const updatedUpvotes = new Set(upvotedSightingsRef.current);
      updatedUpvotes.add(sightingKey);
      persistUpvotedSightings(updatedUpvotes);

      setSightings((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(sightingKey) || sighting;
        updated.set(sightingKey, {
          ...existing,
          upvotes:
            typeof newCount === 'number'
              ? newCount
              : (existing.upvotes || 0) + 1,
        });
        sightingsRef.current = updated;
        return updated;
      });
    } catch (error) {
      console.error('Failed to upvote sighting:', error);
    } finally {
      setPendingUpvoteId(null);
    }
  };

  const mapFirebaseSightingToSighting = (firebaseSighting: any): Sighting => {
    const firebaseKey = firebaseSighting.firebaseKey || firebaseSighting.id;

    return {
      id: firebaseSighting.id || firebaseKey || generateSightingId(),
      firebaseKey,
      title: firebaseSighting.title || 'ICE Sighting',
      location:
        firebaseSighting.location ||
        `${firebaseSighting.lat}, ${firebaseSighting.lng}`,
      time: firebaseSighting.submittedAt
        ? new Date(firebaseSighting.submittedAt)
        : new Date(),
      description: firebaseSighting.description,
      imageUrls: firebaseSighting.imageUrls || undefined,
      upvotes:
        typeof firebaseSighting.upvotes === 'number'
          ? firebaseSighting.upvotes
          : firebaseSighting.corroborationCount || 0,
      corroborationCount: firebaseSighting.corroborationCount,
      category: firebaseSighting.category || 'ICE activity',
    };
  };

  // Function to create marker from Firebase sighting data
  const createMarkerFromFirebaseData = async (firebaseSighting: any) => {
    if (!mapInstance.current || !window.google?.maps) {
      console.log('Map or Google Maps not ready');
      return;
    }

    try {
      const { AdvancedMarkerElement, PinElement } =
        await window.google.maps.importLibrary('marker');

      // Create position from lat/lng
      const position = new window.google.maps.LatLng(
        firebaseSighting.lat,
        firebaseSighting.lng
      );

      const sighting = mapFirebaseSightingToSighting(firebaseSighting);
      const sightingKey = getSightingKey(sighting);

      await addICESightingMarker(
        position,
        AdvancedMarkerElement,
        PinElement,
        sighting
      );

      if (sightingKey) {
        loadedFirebaseSightingsRef.current.add(sightingKey);
      }

      console.log('Created marker for Firebase sighting:', sighting.id);
    } catch (error) {
      console.error('Error creating marker from Firebase data:', error);
    }
  };

  const addICESightingMarker = async (
    position: any,
    AdvancedMarkerElement: any,
    PinElement: any,
    sighting: Sighting,
  ) => {
    const sightingKey = getSightingKey(sighting);

    const marker = createPinMarker({
      position,
      AdvancedMarkerElement,
      PinElement,
      map: mapInstance.current!,
      onClick: () => {
        if (infoWindow.current && mapInstance.current) {
          // Re-center the map to the clicked marker's position
          mapInstance.current.panTo(position);
          
          // Optionally zoom in a bit if not already zoomed
          const currentZoom = mapInstance.current.getZoom();
          if (currentZoom < 15) {
            mapInstance.current.setZoom(15);
          }

          // Close any existing info window
          infoWindow.current.close();

          // Create container for the sighting card
          const container = document.createElement('div');
          const root = createRoot(container);
          const latestSighting =
            (sightingKey && sightingsRef.current.get(sightingKey)) || sighting;
          const hasUpvoted =
            sightingKey && upvotedSightingsRef.current.has(sightingKey);
          const isPending = sightingKey
            ? pendingUpvoteId === sightingKey
            : false;
          
          root.render(
            <SightingCard
              sighting={latestSighting}
              hasUpvoted={!!hasUpvoted}
              isUpvotePending={isPending}
              isAuthenticated={isAuthenticatedRef.current}
              onUpvote={handleUpvote}
            />
          );

          // Set content and position
          infoWindow.current.setContent(container);
          infoWindow.current.setPosition(position);
          infoWindow.current.open(mapInstance.current, marker);
        }
      },
      sightingData: sighting,
    });

    markers.current.push(marker);

    if (sightingKey) {
      loadedFirebaseSightingsRef.current.add(sightingKey);
      setSightings((prev) => {
        const updated = new Map(prev);
        updated.set(sightingKey, sighting);
        sightingsRef.current = updated;
        return updated;
      });
    }
  };

  const showSightingForm = (
    position: any,
    AdvancedMarkerElement: any,
    PinElement: any
  ) => {
    const currentTime = new Date();
    const lat = position.lat().toFixed(6);
    const lng = position.lng().toFixed(6);

    renderInInfoWindow(
      <SightingForm
        lat={lat}
        lng={lng}
        timestamp={currentTime}
        onSubmit={async ({ title, description, images, location, category }) => {
          const sightingId = generateSightingId();

          // upload any images to Firebase storage, using uploadImage().
          // uploadImage() returns the downloadURL for the uploaded image.
          // store the imageUrls.
          let imageURLs: string[] = [];

          if (images && images.length > 0) {
            // Use Promise.all to wait for all uploads to complete
            imageURLs = await Promise.all(
              images.map(async (image) => {
                return await uploadImage(image, sightingId);
              })
            );
            console.log('Uploaded images:', imageURLs);
          }

          const sighting: Sighting = {
            id: sightingId,
            title,
            location,
            time: currentTime,
            description,
            imageUrls: imageURLs.length > 0 ? imageURLs : [],
            upvotes: 0,
            category,
          };

          const toPush = {
            ...sighting,
            lat: position.lat(),
            lng: position.lng(),
            submittedAt: dbServerTimestamp(),
            imageCount: images?.length ?? 0,
            upvotes: 0,
          };

          try {
            const newSightingRef = await dbPush(
              dbRef(realtimeDb, 'sightings'),
              toPush
            );

            const firebaseKey = newSightingRef.key || sightingId;
            const sightingWithKey: Sighting = {
              ...sighting,
              firebaseKey,
              id: firebaseKey || sightingId,
            };

            addICESightingMarker(
              position,
              AdvancedMarkerElement,
              PinElement,
              sightingWithKey,
            );
            infoWindow.current?.close();
          } catch (error: unknown) {
            console.error('Failed to save sighting:', error);
          }

          console.log('Sighting submitted:', toPush);
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

    console.log(
      'Setting up real-time Firebase sightings listener from setupRealtimeListener...'
    );
    let isInitialLoad = true;

    unsubscribeRef.current = listenToSightings((firebaseSightings) => {
      console.log(
        'Firebase listener callback received',
        firebaseSightings.length,
        'sightings'
      );

      const nextSightings = new Map<string, Sighting>();

      firebaseSightings.forEach((firebaseSighting: any) => {
        const mappedSighting = mapFirebaseSightingToSighting(firebaseSighting);
        const sightingKey = getSightingKey(mappedSighting);

        if (!sightingKey) {
          return;
        }

        nextSightings.set(sightingKey, mappedSighting);

        if (!loadedFirebaseSightingsRef.current.has(sightingKey)) {
          // create marker for this sighting
          createMarkerFromFirebaseData(firebaseSighting);
          loadedFirebaseSightingsRef.current.add(sightingKey);

          // show notification only after initial load
          if (!isInitialLoad) {
            const location =
              firebaseSighting.location ||
              `${firebaseSighting.lat?.toFixed(
                4
              )}, ${firebaseSighting.lng?.toFixed(4)}`;
            setNewSightingNotification(
              `New sighting reported: ${
                firebaseSighting.title || 'ICE Sighting'
              } at ${location}`
            );
            setTimeout(() => setNewSightingNotification(null), 5000);
          }
        }
      });

      sightingsRef.current = nextSightings;
      setSightings(nextSightings);

      if (isInitialLoad) {
        isInitialLoad = false;
        console.log('Initial Firebase sightings loaded');
      }
    });
  };
  const initMap = async () => {
    if (!mapRef.current) return;

    try {
      const { Map, InfoWindow } = await window.google.maps.importLibrary(
        'maps'
      );
      const { AdvancedMarkerElement, PinElement } =
        await window.google.maps.importLibrary('marker');

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
              console.log('Geolocation error:', error.message);
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 600000, // 10 minutes
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
        console.log('Using default location (Evanston):', error);
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
        rotateControl: false, // Disable rotate control (optional)
      });

      infoWindow.current = new InfoWindow();

      mapInstance.current.addListener('click', (event: any) => {
        if (!isAuthenticatedRef.current) {
          return;
        }

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
        {isAuthenticated
          ? 'Click on the map to add a pin for an ICE sighting.'
          : 'Sign in to add a pin. You can still browse existing sightings.'}
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
