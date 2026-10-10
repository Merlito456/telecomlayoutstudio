import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { addBarbedWireTopping } from "./barbed-wire";

export function createGate3DBuilder(
  mats: CAD3DSharedMaterials,
  buildCementBasepad: (w: number, d: number, h?: number, withBolts?: boolean, groundY?: number) => THREE.Group,
  doorInteractiveNodesRef?: React.MutableRefObject<Map<string, any>>
) {
  const { cementMat, stainlessMat } = mats;

  return (w: number, excavationDepth = 0, customProps?: Record<string, any>): THREE.Group => {
    const group = new THREE.Group();
    const baseGateH = customProps?.gateHeightM ? customProps.gateHeightM * 10 : 20;
    const gateH = baseGateH;
    const pierSize = 5.0;
    const totalGateH = gateH + excavationDepth;
    const pierH = gateH + 2.5 + excavationDepth;
    const isOpen = customProps?.doorsOpen === true;

    // Left & Right Concrete Gate Pillars
    const pLeft = buildCementBasepad(pierSize, pierSize, pierH, false);
    pLeft.position.set(-w / 2 + pierSize / 2, -excavationDepth, 0);
    group.add(pLeft);

    const pRight = buildCementBasepad(pierSize, pierSize, pierH, false);
    pRight.position.set(w / 2 - pierSize / 2, -excavationDepth, 0);
    group.add(pRight);

    // Top Pyramid Cap on Pillars
    const capGeo = new THREE.ConeGeometry(pierSize * 0.72, 2.0, 4);
    const capLeft = new THREE.Mesh(capGeo, cementMat);
    capLeft.position.set(-w / 2 + pierSize / 2, gateH + 2.5 + 1.0, 0);
    capLeft.rotation.y = Math.PI / 4;
    group.add(capLeft);

    const capRight = new THREE.Mesh(capGeo, cementMat);
    capRight.position.set(w / 2 - pierSize / 2, gateH + 2.5 + 1.0, 0);
    capRight.rotation.y = Math.PI / 4;
    group.add(capRight);

    const clearSpan = Math.max(2, w - pierSize * 2);
    const leafW = clearSpan / 2;
    const gateMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.7 });
    const leafCenterY = (gateH - excavationDepth) / 2;
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.85 });
    const latchMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.35, metalness: 0.8 });
    const primaryHandleY = 10.0;
    const lowerHandleY = excavationDepth > 3.0 ? -excavationDepth + 10.0 : primaryHandleY;
    const handleYList = excavationDepth > 3.0 ? [primaryHandleY, lowerHandleY] : [primaryHandleY];
    const frameRailGeo = new THREE.BoxGeometry(leafW, 0.7, 0.9);
    const numPick = Math.max(3, Math.floor(leafW / 3.5));
    const numMidRails = totalGateH > 24 ? 2 : 1;

    // Left Leaf Hinge Group
    const leftHinge = new THREE.Group();
    leftHinge.position.set(-w / 2 + pierSize, 0, 0);
    leftHinge.rotation.y = isOpen ? Math.PI * 0.48 : 0;

    const leaf1 = new THREE.Mesh(new THREE.BoxGeometry(leafW, totalGateH, 0.8), gateMat);
    leaf1.position.set(leafW / 2, leafCenterY, 0);
    leaf1.castShadow = true;
    leftHinge.add(leaf1);

    const topRailL = new THREE.Mesh(frameRailGeo, stainlessMat);
    topRailL.position.set(leafW / 2, gateH - 0.5, 0);
    leftHinge.add(topRailL);

    const botRailL = new THREE.Mesh(frameRailGeo, stainlessMat);
    botRailL.position.set(leafW / 2, -excavationDepth + 0.5, 0);
    leftHinge.add(botRailL);

    for (let r = 1; r <= numMidRails; r++) {
      const ry = -excavationDepth + (r / (numMidRails + 1)) * totalGateH;
      const midRail = new THREE.Mesh(frameRailGeo, stainlessMat);
      midRail.position.set(leafW / 2, ry, 0);
      leftHinge.add(midRail);
    }

    for (let p = 1; p < numPick; p++) {
      const barGeo = new THREE.CylinderGeometry(0.2, 0.2, totalGateH - 1.2, 8);
      const bar = new THREE.Mesh(barGeo, stainlessMat);
      bar.position.set((p / numPick) * leafW, leafCenterY, 0);
      leftHinge.add(bar);
    }

    const astragalH = Math.max(8.0, primaryHandleY - lowerHandleY + 8.0);
    const astragalCenterY = (primaryHandleY + lowerHandleY) / 2;
    const astragalL = new THREE.Mesh(new THREE.BoxGeometry(1.2, astragalH, 1.1), stainlessMat);
    astragalL.position.set(leafW - 0.6, astragalCenterY, 0);
    leftHinge.add(astragalL);

    handleYList.forEach((hy) => {
      const lockGeo = new THREE.BoxGeometry(1.6, 3.2, 1.3);
      const lock = new THREE.Mesh(lockGeo, stainlessMat);
      lock.position.set(leafW - 0.8, hy, 0);
      leftHinge.add(lock);

      [-1, 1].forEach((side) => {
        const leverStem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), handleMat);
        leverStem.rotation.x = Math.PI / 2;
        leverStem.position.set(leafW - 1.2, hy - 0.2, side * 0.95);
        leftHinge.add(leverStem);

        const leverArm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.25), handleMat);
        leverArm.position.set(leafW - 1.8, hy - 0.2, side * 1.15);
        leftHinge.add(leverArm);
      });
    });

    group.add(leftHinge);

    // Right Leaf Hinge Group
    const rightHinge = new THREE.Group();
    rightHinge.position.set(w / 2 - pierSize, 0, 0);
    rightHinge.rotation.y = isOpen ? -Math.PI * 0.48 : 0;

    const leaf2 = new THREE.Mesh(new THREE.BoxGeometry(leafW, totalGateH, 0.8), gateMat);
    leaf2.position.set(-leafW / 2, leafCenterY, 0);
    leaf2.castShadow = true;
    rightHinge.add(leaf2);

    const topRailR = new THREE.Mesh(frameRailGeo, stainlessMat);
    topRailR.position.set(-leafW / 2, gateH - 0.5, 0);
    rightHinge.add(topRailR);

    const botRailR = new THREE.Mesh(frameRailGeo, stainlessMat);
    botRailR.position.set(-leafW / 2, -excavationDepth + 0.5, 0);
    rightHinge.add(botRailR);

    for (let r = 1; r <= numMidRails; r++) {
      const ry = -excavationDepth + (r / (numMidRails + 1)) * totalGateH;
      const midRail = new THREE.Mesh(frameRailGeo, stainlessMat);
      midRail.position.set(-leafW / 2, ry, 0);
      rightHinge.add(midRail);
    }

    for (let p = 1; p < numPick; p++) {
      const barGeo = new THREE.CylinderGeometry(0.2, 0.2, totalGateH - 1.2, 8);
      const bar = new THREE.Mesh(barGeo, stainlessMat);
      bar.position.set(-(p / numPick) * leafW, leafCenterY, 0);
      rightHinge.add(bar);
    }

    const dropPinH = Math.max(3.0, (lowerHandleY - (-excavationDepth)) * 0.85);
    const dropPin = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, dropPinH, 8), stainlessMat);
    dropPin.position.set(-0.8, -excavationDepth + dropPinH / 2 + (isOpen ? 1.5 : 0), 0.6);
    rightHinge.add(dropPin);

    group.add(rightHinge);

    const sleeveGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 8);
    const sleeve = new THREE.Mesh(sleeveGeo, latchMat);
    sleeve.position.set(0, -excavationDepth + 0.5, 0);
    group.add(sleeve);

    const gateAnchor = new THREE.Object3D();
    gateAnchor.position.set(0, gateH / 2, 0);
    group.add(gateAnchor);

    const targetMap =
      doorInteractiveNodesRef?.current ??
      (doorInteractiveNodesRef instanceof Map ? doorInteractiveNodesRef : null);

    if (customProps?.objId && targetMap && typeof targetMap.set === 'function') {
      let openState = isOpen;
      targetMap.set(customProps.objId, {
        id: customProps.objId,
        name: 'Security Gate',
        doorType: 'security-gate',
        mesh: group,
        anchor: gateAnchor,
        isOpen: () => openState,
        setOpen: (open: boolean) => {
          openState = open;
          leftHinge.rotation.y = open ? Math.PI * 0.48 : 0;
          rightHinge.rotation.y = open ? -Math.PI * 0.48 : 0;
          dropPin.position.y = -excavationDepth + dropPinH / 2 + (open ? 1.5 : 0);
        },
        getWorldPosition: (outVec?: THREE.Vector3) => {
          const v = outVec || new THREE.Vector3();
          gateAnchor.getWorldPosition(v);
          return v;
        },
      });
    }

    addBarbedWireTopping(group, w, gateH + 0.5, 3, false, mats);

    return group;
  };
}
