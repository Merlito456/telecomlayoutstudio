import { StencilCategory } from "../../types/cad";

export const STENCIL_CATEGORIES: { id: StencilCategory; name: string; icon: string }[] = [
  { id: 'gate', name: 'Gate & Access', icon: '🚪' },
  { id: 'shelter', name: 'Cabin / Shelter', icon: '🏢' },
  { id: 'racks', name: 'Equipment Racks', icon: '🗄️' },
  { id: 'rectifier-system', name: 'Rectifier System', icon: '🔋' },
  { id: 'equipments', name: 'Equipments', icon: '🔌' },
  { id: 'olt', name: 'OLT Equipment', icon: '🌐' },
  { id: 'cabinets', name: 'Cabinets', icon: '📦' },
  { id: 'tower', name: 'Tower', icon: '📡' },
  { id: 'power', name: 'Power', icon: '⚡' },
  { id: 'pads', name: 'Pads & Bases', icon: '🛠️' },
  { id: 'cooling', name: 'Cooling', icon: '❄️' },
  { id: 'cabling', name: 'Cable Infrastructure', icon: '🛣️' },
  { id: 'surface', name: 'Site Surface', icon: '🌱' },
  { id: 'environment', name: 'Outside Environment', icon: '🌳' },
  { id: 'labels', name: 'Labels', icon: '🔤' },
];

export const TELECOM_PALETTE = [
  { name: 'Data / Fiber 1', color: '#ef4444' },
  { name: 'Fire / Alarm', color: '#f97316' },
  { name: 'Fiber Optic', color: '#eab308' },
  { name: 'CCTV / Security', color: '#22c55e' },
  { name: 'Voice / Telecom', color: '#06b6d4' },
  { name: 'Power / DC', color: '#3b82f6' },
  { name: 'Access Control', color: '#a855f7' },
  { name: 'Wireless / RF', color: '#ec4899' },
  { name: 'Neutral Gray', color: '#94a3b8' },
  { name: 'High-Vis Yellow', color: '#facc15' },
  { name: 'Structure White', color: '#f8fafc' },
  { name: 'Deep Slate', color: '#1e293b' },
  { name: 'Earth Bronze', color: '#b45309' },
  { name: 'Cool Cyan', color: '#38bdf8' },
  { name: 'Dark Charcoal', color: '#0f172a' },
  { name: 'Signal Amber', color: '#f59e0b' },
  { name: 'Electric Violet', color: '#8b5cf6' },
  { name: 'Emerald Green', color: '#10b981' },
];

