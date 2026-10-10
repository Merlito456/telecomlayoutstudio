import React from 'react';
import { CADObject } from '../../../types/cad';
import { Zap } from 'lucide-react';
import { ACPDBMountingSection } from './acpdb/ACPDBMountingSection';
import { ACPDBDimensionsSection } from './acpdb/ACPDBDimensionsSection';

export interface ACPDBPropertiesCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ACPDBPropertiesCustomizer: React.FC<ACPDBPropertiesCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  const isAcpdb =
    primary.stencilId === 'acpdb-wall' ||
    primary.stencilId === 'acpdb-pole' ||
    primary.stencilId === 'acpdb-dual' ||
    primary.stencilId === 'acpdb' ||
    primary.customProps?.stencilType?.includes('acpdb') ||
    (primary.text && primary.text.toLowerCase().includes('acpdb'));

  if (!isAcpdb) return null;

  return (
    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-sky-950/30 border border-amber-500/40 space-y-3 shadow-md shadow-amber-950/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          ACPDB Distribution Board
        </span>
        <span className="text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          {primary.customProps?.boxCount === 2 || primary.stencilId === 'acpdb-dual'
            ? 'Dual Box (Mains + DG)'
            : primary.customProps?.boxCount === 3
            ? 'Triple Bay (3 Boxes)'
            : primary.customProps?.mounting === 'pole'
            ? 'Pole Mounted (Cut at ACPDB)'
            : primary.customProps?.mounting === 'stand'
            ? 'Pedestal Stand'
            : 'Wall Mounted (Eye-Level)'}
        </span>
      </div>

      <ACPDBMountingSection
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />

      <ACPDBDimensionsSection
        primary={primary}
        onUpdateSelected={onUpdateSelected}
      />
    </div>
  );
};
