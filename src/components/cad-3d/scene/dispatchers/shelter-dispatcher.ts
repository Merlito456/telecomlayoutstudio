/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CADObject } from '../../../../types/cad';
import { getObjectBounds, getRotatedObjectBounds } from '../../../../utils/cad-geometry';
import { getCabinetActualU } from '../../../../utils/cabinet-u-capacity';

export interface ShelterDispatchParams {
  obj: CADObject;
  stencilId: string;
  objW: number;
  objD: number;
  visible3DObjects: CADObject[];
  builders: any;
}

export function dispatchShelterMesh({
  obj,
  stencilId,
  objW,
  objD,
  visible3DObjects,
  builders,
}: ShelterDispatchParams): THREE.Group | THREE.Mesh | null | undefined {
  const {
    buildShelter3D,
    buildCabinets3D,
    buildWallRoofCanopy3D,
    buildSmallHouse3D,
    buildTelecomRack,
    buildRectifierCabinet,
    buildBatteryBank,
    buildIndoorAC,
    buildFireExtinguisher,
  } = builders.shelter;

  const isRectifierSystem =
    obj.customProps?.isRectifierSystem === true ||
    stencilId?.startsWith('rectifier-') ||
    stencilId === 'rack-power-rectifier' ||
    stencilId === 'flatpack-1' ||
    stencilId === 'rack-dc-pdu';

  if (isRectifierSystem) {
    const customMm = obj.customProps?.heightMm ?? (obj as any).heightMm;
    const customU = obj.customProps?.uHeight ?? obj.uHeight;
    let rH: number;
    if (typeof customMm === 'number' && customMm > 0) {
      rH = (customMm / 2000) * 13.0;
    } else if (typeof customU === 'number' && customU > 0) {
      const mm = Math.round(customU * 44.45 + 130);
      rH = (mm / 2000) * 13.0;
    } else {
      rH = 13.0;
    }
    return buildRectifierCabinet(Math.max(objW, 3.4), rH, Math.max(objD, 3.4), {
      ...(obj.customProps || {}),
      stencilId: stencilId,
      heightMm: customMm ?? (customU ? Math.round(customU * 44.45 + 130) : 2000),
      uHeight: customU ?? 42,
    });
  }

  switch (stencilId) {
    case 'shelter':
    case 'cement-shelter': {
      const feederDia =
        obj.cableHoleDiameterMm ??
        obj.feederDiameter ??
        obj.customProps?.cableHoleDiameterMm ??
        obj.customProps?.cableHoleDiameter ??
        obj.customProps?.feederDiameter ??
        250;
      const sb = getRotatedObjectBounds(obj);
      const hasOverlapInterior = visible3DObjects.some((other) => {
        if (other.id === obj.id || other.isStencilLabel || other.parentId === obj.id) return false;
        const oId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
        const isLadder =
          oId.includes('ladder') ||
          oId.includes('raceway') ||
          oId.includes('tray') ||
          other.ladderType === 'indoor' ||
          other.customProps?.placement === 'indoor';
        const isIntItem =
          isLadder ||
          oId.includes('rack') ||
          oId.includes('rectifier') ||
          oId.includes('battery') ||
          oId.includes('acdb');
        if (!isIntItem) return false;
        const ob = getRotatedObjectBounds(other);
        const otherCenterX = (ob.minX + ob.maxX) / 2;
        const otherCenterY = (ob.minY + ob.maxY) / 2;
        return (
          otherCenterX >= sb.minX &&
          otherCenterX <= sb.maxX &&
          otherCenterY >= sb.minY &&
          otherCenterY <= sb.maxY
        );
      });
      return buildShelter3D(
        objW,
        objD,
        {
          ...(obj.customProps || {}),
          objId: obj.id,
          shelterHeightM: obj.shelterHeightM || (obj.customProps as any)?.shelterHeightM,
          interiorObjects: obj.interiorObjects || (obj.customProps as any)?.interiorObjects,
          doorsOpen: !!(obj.doorsOpen || obj.customProps?.doorsOpen),
          cableHoleDiameterMm: feederDia,
          cableHoleDiameter: feederDia,
          feederDiameter: feederDia,
          cableHoleElevationMm:
            obj.cableHoleElevationMm ??
            obj.feederElevationMm ??
            obj.customProps?.cableHoleElevationMm ??
            obj.customProps?.feederElevationMm,
          feederElevationMm:
            obj.cableHoleElevationMm ??
            obj.feederElevationMm ??
            obj.customProps?.cableHoleElevationMm ??
            obj.customProps?.feederElevationMm,
          hasOverlapInterior,
        },
        stencilId === 'cement-shelter'
      );
    }

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
    case 'rack-telecom-600x600':
    case 'rack-telecom-800x800':
    case 'rack-server-800x1000':
    case 'rack-half-24u':
    case 'rack-bbu-radio':
    case 'rack-open-2post':
    case 'rack-center-2post':
    case 'rack-open-4post':
    case 'rack-wall-12u':
    case 'rack-wall-18u': {
      const sId = (stencilId || '').toLowerCase();
      const customMm = obj.customProps?.heightMm ?? (obj as any).heightMm;
      const customU = obj.customProps?.uHeight ?? obj.uHeight;
      let rH: number;
      if (typeof customMm === 'number' && customMm > 0) {
        rH = (customMm / 2000) * 13.0;
      } else if (typeof customU === 'number' && customU > 0) {
        const mm = Math.round(customU * 44.45 + 130);
        rH = (mm / 2000) * 13.0;
      } else {
        rH = sId.includes('18u')
          ? 6.0
          : sId.includes('24u')
          ? 7.5
          : sId.includes('36u')
          ? 10.5
          : sId.includes('47u') || sId.includes('48u')
          ? 14.0
          : sId.includes('45u')
          ? 13.5
          : 13.0;
      }
      return buildTelecomRack(Math.max(objW, 3.4), rH, Math.max(objD, 3.6), obj);
    }

    case 'rectifier-ericsson-rs':
    case 'rectifier-eltek-rs':
    case 'rectifier-zte-rs':
    case 'rectifier-huawei-rs':
    case 'rectifier-vertiv-rs':
    case 'rectifier-delta-rs':
    case 'rack-power-rectifier':
    case 'flatpack-1':
    case 'rack-dc-pdu': {
      const customMm = obj.customProps?.heightMm ?? (obj as any).heightMm;
      const customU = obj.customProps?.uHeight ?? obj.uHeight;
      let rH: number;
      if (typeof customMm === 'number' && customMm > 0) {
        rH = (customMm / 2000) * 13.0;
      } else if (typeof customU === 'number' && customU > 0) {
        const mm = Math.round(customU * 44.45 + 130);
        rH = (mm / 2000) * 13.0;
      } else {
        rH = 13.0;
      }
      return buildRectifierCabinet(Math.max(objW, 3.4), rH, Math.max(objD, 3.4), {
        ...(obj.customProps || {}),
        stencilId: stencilId,
        heightMm: customMm ?? (customU ? Math.round(customU * 44.45 + 130) : 2000),
        uHeight: customU ?? 42,
      });
    }

    case 'huawei-atn-series':
    case 'huawei-atn-910a':
    case 'huawei-atn-910b':
    case 'huawei-atn-910c':
    case 'huawei-atn-950a':
    case 'huawei-atn-950b':
    case 'huawei-atn-950c':
    case 'huawei-atn-980a':
    case 'huawei-atn-980b':
    case 'huawei-atn-980c':
    case 'nokia-mf02':
    case 'nokia-df16':
    case 'nokia-fx08':
    case 'bay-fh-an6000-17':
    case 'bay-fh-an6000-15':
    case 'bay-fh-an6000-7':
    case 'bay-fh-an5516-01':
    case 'bay-fh-an5516-06b':
    case 'fh-an6000-17':
    case 'fh-an6000-15':
    case 'fh-an6000-7':
    case 'fh-an6000-2':
    case 'fh-an6001-g16':
    case 'fh-an6001-ges16':
    case 'fh-an6001-gf16':
    case 'fh-an6001c-gf16':
    case 'fh-an5516-01':
    case 'fh-an5516-06b':
    case 'fh-an5516-06':
    case 'fh-an5516-04': {
      const sId = (stencilId || '').toLowerCase();
      const customMm = obj.customProps?.heightMm ?? (obj as any).heightMm;
      const customU = obj.customProps?.uHeight ?? obj.uHeight;
      let rH: number;
      if (typeof customMm === 'number' && customMm > 0) {
        rH = (customMm / 2000) * 13.0;
      } else if (typeof customU === 'number' && customU > 0) {
        const mm = Math.round(customU * 44.45 + 130);
        rH = (mm / 2000) * 13.0;
      } else {
        rH = sId.includes('910') ? 4.5
        : sId.includes('950') ? 6.5
        : sId.includes('980') ? 9.5
        : sId === 'nokia-mf02' ? 5.5
        : sId === 'nokia-df16' ? 7.5
        : sId === 'nokia-fx08' ? 10.5
        : sId === 'fh-an6000-17' ? 13.5
        : sId === 'fh-an6000-15' || sId === 'fh-an5516-01' ? 11.5
        : sId === 'fh-an6000-7' || sId === 'fh-an5516-06b' || sId === 'fh-an5516-06' ? 8.0
        : sId === 'fh-an6000-2' || sId === 'fh-an5516-04' ? 5.5
        : sId.startsWith('fh-an6001') ? 4.2
        : 8.5;
      }
      return buildTelecomRack(Math.max(objW, 3.4), rH, Math.max(objD, 3.0), obj);
    }

    case 'rack-battery-string':
    case 'rack-battery-4tier':
      return buildBatteryBank(Math.max(objW, 4.0), 6.5, Math.max(objD, 2.0));

    case 'ac-precision-crac':
    case 'rack-precision-cooling':
      return buildIndoorAC(Math.max(objW, 4.0), 12.0, Math.max(objD, 3.6), {
        ...(obj.customProps || {}),
        stencilId,
        isCRAC: true,
      });

    case 'fire-suppression-fm200':
      return buildFireExtinguisher();

    case 'small-house': {
      const isHouseDoorOpen = !!(obj.doorsOpen || obj.customProps?.doorsOpen);
      return buildSmallHouse3D(objW, objD, {
        ...(obj.customProps || {}),
        objId: obj.id,
        doorsOpen: isHouseDoorOpen,
      });
    }

    case 'air-conditioner':
    case 'wall-mount-ac':
    case 'ac-indoor-split':
    case 'ac-split': {
      const acW = obj.width ? Math.max(3.8, Math.min(8.0, (obj.width / 20) * 6.0)) : 5.6;
      const acD = obj.height ? Math.max(1.2, Math.min(2.4, (obj.height / 20) * 6.0)) : 1.5;
      const acH = 2.0;
      return buildIndoorAC(acW, acH, acD, {
        ...(obj.customProps || {}),
        stencilId,
        isCRAC: false,
      });
    }

    case 'eltek-1bay':
    case 'eltek-2bay':
    case 'eltek-mini-odc':
    case 'eltek-odc':
    case 'huawei-1bay':
    case 'huawei-2bay':
    case 'huawei-mini-odc':
    case 'huawei-odc':
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
    case 'fhodc-odc': {
      const sId = (stencilId || '').toLowerCase();
      const brand = sId.startsWith('huawei')
        ? 'huawei'
        : sId.startsWith('eltek')
        ? 'eltek'
        : sId.startsWith('fushan')
        ? 'fushan'
        : sId.startsWith('ericsson')
        ? 'ericsson'
        : 'fhodc';

      let heightRatio = 1.0;
      if (obj.customProps?.heightRatio !== undefined) {
        heightRatio = Number(obj.customProps.heightRatio);
      } else if (obj.customProps?.bayType === 'mini-odc') {
        heightRatio = 3.5 / 10;
      } else if (obj.customProps?.bayType === 'odc') {
        heightRatio = 4.0 / 10;
      } else if (obj.customProps?.bayType === '1bay' || obj.customProps?.bayType === '2bay') {
        heightRatio = 1.0;
      } else if (sId.includes('mini-odc') || sId.includes('mini')) {
        heightRatio = 3.5 / 10;
      } else if (sId.includes('enc6130')) {
        heightRatio = 0.75;
      } else if (sId.includes('enc6150')) {
        heightRatio = 1.0;
      } else if (sId.includes('1bay') || sId.includes('2bay') || sId.includes('3bay')) {
        heightRatio = 1.0;
      } else if (sId.includes('odc')) {
        heightRatio = 4.0 / 10;
      }
      const options = {
        objId: obj.id,
        name: obj.text || `${brand.toUpperCase()} Cabinet`,
        doorsOpen: !!(obj.doorsOpen || obj.customProps?.doorsOpen),
        rackEquipments: obj.customProps?.rackEquipments || (obj as any).rackEquipments || [],
        bayType: obj.customProps?.bayType,
        totalU: getCabinetActualU(obj),
        placementOrientation:
          obj.customProps?.placementOrientation ||
          (sId.includes('mini') && (sId.includes('fh') || brand === 'fhodc') ? 'vertical' : undefined),
      };
      return buildCabinets3D(objW, objD, brand, true, heightRatio, options);
    }

    case 'odc':
    case 'mini-odc':
    case '1bay-cabinet':
    case 'cabinet-1bay':
    case '2bay-cabinet':
    case 'cabinet-2bay':
    case '3bay-cabinet':
    case 'cabinet-3bay': {
      const sId = (stencilId || '').toLowerCase();
      let heightRatio = 1.0;
      if (obj.customProps?.heightRatio !== undefined) {
        heightRatio = Number(obj.customProps.heightRatio);
      } else if (obj.customProps?.bayType === 'mini-odc') {
        heightRatio = 3.5 / 10;
      } else if (obj.customProps?.bayType === 'odc') {
        heightRatio = 4.0 / 10;
      } else if (obj.customProps?.bayType === '1bay' || obj.customProps?.bayType === '2bay') {
        heightRatio = 1.0;
      } else if (sId.includes('mini-odc') || sId.includes('mini')) {
        heightRatio = 3.5 / 10;
      } else if (sId.includes('1bay') || sId.includes('2bay') || sId.includes('3bay')) {
        heightRatio = 1.0;
      } else if (sId.includes('odc')) {
        heightRatio = 4.0 / 10;
      }
      const options = {
        objId: obj.id,
        name: obj.text || 'Telecom Cabinet',
        doorsOpen: !!(obj.doorsOpen || obj.customProps?.doorsOpen),
        rackEquipments: obj.customProps?.rackEquipments || (obj as any).rackEquipments || [],
        bayType: obj.customProps?.bayType,
        totalU: getCabinetActualU(obj),
        placementOrientation: obj.customProps?.placementOrientation,
      };
      return buildCabinets3D(objW, objD, 'standard', false, heightRatio, options);
    }

    case 'wall-roof-shade':
    case 'wall-roof-canopy': {
      let detectedWallTop = 22.0;
      const customWallTop =
        obj.customProps?.wallTop ??
        (obj.customProps?.canopyHeightM !== undefined
          ? obj.customProps.canopyHeightM * 10
          : undefined);

      if (customWallTop !== undefined) {
        detectedWallTop = customWallTop;
      } else {
        const shadeB = getObjectBounds(obj);
        const searchDist = 50;
        for (const other of visible3DObjects) {
          if (other.id === obj.id) continue;
          const otherId = (other.stencilId || other.customProps?.stencilType || '').toLowerCase();
          const isOtherWall =
            otherId === 'wall' ||
            otherId === 'masonry-wall' ||
            otherId === 'perimeter-wall' ||
            otherId === 'boundary-fence' ||
            otherId === 'cement-fence' ||
            otherId.includes('wall') ||
            otherId.includes('fence') ||
            other.customProps?.isWall ||
            (other.type === 'line' &&
              (other.layerId === 'civil' || other.layerId === 'perimeter'));
          const isOtherShelter =
            otherId === 'shelter' ||
            otherId === 'cement-shelter' ||
            otherId.includes('shelter');

          if (isOtherWall || isOtherShelter) {
            const otherB = getObjectBounds(other);
            const isNearby = !(
              shadeB.maxX < otherB.minX - searchDist ||
              shadeB.minX > otherB.maxX + searchDist ||
              shadeB.maxY < otherB.minY - searchDist ||
              shadeB.minY > otherB.maxY + searchDist
            );
            if (isNearby) {
              if (isOtherWall) {
                detectedWallTop = 22.0;
              } else if (isOtherShelter) {
                detectedWallTop = 21.2;
              }
              break;
            }
          }
        }
      }

      const slopeDeg = obj.customProps?.roofSlopeAngle ?? 12;
      const sheetColor = obj.stroke ? new THREE.Color(obj.stroke).getHex() : 0x38bdf8;
      return buildWallRoofCanopy3D(objW, objD, detectedWallTop, slopeDeg, sheetColor);
    }

    default:
      if (
        stencilId.includes('wall-roof') ||
        stencilId.includes('canopy') ||
        stencilId.includes('roof-shade')
      ) {
        const customWallTop =
          obj.customProps?.wallTop ??
          (obj.customProps?.canopyHeightM !== undefined
            ? obj.customProps.canopyHeightM * 10
            : 22.0);
        const slopeDeg = obj.customProps?.roofSlopeAngle ?? 12;
        const sheetColor = obj.stroke ? new THREE.Color(obj.stroke).getHex() : 0x38bdf8;
        return buildWallRoofCanopy3D(objW, objD, customWallTop, slopeDeg, sheetColor);
      }
      return undefined;
  }
}
