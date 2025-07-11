import React, { useState, useEffect } from 'react';
import { Zap, Battery, Sun, Settings, Wrench, Shield } from 'lucide-react';

const SolarIntroPage = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation - faster to complete in 3 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 3;
      });
    }, 100);

    // Start fade out animation at 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3200);

    // Hide intro completely at 3 seconds
    const hideTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Professional dark background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#353B41' }}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* Animated energy particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                backgroundColor: i % 2 === 0 ? '#F47125' : '#166936',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          {/* Professional logo area */}
          <div className="relative mb-12">
            <div className="w-40 h-40 mx-auto mb-8 relative">
              {/* Central hexagon with solar panel pattern */}
              <div 
                className="absolute inset-0 rounded-2xl flex items-center justify-center transform rotate-12 shadow-2xl"
                style={{ 
                  background: `linear-gradient(135deg, #166936 0%, #2A7E4D 50%, #6C937C 100%)`,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
              >
                <div className="w-16 h-16 grid grid-cols-2 gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/20 rounded-sm animate-pulse"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Orbiting professional icons */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#166936' }}>
                    <Battery className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#F47125' }}>
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                  <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#2A7E4D' }}>
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#6C937C' }}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Energy flow lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute opacity-60 animate-pulse"
                  style={{
                    left: `${40 + Math.random() * 20}%`,
                    top: `${30 + Math.random() * 40}%`,
                    width: '2px',
                    height: `${30 + Math.random() * 20}px`,
                    background: `linear-gradient(to bottom, #F47125, transparent)`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                    transform: `rotate(${Math.random() * 45 - 22.5}deg)`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Professional title */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-2 tracking-wider">
              SUMRY
            </h1>
            <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: '#F47125' }}></div>
            <p className="text-2xl font-medium" style={{ color: '#2A7E4D' }}>
              Solar Management & Repair System
            </p>
            <p className="text-lg mt-2 text-white/70">
              Professional Solar Panel Diagnostics & Maintenance
            </p>
          </div>

          {/* Professional feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center group">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#166936' }}
              >
                <Battery className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-white/80">Battery Analysis</span>
            </div>
            
            <div className="text-center group">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#F47125' }}
              >
                <Sun className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-white/80">Solar Monitoring</span>
            </div>
            
            <div className="text-center group">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#2A7E4D' }}
              >
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-white/80">Repair Tools</span>
            </div>
            
            <div className="text-center group">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: '#6C937C' }}
              >
                <Zap className="w-8 h-8 text-white animate-pulse" />
              </div>
              <span className="text-sm font-medium text-white/80">Power Management</span>
            </div>
          </div>

          {/* Professional loading section */}
          <div className="w-80 mx-auto mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-white/80">System Initialization</span>
              <span className="text-sm font-medium text-white/80">{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, #166936 0%, #2A7E4D 50%, #F47125 100%)`
                }}
              />
            </div>
            <p className="text-sm text-white/60 font-medium">
              {progress < 30 ? 'Loading system modules...' : 
               progress < 60 ? 'Initializing diagnostic tools...' : 
               progress < 90 ? 'Connecting to solar network...' : 'System ready'}
            </p>
          </div>

          {/* Professional footer */}
          <div className="absolute bottom-0 mt-4 mb-2 sm:mt-8 sm:mb-4 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-xs text-white/50 font-medium mb-1">
              Professional Solar Panel Repair Department • Version 1.0.2
            </p>
            <p className="text-xs text-white/40 font-medium">
              Built by Ahmad Farachi/Dev • All Rights Reserved
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes energyFlow {
          0% { opacity: 0.3; transform: translateY(0px); }
          50% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0.3; transform: translateY(0px); }
        }
        
        .animate-energy {
          animation: energyFlow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default SolarIntroPage;