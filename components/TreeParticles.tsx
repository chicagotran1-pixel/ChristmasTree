import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeMorphState, ParticleData } from '../types';
import { TREE_CONFIG, COLORS, ANIMATION_SPEED } from '../constants';

interface TreeParticlesProps {
  treeState: TreeMorphState;
}

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();

// --- Generator Functions ---

const getRandomScatterPos = () => {
  const r = 30 * Math.cbrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Needles: Green base
const generateNeedles = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    const hNorm = i / count; 
    const hRandom = Math.max(0, Math.min(1, hNorm + (Math.random() * 0.1 - 0.05)));
    const y = (hRandom * TREE_CONFIG.treeHeight) - (TREE_CONFIG.treeHeight / 2);
    const radiusAtHeight = TREE_CONFIG.baseRadius * (1 - hRandom);
    
    // Dense spiral
    const spirals = 15; 
    const angle = hRandom * Math.PI * 2 * spirals + (Math.random() * Math.PI / 2);
    const thickness = Math.random() * 1.5;
    const finalRadius = Math.max(0.1, radiusAtHeight - thickness);

    particles.push({
      scatterPosition: getRandomScatterPos(),
      treePosition: new THREE.Vector3(Math.cos(angle) * finalRadius, y, Math.sin(angle) * finalRadius),
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: new THREE.Vector3(1, 1, 1).multiplyScalar(0.5 + Math.random() * 1.5),
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
};

// Ornaments: Gold (reduced), Silver, Red
const generateOrnaments = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    const hNorm = Math.random();
    const y = (hNorm * TREE_CONFIG.treeHeight) - (TREE_CONFIG.treeHeight / 2);
    const radiusAtHeight = TREE_CONFIG.baseRadius * (1 - hNorm);
    const finalRadius = Math.max(0.2, radiusAtHeight - 0.2); // Sit slightly outside or inside
    const angle = Math.random() * Math.PI * 2;

    // Color Logic: 20% Gold, 40% Silver, 40% Red
    const randType = Math.random();
    let colorHex = COLORS.GOLD_METALLIC;
    if (randType > 0.2 && randType <= 0.6) colorHex = COLORS.SILVER_METALLIC;
    if (randType > 0.6) colorHex = COLORS.RED_VELVET;

    particles.push({
      scatterPosition: getRandomScatterPos(),
      treePosition: new THREE.Vector3(Math.cos(angle) * finalRadius, y, Math.sin(angle) * finalRadius),
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: new THREE.Vector3(1, 1, 1).multiplyScalar(0.8 + Math.random() * 0.5),
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: new THREE.Color(colorHex)
    });
  }
  return particles;
};

// Ribbons: Pink and Silver spirals
const generateRibbons = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  const bands = 2; // Two distinct ribbons
  const loops = 6; // How many times it wraps around

  for (let i = 0; i < count; i++) {
    const bandIdx = i % bands; // 0 or 1
    const t = Math.floor(i / bands) / (count / bands); // 0 to 1 along the ribbon

    const y = (t * TREE_CONFIG.treeHeight) - (TREE_CONFIG.treeHeight / 2);
    const radiusAtHeight = TREE_CONFIG.baseRadius * (1 - t) + 0.5; // Slightly outside needles
    
    // Spiral angle
    const angleOffset = bandIdx * Math.PI; // Separate by 180 deg
    const angle = (t * Math.PI * 2 * loops) + angleOffset;

    // Add some noise to make it look like tinsel, not a perfect line
    const jitter = new THREE.Vector3((Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3, (Math.random()-0.5)*0.3);

    const basePos = new THREE.Vector3(Math.cos(angle) * radiusAtHeight, y, Math.sin(angle) * radiusAtHeight);
    
    const color = bandIdx === 0 ? COLORS.PINK_RIBBON : COLORS.SILVER_BRIGHT;

    particles.push({
      scatterPosition: getRandomScatterPos(),
      treePosition: basePos.add(jitter),
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: new THREE.Vector3(0.15, 0.4, 0.05).multiplyScalar(0.5 + Math.random()), // Flat strips
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      color: new THREE.Color(color)
    });
  }
  return particles;
};

// Confetti: Red and Pink, scattered on surface
const generateConfetti = (count: number): ParticleData[] => {
  const particles: ParticleData[] = [];
  for (let i = 0; i < count; i++) {
    const hNorm = Math.random();
    const y = (hNorm * TREE_CONFIG.treeHeight) - (TREE_CONFIG.treeHeight / 2);
    const radiusAtHeight = TREE_CONFIG.baseRadius * (1 - hNorm);
    const finalRadius = radiusAtHeight + 0.4; // Hovering slightly
    const angle = Math.random() * Math.PI * 2;

    const color = Math.random() > 0.5 ? COLORS.RED_BRIGHT : COLORS.PINK_LIGHT;

    particles.push({
      scatterPosition: getRandomScatterPos(),
      treePosition: new THREE.Vector3(Math.cos(angle) * finalRadius, y, Math.sin(angle) * finalRadius),
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: new THREE.Vector3(0.15, 0.15, 0.01).multiplyScalar(0.8 + Math.random() * 0.5), // Tiny squares
      speed: 0.1 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      color: new THREE.Color(color)
    });
  }
  return particles;
};

// Star: Single particle data
const generateStar = (): ParticleData => {
  return {
    scatterPosition: getRandomScatterPos().multiplyScalar(1.2), // Farther out
    treePosition: new THREE.Vector3(0, TREE_CONFIG.treeHeight / 2 + 0.5, 0),
    rotation: [0, 0, 0],
    scale: new THREE.Vector3(1.2, 1.2, 1.2),
    speed: 0.1,
    phase: 0
  };
};

export const TreeParticles: React.FC<TreeParticlesProps> = ({ treeState }) => {
  const needlesRef = useRef<THREE.InstancedMesh>(null);
  const ornamentsRef = useRef<THREE.InstancedMesh>(null);
  const ribbonsRef = useRef<THREE.InstancedMesh>(null);
  const confettiRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Mesh>(null);

  // Data Generation
  const needlesData = useMemo(() => generateNeedles(TREE_CONFIG.needleCount), []);
  const ornamentsData = useMemo(() => generateOrnaments(TREE_CONFIG.ornamentCount), []);
  const ribbonsData = useMemo(() => generateRibbons(TREE_CONFIG.ribbonCount), []);
  const confettiData = useMemo(() => generateConfetti(TREE_CONFIG.confettiCount), []);
  const starData = useMemo(() => generateStar(), []);

  // Star Shape & Settings
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.5;
    const innerRadius = 0.7;
    
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.sin(angle) * radius;
        const y = Math.cos(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const starSettings = useMemo(() => ({
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 3
  }), []);

  // Apply colors and centers once
  useLayoutEffect(() => {
    if (ornamentsRef.current) {
      ornamentsData.forEach((d, i) => {
        if (d.color) ornamentsRef.current!.setColorAt(i, d.color);
      });
      ornamentsRef.current.instanceColor!.needsUpdate = true;
    }
    if (ribbonsRef.current) {
      ribbonsData.forEach((d, i) => {
        if (d.color) ribbonsRef.current!.setColorAt(i, d.color);
      });
      ribbonsRef.current.instanceColor!.needsUpdate = true;
    }
    if (confettiRef.current) {
      confettiData.forEach((d, i) => {
        if (d.color) confettiRef.current!.setColorAt(i, d.color);
      });
      confettiRef.current.instanceColor!.needsUpdate = true;
    }
    if (starRef.current) {
      starRef.current.geometry.center();
    }
  }, [ornamentsData, ribbonsData, confettiData]);

  // Animation State
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useFrame((state, delta) => {
    targetProgress.current = treeState === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const step = delta * ANIMATION_SPEED;
    currentProgress.current = THREE.MathUtils.lerp(currentProgress.current, targetProgress.current, step);
    
    const t = currentProgress.current;
    const time = state.clock.getElapsedTime();

    // Reusable update function
    const updateMesh = (
      ref: React.RefObject<THREE.InstancedMesh>, 
      data: ParticleData[], 
      orientToCenter: boolean = false,
      spinSpeed: number = 0
    ) => {
      if (!ref.current) return;
      
      data.forEach((d, i) => {
        // Drift
        const drift = new THREE.Vector3(
          Math.sin(time * d.speed + d.phase) * 0.5,
          Math.cos(time * d.speed + d.phase) * 0.5,
          Math.sin(time * d.speed * 0.5 + d.phase) * 0.5
        );

        // Position Lerp
        tempVec3.copy(d.scatterPosition).add(drift).lerp(d.treePosition, t);
        tempObject.position.copy(tempVec3);

        // Rotation & Scale
        if (orientToCenter && t > 0.8) {
           tempObject.rotation.set(0, 0, 0);
           tempObject.lookAt(0, tempObject.position.y, 0);
           tempObject.rotateY(Math.PI); 
           tempObject.rotateX(-Math.PI / 4);
        } else {
           tempObject.rotation.set(
             d.rotation[0] + time * spinSpeed, 
             d.rotation[1] + time * spinSpeed, 
             d.rotation[2]
           );
        }

        tempObject.scale.copy(d.scale);
        tempObject.updateMatrix();
        ref.current!.setMatrixAt(i, tempObject.matrix);
      });
      ref.current.instanceMatrix.needsUpdate = true;
    };

    updateMesh(needlesRef, needlesData, true, 0.1);
    updateMesh(ornamentsRef, ornamentsData, false, 0.2);
    updateMesh(ribbonsRef, ribbonsData, false, 0.5); // Ribbons tumble a bit more
    updateMesh(confettiRef, confettiData, false, 0.3);

    // Update Star
    if (starRef.current) {
       const d = starData;
       const drift = new THREE.Vector3(
          Math.sin(time * d.speed) * 1, 
          Math.cos(time * d.speed) * 1, 
          0
       );
       tempVec3.copy(d.scatterPosition).add(drift).lerp(d.treePosition, t);
       starRef.current.position.copy(tempVec3);
       starRef.current.rotation.y += delta * 0.5; // Slow spin
       
       // Pulse scale
       const pulse = 1 + Math.sin(time * 2) * 0.1;
       const scale = d.scale.clone().multiplyScalar(pulse);
       starRef.current.scale.copy(scale);
    }
  });

  return (
    <group>
      {/* Needles */}
      <instancedMesh ref={needlesRef} args={[undefined, undefined, TREE_CONFIG.needleCount]} castShadow receiveShadow>
        <coneGeometry args={[0.15, 0.6, 3]} /> 
        <meshStandardMaterial color={COLORS.EMERALD_DEEP} roughness={0.4} metalness={0.6} emissive={COLORS.EMERALD_DEEP} emissiveIntensity={0.2} />
      </instancedMesh>

      {/* Ornaments (Multi-color via instanceColor) */}
      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, TREE_CONFIG.ornamentCount]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial roughness={0.15} metalness={0.9} envMapIntensity={2.5} />
      </instancedMesh>

      {/* Ribbons (Multi-color) */}
      <instancedMesh ref={ribbonsRef} args={[undefined, undefined, TREE_CONFIG.ribbonCount]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.2} metalness={0.8} />
      </instancedMesh>

      {/* Confetti (Multi-color) */}
      <instancedMesh ref={confettiRef} args={[undefined, undefined, TREE_CONFIG.confettiCount]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial side={THREE.DoubleSide} roughness={0.5} metalness={0.4} />
      </instancedMesh>

      {/* Star */}
      <mesh ref={starRef} castShadow>
        <extrudeGeometry args={[starShape, starSettings]} />
        <meshStandardMaterial color={COLORS.GOLD_METALLIC} emissive={COLORS.GOLD_METALLIC} emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  );
};