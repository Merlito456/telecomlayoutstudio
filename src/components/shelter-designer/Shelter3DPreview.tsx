/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { InteriorEquipmentItem } from './catalog';

export interface Shelter3DCameraState {
  angleX: number;
  angleY: number;
  distance: number;
  panX: number;
  panY: number;
  panZ: number;
  isInitialized: boolean;
}

export interface Shelter3DPreviewProps {
  roomLengthMm: number;
  roomWidthMm: number;
  shelterHeightM: number;
  wallThickMm: number;
  doorWall?: 'north' | 'south' | 'east' | 'west';
  doorOffsetPct?: number;
  doorWidthMm?: number;
  cableWall?: 'north' | 'south' | 'east' | 'west' | 'none';
  cableOffsetPct?: number;
  cableHoleDiameterMm?: number;
  cableHoleElevationMm?: number;
  items: InteriorEquipmentItem[];
  cameraStateRef?: React.MutableRefObject<Shelter3DCameraState>;
  roofMode?: 'cutaway' | 'transparent' | 'solid';
  renderStyle?: 'photo' | 'cad';
}

// Global persistent camera state so editing the shelter NEVER restarts the view
const globalShelterCameraState: Shelter3DCameraState = {
  angleX: 0.82,
  angleY: 0.6,
  distance: 0,
  panX: 0,
  panY: 0,
  panZ: 0,
  isInitialized: false,
};

export const Shelter3DPreview: React.FC<Shelter3DPreviewProps> = ({
  roomLengthMm,
  roomWidthMm,
  shelterHeightM,
  wallThickMm,
  doorWall = 'south',
  doorOffsetPct = 35,
  doorWidthMm = 900,
  cableWall = 'east',
  cableOffsetPct = 50,
  cableHoleDiameterMm = 250,
  cableHoleElevationMm,
  items,
  cameraStateRef: externalCameraStateRef,
  roofMode = 'cutaway',
  renderStyle = 'photo',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Use external ref or global state
  const camState = externalCameraStateRef || { current: globalShelterCameraState };

  // Three.js scene instances kept across prop edits
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const roomGrpRef = useRef<THREE.Group | null>(null);
  const shelterHeightMRef = useRef<number>(shelterHeightM);

  shelterHeightMRef.current = shelterHeightM;

  // 1. Scene Mounting Lifecycle: runs only once on mount
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(12, 22, 16);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const roomGrp = new THREE.Group();
    scene.add(roomGrp);
    roomGrpRef.current = roomGrp;

    // Initialize camera position only if not initialized yet
    const scale3D = 6.0;
    const w3D = (roomLengthMm / 1000) * scale3D;
    const d3D = (roomWidthMm / 1000) * scale3D;
    const defaultDistance = Math.max(w3D, d3D) * 1.8;

    if (!camState.current.isInitialized || camState.current.distance <= 0) {
      camState.current.angleX = 0.82;
      camState.current.angleY = 0.6;
      camState.current.distance = Math.max(20, defaultDistance);
      camState.current.panX = 0;
      camState.current.panY = 0;
      camState.current.panZ = 0;
      camState.current.isInitialized = true;
    }

    // Sync global state with active state
    if (camState.current !== globalShelterCameraState) {
      Object.assign(globalShelterCameraState, camState.current);
    }

    // Mouse Interaction
    let isMouseDown = false;
    let isPanMode = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      isPanMode = e.button === 2 || e.button === 1 || e.shiftKey;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (isPanMode) {
        const panFactor = camState.current.distance / 1200;
        camState.current.panX -=
          (Math.cos(camState.current.angleY) * dx - Math.sin(camState.current.angleY) * dy) * panFactor;
        camState.current.panZ +=
          (Math.sin(camState.current.angleY) * dx + Math.cos(camState.current.angleY) * dy) * panFactor;
        camState.current.panY += dy * panFactor;
      } else {
        camState.current.angleY -= dx * 0.008;
        camState.current.angleX = Math.max(0.08, Math.min(Math.PI / 2.15, camState.current.angleX + dy * 0.008));
      }

      // Keep global state synced
      Object.assign(globalShelterCameraState, camState.current);
    };

    const onMouseUp = () => {
      isMouseDown = false;
      isPanMode = false;
    };

    const onWheel = (e: WheelEvent) => {
      camState.current.distance = Math.max(6, Math.min(80, camState.current.distance + e.deltaY * 0.03));
      Object.assign(globalShelterCameraState, camState.current);
      e.preventDefault();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    domEl.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    // Handle element resize (e.g. switching from 2D floorplan to 3D tab or window resize)
    const handleResize = () => {
      if (!mount || !rendererRef.current || !cameraRef.current) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mount);
    window.addEventListener('resize', handleResize);

    // Continuous 60fps render loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;

      const angleX = camState.current.angleX;
      const angleY = camState.current.angleY;
      const distance = camState.current.distance;
      const px = camState.current.panX;
      const py = camState.current.panY;
      const pz = camState.current.panZ;
      const h3D = shelterHeightMRef.current * scale3D;

      cameraRef.current.position.x = px + Math.sin(angleY) * Math.cos(angleX) * distance;
      cameraRef.current.position.y = py + Math.sin(angleX) * distance;
      cameraRef.current.position.z = pz + Math.cos(angleY) * Math.cos(angleX) * distance;
      cameraRef.current.lookAt(px, h3D * 0.4 + py, pz);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      domEl.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
      scene.clear();
      mount.innerHTML = '';
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      roomGrpRef.current = null;
    };
  }, []); // Run ONCE on mount so viewing angle NEVER resets

  // 2. Room & Equipment Mesh Rebuild: runs whenever props change WITHOUT restarting the view
  useEffect(() => {
    const roomGrp = roomGrpRef.current;
    if (!roomGrp) return;

    // Dispose old meshes inside roomGrp
    while (roomGrp.children.length > 0) {
      const child = roomGrp.children[0] as any;
      roomGrp.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
        else child.material.dispose();
      }
    }

    const isCad = renderStyle === 'cad';
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isCad ? 0x061122 : 0x090d16);
    }

    const scale3D = 6.0;
    const w3D = (roomLengthMm / 1000) * scale3D;
    const d3D = (roomWidthMm / 1000) * scale3D;
    const h3D = shelterHeightM * scale3D;
    const t3D = (wallThickMm / 1000) * scale3D;

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 1.5,
    });

    // 1. Floor Slab
    const floorMat = isCad
      ? new THREE.MeshStandardMaterial({ color: 0x07152b, roughness: 0.85, metalness: 0.1 })
      : new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w3D, 0.4, d3D), floorMat);
    floor.position.y = 0.2;
    floor.receiveShadow = true;
    if (isCad) {
      floor.add(new THREE.LineSegments(new THREE.EdgesGeometry(floor.geometry), edgeLineMat));
    }
    roomGrp.add(floor);

    // Floor grid lines (Engineering blueprint grid in CAD mode, ESD tile grid in Photo mode)
    const gridMat = new THREE.MeshBasicMaterial({
      color: isCad ? 0x0284c7 : 0x334155,
      transparent: isCad,
      opacity: isCad ? 0.35 : 1.0,
    });
    for (let gx = -w3D / 2 + 1; gx < w3D / 2; gx += 2) {
      const gLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, d3D), gridMat);
      gLine.position.set(gx, 0.21, 0);
      roomGrp.add(gLine);
    }
    for (let gz = -d3D / 2 + 1; gz < d3D / 2; gz += 2) {
      const gLine = new THREE.Mesh(new THREE.BoxGeometry(w3D, 0.42, 0.04), gridMat);
      gLine.position.set(0, 0.21, gz);
      roomGrp.add(gLine);
    }

    // 2. Perimeter Walls with Doorway Opening
    const wallMat = isCad
      ? new THREE.MeshStandardMaterial({
          color: 0x0c2548,
          roughness: 0.6,
          metalness: 0.2,
          transparent: true,
          opacity: roofMode === 'cutaway' ? 0.72 : 0.88,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.7,
          transparent: roofMode !== 'solid',
          opacity: roofMode === 'cutaway' ? 0.75 : roofMode === 'transparent' ? 0.65 : 1.0,
        });
    const doorW3D = (doorWidthMm / 1000) * scale3D;
    const doorH3D = Math.min(h3D - 1.2, 2.1 * scale3D);

    const addMeshWithEdges = (mesh: THREE.Mesh) => {
      if (isCad) {
        const edgeSeg = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          edgeLineMat
        );
        mesh.add(edgeSeg);
      }
      roomGrp.add(mesh);
    };

    const buildWallWithDoor = (
      wall: 'north' | 'south' | 'east' | 'west',
      hasDoor: boolean,
      offsetPct: number
    ) => {
      const isHoriz = wall === 'north' || wall === 'south';
      const span = isHoriz ? w3D : d3D;
      const zPos = wall === 'north' ? -d3D / 2 - t3D / 2 : wall === 'south' ? d3D / 2 + t3D / 2 : 0;
      const xPos = wall === 'west' ? -w3D / 2 - t3D / 2 : wall === 'east' ? w3D / 2 + t3D / 2 : 0;

      if (!hasDoor) {
        const mesh = new THREE.Mesh(
          isHoriz
            ? new THREE.BoxGeometry(w3D + t3D * 2, h3D, t3D)
            : new THREE.BoxGeometry(t3D, h3D, d3D),
          wallMat
        );
        mesh.position.set(xPos, h3D / 2 + 0.4, zPos);
        addMeshWithEdges(mesh);
        return;
      }

      const dCenter = (offsetPct / 100 - 0.5) * span;
      const leftLen = Math.max(0.4, dCenter - doorW3D / 2 + span / 2);
      const rightLen = Math.max(0.4, span / 2 - (dCenter + doorW3D / 2));

      if (isHoriz) {
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(leftLen, h3D, t3D), wallMat);
        leftWall.position.set(-span / 2 + leftLen / 2, h3D / 2 + 0.4, zPos);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(rightLen, h3D, t3D), wallMat);
        rightWall.position.set(span / 2 - rightLen / 2, h3D / 2 + 0.4, zPos);
        const headerH = Math.max(0.4, h3D - doorH3D);
        const header = new THREE.Mesh(new THREE.BoxGeometry(doorW3D, headerH, t3D), wallMat);
        header.position.set(dCenter, 0.4 + doorH3D + headerH / 2, zPos);
        addMeshWithEdges(leftWall);
        addMeshWithEdges(rightWall);
        addMeshWithEdges(header);
      } else {
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(t3D, h3D, leftLen), wallMat);
        leftWall.position.set(xPos, h3D / 2 + 0.4, -span / 2 + leftLen / 2);
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(t3D, h3D, rightLen), wallMat);
        rightWall.position.set(xPos, h3D / 2 + 0.4, span / 2 - rightLen / 2);
        const headerH = Math.max(0.4, h3D - doorH3D);
        const header = new THREE.Mesh(new THREE.BoxGeometry(t3D, headerH, doorW3D), wallMat);
        header.position.set(xPos, 0.4 + doorH3D + headerH / 2, dCenter);
        addMeshWithEdges(leftWall);
        addMeshWithEdges(rightWall);
        addMeshWithEdges(header);
      }

      // Door Leaf
      const doorLeafMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x0284c7 : 0x0369a1,
        roughness: 0.35,
        metalness: isCad ? 0.3 : 0.6,
      });
      const doorLeaf = new THREE.Mesh(
        isHoriz
          ? new THREE.BoxGeometry(doorW3D - 0.1, doorH3D - 0.1, 0.12)
          : new THREE.BoxGeometry(0.12, doorH3D - 0.1, doorW3D - 0.1),
        doorLeafMat
      );
      if (isHoriz) {
        doorLeaf.position.set(dCenter, 0.4 + doorH3D / 2, zPos);
      } else {
        doorLeaf.position.set(xPos, 0.4 + doorH3D / 2, dCenter);
      }
      addMeshWithEdges(doorLeaf);

      // In CAD mode: draw dashed door swing arc on floor
      if (isCad) {
        const arcRadius = doorW3D;
        const curvePts: THREE.Vector3[] = [];
        const numPts = 16;
        for (let i = 0; i <= numPts; i++) {
          const theta = (i / numPts) * (Math.PI / 2);
          if (isHoriz) {
            curvePts.push(
              new THREE.Vector3(
                dCenter - doorW3D / 2 + Math.cos(theta) * arcRadius,
                0.41,
                zPos + (wall === 'south' ? Math.sin(theta) * arcRadius : -Math.sin(theta) * arcRadius)
              )
            );
          } else {
            curvePts.push(
              new THREE.Vector3(
                xPos + (wall === 'east' ? Math.sin(theta) * arcRadius : -Math.sin(theta) * arcRadius),
                0.41,
                dCenter - doorW3D / 2 + Math.cos(theta) * arcRadius
              )
            );
          }
        }
        const arcGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
        const arcLine = new THREE.Line(
          arcGeo,
          new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
        );
        roomGrp.add(arcLine);
      }
    };

    buildWallWithDoor('north', doorWall === 'north', doorOffsetPct);
    buildWallWithDoor('south', doorWall === 'south', doorOffsetPct);
    buildWallWithDoor('west', doorWall === 'west', doorOffsetPct);
    buildWallWithDoor('east', doorWall === 'east', doorOffsetPct);

    // Ceiling underside and overhead cable ladder elevation references
    const ceilingBottomY = h3D + 0.4;
    const ladderClearance3D = 0.09 * scale3D; // 90mm = 3.5 inches below ceiling
    const ladderY = ceilingBottomY - ladderClearance3D;

    // 3. Feeder Cable Gland Plate on cableWall at cableOffsetPct
    // Telecom Engineering Standard: Feeder window / gland plate is located at the high overhead
    // runway level directly aligned with the ceiling-suspended cable ladder, NEVER in the middle of the wall!
    if (cableWall !== 'none') {
      const glandMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x0ea5e9 : 0xd97706,
        roughness: 0.35,
        metalness: 0.4,
      });
      const bootMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x0369a1 : 0x0f172a,
        roughness: 0.8,
      });

      const safeDiaMm = Math.max(100, Math.min(600, Number(cableHoleDiameterMm) || 250));
      const glandDiaM = safeDiaMm / 1000;
      const glandSpan = Math.max(0.35, Math.min(1.2, glandDiaM * 1.6)) * scale3D;
      const glandH = Math.max(0.35, Math.min(1.2, glandDiaM * 1.6)) * scale3D;

      // Vertical Level: Positioned at overhead cable runway / ceiling entry level (~95% height),
      // aligned directly with the interior overhead cable ladder and outdoor cable gantry, NOT near the middle!
      const defaultFeederY = ladderY;
      const customFeederY =
        cableHoleElevationMm !== undefined && cableHoleElevationMm > 0
          ? 0.4 + (cableHoleElevationMm / 1000) * scale3D
          : defaultFeederY;
      const feederY = Math.max(0.4 + glandH / 2 + 0.2, Math.min(ceilingBottomY - glandH / 2 - 0.1, customFeederY));

      const isHoriz = cableWall === 'north' || cableWall === 'south';
      const span = isHoriz ? w3D : d3D;
      const gOffset = (cableOffsetPct / 100 - 0.5) * span;

      const glandMesh = new THREE.Mesh(
        isHoriz
          ? new THREE.BoxGeometry(glandSpan, glandH, t3D + 0.3)
          : new THREE.BoxGeometry(t3D + 0.3, glandH, glandSpan),
        glandMat
      );
      if (cableWall === 'north') {
        glandMesh.position.set(gOffset, feederY, -d3D / 2 - t3D / 2);
      } else if (cableWall === 'south') {
        glandMesh.position.set(gOffset, feederY, d3D / 2 + t3D / 2);
      } else if (cableWall === 'east') {
        glandMesh.position.set(w3D / 2 + t3D / 2, feederY, gOffset);
      } else {
        glandMesh.position.set(-w3D / 2 - t3D / 2, feederY, gOffset);
      }
      addMeshWithEdges(glandMesh);

      // Multiple feeder conduit entry ports scaled to diameter
      const bootRadius = Math.max(0.06, (safeDiaMm / 250) * 0.12);
      const bootLen = Math.max(0.18, (safeDiaMm / 250) * 0.28);
      const numBoots = Math.max(2, Math.min(4, Math.floor(glandSpan / 0.55)));
      const bStep = (glandSpan * 0.62) / Math.max(1, numBoots - 1);

      for (let bi = 0; bi < numBoots; bi++) {
        const bOff = -(glandSpan * 0.62) / 2 + bi * bStep;
        const boot = new THREE.Mesh(new THREE.CylinderGeometry(bootRadius, bootRadius * 1.35, bootLen, 8), bootMat);
        if (isHoriz) {
          boot.rotation.x = Math.PI / 2;
          boot.position.set(
            gOffset + bOff,
            feederY,
            cableWall === 'north' ? -d3D / 2 - t3D / 2 - bootLen / 2 : d3D / 2 + t3D / 2 + bootLen / 2
          );
        } else {
          boot.rotation.z = Math.PI / 2;
          boot.position.set(
            cableWall === 'east' ? w3D / 2 + t3D / 2 + bootLen / 2 : -w3D / 2 - t3D / 2 - bootLen / 2,
            feederY,
            gOffset + bOff
          );
        }
        roomGrp.add(boot);
      }
    }

    // 4. Ceiling & Architectural Roof Framing Visuals
    // CRITICAL: When editing/designing the shelter in Photo and CAD mode, visuals of the objects
    // added inside are NEVER hidden due to the roof!
    const roofOverhang = 0.25 * scale3D; // 250mm overhang past wall outer face
    const roofTotalW = w3D + t3D * 2 + roofOverhang * 2;
    const roofTotalD = d3D + t3D * 2 + roofOverhang * 2;
    const roofBaseY = h3D + 0.4;

    // A. Architectural Perimeter Fascia & Eaves Beam (defines the building roofline & height clearly)
    const fasciaMat = isCad
      ? new THREE.MeshStandardMaterial({ color: 0x0b203c, roughness: 0.6 })
      : new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.5 });
    const fasciaH = 0.32;
    const fasciaT = 0.28;

    const createFasciaBeam = (geo: THREE.BufferGeometry, px: number, py: number, pz: number) => {
      const mesh = new THREE.Mesh(geo, fasciaMat);
      mesh.position.set(px, py, pz);
      if (isCad) {
        mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeLineMat));
      }
      roomGrp.add(mesh);
    };

    // North & South perimeter eave beams
    createFasciaBeam(
      new THREE.BoxGeometry(roofTotalW, fasciaH, fasciaT),
      0,
      roofBaseY + fasciaH / 2,
      -roofTotalD / 2 + fasciaT / 2
    );
    createFasciaBeam(
      new THREE.BoxGeometry(roofTotalW, fasciaH, fasciaT),
      0,
      roofBaseY + fasciaH / 2,
      roofTotalD / 2 - fasciaT / 2
    );
    // East & West perimeter eave beams
    createFasciaBeam(
      new THREE.BoxGeometry(fasciaT, fasciaH, roofTotalD - fasciaT * 2),
      roofTotalW / 2 - fasciaT / 2,
      roofBaseY + fasciaH / 2,
      0
    );
    createFasciaBeam(
      new THREE.BoxGeometry(fasciaT, fasciaH, roofTotalD - fasciaT * 2),
      -roofTotalW / 2 + fasciaT / 2,
      roofBaseY + fasciaH / 2,
      0
    );

    // B. Structural Roof Purlins / Rafter Trusses across the ceiling plane
    const rafterMat = isCad
      ? new THREE.MeshStandardMaterial({ color: 0x16375c, roughness: 0.5 })
      : new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.6 });
    const numRafters = Math.max(3, Math.min(6, Math.floor(w3D / 5) + 1));
    const rStep = w3D / (numRafters + 1);

    for (let r = 1; r <= numRafters; r++) {
      const rx = -w3D / 2 + r * rStep;
      const rafterGeo = new THREE.BoxGeometry(0.16, 0.26, d3D);
      const rafter = new THREE.Mesh(rafterGeo, rafterMat);
      rafter.position.set(rx, roofBaseY + 0.13, 0);
      if (isCad) {
        rafter.add(new THREE.LineSegments(new THREE.EdgesGeometry(rafterGeo), edgeLineMat));
      }
      roomGrp.add(rafter);
    }

    // C. Roof Sheathing Handling:
    // In ALL modes (Cutaway, Glass/Translucent, and Solid), the roof is explicitly built
    // so interior equipment is NEVER hidden from above or from any view angle!
    if (roofMode === 'transparent') {
      // Pristine architectural structural glass ceiling pane with faint blueprint tint
      const glassMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x38bdf8 : 0x7dd3fc,
        roughness: 0.15,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      });
      const glassCeiling = new THREE.Mesh(new THREE.BoxGeometry(w3D, 0.06, d3D), glassMat);
      glassCeiling.position.y = roofBaseY + 0.28;
      roomGrp.add(glassCeiling);
    } else if (roofMode === 'solid') {
      // Solid mode with architectural inspection cutaway / see-through interior:
      // Solid standing-seam panels on the outer perimeter (outer 18%),
      // while the central 82% section is an open/translucent inspection aperture (skylight)
      // so objects added inside are 100% visible and NEVER hidden due to the roof!
      const solidRimMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x0c2545 : 0x1e293b,
        roughness: 0.6,
        metalness: isCad ? 0.3 : 0.5,
      });
      const skylightMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x0284c7 : 0x38bdf8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      });

      const rimMargin = Math.min(w3D * 0.18, d3D * 0.18);
      // North and South perimeter solid panels
      const pNorth = new THREE.Mesh(new THREE.BoxGeometry(w3D, 0.12, rimMargin), solidRimMat);
      pNorth.position.set(0, roofBaseY + 0.28, -d3D / 2 + rimMargin / 2);
      const pSouth = new THREE.Mesh(new THREE.BoxGeometry(w3D, 0.12, rimMargin), solidRimMat);
      pSouth.position.set(0, roofBaseY + 0.28, d3D / 2 - rimMargin / 2);
      // East and West perimeter solid panels
      const pEast = new THREE.Mesh(new THREE.BoxGeometry(rimMargin, 0.12, d3D - rimMargin * 2), solidRimMat);
      pEast.position.set(w3D / 2 - rimMargin / 2, roofBaseY + 0.28, 0);
      const pWest = new THREE.Mesh(new THREE.BoxGeometry(rimMargin, 0.12, d3D - rimMargin * 2), solidRimMat);
      pWest.position.set(-w3D / 2 + rimMargin / 2, roofBaseY + 0.28, 0);
      addMeshWithEdges(pNorth);
      addMeshWithEdges(pSouth);
      addMeshWithEdges(pEast);
      addMeshWithEdges(pWest);

      // Central see-through inspection cutaway skylight so interior equipment is NEVER hidden!
      const centralSkylight = new THREE.Mesh(
        new THREE.BoxGeometry(w3D - rimMargin * 2, 0.06, d3D - rimMargin * 2),
        skylightMat
      );
      centralSkylight.position.set(0, roofBaseY + 0.28, 0);
      roomGrp.add(centralSkylight);
    }
    // When roofMode is 'cutaway' (default), the center is completely open between the perimeter rafters,
    // ensuring 100% unobstructed, crystal-clear line of sight to every interior equipment item!

    // Interior Ambient / Ceiling Lighting (mounted along top wall rims)
    const interiorAmbient = new THREE.PointLight(
      isCad ? 0xe0f2fe : 0xfffbeb,
      isCad ? 1.6 : 1.4,
      Math.max(w3D, d3D) * 2.5
    );
    interiorAmbient.position.set(0, h3D - 0.2, 0);
    roomGrp.add(interiorAmbient);

    // 5. Overhead Cable Ladder Items
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.3,
      metalness: isCad ? 0.2 : 0.5,
    });
    const rodMat = new THREE.MeshStandardMaterial({
      color: isCad ? 0x38bdf8 : 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2,
    });

    // 6. Place Interior Equipment Items
    items.forEach((item) => {
      const itmW = (item.widthMm / 1000) * scale3D;
      const itmD = (item.depthMm / 1000) * scale3D;
      const rawH = (item.heightMm / 1000) * scale3D;
      const itmH = item.category === 'ladder' ? 0.22 : Math.min(rawH, Math.max(1.5, h3D - ladderClearance3D - 0.8));

      const lx = (item.xMm / 1000) * scale3D - w3D / 2 + itmW / 2;
      const lz = (item.yMm / 1000) * scale3D - d3D / 2 + itmD / 2;
      const rotRad = -((item.rotationDeg * Math.PI) / 180);

      const sId = String(item.stencilId || item.customProps?.stencilType || item.type || '').toLowerCase();
      const isLadder =
        item.category === 'ladder' ||
        item.customProps?.category === 'ladder' ||
        sId.includes('ladder') ||
        sId.includes('runway') ||
        sId.includes('raceway') ||
        sId.includes('tray') ||
        String(item.name || item.text || '').toLowerCase().includes('ladder') ||
        String(item.name || item.text || '').toLowerCase().includes('raceway');

      if (isLadder) {
        const ladderGrp = new THREE.Group();
        const isVert = itmD > itmW;
        const spanW = isVert ? itmD : itmW;
        const spanD = isVert ? itmW : itmD;

        const ladderMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0xfacc15 : 0xeab308,
          roughness: 0.3,
          metalness: isCad ? 0.3 : 0.6,
          emissive: isCad ? 0xca8a04 : 0x713f12,
          emissiveIntensity: 0.25,
        });

        // 1. Heavy-duty C-channel outer stringer rails
        const railGeo = new THREE.BoxGeometry(spanW, 0.35, 0.18);
        const railF = new THREE.Mesh(railGeo, ladderMat);
        railF.position.set(0, 0, spanD / 2 - 0.09);
        const railB = new THREE.Mesh(railGeo, ladderMat);
        railB.position.set(0, 0, -spanD / 2 + 0.09);

        if (isCad) {
          railF.add(new THREE.LineSegments(new THREE.EdgesGeometry(railGeo), edgeLineMat));
          railB.add(new THREE.LineSegments(new THREE.EdgesGeometry(railGeo), edgeLineMat));
        }
        ladderGrp.add(railF, railB);

        // 2. Tubular cross rungs
        const rungCount = Math.max(3, Math.floor(spanW / 1.1));
        const rungMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0xe2e8f0 : 0x94a3b8,
          metalness: 0.7,
          roughness: 0.3,
        });
        for (let r = 0; r <= rungCount; r++) {
          const rx = -spanW / 2 + (r / rungCount) * spanW;
          const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, spanD - 0.2, 8);
          const rung = new THREE.Mesh(rungGeo, rungMat);
          rung.rotation.x = Math.PI / 2;
          rung.position.set(rx, -0.05, 0);
          ladderGrp.add(rung);
        }

        // 3. Threaded ceiling drop rods & ceiling anchors
        for (const rx of [-spanW * 0.35, 0, spanW * 0.35]) {
          for (const rz of [-spanD * 0.42, spanD * 0.42]) {
            const rod = new THREE.Mesh(
              new THREE.CylinderGeometry(0.045, 0.045, ladderClearance3D, 6),
              rodMat
            );
            rod.position.set(rx, ladderClearance3D / 2, rz);
            ladderGrp.add(rod);

            // Ceiling anchor plate clamp
            const clamp = new THREE.Mesh(
              new THREE.BoxGeometry(0.25, 0.1, 0.25),
              new THREE.MeshStandardMaterial({ color: 0x475569 })
            );
            clamp.position.set(rx, ladderClearance3D, rz);
            ladderGrp.add(clamp);
          }

          // Trapeze crossbar supporting ladder from underneath
          const trap = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.12, spanD + 0.3),
            rodMat
          );
          trap.position.set(rx, -0.22, 0);
          ladderGrp.add(trap);
        }

        ladderGrp.position.set(lx, ladderY, lz);
        ladderGrp.rotation.y = rotRad + (isVert ? Math.PI / 2 : 0);
        roomGrp.add(ladderGrp);
        return;
      }

      const rackMat = new THREE.MeshStandardMaterial({
        color: isCad
          ? 0x0f2a4a
          : item.color === '#0f172a'
          ? 0x18181b
          : parseInt(item.color.replace('#', '0x'), 16),
        roughness: isCad ? 0.5 : 0.4,
        metalness: isCad ? 0.2 : 0.6,
      });

      const strokeHex = parseInt((item.strokeColor || '#38bdf8').replace('#', '0x'), 16);
      const trimMat = new THREE.MeshStandardMaterial({
        color: isCad ? 0x38bdf8 : strokeHex,
        roughness: 0.3,
        metalness: 0.7,
      });

      let baseY = 0.4;
      if (item.stencilId.includes('smoke-detector') || item.stencilId.includes('ceiling-led')) {
        baseY = ceilingBottomY - itmH;
      } else if (item.elevationMm && item.elevationMm > 0) {
        const elev3D = (item.elevationMm / 1000) * scale3D;
        baseY = 0.4 + Math.min(elev3D, Math.max(0, h3D - itmH - ladderClearance3D - 0.3));
      }

      const isAC =
        item.category === 'cooling' ||
        sId.includes('ac') ||
        sId.includes('split') ||
        item.name.toLowerCase().includes('ac') ||
        item.name.toLowerCase().includes('air conditioner');

      if (isAC) {
        const acGrp = new THREE.Group();
        const acW = itmW;
        const acH = Math.max(1.2, Math.min(2.5, (item.heightMm / 1000) * scale3D));
        const acD = Math.max(1.0, itmD);
        const elev3D = ((item.elevationMm ?? 2200) / 1000) * scale3D;
        const acBaseY = 0.4 + Math.min(elev3D, Math.max(0.4, h3D - acH - 0.2));

        // 1. Wall bracket backplate (against -acD/2)
        const bracketGeo = new THREE.BoxGeometry(acW * 0.92, acH * 0.85, 0.12);
        const bracketMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.8,
          roughness: 0.3,
        });
        const bracket = new THREE.Mesh(bracketGeo, bracketMat);
        bracket.position.set(0, acBaseY + acH * 0.5, -acD / 2 + 0.06);
        acGrp.add(bracket);

        // 2. Sleek Indoor Unit Enclosure
        const bodyGeo = new THREE.BoxGeometry(acW, acH, acD - 0.12);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0x0c2545 : 0xf8fafc,
          roughness: isCad ? 0.4 : 0.25,
          metalness: isCad ? 0.3 : 0.1,
        });
        const acBody = new THREE.Mesh(bodyGeo, bodyMat);
        acBody.position.set(0, acBaseY + acH * 0.5, 0.06);
        acBody.castShadow = true;
        acBody.receiveShadow = true;
        if (isCad) {
          acBody.add(new THREE.LineSegments(new THREE.EdgesGeometry(bodyGeo), edgeLineMat));
        }
        acGrp.add(acBody);

        // 3. Top Return Air Intake Grille
        const grilleGeo = new THREE.BoxGeometry(acW * 0.84, 0.08, acD * 0.55);
        const grilleMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0x0284c7 : 0x94a3b8,
          roughness: 0.5,
        });
        const grille = new THREE.Mesh(grilleGeo, grilleMat);
        grille.position.set(0, acBaseY + acH + 0.04, -acD * 0.1);
        acGrp.add(grille);

        // 4. Motorized Discharge Air Louver (Bottom Lip, angled downward into room)
        const louverGeo = new THREE.BoxGeometry(acW * 0.88, 0.28, 0.15);
        const louverMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0x0ea5e9 : 0xe2e8f0,
          roughness: 0.3,
          metalness: 0.4,
        });
        const louver = new THREE.Mesh(louverGeo, louverMat);
        louver.rotation.x = Math.PI * 0.12;
        louver.position.set(0, acBaseY + acH * 0.16, acD / 2 + 0.08);
        acGrp.add(louver);

        // 5. Digital Cyan LED Temperature Display
        const dispGeo = new THREE.BoxGeometry(acW * 0.22, acH * 0.22, 0.05);
        const dispMat = new THREE.MeshStandardMaterial({
          color: 0x082f49,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.85,
        });
        const disp = new THREE.Mesh(dispGeo, dispMat);
        disp.position.set(acW * 0.26, acBaseY + acH * 0.52, acD / 2 + 0.02);
        acGrp.add(disp);

        // Green Power LED
        const pLedGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const pLedMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x22c55e,
          emissiveIntensity: 1.0,
        });
        const pLed = new THREE.Mesh(pLedGeo, pLedMat);
        pLed.position.set(acW * 0.39, acBaseY + acH * 0.52, acD / 2 + 0.04);
        acGrp.add(pLed);

        // Copper refrigerant & drainage sleeve heading into the wall behind
        const pipeGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.8,
          roughness: 0.3,
        });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.rotation.x = Math.PI / 2;
        pipe.position.set(acW * 0.32, acBaseY + acH * 0.3, -acD / 2 - 0.2);
        acGrp.add(pipe);

        acGrp.position.set(lx, 0, lz);
        acGrp.rotation.y = rotRad;
        roomGrp.add(acGrp);
        return;
      }

      const rackGrp = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(itmW, itmH, itmD), rackMat);
      body.position.y = baseY + itmH / 2;
      body.castShadow = true;
      body.receiveShadow = true;

      if (isCad) {
        body.add(new THREE.LineSegments(new THREE.EdgesGeometry(body.geometry), edgeLineMat));

        // In CAD mode: draw maintenance clearance envelope on floor (900mm front clearance)
        if (!item.stencilId.includes('smoke') && !item.stencilId.includes('ceiling-led')) {
          const clrLen = 5.4; // 900mm = 0.9m * 6.0 = 5.4 units
          const clrGeo = new THREE.BoxGeometry(itmW, 0.02, clrLen);
          const clrMat = new THREE.MeshBasicMaterial({
            color: 0x0284c7,
            transparent: true,
            opacity: 0.16,
          });
          const clrMesh = new THREE.Mesh(clrGeo, clrMat);
          clrMesh.position.set(0, 0.22, itmD / 2 + clrLen / 2);
          rackGrp.add(clrMesh);

          const clrEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(clrGeo),
            new THREE.LineBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.6 })
          );
          clrEdges.position.set(0, 0.22, itmD / 2 + clrLen / 2);
          rackGrp.add(clrEdges);
        }
      }

      rackGrp.add(body);

      // Front door frame trim & vertical rack rails
      const railL = new THREE.Mesh(new THREE.BoxGeometry(0.12, itmH - 0.2, 0.06), trimMat);
      railL.position.set(-itmW / 2 + 0.14, baseY + itmH / 2, itmD / 2 + 0.02);
      const railR = new THREE.Mesh(new THREE.BoxGeometry(0.12, itmH - 0.2, 0.06), trimMat);
      railR.position.set(itmW / 2 - 0.14, baseY + itmH / 2, itmD / 2 + 0.02);
      rackGrp.add(railL, railR);

      // Status indicator LED
      const ledGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);
      const greenLED = new THREE.Mesh(
        ledGeo,
        new THREE.MeshBasicMaterial({ color: isCad ? 0x38bdf8 : 0x22c55e })
      );
      greenLED.position.set(itmW / 2 - 0.35, baseY + itmH * 0.82, itmD / 2 + 0.04);
      rackGrp.add(greenLED);

      // If this item is a Rectifier System or Battery Bank, render detailed battery modules
      const isRectifier =
        (item.category as string) === 'rectifier' ||
        (item.category as string) === 'power' ||
        (item.category as string) === 'battery' ||
        item.stencilId === 'flatpack-1' ||
        item.stencilId.includes('rectifier') ||
        (item as any).batteryCount !== undefined;

      if (isRectifier) {
        const batteryCount = typeof (item as any).batteryCount === 'number' ? (item as any).batteryCount : 4;
        const battMat = new THREE.MeshStandardMaterial({
          color: isCad ? 0x0a1c33 : 0x14532d, // Emerald green for lithium battery bank
          roughness: 0.5,
        });
        const posPinMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
        const negPinMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
        const copperPinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25 });
        const mcbRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
        const cyanLcdMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.8,
        });

        // Upper Compartment: Modular Rectifier Subrack & Smartpack LCD Controller
        const upperY = baseY + itmH * 0.76;
        const upperH = itmH * 0.18;
        const upperShelf = new THREE.Mesh(
          new THREE.BoxGeometry(itmW * 0.84, upperH, 0.14),
          new THREE.MeshStandardMaterial({ color: isCad ? 0x071526 : 0x18181b })
        );
        upperShelf.position.set(0, upperY, itmD / 2 + 0.04);
        rackGrp.add(upperShelf);

        // Modular Rectifier Units (Flatpack modules)
        const numMods = Math.max(2, Math.min(8, (item as any).rectifierModules || (item.customProps as any)?.rectifierModules || 4));
        const modW = (itmW * 0.8) / numMods;
        for (let m = 0; m < numMods; m++) {
          const mx = -itmW * 0.4 + m * modW + modW / 2;
          const modMesh = new THREE.Mesh(
            new THREE.BoxGeometry(modW * 0.88, upperH * 0.44, 0.08),
            new THREE.MeshStandardMaterial({ color: isCad ? 0x0f2b48 : 0x27272a })
          );
          modMesh.position.set(mx, upperY + upperH * 0.22, itmD / 2 + 0.12);
          rackGrp.add(modMesh);

          // Green Run LED
          const rLed = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.04, 0.02),
            new THREE.MeshBasicMaterial({ color: 0x22c55e })
          );
          rLed.position.set(mx - modW * 0.28, upperY + upperH * 0.22 - upperH * 0.12, itmD / 2 + 0.17);
          rackGrp.add(rLed);
        }

        // Smartpack LCD Controller Screen
        const lcdMesh = new THREE.Mesh(
          new THREE.BoxGeometry(itmW * 0.48, upperH * 0.34, 0.04),
          cyanLcdMat
        );
        lcdMesh.position.set(-itmW * 0.12, upperY - upperH * 0.25, itmD / 2 + 0.12);
        rackGrp.add(lcdMesh);

        // Middle Compartment: DC Distribution Breakers (MCB Array)
        const midY = baseY + itmH * 0.58;
        const midH = itmH * 0.08;
        const mcbPanel = new THREE.Mesh(
          new THREE.BoxGeometry(itmW * 0.84, midH, 0.1),
          new THREE.MeshStandardMaterial({ color: isCad ? 0x071526 : 0x18181b })
        );
        mcbPanel.position.set(0, midY, itmD / 2 + 0.04);
        rackGrp.add(mcbPanel);

        for (let bi = 0; bi < 6; bi++) {
          const bx = -itmW * 0.35 + bi * (itmW * 0.14) + (itmW * 0.07);
          const breaker = new THREE.Mesh(
            new THREE.BoxGeometry(itmW * 0.09, midH * 0.55, 0.06),
            mcbRedMat
          );
          breaker.position.set(bx, midY, itmD / 2 + 0.1);
          rackGrp.add(breaker);
        }

        // Lower Compartment: Battery String & Copper Busbars
        const bPanel = new THREE.Mesh(
          new THREE.BoxGeometry(itmW * 0.84, itmH * 0.45, 0.08),
          new THREE.MeshStandardMaterial({ color: isCad ? 0x071526 : 0x171717 })
        );
        bPanel.position.set(0, baseY + itmH * 0.26, itmD / 2 + 0.03);
        if (isCad) {
          bPanel.add(new THREE.LineSegments(new THREE.EdgesGeometry(bPanel.geometry), edgeLineMat));
        }
        rackGrp.add(bPanel);

        const tiers = Math.min(4, Math.ceil(batteryCount / 4));
        const tierH = (itmH * 0.42) / tiers;
        for (let t = 0; t < tiers; t++) {
          const cellsInTier = Math.min(4, batteryCount - t * 4);
          const cellW = (itmW * 0.74) / 4;
          const ty = baseY + 0.2 + t * tierH + tierH / 2;

          for (let c = 0; c < cellsInTier; c++) {
            const cx = -itmW * 0.37 + c * cellW + cellW / 2;
            const bCell = new THREE.Mesh(
              new THREE.BoxGeometry(cellW * 0.86, tierH * 0.75, 0.12),
              battMat
            );
            bCell.position.set(cx, ty, itmD / 2 + 0.08);
            if (isCad) {
              bCell.add(new THREE.LineSegments(new THREE.EdgesGeometry(bCell.geometry), edgeLineMat));
            }
            rackGrp.add(bCell);

            const pinPlus = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), posPinMat);
            pinPlus.position.set(cx - cellW * 0.22, ty + tierH * 0.16, itmD / 2 + 0.14);
            const pinMinus = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), negPinMat);
            pinMinus.position.set(cx + cellW * 0.22, ty + tierH * 0.16, itmD / 2 + 0.14);
            rackGrp.add(pinPlus, pinMinus);

            // Interconnect copper busbar
            if (c < cellsInTier - 1) {
              const busbarMesh = new THREE.Mesh(
                new THREE.BoxGeometry(cellW * 0.44, 0.03, 0.02),
                copperPinMat
              );
              busbarMesh.position.set(cx + cellW / 2, ty + tierH * 0.16, itmD / 2 + 0.15);
              rackGrp.add(busbarMesh);
            }
          }
        }
      }

      rackGrp.position.set(lx, 0, lz);
      rackGrp.rotation.y = rotRad;
      roomGrp.add(rackGrp);
    });
  }, [
    roomLengthMm,
    roomWidthMm,
    shelterHeightM,
    wallThickMm,
    doorWall,
    doorOffsetPct,
    doorWidthMm,
    cableWall,
    cableOffsetPct,
    cableHoleDiameterMm,
    cableHoleElevationMm,
    items,
    roofMode,
    renderStyle,
  ]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
