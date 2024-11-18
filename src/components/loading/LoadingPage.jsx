import React from 'react';

const LoadingPage = () => {
  const loadingTextStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    background: 'linear-gradient(270deg, #0D47A1, #42A5F5, #0D47A1)',
    backgroundSize: '600% 600%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'colorShift 3s ease infinite',
  };

  const pageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#fff',
  };

  return (
    <div style={pageStyle}>
      <h1 style={loadingTextStyle}>TransFleet</h1>
      <style>
        {`
          @keyframes colorShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingPage;
