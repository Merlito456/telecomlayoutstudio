import { useState, useCallback } from 'react';
import { Point, StencilDefinition, ToolType, CADDefaultStyle } from '../types/cad';

interface UseCADAppStateProps {
  addToast: (type: 'info' | 'success' | 'warning' | 'error', message: string, title?: string) => void;
}

export function useCADAppState({ addToast }: UseCADAppStateProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isStencilDrawerOpen, setIsStencilDrawerOpen] = useState(false);
  const [armedStencil, setArmedStencil] = useState<StencilDefinition | null>(null);
  const [armedRotation, setArmedRotation] = useState<number>(0);

  const [defaultStyle, setDefaultStyle] = useState<CADDefaultStyle>({
    stroke: '#38bdf8',
    strokeWidth: 2,
    fill: '#1e293b',
    fillEnabled: true,
    fillOpacity: 0.8,
    fontFamily: 'titillium-web',
    fontSize: 12,
  });

  const [inlineEditor, setInlineEditor] = useState<{
    objId: string;
    field?: any;
    text: string;
    pos: Point;
    fontSize: number;
    fontFamily?: string;
  } | null>(null);

  const [hoveredTextLabel, setHoveredTextLabel] = useState<any | null>(null);
  const [activePanelTab, setActivePanelTab] = useState<'properties' | 'layers'>('properties');
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [startInRoamMode, setStartInRoamMode] = useState<boolean>(false);

  // Universal Cancel Action: Mouse 2 (Right Click) or Escape
  const handleCancelAction = useCallback(() => {
    if (armedStencil) {
      setArmedStencil(null);
      addToast('info', 'Placement cancelled (Mouse 2)');
      return;
    }
    if (inlineEditor) {
      setInlineEditor(null);
      addToast('info', 'Editing cancelled');
      return;
    }
    if (selectedIds.length > 0) {
      setSelectedIds([]);
      addToast('info', 'Deselected (Mouse 2)');
      return;
    }
    if (activeTool !== 'select') {
      setActiveTool('select');
      addToast('info', 'Returned to Select tool (Mouse 2)');
      return;
    }
  }, [armedStencil, inlineEditor, selectedIds, activeTool, addToast]);

  return {
    selectedIds,
    setSelectedIds,
    activeTool,
    setActiveTool,
    isStencilDrawerOpen,
    setIsStencilDrawerOpen,
    armedStencil,
    setArmedStencil,
    armedRotation,
    setArmedRotation,
    defaultStyle,
    setDefaultStyle,
    inlineEditor,
    setInlineEditor,
    hoveredTextLabel,
    setHoveredTextLabel,
    activePanelTab,
    setActivePanelTab,
    is3DMode,
    setIs3DMode,
    startInRoamMode,
    setStartInRoamMode,
    handleCancelAction,
  };
}
