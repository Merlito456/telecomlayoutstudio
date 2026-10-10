/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect } from 'react';
import { ProjectSettings, ViewportState } from '../types/cad';

interface UseCADViewportGesturesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  settings: ProjectSettings;
  viewport: ViewportState;
  setViewport: React.Dispatch<React.SetStateAction<ViewportState>>;
}

export function useCADViewportGestures({
  containerRef,
  canvasRef,
  settings,
  viewport: _viewport,
  setViewport,
}: UseCADViewportGesturesProps) {
  // Center and fit canvas in viewport
  const centerAndFitCanvas = useCallback(
    (width?: number, height?: number) => {
      const container = containerRef.current;
      const cw = width || container?.clientWidth || window.innerWidth;
      const ch = height || container?.clientHeight || window.innerHeight;
      if (cw < 80 || ch < 80) return;
      const targetW = settings.canvasWidth || 1600;
      const targetH = settings.canvasHeight || 1000;
      const padding = 36;
      const zoomX = (cw - padding * 2) / targetW;
      const zoomY = (ch - padding * 2) / targetH;
      const fitZoom = Math.max(0.15, Math.min(1.25, Math.min(zoomX, zoomY)));
      const panX = (cw - targetW * fitZoom) / 2;
      const panY = (ch - targetH * fitZoom) / 2;
      setViewport({ zoom: fitZoom, panX, panY });
    },
    [containerRef, setViewport, settings.canvasWidth, settings.canvasHeight]
  );

  const handleFitToScreen = useCallback(() => {
    centerAndFitCanvas();
  }, [centerAndFitCanvas]);

  useEffect(() => {
    const t1 = setTimeout(() => centerAndFitCanvas(), 60);
    const t2 = setTimeout(() => centerAndFitCanvas(), 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [centerAndFitCanvas]);

  // Dedicated Non-Passive Wheel & Gesture Handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const isOverStencilDrawer = !!target?.closest('[data-stencil-drawer]');
      const drawerEl = document.querySelector('[data-stencil-drawer]');
      const drawerRect = drawerEl?.getBoundingClientRect();
      const isCursorOverDrawer =
        drawerRect &&
        e.clientX >= drawerRect.left &&
        e.clientX <= drawerRect.right &&
        e.clientY >= drawerRect.top &&
        e.clientY <= drawerRect.bottom;
      if (isOverStencilDrawer || isCursorOverDrawer) {
        const scrollList = document.querySelector('[data-stencil-scroll-list]');
        if (scrollList) {
          scrollList.scrollTop += e.deltaY;
        }
        return;
      }
      // If any modal, dialog, or overlay is open, completely yield all scrolling to the modal
      const isAnyModalOpen = !!document.querySelector(
        '[role="dialog"], [data-modal], .fixed.inset-0.z-50, [data-modal-open]'
      );
      if (isAnyModalOpen) {
        return;
      }

      const isOverUI = !!target?.closest(
        'aside, header, footer, [role="dialog"], [data-modal], [data-stencil-drawer], [data-roam-hud], [data-properties-panel], .overflow-y-auto, .overflow-auto, input, textarea, button, select'
      );
      if (isOverUI && !e.ctrlKey && !e.metaKey) {
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (isOverUI) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
          mouseX = rect.width / 2;
          mouseY = rect.height / 2;
        }
        const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        setViewport((prev) => {
          const newZoom = Math.max(0.08, Math.min(12, prev.zoom * zoomFactor));
          const newPanX = mouseX - (mouseX - prev.panX) * (newZoom / prev.zoom);
          const newPanY = mouseY - (mouseY - prev.panY) * (newZoom / prev.zoom);
          return { zoom: newZoom, panX: newPanX, panY: newPanY };
        });
        return;
      }
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const isOverContainer =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        const isDirectlyOnCanvas =
          target === canvasRef.current ||
          target === container ||
          target?.tagName === 'CANVAS' ||
          !!target?.closest('[data-canvas-workspace]');

        if (isOverContainer && !isOverUI && isDirectlyOnCanvas) {
          e.preventDefault();
          setViewport((prev) => ({
            ...prev,
            panX: prev.panX - e.deltaX,
            panY: prev.panY - e.deltaY,
          }));
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    const preventGesture = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventGesture, { passive: false });
    document.addEventListener('gesturechange', preventGesture, { passive: false });
    document.addEventListener('gestureend', preventGesture, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
      document.removeEventListener('gestureend', preventGesture);
    };
  }, [canvasRef, containerRef, setViewport]);

  // Window Resize & Container Layout Observer
  useEffect(() => {
    let hasCentered = false;
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      if (cw > 0 && ch > 0) {
        canvasRef.current.width = cw * dpr;
        canvasRef.current.height = ch * dpr;
        if (!hasCentered) {
          hasCentered = true;
          centerAndFitCanvas(cw, ch);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef, containerRef, centerAndFitCanvas]);

  return {
    centerAndFitCanvas,
    handleFitToScreen,
  };
}
