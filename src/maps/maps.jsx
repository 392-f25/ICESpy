/**
 * @type {google.maps.Map}
 */
let map;

/**
 * @type {google.maps.InfoWindow}
 */
let infoWindow;

/**
 * @type {google.maps.marker.AdvancedMarkerElement[]}
 */
const markers = [];

async function initMap() {
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  map = new Map(document.getElementById('map'), {
    center: { lat: 34.0522, lng: -118.2437 }, // Default to Los Angeles
    zoom: 10,
    mapId: 'DEMO_MAP_ID',
    gestureHandling: 'greedy'
  });

  infoWindow = new InfoWindow();

  map.addListener('click', (/** @type {google.maps.MapMouseEvent} */ event) => {
    if (event.latLng) {
      addPetSightingMarker(event.latLng, AdvancedMarkerElement, PinElement);
    }
  });

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (/** @type {GeolocationPosition} */ position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);
        map.setZoom(12);
      },
      () => {
        // Handle error or user denial
        console.log("Error: The Geolocation service failed or was denied.");
      }
    );
  }
}

/**
 * Adds a new marker to the map for a pet sighting.
 * @param {google.maps.LatLng} position The position of the sighting.
 * @param {typeof google.maps.marker.AdvancedMarkerElement} AdvancedMarkerElement The AdvancedMarkerElement class.
 * @param {typeof google.maps.marker.PinElement} PinElement The PinElement class.
 */
function addPetSightingMarker(position, AdvancedMarkerElement, PinElement) {
  const petIcon = document.createElement('span');
  petIcon.classList.add('material-icons');
  petIcon.textContent = 'pets';

  const pin = new PinElement({
    glyph: petIcon,
    background: '#FFC107', // Amber color
    borderColor: '#B76E00'
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    content: pin.element,
    title: 'Lost Pet Sighting'
  });

  markers.push(marker);

  marker.addListener('click', () => {
    infoWindow.close();
    infoWindow.setContent(`Sighting at: ${position.lat().toFixed(4)}, ${position.lng().toFixed(4)}`);
    infoWindow.open(map, marker);
  });
}

initMap();
