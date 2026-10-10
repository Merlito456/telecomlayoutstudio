import * as THREE from "three";
import { CAD3DSharedMaterials } from "../materials";

export function createCableLadderBuilders(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat, stainlessMat, telecomGreyMat } = mats;

    const buildBasepadLadder3D = (w: number, d: number, groundDropH = 0): THREE.Group => {
      // If stretched vertically in 2D (d > w), orient side rails along Z (d) and rungs across X (w)
      if (d > w * 1.05) {
        const wrapper = new THREE.Group();
        const inner = buildBasepadLadder3D(d, w, groundDropH);
        inner.rotation.y = Math.PI / 2;
        wrapper.add(inner);
        return wrapper;
      }
      const group = new THREE.Group();
      const trayH = 0.9;
      const trayW = w;
      const trayD = d;
      const standOffH = 0.35; // Low-profile unistrut standoff feet sitting directly on the basepad top surface

      // 1. Galvanized C-channel side rails (top edge at standOffH + trayH = 1.25)
      const railGeo = new THREE.BoxGeometry(trayW, trayH, 0.4);
      const rail1 = new THREE.Mesh(railGeo, galvSteelMat);
      rail1.position.set(0, standOffH + trayH / 2, -trayD / 2);
      rail1.castShadow = true;
      const rail2 = new THREE.Mesh(railGeo, galvSteelMat);
      rail2.position.set(0, standOffH + trayH / 2, trayD / 2);
      rail2.castShadow = true;
      group.add(rail1);
      group.add(rail2);

      // 2. Cross rungs positioned near the top surface of the ladder so cables laid on top (y = 1.25) rest directly on the rungs!
      const rungRadius = 0.18;
      const rungCenterY = standOffH + trayH - rungRadius; // Top of rung is at standOffH + trayH = 1.25!
      const numRungs = Math.max(3, Math.floor(trayW / 3.5));
      for (let r = 0; r <= numRungs; r++) {
        const rx = -trayW / 2 + (r / numRungs) * trayW;
        const rungGeo = new THREE.CylinderGeometry(rungRadius, rungRadius, trayD, 8);
        const rung = new THREE.Mesh(rungGeo, galvSteelMat);
        rung.rotation.x = Math.PI / 2;
        rung.position.set(rx, rungCenterY, 0);
        rung.castShadow = true;
        group.add(rung);
      }

      // 3. Standoff unistrut channel brackets resting directly on the basepad surface (or extending down to ground if bridging a gap)
      const bracketXPositions = [-trayW * 0.35, 0, trayW * 0.35];
      bracketXPositions.forEach((bx) => {
        const totalPostH = standOffH + groundDropH;
        // Base plate footer resting on support surface
        const footerGeo = new THREE.BoxGeometry(1.2, 0.2, trayD + 0.6);
        const footer = new THREE.Mesh(footerGeo, galvSteelMat);
        footer.position.set(bx, -groundDropH + 0.1, 0);
        footer.castShadow = true;
        group.add(footer);

        // Vertical riser posts connecting footer to ladder rails
        [-trayD / 2, trayD / 2].forEach((pz) => {
          const postGeo = new THREE.BoxGeometry(0.4, totalPostH, 0.4);
          const post = new THREE.Mesh(postGeo, galvSteelMat);
          post.position.set(bx, standOffH - totalPostH / 2, pz);
          group.add(post);
        });
      });

      return group;
    };

    // Helper 2: Cabin Feeder Cable Ladder (Connected at indoor ladder to outside of shelter elevated from the ground)
    const buildCabinFeederLadder3D = (w: number, d: number, customFeederElev?: number): THREE.Group => {
      if (d > w * 1.05) {
        const wrapper = new THREE.Group();
        const inner = buildCabinFeederLadder3D(d, w, customFeederElev);
        inner.rotation.y = Math.PI / 2;
        wrapper.add(inner);
        return wrapper;
      }
      const group = new THREE.Group();
      const trayH = 1.2;
      const trayW = w;
      const trayD = d;
      const feederElev = typeof customFeederElev === 'number' && customFeederElev > 0 ? customFeederElev : 16.5; // Elevated high from ground matching standard shelter feeder port level

      // 1. Elevated Heavy-Duty C-Channel Rails
      const feederRailMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.3,
        metalness: 0.7,
      });
      const railGeo = new THREE.BoxGeometry(trayW, trayH, 0.5);
      const rail1 = new THREE.Mesh(railGeo, feederRailMat);
      rail1.position.set(0, feederElev + trayH / 2, -trayD / 2);
      rail1.castShadow = true;
      const rail2 = new THREE.Mesh(railGeo, feederRailMat);
      rail2.position.set(0, feederElev + trayH / 2, trayD / 2);
      rail2.castShadow = true;
      group.add(rail1);
      group.add(rail2);

      // 2. High-Strength Cross Rungs flush with top surface (feederElev + trayH = 15.7)
      const numRungs = Math.max(4, Math.floor(trayW / 4.0));
      for (let r = 0; r <= numRungs; r++) {
        const rx = -trayW / 2 + (r / numRungs) * trayW;
        const rungGeo = new THREE.CylinderGeometry(0.22, 0.22, trayD, 8);
        const rung = new THREE.Mesh(rungGeo, galvSteelMat);
        rung.rotation.x = Math.PI / 2;
        rung.position.set(rx, feederElev + trayH - 0.22, 0);
        rung.castShadow = true;
        group.add(rung);
      }

      // 3. Tall Outdoor Support Bent Stanchions (Reaching all the way from Ground y=0 to feederElev)
      const stanchionX = [-trayW * 0.3, trayW * 0.3];
      stanchionX.forEach((sx) => {
        // Base columns and ground plates
        [-trayD / 2 - 0.4, trayD / 2 + 0.4].forEach((sz) => {
          const colGeo = new THREE.CylinderGeometry(0.4, 0.4, feederElev, 12);
          const col = new THREE.Mesh(colGeo, galvSteelMat);
          col.position.set(sx, feederElev / 2, sz);
          col.castShadow = true;
          group.add(col);

          // Ground base flange plate with anchor bolts
          const flangeGeo = new THREE.BoxGeometry(1.4, 0.3, 1.4);
          const flange = new THREE.Mesh(flangeGeo, new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4 }));
          flange.position.set(sx, 0.15, sz);
          group.add(flange);
        });

        // Horizontal cross-bearer unistrut bar bridging both columns under the tray
        const crossGeo = new THREE.BoxGeometry(0.6, 0.6, trayD + 1.6);
        const cross = new THREE.Mesh(crossGeo, galvSteelMat);
        cross.position.set(sx, feederElev - 0.3, 0);
        group.add(cross);
      });

      // 4. Shelter Wall Feeder Port Penetration Gland Collar at terminal end (x = -trayW / 2)
      const glandGeo = new THREE.BoxGeometry(0.8, trayH + 2.0, trayD + 2.0);
      const glandMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.2, metalness: 0.5 });
      const gland = new THREE.Mesh(glandGeo, glandMat);
      gland.position.set(-trayW / 2, feederElev + trayH / 2, 0);
      group.add(gland);

      // 5. Simulated outdoor coaxial feeder cable bundle sitting in tray
      const cableBundleGeo = new THREE.CylinderGeometry(trayD * 0.25, trayD * 0.25, Math.max(1, trayW - 1), 8);
      const cableBundleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const bundle = new THREE.Mesh(cableBundleGeo, cableBundleMat);
      bundle.rotation.z = Math.PI / 2;
      bundle.position.set(0, feederElev + trayH * 0.4, 0);
      group.add(bundle);

      return group;
    };

    // Helper 3: In-Shelter Cable Ladder / Indoor Ladder (Used inside the shelter, overhead ceiling suspended with yellow fiber raceway)
    const buildIndoorLadder3D = (w: number, d: number): THREE.Group => {
      if (d > w * 1.05) {
        const wrapper = new THREE.Group();
        const inner = buildIndoorLadder3D(d, w);
        inner.rotation.y = Math.PI / 2;
        wrapper.add(inner);
        return wrapper;
      }
      const group = new THREE.Group();
      group.renderOrder = 2;
      const trayH = 0.55;
      const trayW = w;
      const trayD = d;
      const dropRodH = 0.8;

      // 1. High-visibility safety yellow electroplated side rails
      const indoorMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0xca8a04,
        emissiveIntensity: 0.2,
      });
      const railGeo = new THREE.BoxGeometry(trayW, trayH, 0.35);
      const rail1 = new THREE.Mesh(railGeo, indoorMat);
      rail1.position.set(0, trayH / 2, -trayD / 2);
      const rail2 = new THREE.Mesh(railGeo, indoorMat);
      rail2.position.set(0, trayH / 2, trayD / 2);
      group.add(rail1);
      group.add(rail2);

      // 2. Indoor cross rungs
      const numRungs = Math.max(4, Math.floor(trayW / 4));
      for (let r = 0; r <= numRungs; r++) {
        const rx = -trayW / 2 + (r / numRungs) * trayW;
        const rungGeo = new THREE.CylinderGeometry(0.14, 0.14, trayD - 0.2, 8);
        const rung = new THREE.Mesh(rungGeo, stainlessMat);
        rung.rotation.x = Math.PI / 2;
        rung.position.set(rx, trayH - 0.14, 0);
        group.add(rung);
      }

      // 3. Threaded Drop Rods suspended upwards to shelter ceiling
      const rodX = [-trayW * 0.35, 0, trayW * 0.35];
      rodX.forEach((rx) => {
        [-trayD / 2, trayD / 2].forEach((rz) => {
          const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, dropRodH, 6);
          const rod = new THREE.Mesh(rodGeo, galvSteelMat);
          rod.position.set(rx, trayH + dropRodH / 2, rz);
          group.add(rod);

          // Ceiling anchor clamp
          const anchorGeo = new THREE.BoxGeometry(0.6, 0.2, 0.6);
          const anchor = new THREE.Mesh(anchorGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
          anchor.position.set(rx, trayH + dropRodH, rz);
          group.add(anchor);
        });

        // Bottom unistrut trapeze crossbar supporting tray
        const trapezeGeo = new THREE.BoxGeometry(0.35, 0.25, trayD + 0.8);
        const trapeze = new THREE.Mesh(trapezeGeo, galvSteelMat);
        trapeze.position.set(rx, -0.12, 0);
        group.add(trapeze);
      });

      return group;
    };

    // Helper 4: Connecting Transition Ladder (Connects basepad ladder to cabin feeder ladder or tower climbing ladder)
    const buildConnectingLadder3D = (w: number, d: number): THREE.Group => {
      if (d > w * 1.05) {
        const wrapper = new THREE.Group();
        const inner = buildConnectingLadder3D(d, w);
        inner.rotation.y = Math.PI / 2;
        wrapper.add(inner);
        return wrapper;
      }
      const group = new THREE.Group();
      const trayW = w;
      const trayD = d;
      const lowY = 1.5;   // Basepad ladder top surface level
      const highY = 14.5; // Cabin feeder ladder or tower climbing ladder entry level
      const deltaY = highY - lowY;
      const slopeAngle = Math.atan2(deltaY, trayW);
      const slopeLen = Math.sqrt(trayW * trayW + deltaY * deltaY);

      const connMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.35,
        metalness: 0.6,
      });

      // 1. Angled Transition Rails
      const railGeo = new THREE.BoxGeometry(slopeLen, 1.0, 0.4);
      const rail1 = new THREE.Mesh(railGeo, galvSteelMat);
      rail1.rotation.z = slopeAngle;
      rail1.position.set(0, (lowY + highY) / 2, -trayD / 2);
      rail1.castShadow = true;

      const rail2 = new THREE.Mesh(railGeo, galvSteelMat);
      rail2.rotation.z = slopeAngle;
      rail2.position.set(0, (lowY + highY) / 2, trayD / 2);
      rail2.castShadow = true;
      group.add(rail1);
      group.add(rail2);

      // 2. Angled Rungs along transition slope
      const numRungs = Math.max(5, Math.floor(slopeLen / 3.5));
      for (let r = 0; r <= numRungs; r++) {
        const t = r / numRungs;
        const rx = -trayW / 2 + t * trayW;
        const ry = lowY + t * deltaY;
        const rungGeo = new THREE.CylinderGeometry(0.2, 0.2, trayD, 8);
        const rung = new THREE.Mesh(rungGeo, galvSteelMat);
        rung.rotation.x = Math.PI / 2;
        rung.position.set(rx, ry + 0.5, 0);
        rung.castShadow = true;
        group.add(rung);
      }

      // 3. Low Transition Elbow Pivot Bracket (at basepad ladder connection)
      const lowElbowGeo = new THREE.BoxGeometry(1.2, 1.8, trayD + 0.6);
      const lowElbow = new THREE.Mesh(lowElbowGeo, connMat);
      lowElbow.position.set(-trayW / 2, lowY, 0);
      group.add(lowElbow);

      // 4. High Transition Elbow Pivot Bracket (at feeder / tower ladder connection)
      const highElbowGeo = new THREE.BoxGeometry(1.2, 1.8, trayD + 0.6);
      const highElbow = new THREE.Mesh(highElbowGeo, connMat);
      highElbow.position.set(trayW / 2, highY, 0);
      group.add(highElbow);

      // 5. Midpoint Structural Diagonal Knee Brace / Riser Stanchion to Ground
      const midColGeo = new THREE.CylinderGeometry(0.35, 0.35, (lowY + highY) / 2, 8);
      const midCol = new THREE.Mesh(midColGeo, galvSteelMat);
      midCol.position.set(0, (lowY + highY) / 4, 0);
      group.add(midCol);

      return group;
    };

    // Generic fallback for cable ladder
    const buildCableLadderTop3D = (w: number, d: number): THREE.Group => {
      return buildBasepadLadder3D(w, d);
    };

    // Helper: Horizontal Cylindrical Fuel Tank on Saddle Supports (1000L Capacity)

    const buildCableTray3D = (x1: number, z1: number, x2: number, z2: number, w: number): THREE.Group => {
      const group = new THREE.Group();
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const ang = Math.atan2(dz, dx);
      const elevY = 12; // Elevated at 12 units (~2.6m above grade)

      const trayGroup = new THREE.Group();
      trayGroup.position.set(x1, 0, z1);
      trayGroup.rotation.y = -ang;

      // Tray Ladder Rails & Rungs
      const railH = 1.0;
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(len, railH, 0.4), galvSteelMat);
      rail1.position.set(len / 2, elevY, -w / 2);
      rail1.castShadow = true;
      trayGroup.add(rail1);

      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(len, railH, 0.4), galvSteelMat);
      rail2.position.set(len / 2, elevY, w / 2);
      rail2.castShadow = true;
      trayGroup.add(rail2);

      // Cross rungs every 6 units
      for (let rx = 3; rx < len; rx += 6) {
        const rung = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, w), galvSteelMat);
        rung.position.set(rx, elevY - 0.2, 0);
        rung.castShadow = true;
        trayGroup.add(rung);
      }

      // Vertical Support Bents (Unistrut posts to ground)
      for (let px = 6; px < len; px += 24) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, elevY, 8), galvSteelMat);
        post.position.set(px, elevY / 2, 0);
        post.castShadow = true;
        trayGroup.add(post);

        // Concrete footing plinth at ground level
        const foot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 2.4), cementMat);
        foot.position.set(px, 0.5, 0);
        trayGroup.add(foot);
      }

      // Hardcoded wire visualization removed - line objects in the CAD design represent actual wires!
      group.add(trayGroup);
      return group;
    };

  return {
    buildBasepadLadder3D,
    buildCabinFeederLadder3D,
    buildIndoorLadder3D,
    buildConnectingLadder3D,
    buildCableLadderTop3D,
    buildCableTray3D,
  };
}
