import React, { useState, useCallback } from 'react';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = useCallback(() => {
    setTreeState((prev) => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#010806] text-white overflow-hidden selection:bg-yellow-500/30">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience treeState={treeState} />
      </div>

      {/* UI Layer */}
      <UIOverlay treeState={treeState} onToggle={toggleState} />
    </div>
  );
};

export default App;