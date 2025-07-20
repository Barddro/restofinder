"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    //const newSocket = io("https://restofinder-backend-production.up.railway.app", {
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket", "polling"],  // Try both transport methods
      reconnectionAttempts: 5
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Cleanup when component unmounts
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}