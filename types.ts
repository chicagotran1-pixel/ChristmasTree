import { Vector3, Color } from 'three';

export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  scatterPosition: Vector3;
  treePosition: Vector3;
  rotation: [number, number, number];
  scale: Vector3;
  speed: number; // For floating animation
  phase: number; // For floating animation offset
  color?: Color;
}

export interface TreeConfig {
  needleCount: number;
  ornamentCount: number;
  ribbonCount: number;
  confettiCount: number;
  treeHeight: number;
  baseRadius: number;
}