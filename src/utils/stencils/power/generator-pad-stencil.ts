import { CADObject, Point, StencilDefinition } from '../../../types/cad';
import { uid } from '../common';
import { buildGeneratorPadElements } from './generator-pad-elements';

export const GEN_PAD_STENCILS: StencilDefinition[] = [
  {
    id: 'generator-pad',
    name: 'Generator (Green) + Pad',
    category: 'power',
    badge: 'Green Canopy',
    description:
      'Sound-attenuated telecom standby diesel generator in industrial green acoustic canopy with sub-base fuel tank, forklift pockets, radiator louvers, digital control panel, exhaust silencer & concrete pad',
    defaultWidth: 130,
    defaultHeight: 80,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point, _scale?: number): CADObject[] => {
      const parentId = uid();
      const w = 130;
      const h = 80;
      const padMargin = 8;
      const encW = w - padMargin * 2;
      const encH = h - padMargin * 2;

      const mainGroup: CADObject = {
        id: parentId,
        type: 'stencil-group',
        stencilId: 'generator-pad',
        isStencil: true,
        isStretchable: true,
        stretchAxis: 'both',
        baseWidth: w,
        baseHeight: h,
        x: origin.x,
        y: origin.y,
        width: w,
        height: h,
        stroke: '#16a34a',
        strokeWidth: 2,
        fill: '#14532d',
        fillEnabled: true,
        fillOpacity: 0.9,
        opacity: 1,
        customProps: { stencilType: 'generator-pad', isGeneratorGreen: true },
        children: buildGeneratorPadElements(w, h, padMargin, encW, encH),
      };

      const label: CADObject = {
        id: uid(),
        type: 'text',
        x: origin.x + w / 2 - 45,
        y: origin.y - 18,
        width: 90,
        height: 18,
        text: 'GENERATOR (GREEN) 30kVA',
        fontSize: 9,
        bold: true,
        textColor: '#4ade80',
        bgColor: '#052e16',
        stroke: '#16a34a',
        strokeWidth: 1,
        fill: '#052e16',
        fillEnabled: true,
        fillOpacity: 0.95,
        opacity: 1,
        isStencilLabel: true,
        parentId: parentId,
      };

      return [mainGroup, label];
    },
  },
  {
    id: 'generator',
    name: 'Diesel Generator (Green)',
    category: 'power',
    badge: 'Green Canopy',
    description:
      'Sound-attenuated telecom standby diesel generator in industrial green acoustic canopy with sub-base fuel tank, forklift pockets, radiator louvers, digital control panel & exhaust silencer',
    defaultWidth: 130,
    defaultHeight: 80,
    isStretchable: true,
    stretchAxis: 'both',
    createObjects: (origin: Point, scale?: number): CADObject[] => {
      const def = GEN_PAD_STENCILS.find((s: StencilDefinition) => s.id === 'generator-pad');
      return def ? def.createObjects(origin, scale ?? 1) : [];
    },
  },
];
