"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect, Suspense } from "react";
import { Slider, Loader } from 'rsuite';
import FoodSelector from '../ui/FoodSelector';
//import 'rsuite/Slider/styles/index.css';
//import 'rsuite/RangeSlider/styles/index.css';


function QuestionnairePageContent() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomCode = searchParams.get('code');

  const labels = ['$','$$','$$$', '$$$$', '$$$$$'];

  const [questionNum, setQuestionNum] = useState(0);
  const [answer, setAnswer] = useState([]);  // Initialize as empty array instead of null
  const [selections, setSelections] = useState([]);
  const [priceRange, setPriceRange] = useState(0);
  const [distance, setDistance] = useState(30);

  useEffect(() => {
    if (!socket) return;

    const handleReadyProceed = (qNum) => {
      setQuestionNum(qNum);
    };

    const onRoomClose = () => {
      router.push('/disconnect');
    }

    socket.on("connect", () => {
      router.push('/disconnect');
    });
    socket.on("readyProceed", handleReadyProceed);
    socket.on("roomClosed", onRoomClose);

    // Initialize answer based on questionNum
    switch(questionNum) {
      case 0:
        setAnswer([]);
        setSelections([]);
        break;
      case 1:
        setAnswer([]);
        setSelections([]);
        break;
      case 4:
        router.push(`/results?code=${roomCode}`);
        break;
      default:
        break;
    }
    
    return () => {
      socket.off("readyProceed", handleReadyProceed);
    };
  }, [socket, questionNum]);

  function submitAnswer() {
    let finalAnswer;
    
    // Determine what to submit based on the question
    switch(questionNum) {
      case 0:
      case 1:
        finalAnswer = answer;
        break;
      case 2:
        finalAnswer = distance;
        break;
      case 3:
        finalAnswer = priceRange;
        break;
      default:
        finalAnswer = null;
    }
    
    if (finalAnswer !== null && 
        (typeof finalAnswer !== 'object' || (Array.isArray(finalAnswer) && finalAnswer.length > 0))) {
      console.log('answer: ', finalAnswer);
      socket.emit("submitAnswer", socket.id, roomCode, finalAnswer);
      setQuestionNum(-1);
    }
    else {
      alert("Please enter an answer");
    }
  }

  const handleFoodSelect = (index) => (value) => {
    // Create a new array copy to avoid mutating state directly
    const newAnswer = [...answer];
    const newSelections = [...selections];
    // Update only the specific index
    newAnswer[index] = value.value;
    newSelections[index] = value;
    // Set the new state
    setAnswer(newAnswer);
    setSelections(newSelections);
    
    console.log('Current answer array:', newAnswer);
  };
  
  // Similar function for clearing a specific entry
  const handleClearFood = (index) => () => {
    const newAnswer = [...answer];
    const newSelections = [...selections];

    newAnswer[index] = null;
    newSelections[index] = null;

    setAnswer(newAnswer);
    setSelections(newSelections);
    
    console.log(`Cleared food at position ${index + 1}`);
  };

  // Render based on question number
  const renderQuestion = () => {
    switch(questionNum) {
      case 0: 
        return(
          <div className='content-center justify-self-center justify-items-center py-4'>
            <h1 className='text-violet-500 text-xl'>List up to 3 types of food you feel for</h1>
              <div className='py-4'>
                <form className="flex flex-row gap-5" onSubmit={(e) => {
                  e.preventDefault();
                  submitAnswer();
                }}>
                    <div className="py-2"> 
                    <FoodSelector 
                      selectedValue={selections[0]}
                      onSelectValue={handleFoodSelect(0)}
                      onClearValue={handleClearFood(0)}
                    />
                    </div>

                    {answer[0] && (
                      <div className="py-2"> 
                      <FoodSelector 
                        selectedValue={selections[1]}
                        onSelectValue={handleFoodSelect(1)}
                        onClearValue={handleClearFood(1)}
                      />
                      </div>
                    )}

                    {(answer[0] && answer[1]) && (
                      <div className="py-2"> 
                      <FoodSelector 
                        selectedValue={selections[2]}
                        onSelectValue={handleFoodSelect(2)}
                        onClearValue={handleClearFood(2)}
                      />
                      </div>
                    )}
                    
                    <button type="submit" className="btn">Submit</button>
                </form>
              </div>
          </div>
        );
      
      case 1:
        return(
          <div className='content-center justify-self-center justify-items-center py-4'>
            <h1 className='text-violet-500 text-xl'>One type of food you don't want</h1>
            <div className='py-4'>
              <form className="flex flex-row gap-5" onSubmit={(e) => {
                e.preventDefault();
                submitAnswer();
              }}>

                <div className="py-2">
                <FoodSelector 
                      selectedValue={selections[0]}
                      onSelectValue={handleFoodSelect(0)}
                      onClearValue={handleClearFood(0)}
                />
                </div>
                <button type="submit" className="btn">Submit</button>
              </form>
            </div>
          </div>
        );
      
      case 2: 
        return(
          <div className='content-center justify-self-center justify-items-center py-4'>
            <h1 className='text-violet-500 text-xl'>How far (in meters)?</h1>
            <div className='py-4'>
              <form className="flex flex-row gap-5" onSubmit={(e) => {
                e.preventDefault();
                submitAnswer();
              }}>
                <div className="py-2">
                  <Slider 
                  value={distance}
                  onChange={setDistance}
                  min={100} 
                  max={20000} 
                  step={50} 
                  style={{ width: 400 }}
                  tooltip
                  renderTooltip={(value) => (value >= 1000) ? value/1000 + ' km': value + ' m'}
                  //barClassName="custom-slider-bar"
                  //handleClassName="custom-slider-handle"
                  handleStyle={{
                    backgroundColor: '#4428a1',
                    borderRadius: 20,
                    borderColor: '#4428a1'
                  }}
                  />
                </div>
                <button type="submit" className="btn">Submit</button>
              </form>
            </div>
          </div>
        );
      case 3:
        return (
          <div className='content-center justify-self-center justify-items-center py-4'>
            <h1 className='text-violet-500 text-xl'>Price Range?</h1>
            <div className='py-4'>
              <form className="flex flex-row gap-5" onSubmit={(e) => {
                e.preventDefault();
                submitAnswer();
              }}>
                <div className="py-2">
                <Slider 
                  value={priceRange}
                  onChange={setPriceRange}
                  min={0} 
                  max={4} 
                  step={1} 
                  style={{ width: 400 }}
                  graduated 
                  progress 
                  tooltip
                  renderTooltip={(value) => labels[value]}
                  //barClassName="custom-slider-bar"
                  //handleClassName="custom-slider-handle"

                  handleStyle={{
                    backgroundColor: '#4428a1',
                    borderRadius: 20,
                    borderColor: '#4428a1'
                  }}
                  />
                </div>
                <button type="submit" className="btn">Submit</button>
              </form>
            </div>
          </div>
        )
      case 4:
        return(
          <div>
          </div>
        );
      
      case -1:
        return(
          <div className="content-center justify-self-center justify-items-center py-4">
            <div>
              <h1 className='text-violet-500 text-3xl'>Waiting for all clients to submit</h1>
            </div>
            <div>
              <Loader size='lg' />
            </div>
          </div>
        );
      
      default:
        return <div>Unknown question number</div>;
    }
  };

  // Return the rendered question
  return renderQuestion();
}

export default function QuestionnairePage() {
  return(
    <Suspense>
      <QuestionnairePageContent />
    </Suspense>
  )
}