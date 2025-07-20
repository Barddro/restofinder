import React, { useState, useRef, useEffect } from 'react';
import { Loader } from 'rsuite';


const Card = ({name, photo, priceLevel, rating, numOfRatings, address, vote, cardNum, isVoting}) => {
    console.log("photo: ", photo);

    const [isLoaded, setIsLoaded] = useState(false); 
    const [imgLoadError, setImgLoadError] = useState(false); 
    const pricearr = ['$','$$','$$$','$$$$', '$$$$$']
    const ratingarr = ['☆☆☆☆☆','★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆', '★★★★★']

    /*
    const ratingstr = (rating) => {
        let ratingstars = "";
        const ratinground = Math.round(rating); 
        for (let i = 0; i < 5; i++) {
            if (i <= ratinground) {
                ratingstars += "★"
            }
            else {
                ratingstars += "☆"
            }
        } 
        return ratingstars;
    }
    */

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
        });
    };

    useEffect(() => {
        if (photo) {
        loadImage(photo)
            .then(() => {
            setIsLoaded(true);
            })
            .catch((err) => {
            console.error("Image failed to load:", photo, err);
            setImageError(true);
            });
        }
    }, [photo]);

    return(
        <div>
            <div className='py-5 px-5 rounded-2xl border-2 border-gray-300 shadow w-fit'>
                <p className='text-2xl font-bold'>{name}</p>

                {!isLoaded && !imgLoadError && 
                    <div className='py-2 px-2 w-72 h-60 flex items-center justify-center relative'>
                        <Loader size='md' />
                    </div>
                }
                    
                    {isLoaded && !imgLoadError && <img
                        src={photo}
                        alt={name}
                        className='object-cover w-xl h-auto rounded-lg'
                        />
                    }
                    {imgLoadError && <div className='background-gray-200 w-xl h-auto rounded-lg flex items-center justify-center' />}


                <div className='flex-auto'>
                    <p className='text-lg font-bold'></p>
                    <p>Address: {address}</p>
                </div>
                
                <div className='flex-auto'>
                    <p>Price: {pricearr[priceLevel]}</p>
                    <p> Rating: {ratingarr[Math.round(rating)]} ({numOfRatings})</p>
                </div>

                {isVoting && <button className='btn' onClick={() => vote(cardNum)}>Vote</button>}
            </div>
            <div className='py-3'></div>
        </div>
    )
};

export default Card;