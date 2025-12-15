const API_BASE_URL = '/api';

export async function getLocations() {
  const response = await fetch(`${API_BASE_URL}/locations`);
  if (!response.ok) throw new Error('Failed to fetch locations');
  return response.json();
}

export async function saveLocation(locationData) {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(locationData)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save location');
  }
  return response.json();
}

export async function deleteLocation(id) {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete location');
  return response.json();
}

export async function searchLocations(keyword) {
  const response = await fetch(`${API_BASE_URL}/locations/search?keyword=${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error('Failed to search locations');
  return response.json();
}

export async function reverseGeocode(coords) {
  try {
    const [lon, lat] = coords;
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Address lookup failed';
  }
}