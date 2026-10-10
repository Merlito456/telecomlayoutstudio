import * as THREE from 'three';
import { LightingPreset } from '../types';
import { SkyWeatherRig } from './sky-types';

export function updateSkyAtmosphereLighting(
  rig: SkyWeatherRig,
  preset: LightingPreset,
  showSky: boolean
): void {
  const {
    scene,
    lightsGroup,
    skyGroup,
    skyMat,
    sunGroup,
    sunDiskMesh,
    sunCoronaMesh,
    sunAuraMesh,
    moonMesh,
    cloudTopMat,
    cloudBaseMat,
  } = rig;

  while (lightsGroup.children.length > 0) {
    lightsGroup.remove(lightsGroup.children[0]);
  }

  skyGroup.visible = showSky;

  if (preset === 'daylight') {
    if (showSky) {
      scene.background = null;
      scene.fog = new THREE.FogExp2(0xbcd9f2, 0.00065);

      skyMat.uniforms.uZenithColor.value.setHex(0x19539b);
      skyMat.uniforms.uMidColor.value.setHex(0x4ea5ea);
      skyMat.uniforms.uHorizonColor.value.setHex(0xc8e4fc);
      skyMat.uniforms.uGroundColor.value.setHex(0xb2d3ed);
      skyMat.uniforms.uSunPosition.value.set(120, 180, 100);
      skyMat.uniforms.uSunColor.value.setHex(0xfff4d4);
      skyMat.uniforms.uSunIntensity.value = 1.4;
      skyMat.uniforms.uIsNight.value = 0.0;

      const dir = new THREE.Vector3(120, 180, 100).normalize();
      sunGroup.position.copy(dir.multiplyScalar(1850));

      sunDiskMesh.visible = true;
      (sunDiskMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
      sunCoronaMesh.visible = true;
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffe8aa);
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).opacity = 0.88;
      sunAuraMesh.visible = true;
      (sunAuraMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffdf90);
      (sunAuraMesh.material as THREE.MeshBasicMaterial).opacity = 0.4;
      moonMesh.visible = false;

      cloudTopMat.color.setHex(0xffffff);
      cloudTopMat.opacity = 0.88;
      cloudBaseMat.color.setHex(0xd0e0ee);
      cloudBaseMat.opacity = 0.84;
    } else {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.0012);
    }

    const sun = new THREE.DirectionalLight(0xfff7e6, 2.4);
    sun.position.set(120, 180, 100);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 600;
    const d = 160;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0004;
    lightsGroup.add(sun);

    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x64748b, 0.7);
    lightsGroup.add(hemi);

    const amb = new THREE.AmbientLight(0xffffff, 0.25);
    lightsGroup.add(amb);
  } else if (preset === 'sunset') {
    if (showSky) {
      scene.background = null;
      scene.fog = new THREE.FogExp2(0x8a4040, 0.00085);

      skyMat.uniforms.uZenithColor.value.setHex(0x1e1338);
      skyMat.uniforms.uMidColor.value.setHex(0x732d52);
      skyMat.uniforms.uHorizonColor.value.setHex(0xff7836);
      skyMat.uniforms.uGroundColor.value.setHex(0x9c4136);
      skyMat.uniforms.uSunPosition.value.set(180, 50, 90);
      skyMat.uniforms.uSunColor.value.setHex(0xff9944);
      skyMat.uniforms.uSunIntensity.value = 1.8;
      skyMat.uniforms.uIsNight.value = 0.0;

      const dir = new THREE.Vector3(180, 50, 90).normalize();
      sunGroup.position.copy(dir.multiplyScalar(1850));

      sunDiskMesh.visible = true;
      (sunDiskMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffa040);
      sunCoronaMesh.visible = true;
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff7722);
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).opacity = 0.95;
      sunAuraMesh.visible = true;
      (sunAuraMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff5510);
      (sunAuraMesh.material as THREE.MeshBasicMaterial).opacity = 0.55;
      moonMesh.visible = false;

      cloudTopMat.color.setHex(0xffd3a4);
      cloudTopMat.opacity = 0.92;
      cloudBaseMat.color.setHex(0x6e3852);
      cloudBaseMat.opacity = 0.88;
    } else {
      scene.background = new THREE.Color(0x1e1526);
      scene.fog = new THREE.FogExp2(0x1e1526, 0.0014);
    }

    const sun = new THREE.DirectionalLight(0xff8c42, 2.8);
    sun.position.set(180, 50, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 600;
    const d = 180;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0004;
    lightsGroup.add(sun);

    const hemi = new THREE.HemisphereLight(0xfed7aa, 0x3b1d11, 0.6);
    lightsGroup.add(hemi);

    const amb = new THREE.AmbientLight(0xfdba74, 0.2);
    lightsGroup.add(amb);
  } else if (preset === 'night') {
    if (showSky) {
      scene.background = null;
      scene.fog = new THREE.FogExp2(0x0a101d, 0.0012);

      skyMat.uniforms.uZenithColor.value.setHex(0x030611);
      skyMat.uniforms.uMidColor.value.setHex(0x081024);
      skyMat.uniforms.uHorizonColor.value.setHex(0x0f1a30);
      skyMat.uniforms.uGroundColor.value.setHex(0x070c18);
      skyMat.uniforms.uSunPosition.value.set(-80, 150, -80);
      skyMat.uniforms.uSunColor.value.setHex(0x5599ff);
      skyMat.uniforms.uSunIntensity.value = 0.9;
      skyMat.uniforms.uIsNight.value = 1.0;

      const dir = new THREE.Vector3(-80, 150, -80).normalize();
      sunGroup.position.copy(dir.multiplyScalar(1850));

      sunDiskMesh.visible = false;
      sunCoronaMesh.visible = true;
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
      (sunCoronaMesh.material as THREE.MeshBasicMaterial).opacity = 0.5;
      sunAuraMesh.visible = true;
      (sunAuraMesh.material as THREE.MeshBasicMaterial).color.setHex(0x1e3a8a);
      (sunAuraMesh.material as THREE.MeshBasicMaterial).opacity = 0.35;
      moonMesh.visible = true;

      cloudTopMat.color.setHex(0x243248);
      cloudTopMat.opacity = 0.72;
      cloudBaseMat.color.setHex(0x0f1826);
      cloudBaseMat.opacity = 0.68;
    } else {
      scene.background = new THREE.Color(0x050811);
      scene.fog = new THREE.FogExp2(0x050811, 0.0018);
    }

    const moon = new THREE.DirectionalLight(0x38bdf8, 0.4);
    moon.position.set(-80, 150, -80);
    lightsGroup.add(moon);

    const hemi = new THREE.HemisphereLight(0x1e293b, 0x050811, 0.3);
    lightsGroup.add(hemi);

    const floodPositions = [
      { x: -70, y: 35, z: -70 },
      { x: 70, y: 35, z: -70 },
      { x: 70, y: 35, z: 70 },
      { x: -70, y: 35, z: 70 },
    ];

    for (const pos of floodPositions) {
      const spot = new THREE.SpotLight(0xfef08a, 2.5, 180, Math.PI / 4, 0.4, 1.2);
      spot.position.set(pos.x, pos.y, pos.z);
      spot.target.position.set(0, 0, 0);
      spot.castShadow = true;
      spot.shadow.mapSize.width = 1024;
      spot.shadow.mapSize.height = 1024;
      lightsGroup.add(spot);
      lightsGroup.add(spot.target);

      const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), lampMat);
      lamp.position.copy(spot.position);
      lightsGroup.add(lamp);
    }
  }
}
