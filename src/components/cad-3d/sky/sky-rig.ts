import * as THREE from 'three';
import {
  createCirrusTexture,
  createCloudPuffTexture,
  createMoonTexture,
  createSunCoronaTexture,
} from '../textures';
import { CloudBank, SkyWeatherRig } from './sky-types';

export function createSkyWeatherSystem(scene: THREE.Scene, showSky: boolean): SkyWeatherRig {
  const lightsGroup = new THREE.Group();
  scene.add(lightsGroup);

  const skyGroup = new THREE.Group();
  scene.add(skyGroup);
  skyGroup.visible = showSky;

  const cloudPuffTex = createCloudPuffTexture();
  const cirrusTex = createCirrusTexture();
  const sunCoronaTex = createSunCoronaTexture();
  const moonTex = createMoonTexture();

  // Atmospheric Sky Dome Shader Mesh
  const skyGeo = new THREE.SphereGeometry(2100, 36, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uZenithColor: { value: new THREE.Color(0x19539b) },
      uMidColor: { value: new THREE.Color(0x4ea5ea) },
      uHorizonColor: { value: new THREE.Color(0xc8e4fc) },
      uGroundColor: { value: new THREE.Color(0xb2d3ed) },
      uSunPosition: { value: new THREE.Vector3(120, 180, 100) },
      uSunColor: { value: new THREE.Color(0xfff4d4) },
      uSunIntensity: { value: 1.4 },
      uIsNight: { value: 0.0 },
      uTime: { value: 0.0 },
    },
    vertexShader: `
      varying vec3 vRay;
      void main() {
        vRay = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uZenithColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uGroundColor;
      uniform vec3 uSunPosition;
      uniform vec3 uSunColor;
      uniform float uSunIntensity;
      uniform float uIsNight;
      uniform float uTime;
      varying vec3 vRay;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      void main() {
        vec3 ray = normalize(vRay);
        float h = ray.y;

        vec3 skyColor;
        if (h > 0.0) {
          float tMid = smoothstep(0.0, 0.28, h);
          float tZenith = smoothstep(0.28, 0.95, h);
          vec3 lowerSky = mix(uHorizonColor, uMidColor, tMid);
          skyColor = mix(lowerSky, uZenithColor, tZenith);
        } else {
          float tGround = smoothstep(0.0, -0.22, h);
          skyColor = mix(uHorizonColor, uGroundColor, tGround);
        }

        vec3 sunDir = normalize(uSunPosition);
        float cosTheta = max(0.0, dot(ray, sunDir));

        if (uIsNight < 0.5) {
          float aureole = pow(cosTheta, 28.0) * 0.75 + pow(cosTheta, 6.0) * 0.25;
          skyColor += uSunColor * aureole * uSunIntensity;
        } else {
          vec3 starCoord = floor(ray * 420.0);
          float n = hash(starCoord);
          if (n > 0.988 && h > 0.04) {
            float twinkle = 0.65 + 0.35 * sin(uTime * 3.0 + n * 20.0);
            float starBright = pow((n - 0.988) / 0.012, 1.8) * twinkle * smoothstep(0.04, 0.22, h);
            skyColor += vec3(0.9, 0.95, 1.0) * starBright * 1.5;
          }
          float moonGlow = pow(cosTheta, 32.0) * 0.45 + pow(cosTheta, 8.0) * 0.15;
          skyColor += vec3(0.55, 0.75, 1.0) * moonGlow;
        }

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.renderOrder = -1000;
  skyGroup.add(skyMesh);

  // Sun & Corona Group
  const sunGroup = new THREE.Group();
  skyGroup.add(sunGroup);

  const sunDiskMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sunDiskMesh = new THREE.Mesh(new THREE.CircleGeometry(42, 32), sunDiskMat);
  sunGroup.add(sunDiskMesh);

  const sunCoronaMat = new THREE.MeshBasicMaterial({
    map: sunCoronaTex,
    color: 0xffe8aa,
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sunCoronaMesh = new THREE.Mesh(new THREE.PlaneGeometry(380, 380), sunCoronaMat);
  sunGroup.add(sunCoronaMesh);

  const sunAuraMat = new THREE.MeshBasicMaterial({
    map: sunCoronaTex,
    color: 0xffdf90,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sunAuraMesh = new THREE.Mesh(new THREE.PlaneGeometry(920, 920), sunAuraMat);
  sunGroup.add(sunAuraMesh);

  const moonMat = new THREE.MeshBasicMaterial({
    map: moonTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const moonMesh = new THREE.Mesh(new THREE.PlaneGeometry(85, 85), moonMat);
  moonMesh.visible = false;
  sunGroup.add(moonMesh);

  const cirrusMat = new THREE.MeshBasicMaterial({
    map: cirrusTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const cirrusGeo = new THREE.PlaneGeometry(2400, 2400);
  const cirrusMesh = new THREE.Mesh(cirrusGeo, cirrusMat);
  cirrusMesh.rotation.x = -Math.PI / 2;
  cirrusMesh.position.y = 520;
  skyGroup.add(cirrusMesh);

  const cumulusCloudsGroup = new THREE.Group();
  skyGroup.add(cumulusCloudsGroup);

  const cloudTopMat = new THREE.SpriteMaterial({
    map: cloudPuffTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const cloudBaseMat = new THREE.SpriteMaterial({
    map: cloudPuffTex,
    color: 0xd0e0ee,
    transparent: true,
    opacity: 0.84,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const cloudBanks: CloudBank[] = [];
  const cloudSeeds = [
    { x: -550, y: 190, z: -450, scale: 1.15 },
    { x: -320, y: 175, z: -280, scale: 0.95 },
    { x: -120, y: 215, z: -500, scale: 1.25 },
    { x: 140, y: 180, z: -380, scale: 1.05 },
    { x: 380, y: 200, z: -480, scale: 1.3 },
    { x: 560, y: 185, z: -220, scale: 0.9 },
    { x: -600, y: 170, z: -80, scale: 1.15 },
    { x: -280, y: 195, z: 20, scale: 1.2 },
    { x: 0, y: 220, z: -100, scale: 1.35 },
    { x: 260, y: 175, z: -60, scale: 1.0 },
    { x: 520, y: 210, z: 80, scale: 1.15 },
    { x: -480, y: 185, z: 260, scale: 1.1 },
    { x: -200, y: 170, z: 340, scale: 0.95 },
    { x: 80, y: 205, z: 280, scale: 1.2 },
    { x: 350, y: 190, z: 360, scale: 1.05 },
    { x: 580, y: 175, z: 420, scale: 1.1 },
    { x: -100, y: 195, z: 520, scale: 1.25 },
    { x: 220, y: 180, z: 540, scale: 0.9 },
  ];

  for (const cs of cloudSeeds) {
    const bankGroup = new THREE.Group();
    bankGroup.position.set(cs.x, cs.y, cs.z);

    const puffDefs = [
      { ox: 0, oy: 8, oz: 0, sx: 75 * cs.scale, sy: 55 * cs.scale, isTop: true },
      { ox: -25, oy: 6, oz: 15, sx: 60 * cs.scale, sy: 48 * cs.scale, isTop: true },
      { ox: 28, oy: 7, oz: -12, sx: 65 * cs.scale, sy: 50 * cs.scale, isTop: true },
      { ox: 10, oy: 12, oz: 18, sx: 55 * cs.scale, sy: 45 * cs.scale, isTop: true },
      { ox: -18, oy: 10, oz: -22, sx: 52 * cs.scale, sy: 42 * cs.scale, isTop: true },
      { ox: -50, oy: 2, oz: 5, sx: 55 * cs.scale, sy: 42 * cs.scale, isTop: true },
      { ox: 52, oy: 3, oz: -8, sx: 58 * cs.scale, sy: 44 * cs.scale, isTop: true },
      { ox: 38, oy: 1, oz: 28, sx: 48 * cs.scale, sy: 38 * cs.scale, isTop: true },
      { ox: -40, oy: 0, oz: -25, sx: 46 * cs.scale, sy: 36 * cs.scale, isTop: true },
      { ox: 0, oy: -10, oz: 0, sx: 85 * cs.scale, sy: 36 * cs.scale, isTop: false },
      { ox: -32, oy: -9, oz: 10, sx: 70 * cs.scale, sy: 34 * cs.scale, isTop: false },
      { ox: 35, oy: -11, oz: -10, sx: 72 * cs.scale, sy: 35 * cs.scale, isTop: false },
    ];

    for (const pd of puffDefs) {
      const mat = pd.isTop ? cloudTopMat : cloudBaseMat;
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(pd.ox, pd.oy, pd.oz);
      sprite.scale.set(pd.sx, pd.sy, 1);
      bankGroup.add(sprite);
    }

    cumulusCloudsGroup.add(bankGroup);
    cloudBanks.push({
      group: bankGroup,
      speedX: 0.12 + Math.random() * 0.08,
      speedZ: 0.03 + Math.random() * 0.04,
    });
  }

  return {
    skyGroup,
    skyMat,
    sunGroup,
    sunDiskMesh,
    sunCoronaMesh,
    sunAuraMesh,
    moonMesh,
    cirrusMesh,
    cumulusCloudsGroup,
    cloudTopMat,
    cloudBaseMat,
    cloudBanks,
    lightsGroup,
    scene,
  };
}

export function animateSkyWeather(
  rig: SkyWeatherRig,
  dt: number,
  cameraPos: THREE.Vector3,
  showSky: boolean,
  elapsedTime: number
): void {
  if (rig.skyMat) {
    rig.skyMat.uniforms.uTime.value = elapsedTime;
  }
  if (rig.sunGroup) {
    rig.sunGroup.lookAt(cameraPos);
  }
  if (rig.cirrusMesh && showSky) {
    rig.cirrusMesh.rotation.z += dt * 0.0015;
  }
  if (showSky && rig.cloudBanks.length > 0) {
    for (let i = 0; i < rig.cloudBanks.length; i++) {
      const bank = rig.cloudBanks[i];
      bank.group.position.x += bank.speedX * dt * 45;
      bank.group.position.z += bank.speedZ * dt * 45;
      if (bank.group.position.x > 750) {
        bank.group.position.x = -750;
        bank.group.position.z = -650 + Math.random() * 1300;
      }
    }
  }
}
