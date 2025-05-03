"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect, Suspense } from "react";
import { Loader } from 'rsuite';
import Card from "../ui/Card";


function QuestionnairePageContent() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomCode = searchParams.get('code');
  const [loadedResultsPageEmitted, setLoadedResultsPageEmitted] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [roomState, setRoomState] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const onRoomClose = () => {
      router.push('/disconnect');
    }

    const startVote = (restaurants) => {
      console.log("starting voting", restaurants);
      setRestaurants(restaurants);
      setRoomState(1);
    }

    const newVote = (restaurants) => {
      console.log("new voting round", restaurants);
      setRestaurants(restaurants); 
      if (restaurants.length > 1) {
        setRoomState(1);
      } else {
        setRoomState(3);
      }
    }

    socket.on("connect", () => {
      router.push('/disconnect');
    });
      
    socket.on("restoQuery", startVote);
    socket.on("newVote", newVote);
    socket.on("roomClosed", onRoomClose);
    
    return () => {
      socket.off("restoQuery", startVote);
      socket.off("newVote", newVote);
      socket.off("roomClosed", onRoomClose);
    };
  }, [socket, router]);

  useEffect(() => {
    if (socket && roomCode && !loadedResultsPageEmitted) {
      socket.emit("loadedResultsPage", socket.id, roomCode);
      setLoadedResultsPageEmitted(true);
    }
  }, []);
  //socket, roomCode, loadedResultsPageEmitted (dependency array)

  function vote(restoNum) {
    socket.emit("submitVote", socket.id, roomCode, restoNum);
    setRoomState(2);
  }

  switch (roomState) {
    case 0: 
      return (
        <div className="content-center justify-self-center justify-items-center py-4">
          <div>
            <h1 className='text-violet-500 text-3xl'>Waiting for restaurants</h1>
          </div>
          <div>
            <Loader size='lg' />
          </div>
        </div>
      );
      case 1:
        return (
          <div className='py-3 content-center justify-self-center'>
            {restaurants && restaurants.length > 0 ? (
              restaurants.map((resto, index) => {
                const uniqueKey = resto.place_id;
                
                return (
                  <div key={uniqueKey}>
                    <Card 
                      cardNum={uniqueKey}
                      name={resto.name}
                      photo={resto.photoUrl}
                      priceLevel={resto.price_level}
                      rating={resto.rating}
                      numOfRatings={resto.user_ratings_total}
                      address={resto.vicinity}
                      isVoting={true}
                      //onVote={() => vote(uniqueKey)}
                      vote={() => vote(resto.id)}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p>No restaurants found</p>
              </div>
            )}
          </div>
        );
    case 2:
      return (
        <div className="content-center justify-self-center justify-items-center py-4">
          <div>
            <h1 className='text-violet-500 text-3xl'>Waiting for all clients to vote</h1>
          </div>
          <div>
            <Loader size='lg' />
          </div>
        </div>
      );
    case 3:
      // Assuming the first restaurant is the winner in this case
      const winningResto = restaurants[0];
      return (
        <div>
          {winningResto && (
            <Card 
              cardNum={winningResto.place_id || winningResto.id}
              name={winningResto.name}
              photo={winningResto.photoUrl}
              priceLevel={winningResto.price_level}
              rating={winningResto.rating}
              numOfRatings={winningResto.user_ratings_total}
              address={winningResto.vicinity}
              isVoting={false}
            />
          )}


        </div>
      );
    default:
      return null;
  }
}

export default function QuestionnairePage() {
  return(
    <Suspense>
      <QuestionnairePageContent />
    </Suspense>
  )
}