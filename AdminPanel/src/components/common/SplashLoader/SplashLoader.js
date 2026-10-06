import React, { useEffect, useState } from 'react';
import './SplashLoader.css';

export default function SplashLoader({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 1000ms
    const timer1 = setTimeout(() => {
      setIsFadingOut(true);
    }, 1100);

    // Completely unmount after fade out transition (1400ms)
    const timer2 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className={`splash-loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-loader-content">
        <div className="splash-logo-wrapper">
          <div className="splash-glow-ring" />
          <img
            src="/loader.jpeg"
            alt="Yeloline Loading Emblem"
            className="splash-logo-img"
          />
        </div>

        <div className="splash-brand-title">YELOLINE</div>
        <div className="splash-brand-subtitle">CONSTRUCTION & RENOVATION</div>

        <div className="splash-progress-track">
          <div className="splash-progress-fill" />
        </div>
      </div>
    </div>
  );
}
