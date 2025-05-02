
import React, { useState, useEffect, useRef } from 'react';


const AddressSelector = ({ coordinates, setCoordinates, setIsLocationReady }) => {
  const [address, setAddress] = useState('');
  //const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const autocompleteRef = useRef(null);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  const initAutocomplete = () => {
    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setCoordinates({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
          setAddress(place.formatted_address);
        }
      });
    }
  };
  
  // Replace with your actual Google Maps API key
  const API_KEY = 'AIzaSyCn5q1Ds8lyBFtzexmxgvFJL-OagAi3t3c';
  
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use Google Maps Geocoding API to convert address to coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoordinates({ lat, lng });
        setIsLocationReady(true);
      } else {
        throw new Error(data.status || 'Failed to geocode address');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setCoordinates(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow-md">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Enter your address
          </label>
          <input
            ref={autocompleteRef}
            type="text"
            id="address"
            value={address}
            onChange={handleAddressChange}
            placeholder="Address..."
            className="w-full p-2 border rounded"
        />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn disabled:bg-violet-300"
        >
          {isLoading ? 'Converting...' : 'Get Coordinates'}
        </button>
      </form>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {
        coordinates && <div />
      }

      
    
    </div>
  );
};

export default AddressSelector;

