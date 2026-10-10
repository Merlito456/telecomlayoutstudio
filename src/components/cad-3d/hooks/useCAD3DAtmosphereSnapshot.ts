import { useCallback } from 'react';
import * as THREE from 'three';
import { updateSkyAtmosphereLighting, SkyWeatherRig } from '../sky-weather';
import { LightingPreset } from '../types';

interface UseCAD3DAtmosphereSnapshotProps {
  skyWeatherRigRef: React.RefObject<SkyWeatherRig | null>;
  showSkyRef: React.RefObject<boolean>;
  lightingPresetRef: React.RefObject<LightingPreset>;
  setShowSky: React.Dispatch<React.SetStateAction<boolean>>;
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.RefObject<THREE.Scene | null>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
}

export function useCAD3DAtmosphereSnapshot({
  skyWeatherRigRef,
  showSkyRef,
  lightingPresetRef,
  setShowSky,
  rendererRef,
  sceneRef,
  cameraRef,
}: UseCAD3DAtmosphereSnapshotProps) {
  const updateEnvironment = useCallback((preset: LightingPreset) => {
    if (!skyWeatherRigRef.current) return;
    updateSkyAtmosphereLighting(
      skyWeatherRigRef.current,
      preset,
      showSkyRef.current ?? true
    );
  }, [skyWeatherRigRef, showSkyRef]);

  const handleToggleSky = useCallback(() => {
    setShowSky((prev) => {
      const next = !prev;
      (showSkyRef as any).current = next;
      if (skyWeatherRigRef.current?.skyGroup) {
        skyWeatherRigRef.current.skyGroup.visible = next;
      }
      updateEnvironment(lightingPresetRef.current ?? 'daylight');
      return next;
    });
  }, [updateEnvironment, setShowSky, showSkyRef, skyWeatherRigRef, lightingPresetRef]);

  const handleExportSnapshot = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Site-Layout-3D-${Date.now()}.png`;
    a.click();
  }, [rendererRef, sceneRef, cameraRef]);

  return {
    updateEnvironment,
    handleToggleSky,
    handleExportSnapshot,
  };
}
