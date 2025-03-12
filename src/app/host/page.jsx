"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect, useRef } from "react";

import { join } from 'path';
import SelectButton from '../ui/SelectButton'
import Restrictions from '../ui/Restrictions'



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

  function notifyReady() {
    console.log("notifyReady triggered with roomCode:", roomCode);
    socket.emit("readyBegin", roomCode);
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
        <button onClick={notifyReady} disabled={!roomCode || ready} className="btn-wide">Ready</button>
      </div>

      <Restrictions restrictions={restrictions} setRestrictions={setRestrictions} />
    </div>
  );
}