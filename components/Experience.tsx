import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TreeMorphState } from '../types';
import { TreeParticles } from './TreeParticles';
import { COLORS } from '../constants';

interface ExperienceProps {
  treeState: TreeMorphState;
}

const Rig = () => {
  useFrame((state) => {
    // Subtle mouse parallax
    const t = state.clock.getElapsedTime();
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, 25 * Math.sin(t * 0.1), 0.01);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 25 * Math.cos(t * 0.1), 0.01);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export const Experience: React.FC<ExperienceProps> = ({ treeState }) => {
  return (
    <Canvas 
      shadows
      dpr={[1, 2]} // Quality scaling
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ReinhardToneMapping, 
        toneMappingExposure: 1.5 
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 30]} fov={50} />
      <Rig />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color="#001e0f" />
      <spotLight 
        position={[10, 40, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2000} 
        color={COLORS.GOLD_METALLIC} 
        castShadow 
        shadow-bias={-0.0001}
      />
      <pointLight position={[-10, -10, -10]} intensity={500} color={COLORS.EMERALD_LIGHT} />
      <pointLight position={[10, 10, 10]} intensity={500} color={COLORS.GOLD_ROSE} />

      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Background Ambience */}
      <color attach="background" args={[COLORS.VOID]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={[COLORS.VOID, 15, 60]} />

      {/* Main Content */}
      <group position={[0, -5, 0]}>
        <TreeParticles treeState={treeState} />
      </group>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
         {/* Floating Title Logic could go here, but doing it in HTML overlay for sharpness */}
      </Float>

      {/* Post Processing - The "Arix Signature" Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.5} // Don't go below the floor
      />
    </Canvas>
  );
};