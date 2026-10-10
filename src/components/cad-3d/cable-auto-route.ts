import { CADObject } from '../../types/cad';
import {
  getRotatedObjectBounds,
  isRackObject,
  isCableLadderObject,
  getUnpackedCADObjects,
} from '../../utils/cad-geometry';
import { CablePreset, detectPresetForTarget } from './cable-presets';

export function autoRouteLaddersToCabinets(
  allObjs: CADObject[],
  preset: CablePreset
): CADObject[] {
  const candidateObjs = getUnpackedCADObjects(allObjs);
  const ladders = candidateObjs.filter((o) => isCableLadderObject(o));
  const cabinets = candidateObjs.filter((o) => {
    if (o.isStencilLabel || isCableLadderObject(o)) return false;
    if (isRackObject(o)) return true;
    const s = (o.stencilId || o.customProps?.stencilType || '').toLowerCase();
    return (
      s.includes('cabinet') ||
      s.includes('odc') ||
      s.includes('eltek') ||
      s.includes('huawei') ||
      s.includes('ericsson') ||
      s.includes('fushan') ||
      s.includes('fh') ||
      s.includes('1bay') ||
      s.includes('2bay') ||
      s.includes('3bay') ||
      s.includes('rectifier') ||
      s.includes('flatpack') ||
      s.includes('battery') ||
      s.includes('olt') ||
      s.includes('pdu')
    );
  });
  if (ladders.length === 0 || cabinets.length === 0) return [];

  const generatedLines: CADObject[] = [];
  const makeLine = (x1: number, y1: number, x2: number, y2: number, strokeColor?: string): CADObject => ({
    id: 'cable3d_' + Math.random().toString(36).substring(2, 9),
    type: 'line',
    x: Math.round(x1),
    y: Math.round(y1),
    x2: Math.round(x2),
    y2: Math.round(y2),
    width: Math.abs(Math.round(x2) - Math.round(x1)),
    height: Math.abs(Math.round(y2) - Math.round(y1)),
    stroke: strokeColor || preset.color,
    strokeWidth: 3,
    fill: 'transparent',
    fillEnabled: false,
    fillOpacity: 0,
    opacity: 1,
    layerId: 'layer-cabling',
  });

  for (const lad of ladders) {
    const ladPreset = detectPresetForTarget(lad) || preset;
    const lb = getRotatedObjectBounds(lad);
    const isVert = lb.height >= lb.width;
    if (isVert) {
      const wireX = Math.round(lb.centerX);
      const adjCabs = cabinets
        .map((c) => ({ cab: c, cb: getRotatedObjectBounds(c) }))
        .filter(({ cb }) => {
          const gap = cb.minX >= lb.maxX ? cb.minX - lb.maxX : lb.minX >= cb.maxX ? lb.minX - cb.maxX : 0;
          return gap <= 95 && cb.centerY >= lb.minY - 25 && cb.centerY <= lb.maxY + 25;
        });
      const tapYs: number[] = [Math.round(lb.minY + 10), Math.round(lb.maxY - 10)];
      for (const { cab, cb } of adjCabs) {
        const isRight = cb.centerX >= lb.centerX;
        const wallX = isRight ? Math.round(cb.minX) : Math.round(cb.maxX);
        const tapY = Math.round(cb.centerY);
        tapYs.push(tapY);
        if (Math.abs(wallX - wireX) >= 4) {
          const cabPreset = detectPresetForTarget(cab) || ladPreset;
          generatedLines.push(makeLine(wireX, tapY, wallX, tapY, cabPreset.color));
        }
      }
      const minY = Math.min(...tapYs);
      const maxY = Math.max(...tapYs);
      if (maxY - minY >= 8) {
        generatedLines.push(makeLine(wireX, minY, wireX, maxY, ladPreset.color));
      }
    } else {
      const wireY = Math.round(lb.centerY);
      const adjCabs = cabinets
        .map((c) => ({ cab: c, cb: getRotatedObjectBounds(c) }))
        .filter(({ cb }) => {
          const gap = cb.minY >= lb.maxY ? cb.minY - lb.maxY : lb.minY >= cb.maxY ? lb.minY - cb.maxY : 0;
          return gap <= 95 && cb.centerX >= lb.minX - 25 && cb.centerX <= lb.maxX + 25;
        });
      const tapXs: number[] = [Math.round(lb.minX + 10), Math.round(lb.maxX - 10)];
      for (const { cab, cb } of adjCabs) {
        const isBelow = cb.centerY >= lb.centerY;
        const wallY = isBelow ? Math.round(cb.minY) : Math.round(cb.maxY);
        const tapX = Math.round(cb.centerX);
        tapXs.push(tapX);
        if (Math.abs(wallY - wireY) >= 4) {
          const cabPreset = detectPresetForTarget(cab) || ladPreset;
          generatedLines.push(makeLine(tapX, wireY, tapX, wallY, cabPreset.color));
        }
      }
      const minX = Math.min(...tapXs);
      const maxX = Math.max(...tapXs);
      if (maxX - minX >= 8) {
        generatedLines.push(makeLine(minX, wireY, maxX, wireY, ladPreset.color));
      }
    }
  }

  return generatedLines;
}
