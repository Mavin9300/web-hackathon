export const geocodingService = {
  async getCoordinates(locationQuery) {
    if (!locationQuery) return null;
    
    // Check if input is "lat, lon" or similar coordinate pair
    // matches: numbers, comma, numbers. Allow space.
    // simplistic check: ^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$
    // or just try to parse floats.
    const parts = locationQuery.split(',').map(s => s.trim());
    if (parts.length === 2) {
        const val1 = parseFloat(parts[0]);
        const val2 = parseFloat(parts[1]);
        
        if (!isNaN(val1) && !isNaN(val2)) {
             // Heuristics: Lat is -90 to 90. Lon is -180 to 180.
             // If one is > 90 or < -90, it must be Longitude.
             // If both are within 90, assume Lat, Lon order? Or user input dependent.
             // User input: '103.133183, 44.886949' -> 103 is Lon.
             
             let lat, lon;
             if (Math.abs(val1) > 90) {
                 // val1 must be Longitude
                 lon = val1;
                 lat = val2;
             } else {
                 // assume val1 is Latitude (standard) unless val2 is clearly not longitude (unlikely)
                 // But wait, user logged '103..., 44...'. 
                 lat = val1;
                 lon = val2;
                 
                 // if val1 was > 90 it would be caught above.
                 // In user case '103', it's > 90. So val1=Lon.
                 if (Math.abs(val2) > 90 && Math.abs(val1) <= 90) {
                    // val2 is Lon, val1 is Lat.
                    lat = val1;
                    lon = val2;
                 } else if (Math.abs(val1) > 90) {
                    lon = val1;
                    lat = val2;
                 }
                 // If both are < 90, ambiguous. Assume Lat, Lon.
             }
             
             // Additional check for user specific case '103, 44'. 
             // 103 is Lon. 44 is Lat.
             // My logic above: if val1(103) > 90 -> lon=103, lat=44. Correct.
             
             console.log(`[GeocodingService] Parsed raw coordinates: Lat=${lat}, Lon=${lon}`);
             return {
                 latitude: lat,
                 longitude: lon,
                 display_name: locationQuery // Use raw string as name
             };
        }
    }

    try {
      // Using OpenStreetMap Nominatim API (Free, requires User-Agent)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'HackathonBookApp/1.0'
        }
      });
      
      if (!response.ok) {
        console.warn('Geocoding API failed', response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('Geocoding Response:', data); // DEBUG LOG
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          display_name: data[0].display_name
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  }
};

export default geocodingService;
