"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect } from "react";


export default function QuestionnairePage() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomCode = searchParams.get('code');


    useEffect(() => {
        if (!socket) return;

        const onRoomClose = () => {
            router.push('/disconnect');
        }
          
        socket.on("roomClosed", onRoomClose);
        
    }, [socket]);

    return (
        <div></div>
    )
}