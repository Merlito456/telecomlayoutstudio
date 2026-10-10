/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RackElevationConfig } from './types';
import { buildOpenBayRack3D } from './build-3d-rack';

interface Rack3DPreviewProps {
  rackConfig: RackElevationConfig;
}

export const Rack3DPreview: React.FC<Rack3DPreviewProps> = ({ rackConfig }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const totalU = rackConfig.totalU || 42;
    const heightMm = rackConfig.heightMm || Math.round(totalU * 44.45 + 130);
    const rackH = (heightMm / 2000) * 13.0;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, rackH * 0.65, rackH * 1.55);
    camera.lookAt(0, rackH * 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    backLight.position.set(-10, 10, -10);
    scene.add(backLight);

    // Ground Grid
    const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    grid.position.y = 0;
    scene.add(grid);

    // Build Rack Mesh with equipments
    const rackMesh = buildOpenBayRack3D({
      rackW: 4.0,
      rackH,
      rackD: 4.2,
      totalU: rackConfig.totalU,
      heightMm,
      equipments: rackConfig.equipments,
      rackType: rackConfig.rackType,
      rackName: rackConfig.name,
      isCabinet: rackConfig.isCabinet,
      doorsOpen: rackConfig.doorsOpen,
      brand: rackConfig.brand,
      placementOrientation: rackConfig.placementOrientation,
    });
    scene.add(rackMesh);

    // Orbit controls via mouse pointer
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0;
    let rotY = 0;
    let camDistance = rackH * 1.5;

    const updateCamera = () => {
      const radius = camDistance;
      const phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, Math.PI / 4 + rotY));
      const theta = rotX;
      camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
      camera.position.y = Math.max(1, rackH * 0.5 + radius * Math.sin(phi));
      camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
      camera.lookAt(0, rackH * 0.5, 0);
    };
    updateCamera();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotX += dx * 0.008;
      rotY -= dy * 0.008;
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDistance = Math.max(5, Math.min(45, camDistance + e.deltaY * 0.02));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Render loop
    let animId = 0;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
    };
    renderLoop();

    // Resize handler
    const onResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, [rackConfig]);

  const actualHeightMm = rackConfig.heightMm || Math.round((rackConfig.totalU || 42) * 44.45 + 130);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-4 pointer-events-none p-1.5 px-3 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur-md shadow-lg flex items-center gap-2">
        <span className="font-semibold text-xs text-white">{rackConfig.name}</span>
        <span className="text-slate-500">·</span>
        <span className="text-xs text-sky-400 font-mono font-bold">{rackConfig.totalU}U Frame</span>
        <span className="text-slate-500">·</span>
        <span className="text-xs text-amber-300 font-mono font-bold">{actualHeightMm}mm</span>
        <span className="text-slate-500">·</span>
        <span className="text-[10px] text-slate-400 font-mono">~{(actualHeightMm / 304.8).toFixed(1)} ft</span>
      </div>
      <div className="absolute bottom-3 left-4 pointer-events-none p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono">
        Drag to rotate 360° · Scroll to zoom · Cable laying snap targets enabled
      </div>
    </div>
  );
};
