"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect, useRef } from "react";

import { join } from 'path';
import SelectButton from '../ui/SelectButton'
import Restrictions from '../ui/Restrictions'
import AddressSelector from '../ui/AddressSelector'



export default function HostPage() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCreationAttempted = useRef(false);


  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState([]);
  const [ready, setReady] = useState(false);
  const [restrictions, setRestrictions] = useState(Array(4).fill(false))
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({lat: 0, lng: 0});
  const [autoLocation, setAutoLocation] = useState(true);


  useEffect(() => {
    if (!socket) return;
  
    setIsConnected(socket.connected);
    console.log("(host) Client socket ID on mount:", socket.id);
  
    const onConnect = () => {
      if (!roomCode && !roomCreationAttempted.current) {
        console.log("creating room on connect");
        socket.emit("createRoom");
        roomCreationAttempted.current = true;
        console.log("(host) Client socket ID on connect:", socket.id);
      }
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
    };
  
    const onRoomCreated = (roomCode) => {
      console.log("Room created with code:", roomCode);
      setRoomCode(roomCode);
    };
  
    const onUserJoined = (userId) => {
      console.log("User joined:", userId);
      setUsers(prev => [...prev, userId]);
    };
    
    const onUserLeft = (userId) => {
      console.log("User left:", userId);
      setUsers(prev => prev.filter(id => id !== userId));
    };
  
    // Define the onBegin function to use the current roomCode value from the closure
    const onBegin = () => {
      console.log("Ready to Begin with room code:", roomCode);
      if (roomCode) {
        router.push(`/questionnaire?code=${roomCode}`);
      } else {
        console.error("Room code is missing when trying to begin!");
      }
    };
  
    if (socket.connected && !roomCode && !roomCreationAttempted.current) {
      console.log("creating room immediately")
      socket.emit("createRoom");
      roomCreationAttempted.current = true;
    }
  
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("roomCreated", onRoomCreated);
    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);
    socket.on("begin", onBegin); // Don't call the function here, just pass the reference
  
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("roomCreated", onRoomCreated);
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
      socket.off("begin", onBegin); // Clean up the begin event listener
    };
  
  }, [socket, roomCode, router]); // Add roomCode and router to the dependencies

  useEffect(() => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
    } else {
      setAutoLocation(false);
      setIsGettingLocation(false);
    }
    
    function locationSuccess(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setCurrentLocation({lat: latitude, lng: longitude});
      setIsLocationReady(true);
      setIsGettingLocation(false);
    }
  
    function locationError() {
      console.log("Unable to retrieve your location");
      setAutoLocation(false);
      setIsGettingLocation(false);
    }
  }, []);

  function notifyReady() {
    if (!isLocationReady && autoLocation) {
      alert("Still retrieving your location. Please wait a moment.");
      return;
    }
    
    if (currentLocation && 
        (currentLocation.lat !== 0 || currentLocation.lng !== 0) && 
        (currentLocation.lat >= -90 && currentLocation.lat <= 90) && 
        (currentLocation.lng >= -180 && currentLocation.lng <= 180)) {
      console.log("notifyReady triggered with roomCode:", roomCode);
      socket.emit("readyBegin", roomCode, currentLocation, restrictions);
    }
    else {
      alert("Please enter a valid address or wait for location retrieval");
    }
  }

  return (
    <div style={{ padding: '2rem' }}>      
      {roomCode && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <h2>Room Code</h2>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              letterSpacing: '0.25rem'
            }}>
              {roomCode}
            </div>
            <p>Share this code with others to join your session</p>
        </div>
      )}
      <h2>Users Joined: {users.length}</h2>
      
      <div className='content-center justify-self-center py-4'>
        {isGettingLocation && autoLocation ? (
          <div>Retrieving your location...</div>
        ) : (
          <button 
            onClick={notifyReady} 
            disabled={!roomCode || ready || (autoLocation && !isLocationReady)} 
            className="btn-wide"
          >
            Ready
          </button>
        )}
      </div>

      {!autoLocation && (
        <AddressSelector coordinates={currentLocation} setCoordinates={setCurrentLocation} />
      )}

      <Restrictions restrictions={restrictions} setRestrictions={setRestrictions} />
    </div>
  );
}