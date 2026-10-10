import { CADObject, ProjectSettings } from '../../types/cad';
import { renderBrandedCabinet } from './cabinets/render-branded-cabinets';
import { renderLegacyCabinet } from './cabinets/render-legacy-cabinets';
import { renderEquipmentRack } from './cabinets/render-equipment-racks';
import { renderRectifierSystem } from './cabinets/render-rectifier-system';

export function renderCabinetStencil(
  ctx: CanvasRenderingContext2D,
  obj: CADObject,
  _settings: ProjectSettings,
  w: number,
  h: number,
  stencilId: string
): boolean {
  if (stencilId?.startsWith('rectifier-') || (obj.customProps?.isRectifierSystem && stencilId !== 'rack-power-rectifier')) {
    return renderRectifierSystem(ctx, w, h, stencilId, obj);
  }

  if (stencilId?.startsWith('huawei-atn') || stencilId?.startsWith('nokia-') || stencilId?.startsWith('fh-')) {
    return renderEquipmentRack(ctx, w, h, stencilId, obj);
  }

  switch (stencilId) {
    case 'huawei-1bay':
    case 'huawei-2bay':
    case 'huawei-mini-odc':
    case 'huawei-odc':
    case 'eltek-1bay':
    case 'eltek-2bay':
    case 'eltek-mini-odc':
    case 'eltek-odc':
    case 'fushan-1bay':
    case 'fushan-2bay':
    case 'fushan-mini-odc':
    case 'fushan-odc':
    case 'ericsson-1bay':
    case 'ericsson-2bay':
    case 'ericsson-mini-odc':
    case 'ericsson-odc':
    case 'ericsson-enc6150':
    case 'ericsson-enc6130':
    case 'fhodc-1bay':
    case 'fhodc-2bay':
    case 'fhodc-mini-odc':
    case 'fhodc-odc':
      return renderBrandedCabinet(ctx, w, h, stencilId, obj);

    case 'odc':
    case '1bay-cabinet':
    case 'cabinet-1bay':
    case '2bay-cabinet':
    case 'cabinet-2bay':
    case '3bay-cabinet':
    case 'cabinet-3bay':
      return renderLegacyCabinet(ctx, w, h, stencilId, obj);

    case 'flatpack-1':
    case 'huawei-atn-series':
    case 'nokia-mf02':
    case 'nokia-df16':
    case 'nokia-fx08':
    case 'open-rack':
    case 'rack-19in-42u':
    case 'rack-19in-45u':
    case 'rack-19in-47u':
    case 'rack-datacenter-48u':
    case 'rack-mid-36u':
    case 'rack-compact-18u':
    case 'rack-etsi-600x300':
    case 'rack-23in-42u':
    case 'rack-odf-42u':
    case 'rack-odf-high-density':
    case 'rack-dwdm-otn':
    case 'rack-core-router':
    case 'rack-mdf-ddf':
    case 'rack-seismic-z4':
    case 'rack-power-rectifier':
    case 'rack-ups-inverter':
    case 'rack-battery-string':
    case 'rack-open-2post':
    case 'rack-center-2post':
    case 'rack-open-4post':
    case 'rack-wall-12u':
    case 'rack-wall-18u':
    case 'rack-telecom-600x600':
    case 'rack-telecom-800x800':
    case 'rack-server-800x1000':
    case 'rack-half-24u':
    case 'rack-bbu-radio':
    case 'rack-battery-4tier':
    case 'rack-dc-pdu':
    case 'h-frame':
      return renderEquipmentRack(ctx, w, h, stencilId, obj);
  }
  return false;
}
