export const getAddressFromCoords = async (lat: number, lng: number): Promise<{
  address: string;
  zipCode: string;
}> => {
  try {
    const { Geocoder } = await window.google.maps.importLibrary("geocoding");
    const geocoder = new Geocoder();
    
    const response = await new Promise<any>((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any[], status: any) => {
          if (status === 'OK' && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });

    const addressComponents = response.address_components;
    let zipCode = '';
    let streetNumber = '';
    let streetName = '';
    let city = '';
    let state = '';

    // Parse address components
    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        streetName = component.long_name + ',';
      }
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = ', ' + component.short_name;
      }
    }

    const address = `${streetNumber} ${streetName} ${city}${state}`.trim();
    
    return {
      address: address || response.formatted_address,
      zipCode: zipCode
    };

  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      zipCode: ''
    };
  }
};