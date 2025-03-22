
const { Client } = require("@googlemaps/google-maps-services-js");
const { PlacesClient } = require('@googlemaps/places').v1;
// Create a maps client
const mapsClient = new Client({});


async function fetchMapsData(cuisineType, latitude, longitude, radius, priceLevel, numberOfRestos) {
  const API_KEY = 'AIzaSyCn5q1Ds8lyBFtzexmxgvFJL-OagAi3t3c';
  
  try {
    const response = await mapsClient.placesNearby({
      params: {
        location: `${latitude},${longitude}`,
        radius: radius,
        keyword: cuisineType,
        type: 'restaurant',
        minprice: (priceLevel - 1 >= 0) ? priceLevel - 1 : 0,
        maxprice: (priceLevel + 1 <= 4) ? priceLevel + 1 : 4,
        opennow: true,
        rankby: 'prominence',
        key: API_KEY
      }
    });
    
    if (response.data.status === 'OK') {
      console.log(response.data.results);
      goodResults = [];
      for (let i = 0; i < Math.min(numberOfRestos, response.data.results.length); i++) {
        //console.log("photo:")
        //console.log(response.data.results[i].photos[0])
        response.data.results[i].photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=4000&photoreference=${response.data.results[i].photos[0].photo_reference}&key=${API_KEY}`;
        //console.log(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=4000&photoreference=${response.data.results[i].photos[0].photo_reference}&key=${API_KEY}`)
        //REMOVE! https://maps.googleapis.com/maps/api/place/photo?maxwidth=3000&photoreference=AUy1YQ3x0QJMpaJz_0bWNctbqNxKYFI_9MuIrK3LjrSKr8twbgg8gIvd2zItZ9zdnbDS7bQoP3ZdMzm6VMXhEljV0qGVWf7WaaUWa2UixY974KWmJIckXlmZRXjKcKc3AkIS7jeTAgJnRiIgvResYX2WdrAA1ydlR-ZNkmT6B1W9qSamlLqOnn-4WuVCvNRnM-uinoC5A54y50KCTP155sjUQb_oQ0ipzujd9AaGXkYHRGiNRVNBSgzC6QyTUP_Fju2_2jEC4lamramK4eFQwssMApFwMYoNiKzARecLdcS7yKix5srwwKw&key=AIzaSyCn5q1Ds8lyBFtzexmxgvFJL-OagAi3t3c
        response.data.results[i].id = i;
        goodResults.push(response.data.results[i]);
      }
      return goodResults;
    } else {
      console.error("Places API error:", response.data.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching places:", error.message);
    throw error;
  }
}

//fetchMapsData("italian", 45.49581197347, -73.57498971501632, 500, 2);

/*
console.log(estimateDistanceRadius({lat: 45.49579693246844, lng: -73.575032630358,}, 20, 'walking'))

// Update your estimateDistanceRadius function
async function estimateDistanceRadius(origin, commuteTimeMinutes, transportMode) {
  const API_KEY = 'AIzaSyCn5q1Ds8lyBFtzexmxgvFJL-OagAi3t3c'; // Replace with your API key
  const testDistances = [0.5, 1, 2, 3, 4, 5, 10, 15]; // km
  const distanceTimeMap = [];
  
  for (const distance of testDistances) {
    const numPoints = 8;
    const destinations = [];
    
    for (let i = 0; i < numPoints; i++) {
      const bearing = (i * 360 / numPoints);
      const destinationPoint = calculateDestinationPoint(
        origin.lat, 
        origin.lng, 
        distance * 1000,
        bearing
      );
      destinations.push(destinationPoint);
    }
    
    // Format destinations for Distance Matrix API
    const destinationsStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    
    try {
      // Use the Node.js client library
      const response = await mapsClient.distancematrix({
        params: {
          origins: [`${origin.lat},${origin.lng}`],
          destinations: destinations.map(d => `${d.lat},${d.lng}`),
          mode: transportMode.toLowerCase(),
          departure_time: 'now',
          key:'AIzaSyCn5q1Ds8lyBFtzexmxgvFJL-OagAi3t3c'
        }
      });
      
      if (response.data.status === 'OK') {
        let totalTime = 0;
        let validSamples = 0;
        
        for (let i = 0; i < numPoints; i++) {
          const element = response.data.rows[0].elements[i];
          if (element.status === 'OK') {
            totalTime += element.duration.value; // seconds
            validSamples++;
          }
        }
        
        if (validSamples > 0) {
          const avgTimeMinutes = (totalTime / validSamples) / 60;
          distanceTimeMap.push({ distance, timeMinutes: avgTimeMinutes });
          console.log(`Average time at ${distance}km: ${avgTimeMinutes.toFixed(2)} minutes`);
        }
      }
    } catch (error) {
      console.error(`Error for distance ${distance}km:`, error.message);
    }
  }
  
  // The rest of your function remains the same
  const estimatedRadius = interpolateRadius(distanceTimeMap, commuteTimeMinutes);
  return estimatedRadius;
}

function calculateDestinationPoint(lat, lng, distance, bearing) {
  const R = 6371000; // Earth's radius in meters
  const d = distance / R; // angular distance
  const bearingRad = bearing * Math.PI / 180;
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + 
                 Math.cos(lat1) * Math.sin(d) * Math.cos(bearingRad));
  const lng2 = lng1 + Math.atan2(Math.sin(bearingRad) * Math.sin(d) * Math.cos(lat1),
                       Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  
  return { 
    lat: lat2 * 180 / Math.PI, 
    lng: ((lng2 * 180 / Math.PI) + 540) % 360 - 180 // normalize to [-180,180]
  };
}
  
// Helper function to interpolate radius from distance-time data
function interpolateRadius(distanceTimeMap, targetTimeMinutes) {
  // Sort by time
  distanceTimeMap.sort((a, b) => a.timeMinutes - b.timeMinutes);
  
  // Find bracketing times
  for (let i = 0; i < distanceTimeMap.length - 1; i++) {
    if (distanceTimeMap[i].timeMinutes <= targetTimeMinutes && 
        distanceTimeMap[i+1].timeMinutes >= targetTimeMinutes) {
      
      // Linear interpolation
      const timeRange = distanceTimeMap[i+1].timeMinutes - distanceTimeMap[i].timeMinutes;
      const distanceRange = distanceTimeMap[i+1].distance - distanceTimeMap[i].distance;
      const timeRatio = (targetTimeMinutes - distanceTimeMap[i].timeMinutes) / timeRange;
      
      return distanceTimeMap[i].distance + (distanceRange * timeRatio);
    }
  }
  
  // Handle edge cases
  if (targetTimeMinutes <= distanceTimeMap[0].timeMinutes) {
    return distanceTimeMap[0].distance * (targetTimeMinutes / distanceTimeMap[0].timeMinutes);
  }
  
  if (targetTimeMinutes >= distanceTimeMap[distanceTimeMap.length - 1].timeMinutes) {
    const lastTwo = distanceTimeMap.slice(-2);
    const slope = (lastTwo[1].distance - lastTwo[0].distance) / 
                  (lastTwo[1].timeMinutes - lastTwo[0].timeMinutes);
    return lastTwo[1].distance + slope * (targetTimeMinutes - lastTwo[1].timeMinutes);
  }
  
  return null;
}


async function findRadiusForCommuteTime(currLat, currLng, commuteTime, transportMode) {
    const origin = { lat: currLat, lng: currLng };
    
    const radius = await estimateDistanceRadius(origin, commuteTime, transportMode);
    console.log(`Estimated radius for a ${commuteTime} minute ${transportMode} commute: ${radius.toFixed(2)} km`);
    
    // Now you can use this radius with Places API for a more accurate search
    return radius*1000; // Convert km to meters
}
*/

module.exports = {
  fetchMapsData,
};
