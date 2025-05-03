"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, Suspense } from "react";
import { useSocket } from "../context/SocketContext";


import { join } from 'path';


function DisconnectPageContent() {
  const router = useRouter();
  const socket = useSocket();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      socket.disconnect();
    });
  }, [socket]);

  return (
    <div style={{ padding: '2rem' }}>      
      <h1 className='text-violet-500 text-3xl'>Disconnected</h1>
      <p className='text-violet-500 text-lg'>Looks like you've been disconnected from the server.</p>
    </div>
  );
}

export default function DisconnectPage() {
  return(
    <Suspense>
      <DisconnectPageContent />
    </Suspense>
  )
}