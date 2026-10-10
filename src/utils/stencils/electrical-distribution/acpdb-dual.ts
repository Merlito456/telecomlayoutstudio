import { CADObject, Point, StencilDefinition } from "../../../types/cad";
import { uid } from "../common";

export const ACPDB_DUAL_STENCIL: StencilDefinition = {
  id: 'acpdb-dual',
  name: 'Dual ACPDB (Mains + DG)',
  category: 'power',
  badge: 'Dual Enclosure',
  description: 'Dual outdoor ACPDB enclosures mounted side-by-side (Primary AC Mains DB + DG Standby DB) on common unistrut rails with inter-tie conduit, digital power meters, surge arresters, and branch breakers',
  defaultWidth: 16,
  defaultHeight: 8,
  createObjects: (origin: Point): CADObject[] => {
    const parentId = uid();
    const w = 16;
    const h = 8;

    const mainGroup: CADObject = {
      id: parentId,
      type: 'stencil-group',
      stencilId: 'acpdb-dual',
      isStencil: true,
      x: origin.x,
      y: origin.y,
      width: w,
      height: h,
      stroke: '#f59e0b',
      strokeWidth: 1.2,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.95,
      opacity: 1,
      customProps: { stencilType: 'acpdb-dual', mounting: 'wall', isWallMounted: true, mountingElevationM: 1.55, boxCount: 2 },
      children: [
        // Common unistrut channel across both boxes
        {
          id: uid(),
          type: 'rectangle',
          x: -0.5,
          y: 0.4,
          width: w + 1.0,
          height: 1.0,
          stroke: '#94a3b8',
          strokeWidth: 0.5,
          fill: '#475569',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
        // Left Box: Mains ACPDB
        {
          id: uid(),
          type: 'rectangle',
          x: 0.2,
          y: 1.8,
          width: 7.2,
          height: 5.6,
          stroke: '#f59e0b',
          strokeWidth: 1.0,
          fill: '#f1f5f9',
          fillEnabled: true,
          fillOpacity: 0.95,
          opacity: 1,
        },
        // Right Box: DG ACPDB
        {
          id: uid(),
          type: 'rectangle',
          x: 8.6,
          y: 1.8,
          width: 7.2,
          height: 5.6,
          stroke: '#f59e0b',
          strokeWidth: 1.0,
          fill: '#f1f5f9',
          fillEnabled: true,
          fillOpacity: 0.95,
          opacity: 1,
        },
        // Inter-tie rigid steel conduit between boxes
        {
          id: uid(),
          type: 'rectangle',
          x: 7.4,
          y: 4.2,
          width: 1.2,
          height: 0.8,
          stroke: '#38bdf8',
          strokeWidth: 0.4,
          fill: '#0284c7',
          fillEnabled: true,
          fillOpacity: 1,
          opacity: 1,
        },
      ],
    };

    const label: CADObject = {
      id: uid(),
      type: 'text',
      x: origin.x + w / 2 - 25,
      y: origin.y - 11,
      width: 50,
      height: 10,
      text: 'DUAL ACPDB (MAINS + DG)',
      fontSize: 6.5,
      bold: true,
      textColor: '#f59e0b',
      bgColor: '#1e293b',
      stroke: '#d97706',
      strokeWidth: 0.7,
      fill: '#1e293b',
      fillEnabled: true,
      fillOpacity: 0.9,
      opacity: 1,
      isStencilLabel: true,
      parentId: parentId,
    };

    return [mainGroup, label];
  },
};
