// src/components/Loader.js (adjust path if needed)
import React, { useState, useEffect, Fragment } from 'react';

const Loader = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShow(false);
    }, 3000); // loader visible for 3 seconds

    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return (
    <Fragment>
      <div className="loader-wrapper">
        <div className="loader-index">
          <span></span>
        </div>
        <svg>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
          </filter>
        </svg>
      </div>

      <style>{`
        .loader-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 9999;
        }

        .loader-index span {
          display: block;
          width: 30px;
          height: 30px;
          background-color: #007bff;
          border-radius: 50%;
          animation: loader-bounce 1.4s infinite ease-in-out both;
          filter: url('#goo');
        }

        @keyframes loader-bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </Fragment>
  );
};

export default Loader;
