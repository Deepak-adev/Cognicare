import * as Location from 'expo-location';
import { useStore } from '../store/useStore';

export const LocationService = {
  // Hardcoded home location for the demo
  homeLocation: {
    latitude: 26.1445, // Example: Guwahati
    longitude: 91.7362
  },
  geofenceRadiusMeters: 100,
  
  init: async () => {
    // HARDCODED SAFE MODE for Demo: Prevent location fetching which causes errors
    console.log('[LocationService] Hardcoded safe mode active.');
    return;
  },

  checkGeofence: (currentCoords) => {
    // Simple distance calculation (Haversine formula)
    const R = 6371e3; // metres
    const lat1 = LocationService.homeLocation.latitude * Math.PI/180; 
    const lat2 = currentCoords.latitude * Math.PI/180;
    const deltaLat = (currentCoords.latitude - LocationService.homeLocation.latitude) * Math.PI/180;
    const deltaLon = (currentCoords.longitude - LocationService.homeLocation.longitude) * Math.PI/180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    const { triggerRescueProtocol, wanderAlertActive } = useStore.getState();

    if (distance > LocationService.geofenceRadiusMeters) {
      if (!wanderAlertActive) {
        triggerRescueProtocol(true);
      }
    } else {
      if (wanderAlertActive) {
        console.log(`[LocationService] Back in safe zone. Distance: ${Math.round(distance)}m`);
        triggerRescueProtocol(false);
      }
    }
  }
};
