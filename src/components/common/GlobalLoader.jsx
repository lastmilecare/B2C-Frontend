import React from "react";
import "../../loder.css";

const GlobalLoader = () => {
  return (
    <div className="loader-wrapper">

    
      <img 
        src="/images/LMC_logo.webp" 
        alt="logo"
        className="logo-beat"
      />

     
      <div className="ecg-container">

       
        <svg viewBox="0 0 200 50" className="ecg ecg1">
          <path
            d="M0 25 L20 25 L30 10 L40 40 L50 25 L70 25 L80 15 L90 35 L100 25 L200 25"
            className="ecg-path"
          />
        </svg>

       
        <svg viewBox="0 0 200 50" className="ecg ecg2">
          <path
            d="M0 25 L20 25 L30 10 L40 40 L50 25 L70 25 L80 15 L90 35 L100 25 L200 25"
            className="ecg-path"
          />
        </svg>

       
        <svg viewBox="0 0 200 50" className="ecg ecg3">
          <path
            d="M0 25 L20 25 L30 10 L40 40 L50 25 L70 25 L80 15 L90 35 L100 25 L200 25"
            className="ecg-path"
          />
        </svg>

      </div>

    </div>
  );
};

export default GlobalLoader;