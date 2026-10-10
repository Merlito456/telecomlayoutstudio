import React from 'react';
import { CADObject } from '../../types/cad';
import { ATSCustomizer } from './electrical/ATSCustomizer';
import { ACPDBPropertiesCustomizer } from './electrical/ACPDBPropertiesCustomizer';
import { ECBPropertiesCustomizer } from './electrical/ECBPropertiesCustomizer';

export interface ElectricalPanelCustomizerProps {
  primary: CADObject;
  onUpdateSelected: (partial: Partial<CADObject>, recordHistory?: boolean) => void;
  allObjects?: CADObject[];
  onAddToast?: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const ElectricalPanelCustomizer: React.FC<ElectricalPanelCustomizerProps> = ({
  primary,
  onUpdateSelected,
  allObjects,
  onAddToast,
}) => {
  return (
    <>
      <ATSCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />
      <ACPDBPropertiesCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />
      <ECBPropertiesCustomizer
        primary={primary}
        onUpdateSelected={onUpdateSelected}
        allObjects={allObjects}
        onAddToast={onAddToast}
      />
    </>
  );
};

