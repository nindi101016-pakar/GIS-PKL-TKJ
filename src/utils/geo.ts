/**
 * Geographic calculations and Haversine distance helpers for GIS Mapping
 */

/**
 * Calculates great-circle distance between two coordinates using the Haversine formula
 * Returns distance in kilometers (km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats distance with appropriate units (m or km)
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) return '-';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Estimates travel time assuming an average motorcycle/car road speed of 35-40 km/h with a 1.25 road winding factor
 */
export function estimateTravelTime(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm)) return '-';
  const roadDistance = distanceKm * 1.25; // Winding road factor
  const minutes = Math.round((roadDistance / 35) * 60);

  if (minutes < 2) return '~2 menit';
  if (minutes < 60) return `~${minutes} menit`;

  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `~${hours} jam ${remainingMin > 0 ? `${remainingMin} mnt` : ''}`;
}

/**
 * Computes compass direction from point 1 to point 2
 */
export function getCompassBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut',
  ];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}
