import React from 'react';
import { TreeMorphState } from '../types';

interface UIOverlayProps {
  treeState: TreeMorphState;
  onToggle: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ treeState, onToggle }) => {
  const isTree = treeState === TreeMorphState.TREE_SHAPE;

  return (
    <main className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-start space-y-2 pointer-events-auto">
        <h1 className="text-4xl md:text-6xl font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-yellow-500/50"></div>
        <p className="font-serif-display text-emerald-100/80 text-sm md:text-base tracking-widest uppercase">
          Signature Collection
        </p>
      </header>

      {/* Center Action (Bottom) */}
      <div className="w-full flex flex-col items-center justify-end pb-8 pointer-events-auto">
        <div className="relative group">
           {/* Glow Effect behind button */}
           <div className={`absolute -inset-1 bg-gradient-to-r from-yellow-600 to-emerald-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 ${isTree ? 'animate-pulse' : ''}`}></div>
           
           <button 
            onClick={onToggle}
            className="relative px-8 py-4 bg-black/80 border border-yellow-500/30 rounded-full backdrop-blur-md transition-all duration-500 hover:bg-black/90 hover:border-yellow-400 hover:scale-105 active:scale-95 flex items-center space-x-3 overflow-hidden"
           >
             <span className={`w-2 h-2 rounded-full ${isTree ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-yellow-400 shadow-[0_0_10px_#facc15]'} transition-colors duration-500`}></span>
             <span className="font-cinzel text-yellow-100 tracking-widest text-lg min-w-[140px] text-center">
               {isTree ? "SCATTER" : "ASSEMBLE"}
             </span>
           </button>
        </div>
        
        <p className="mt-4 font-serif-display text-emerald-500/50 text-xs tracking-[0.2em]">
          INTERACTIVE 3D EXPERIENCE
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 right-0 p-12 opacity-30">
        <div className="w-32 h-[1px] bg-gradient-to-l from-yellow-500 to-transparent"></div>
        <div className="absolute top-12 right-12 w-[1px] h-32 bg-gradient-to-b from-yellow-500 to-transparent"></div>
      </div>
      <div className="absolute bottom-0 left-0 p-12 opacity-30">
        <div className="w-32 h-[1px] bg-gradient-to-r from-yellow-500 to-transparent"></div>
        <div className="absolute bottom-12 left-12 w-[1px] h-32 bg-gradient-to-t from-yellow-500 to-transparent"></div>
      </div>
    </main>
  );
};