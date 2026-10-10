import * as THREE from 'three';

export interface CloudBank {
  group: THREE.Group;
  speedX: number;
  speedZ: number;
}

export interface SkyWeatherRig {
  skyGroup: THREE.Group;
  skyMat: THREE.ShaderMaterial;
  sunGroup: THREE.Group;
  sunDiskMesh: THREE.Mesh;
  sunCoronaMesh: THREE.Mesh;
  sunAuraMesh: THREE.Mesh;
  moonMesh: THREE.Mesh;
  cirrusMesh: THREE.Mesh;
  cumulusCloudsGroup: THREE.Group;
  cloudTopMat: THREE.SpriteMaterial;
  cloudBaseMat: THREE.SpriteMaterial;
  cloudBanks: CloudBank[];
  lightsGroup: THREE.Group;
  scene: THREE.Scene;
}
