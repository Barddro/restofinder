"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect } from "react";


function JoinPageContent() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isConnected, setIsConnected] = useState(false);
  //const [joined, setJoined] = useState(false);
  const roomCode = searchParams.get('code');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);
    console.log("(join) Client socket ID on mount:", socket.id);

    socket.emit("checkRoom", roomCode, (exists) => {
      if (!exists) {
        setError("Room not found");
        router.push('/')
      }
    });

    const onBegin = () => {
      console.log("Ready to Begin");
      router.push(`/questionnaire?code=${roomCode}`);
    }

    const onRoomClose = () => {
      router.push('/disconnect');
    }

    socket.on("begin", onBegin);
    socket.on("roomClosed", onRoomClose);

    return () => {
      socket.off("begin", onBegin);
    };

  }, [socket]);

  return (
    <div style={{ padding: '2rem' }}>

      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '0.5rem',
        textAlign: 'center'
      }}>
        <h2>Connected to Room</h2>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            letterSpacing: '0.25rem'
          }}>
            {roomCode}
          </div>
          <p>Waiting for Host to Start</p>
      </div>      
    </div>
  );
  
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="content-center justify-self-center py-4">
        <Loader size="lg" />
        <div className="text-center mt-4">Loading questionnaire...</div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}