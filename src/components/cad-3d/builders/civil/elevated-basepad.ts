import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createElevatedBasepadBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat, stainlessMat } = mats;

  return (w: number, d: number, props?: Record<string, any>): THREE.Group => {
    const group = new THREE.Group();
    const elH = props?.elevationHeight ? props.elevationHeight / 100 : 8.0;
    const stairsWall: 'north' | 'south' | 'east' | 'west' | 'none' = props?.stairsWall || 'south';
    const railingN: boolean = props?.railingNorth !== false;
    const railingS: boolean = props?.railingSouth ?? (stairsWall === 'south' ? false : true);
    const railingE: boolean = props?.railingEast !== false;
    const railingW: boolean = props?.railingWest !== false;
    const busbarWall: 'north' | 'south' | 'east' | 'west' | 'none' = props?.busbarWall || 'east';

    // 1. Concrete Footing Piers + Steel Stanchion Columns at 4 corners
    const pierPositions = [
      { x: -w / 2 + 3, z: -d / 2 + 3 },
      { x: w / 2 - 3, z: -d / 2 + 3 },
      { x: -w / 2 + 3, z: d / 2 - 3 },
      { x: w / 2 - 3, z: d / 2 - 3 },
    ];
    if (w >= 20) {
      pierPositions.push({ x: 0, z: -d / 2 + 3 });
      pierPositions.push({ x: 0, z: d / 2 - 3 });
    }

    pierPositions.forEach((pt) => {
      const footGeo = new THREE.BoxGeometry(4.5, 2.0, 4.5);
      const foot = new THREE.Mesh(footGeo, cementMat);
      foot.position.set(pt.x, 1.0, pt.z);
      group.add(foot);

      const colH = elH - 2.0;
      const colGeo = new THREE.BoxGeometry(2.2, colH, 2.2);
      const col = new THREE.Mesh(colGeo, galvSteelMat);
      col.position.set(pt.x, 2.0 + colH / 2, pt.z);
      col.castShadow = true;
      group.add(col);

      const flgGeo = new THREE.BoxGeometry(3.5, 0.4, 3.5);
      const flg = new THREE.Mesh(flgGeo, stainlessMat);
      flg.position.set(pt.x, elH - 0.2, pt.z);
      group.add(flg);
    });

    // 2. Structural Platform Deck
    const deckThick = 1.8;
    const deckGeo = new THREE.BoxGeometry(w, deckThick, d);
    const deck = new THREE.Mesh(deckGeo, cementMat);
    deck.position.y = elH + deckThick / 2;
    deck.castShadow = true;
    deck.receiveShadow = true;
    group.add(deck);

    const rimGeo = new THREE.BoxGeometry(w + 0.6, deckThick + 0.4, d + 0.6);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.7 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = elH + deckThick / 2;
    group.add(rim);

    // 3. Safety Railings
    const railH = 7.0;
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const railSilverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.8 });

    const addRailSide = (side: 'north' | 'south' | 'east' | 'west') => {
      const isHoriz = side === 'north' || side === 'south';
      const span = isHoriz ? w : d;
      const zPos = side === 'north' ? -d / 2 : side === 'south' ? d / 2 : 0;
      const xPos = side === 'west' ? -w / 2 : side === 'east' ? w / 2 : 0;

      const railTopGeo = new THREE.CylinderGeometry(0.3, 0.3, span, 8);
      const railTop = new THREE.Mesh(railTopGeo, railSilverMat);
      if (isHoriz) {
        railTop.rotation.z = Math.PI / 2;
        railTop.position.set(0, elH + deckThick + railH, zPos);
      } else {
        railTop.rotation.x = Math.PI / 2;
        railTop.position.set(xPos, elH + deckThick + railH, 0);
      }
      group.add(railTop);

      const railMid = railTop.clone();
      railMid.position.y = elH + deckThick + railH * 0.5;
      group.add(railMid);

      const numPosts = Math.max(2, Math.floor(span / 8));
      for (let i = 0; i <= numPosts; i++) {
        const t = i / numPosts;
        const px = isHoriz ? -w / 2 + t * w : xPos;
        const pz = isHoriz ? zPos : -d / 2 + t * d;

        const postGeo = new THREE.CylinderGeometry(0.4, 0.4, railH, 8);
        const post = new THREE.Mesh(postGeo, yellowMat);
        post.position.set(px, elH + deckThick + railH / 2, pz);
        group.add(post);
      }
    };

    if (railingN) addRailSide('north');
    if (railingS) addRailSide('south');
    if (railingE) addRailSide('east');
    if (railingW) addRailSide('west');

    // 4. 3D Stairs Stepping Down to Ground
    if (stairsWall !== 'none') {
      const numSteps = 5;
      const stairW = 8.0;
      const runLen = 10.0;
      const stepH = elH / numSteps;
      const stepD = runLen / numSteps;

      for (let s = 0; s < numSteps; s++) {
        const sy = (s + 0.5) * stepH;
        const sFraction = (numSteps - 1 - s) / numSteps;
        const sOffset = 1.0 + sFraction * runLen;

        let sx = 0;
        let sz = 0;
        let geoW = stairW;
        let geoD = stepD + 0.5;

        if (stairsWall === 'south') {
          sx = 0;
          sz = d / 2 + sOffset;
        } else if (stairsWall === 'north') {
          sx = 0;
          sz = -d / 2 - sOffset;
        } else if (stairsWall === 'east') {
          sx = w / 2 + sOffset;
          sz = 0;
          geoW = stepD + 0.5;
          geoD = stairW;
        } else {
          sx = -w / 2 - sOffset;
          sz = 0;
          geoW = stepD + 0.5;
          geoD = stairW;
        }

        const stepGeo = new THREE.BoxGeometry(geoW, stepH, geoD);
        const stepMesh = new THREE.Mesh(stepGeo, cementMat);
        stepMesh.position.set(sx, sy, sz);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        group.add(stepMesh);

        const noseGeo = new THREE.BoxGeometry(geoW, 0.3, 0.6);
        const noseMesh = new THREE.Mesh(noseGeo, yellowMat);
        noseMesh.position.set(sx, sy + stepH / 2, sz);
        group.add(noseMesh);
      }
    }

    // 5. 3D Copper Ground Busbar (MGB)
    if (busbarWall !== 'none') {
      const copperMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });
      const bbW = 6.0;
      const bbH = 1.2;
      const bbD = 0.4;
      const bbGeo = new THREE.BoxGeometry(bbW, bbH, bbD);
      const bb = new THREE.Mesh(bbGeo, copperMat);

      if (busbarWall === 'east') {
        bb.rotation.y = Math.PI / 2;
        bb.position.set(w / 2 + 0.4, elH + deckThick / 2, 0);
      } else if (busbarWall === 'west') {
        bb.rotation.y = Math.PI / 2;
        bb.position.set(-w / 2 - 0.4, elH + deckThick / 2, 0);
      } else if (busbarWall === 'north') {
        bb.position.set(0, elH + deckThick / 2, -d / 2 - 0.4);
      } else {
        bb.position.set(0, elH + deckThick / 2, d / 2 + 0.4);
      }
      group.add(bb);
    }

    return group;
  };
}
