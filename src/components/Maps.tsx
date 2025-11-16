import React, { useEffect, useRef } from 'react';

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

  const addICESightingMarker = async (
    position: any,
    AdvancedMarkerElement: any,
    PinElement: any,
    sightingData?: { info: string; image?: File }
  ) => {
    const iceIcon = document.createElement('div');
    iceIcon.style.width = '12px';
    iceIcon.style.height = '12px';
    iceIcon.style.backgroundColor = '#000000';
    iceIcon.style.borderRadius = '50%';

    const pin = new PinElement({
      glyph: iceIcon,
      background: '#ff0000ff',
      borderColor: '#000000ff'
    });

    const marker = new AdvancedMarkerElement({
      map: mapInstance.current!,
      position: position,
      content: pin.element,
      title: 'ICE Sighting'
    });

    markers.current.push(marker);

    marker.addListener('click', () => {
      if (infoWindow.current) {
        infoWindow.current.close();
        const content = sightingData ? 
          `<div style="max-width: 250px;">
            <strong>ICE Sighting</strong><br>
            <small>Location: ${position.lat().toFixed(4)}, ${position.lng().toFixed(4)}</small><br>
            <p style="margin: 8px 0;">${sightingData.info}</p>
          </div>` :
          `Sighting at: ${position.lat().toFixed(4)}, ${position.lng().toFixed(4)}`;
        infoWindow.current.setContent(content);
        infoWindow.current.open(mapInstance.current!, marker);
      }
    });
  };

  const showSightingForm = (position: any, AdvancedMarkerElement: any, PinElement: any) => {
    const currentTime = new Date().toLocaleString();
    const lat = position.lat().toFixed(6);
    const lng = position.lng().toFixed(6);

    const formContent = `
      <div style="width: 300px; padding: 10px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">New ICE Sighting</h3>
        
        <div style="margin-bottom: 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 3px; font-size: 12px;">Location:</label>
          <input type="text" id="sighting-location" value="${lat}, ${lng}" 
                 style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;" readonly>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 3px; font-size: 12px;">Time:</label>
          <input type="text" id="sighting-time" value="${currentTime}" 
                 style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;" readonly>
        </div>

        <div style="margin-bottom: 10px;">
          <label style="display: block; font-weight: bold; margin-bottom: 3px; font-size: 12px;">Information:</label>
          <textarea id="sighting-info" placeholder="Describe what you saw..." 
                    style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; height: 60px; resize: vertical; font-size: 12px; font-family: Arial, sans-serif;"></textarea>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: block; font-weight: bold; margin-bottom: 3px; font-size: 12px;">Image (optional):</label>
          <input type="file" id="sighting-image" accept="image/*" 
                 style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
        </div>

        <div style="display: flex; gap: 10px;">
          <button id="submit-sighting" 
                  style="flex: 1; padding: 8px 16px; background-color: #7b3effff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
            Submit
          </button>
        </div>
      </div>
    `;

    if (infoWindow.current) {
      infoWindow.current.setContent(formContent);
      infoWindow.current.setPosition(position);
      infoWindow.current.open(mapInstance.current!);

      // Add event listeners after the content is set
      setTimeout(() => {
        const submitBtn = document.getElementById('submit-sighting');
        const cancelBtn = document.getElementById('cancel-sighting');
        const infoTextarea = document.getElementById('sighting-info') as HTMLTextAreaElement;
        const imageInput = document.getElementById('sighting-image') as HTMLInputElement;

        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            const info = infoTextarea?.value || 'No additional information';
            const imageFile = imageInput?.files?.[0];
            
            // Create the marker with the sighting data
            addICESightingMarker(position, AdvancedMarkerElement, PinElement, { 
              info, 
              image: imageFile 
            });
            
            // Close the form
            infoWindow.current?.close();
            
            console.log('Sighting submitted:', { 
              location: `${lat}, ${lng}`, 
              time: currentTime, 
              info,
              hasImage: !!imageFile 
            });
          });
        }

        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            infoWindow.current?.close();
          });
        }
      }, 100);
    }
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
      infoWindow.current = null;
    };
  }, []);

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