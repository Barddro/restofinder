"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from "../context/SocketContext";
import { useState, useEffect } from "react";
import { Slider, RangeSlider } from 'rsuite';
import FoodSelector from '../ui/FoodSelector';

export default function QuestionnairePage() {
  const socket = useSocket();
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomCode = searchParams.get('code');

  const labels = ['$','$$','$$$'];

  const [questionNum, setQuestionNum] = useState(0);
  const [answer, setAnswer] = useState([]);  // Initialize as empty array instead of null

  useEffect(() => {
    if (!socket) return;

    const handleReadyProceed = (qNum) => {
      setQuestionNum(qNum);
    };
    
    socket.on("readyProceed", handleReadyProceed);

    // Initialize answer based on questionNum
    switch(questionNum) {
      case 0:
        setAnswer([]);
        break;
      case 1:
        setAnswer("");
        break;
      case 2:
        setAnswer(0);
        break;
      case 3:
        setAnswer(0);
        break;
      default:
        setAnswer(null);
        break;
    }
    
    return () => {
      socket.off("readyProceed", handleReadyProceed);
    };
  }, [socket, questionNum]);

  function submitAnswer() {
    if (answer || (typeof(answer) === 'object' && answer.length > 0)) {
      console.log('answer: ', answer);
      socket.emit("submitAnswer", socket.id, roomCode, answer);
      setQuestionNum(-1);
    }
    else {
      alert("Please enter an answer");
    }
  }


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
                    <input 
                      className="basis-auto input-field"
                      value={answer[0] || ""} 
                      placeholder="food type 1"
                      required
                      onChange={(e) => {
                        setAnswer(prev => {
                          const newArray = [...prev];
                          newArray[0] = e.target.value;
                          return newArray;
                        });
                      }}
                    />
                    </div>

                    {answer[0] && (
                      <div className="py-2"> 
                      <input 
                        className="basis-auto input-field"
                        value={answer[1] || ""} 
                        placeholder="food type 2"
                        onChange={(e) => {
                          setAnswer(prev => {
                            const newArray = [...prev];
                            newArray[1] = e.target.value;
                            return newArray;
                          });
                        }}
                      />
                      </div>
                    )}

                    {(answer[0] && answer[1]) && (
                      <div className="py-2"> 
                      <input 
                        className="basis-auto input-field"
                        value={answer[2] || ""} 
                        placeholder="food type 3"
                        onChange={(e) => {
                          setAnswer(prev => {
                            const newArray = [...prev];
                            newArray[2] = e.target.value;
                            return newArray;
                          });
                        }}
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
                <input 
                  className="basis-auto input-field"
                  value={answer || ""} 
                  placeholder="food type 1"
                  required
                  onChange={(e) => {setAnswer(e.target.value);}}
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
            <h1 className='text-violet-500 text-xl'>How far?</h1>
            <div className='py-4'>
              <form className="flex flex-row gap-5" onSubmit={(e) => {
                e.preventDefault();
                submitAnswer();
              }}>
                <div className="py-2">
                  <Slider 
                  barClassName="custom-slider-bar"
                  handleClassName="custom-slider-handle"
                  value={answer || 30}
                  onChange={setAnswer}
                  min={5} 
                  max={90} 
                  step={5} 
                  graduated 
                  progress 
                  tooltip
                  renderTooltip={(value) => value + ' minutes'}
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
                  value={answer || 1}
                  onChange={setAnswer}
                  min={0}
                  max={labels.length - 1}
                  className="custom-slider"
                  barClassName="custom-slider-bar"
                  handleClassName="custom-slider-handle"
                  handleStyle={{
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 12,
                    width: 32,
                    height: 22
                  }}
                  graduated
                  tooltip={false}
                  handleTitle={labels[answer]}
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
            <button onClick={submitAnswer} className="btn">Submit</button>
          </div>
        );
      
      case -1:
        return(
          <div className="content-center justify-self-center justify-items-center py-4">
            <h1 className='text-violet-500 text-3xl'>Waiting for all clients to submit</h1>
          </div>
        );
      
      default:
        return <div>Unknown question number</div>;
    }
  };

  // Return the rendered question
  return renderQuestion();
}