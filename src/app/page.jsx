"use client"

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "./context/SocketContext";
import { useState, useEffect } from "react";

export default function Home() {
  const socket = useSocket();
  const router = useRouter();

  const [sessionCode, setSessionCode] = useState("");
  const [oldSessionCode, setOldSessionCode] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [roomExists, setRoomExists] = useState(true);
  const [roomAlreadyStarted, setRoomAlreadyStarted] = useState(false);


  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    const onConnect = () => {
      setIsConnected(true);
    };
    
    const onDisconnect = () => {
      setIsConnected(false);
    };
    
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };

  }, [socket]);



  function createRoom() {
    router.push(`/host`)
    //socket.emit("createRoom");
  }

  function joinRoom(e) {
    e.preventDefault();
    if(socket && isConnected && sessionCode) {
      socket.emit("checkRoom", sessionCode, (exists, state) => {
        if (exists) {

          setRoomExists(true);

          if (!state) {
          socket.emit("joinRoom", sessionCode);
          router.push(`/join?code=${sessionCode}`);
          }
          else {
            setRoomExists(true);
            setOldSessionCode(sessionCode);
            setRoomAlreadyStarted(true);
          }
        } else {
          setRoomAlreadyStarted(false);
          setOldSessionCode(sessionCode);
          setRoomExists(false);
        }
      });
    }
    else {
      console.error("Socket not connected or session code missing")
    }
    
  }

  return (
    <div className='content-center justify-self-center justify-items-center py-4'>
      
      <div className='py-4'>
      <button onClick={createRoom} className="btn-wide">Host Session</button>
      </div>

      <div className='py-4'>
        <h1 className='text-violet-500 text-2xl'>OR</h1>
      </div>

      <div className='py-4'>
        <form className="flex flex-col gap-2">
          <div className="flex flex-row gap-5">
            <div className="relative flex-grow">
              <input 
                className={`w-full bg-gray-50 border border-gray-300 text-gray-900 text-xl rounded-lg focus:outline-none focus:ring block px-4 py-2 ${roomExists ? 'focus:ring-violet-600 focus:border-violet-600' : 'ring-red-600 border-red-600'}`}
                value={sessionCode} 
                placeholder="Session Code"
                required
                onChange={(e) => setSessionCode(e.target.value)}
              />
              { (!roomExists || roomAlreadyStarted) && 
                <p className='absolute text-xs text-red-500 mt-1'>
                  {!roomExists && 'Room with code \'' + oldSessionCode + '\' does not exist'}
                  {roomAlreadyStarted && 'Room with code \'' + oldSessionCode + '\' has already started'}
                </p>
              }
            </div>
            <button onClick={joinRoom} className="btn-fat">Join Session</button>
          </div>
        </form>
      </div>
      
    </div>
  );
}