import React, { useState, useRef, useEffect } from 'react';

const Card = ({name, photo, priceLevel, rating, numOfRatings, address, vote, cardNum, isVoting}) => {
    console.log("photo: ", photo);
    
    const pricearr = ['$','$$','$$$','$$$$', '$$$$$']
    
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

    return(
        <div>
            <div className='py-5 px-5 rounded-2xl border-2 border-gray-300 shadow w-fit'>
                <p className='text-2xl py-2 font-bold'>{name}</p>
                <div className='py-2 px-2'>
                    <img src={photo} className='object-cover w-xl h-auto rounded-lg'></img>
                </div>

                <div className='flex-auto'>
                    <p className='text-lg font-bold'></p>
                    <p>Address: {address}</p>
                </div>
                
                <div className='flex-auto'>
                    <p>Price: {pricearr[priceLevel]}</p>
                    <p> Rating: {ratingstr(rating)} ({numOfRatings})</p>
                </div>

                {isVoting && <button className='btn' onClick={() => vote(cardNum)}>Vote</button>}
            </div>
            <div className='py-3'></div>
        </div>
    )
};

export default Card;