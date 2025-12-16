'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Declare global google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
}

export default function MapPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  onClose,
}: MapPickerProps) {
  const [latitude, setLatitude] = useState(initialLat);
  const [longitude, setLongitude] = useState(initialLng);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        // ✅ FIX: Inisialisasi Loader dengan cara yang benar
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        });

        // ✅ FIX: Gunakan .load() bukan .importLibrary()
        await loader.load();
        
        // ✅ FIX: Akses google dari window setelah load
        if (!window.google) {
          throw new Error('Google Maps failed to load');
        }

        const google = window.google;
        
        if (!mapRef.current) return;

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Create marker
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          draggable: true,
          title: 'Store Location',
        });

        // Add click listener to map
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          const lat = e.latLng?.lat();
          const lng = e.latLng?.lng();
          
          if (lat && lng) {
            updateMarkerPosition(lat, lng, map, marker);
            reverseGeocode(lat, lng);
          }
        });

        // Add marker drag listener
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setLatitude(lat);
            setLongitude(lng);
            reverseGeocode(lat, lng);
          }
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        // Get initial address
        reverseGeocode(latitude, longitude);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load map. Please check your API key.');
        setLoading(false);
      }
    };

    initMap();
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (!window.google) return;
      
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat, lng },
      });

      if (result.results[0]) {
        setAddress(result.results[0].formatted_address);
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
    }
  };

  const updateMarkerPosition = (
    lat: number, 
    lng: number, 
    map: google.maps.Map, 
    marker: google.maps.Marker
  ) => {
    if (!window.google) return;
    
    const newPosition = new window.google.maps.LatLng(lat, lng);
    marker.setPosition(newPosition);
    map.panTo(newPosition);
    setLatitude(lat);
    setLongitude(lng);
    setIsSelecting(false);
  };

  const handleManualInput = async () => {
    if (mapInstanceRef.current && markerRef.current) {
      const lat = parseFloat(latitude.toString());
      const lng = parseFloat(longitude.toString());
      
      if (!isNaN(lat) && !isNaN(lng)) {
        updateMarkerPosition(lat, lng, mapInstanceRef.current, markerRef.current);
      }
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat);
        setLongitude(lng);
        
        if (mapInstanceRef.current && markerRef.current) {
          updateMarkerPosition(lat, lng, mapInstanceRef.current, markerRef.current);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  const handleSelect = () => {
    onLocationSelect(latitude, longitude, address);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          You can manually enter coordinates below:
        </p>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex-1">
            <label className="label">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="input input-bordered w-full"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSelect} className="btn btn-primary">Use Coordinates</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click anywhere on the map or drag the marker 
          to set your store location. You can also use your current location or enter 
          coordinates manually.
        </p>
      </div>

      {/* Map Container */}
      <div className="relative h-96 rounded-lg overflow-hidden border border-gray-300">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-2 text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label text-sm font-medium">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            className="input input-bordered w-full"
            onBlur={handleManualInput}
          />
        </div>
        <div>
          <label className="label text-sm font-medium">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            className="input input-bordered w-full"
            onBlur={handleManualInput}
          />
        </div>
        <div>
          <label className="label text-sm font-medium">Actions</label>
          <button
            onClick={handleUseCurrentLocation}
            className="btn btn-outline w-full gap-2"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use My Location
          </button>
        </div>
      </div>

      {/* Address Display */}
      <div>
        <label className="label text-sm font-medium">Detected Address</label>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            {address || 'Click on the map to select a location...'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button onClick={onClose} className="btn btn-ghost" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={handleSelect}
          className="btn btn-primary gap-2"
          disabled={loading || isSelecting}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Select This Location
            </>
          )}
        </button>
      </div>
    </div>
  );
}