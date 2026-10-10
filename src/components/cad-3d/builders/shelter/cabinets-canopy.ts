import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";

export function createCabinetsAndCanopyBuilders(
  mats: CAD3DSharedMaterials,
  doorInteractiveNodesRef?: any
) {
  const { cementMat, galvSteelMat, genGreenMat, telecomGreyMat, stainlessMat, porcelainRedMat, porcelainBlueMat } = mats;

      const buildCabinets3D = (
      w: number,
      d: number,
      brand = 'standard',
      isWhite = false,
      heightRatio = 1.0, // 1-Bay & 2-Bay = 1.0 (equal height); ODC = 4/10 (0.40); MINI ODC = 3.5/10 (0.35) REGARDLESS OF BRAND
      options?: {
        objId?: string;
        name?: string;
        doorsOpen?: boolean;
        rackEquipments?: any[];
        bayType?: string;
        totalU?: number;
        placementOrientation?: 'horizontal' | 'vertical';
      }
    ): THREE.Group => {
      const group = new THREE.Group();
      // User specifications for cabinet heights:
      // - 1 Bay = 2 Bay in height (standard full height 14.0, ratio 1.0)
      // - ODC = 4/10 of 1 Bay (ratio 0.40, height 5.6)
      // - MINI ODC = 3.5/10 of 1 Bay (ratio 0.35, height 4.9)
      const standard1BayH = 14.0;
      const cabH = standard1BayH * heightRatio;
      const isOpen = !!options?.doorsOpen;

      // Cabinet housing material
      const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.25,
        metalness: 0.1,
      });
      const housingMat = isWhite ? whiteMat : telecomGreyMat;
      const darkInteriorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0f1d,
        roughness: 0.7,
        metalness: 0.3,
      });

      // 1. Cabinet Outer Shell Enclosure (Back wall, left & right walls, bottom plate)
      const wallT = 0.35;
      // Back panel
      const backGeo = new THREE.BoxGeometry(w, cabH, wallT);
      const backWall = new THREE.Mesh(backGeo, housingMat);
      backWall.position.set(0, cabH / 2, -d / 2 + wallT / 2);
      backWall.castShadow = true;
      group.add(backWall);

      // Left wall
      const sideGeo = new THREE.BoxGeometry(wallT, cabH, d);
      const leftWall = new THREE.Mesh(sideGeo, housingMat);
      leftWall.position.set(-w / 2 + wallT / 2, cabH / 2, 0);
      leftWall.castShadow = true;
      group.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(sideGeo, housingMat);
      rightWall.position.set(w / 2 - wallT / 2, cabH / 2, 0);
      rightWall.castShadow = true;
      group.add(rightWall);

      // Bottom plate
      const botGeo = new THREE.BoxGeometry(w, 0.4, d);
      const botPlate = new THREE.Mesh(botGeo, housingMat);
      botPlate.position.set(0, 0.2, 0);
      group.add(botPlate);

      // Interior back lining
      const innerBackGeo = new THREE.BoxGeometry(w - wallT * 2, cabH - 0.8, 0.1);
      const innerBack = new THREE.Mesh(innerBackGeo, darkInteriorMat);
      innerBack.position.set(0, cabH / 2, -d / 2 + wallT + 0.05);
      group.add(innerBack);

      // Sloped weather hood
      const hoodGeo = new THREE.BoxGeometry(w + 1.5, 0.8, d + 1.5);
      const hood = new THREE.Mesh(hoodGeo, housingMat);
      hood.position.y = cabH + 0.4;
      hood.castShadow = true;
      group.add(hood);

      // Galvanized steel anchor base frame / mounting brackets
      const footGeo = new THREE.BoxGeometry(0.8, 0.3, 0.8);
      const footOffsets = [
        [-w / 2 + 0.5, -d / 2 + 0.5],
        [w / 2 - 0.5, -d / 2 + 0.5],
        [-w / 2 + 0.5, d / 2 - 0.5],
        [w / 2 - 0.5, d / 2 - 0.5],
      ];
      for (const [fx, fz] of footOffsets) {
        const foot = new THREE.Mesh(footGeo, galvSteelMat);
        foot.position.set(fx, 0.15, fz);
        group.add(foot);
      }

      // Interior LED Light (illuminates cabinet contents when door is opened)
      const interiorLight = new THREE.PointLight(0xfff7ed, 0.8, Math.max(8.0, cabH * 1.5));
      interiorLight.position.set(0, cabH - 1.0, 0);
      interiorLight.visible = isOpen;
      group.add(interiorLight);

      // 2. Open Bay 19" Rack Frame inside each Cabinet Bay
      // (The outdoor cabinet is an open bay rack enclosed inside the weatherproof cabinet shell - NO horizontal platform)
      const bays = w > 25 ? 2 : 1;
      const bayW = (w - wallT * 2) / bays;
      const rackW = Math.max(2.2, bayW - 0.7);
      const rackD = Math.max(1.8, d - wallT * 2 - 1.0);
      const rackH = cabH - 1.2;
      const postThickness = 0.26;
      const postGeo = new THREE.BoxGeometry(postThickness, rackH, postThickness);

      const railSteelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.3,
      });
      const darkSteelMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.35,
      });

      for (let b = 0; b < bays; b++) {
        const bayCenterX = -w / 2 + wallT + b * bayW + bayW / 2;
        const frontZ = d / 2 - 0.8;
        const rearZ = frontZ - rackD;

        // 4 Upright Vertical Posts: Front Left/Right & Rear Left/Right (4-Post Open Bay Rack)
        const postOffsets: [number, number][] = [
          [bayCenterX - rackW / 2 + postThickness / 2, frontZ],
          [bayCenterX + rackW / 2 - postThickness / 2, frontZ],
          [bayCenterX - rackW / 2 + postThickness / 2, rearZ],
          [bayCenterX + rackW / 2 - postThickness / 2, rearZ],
        ];

        postOffsets.forEach(([px, pz]) => {
          const post = new THREE.Mesh(postGeo, railSteelMat);
          post.position.set(px, cabH / 2, pz);
          group.add(post);
        });

        // EIA-310 19" Front Mounting Flanges with Unit Ticks
        const tickGeo = new THREE.BoxGeometry(0.1, 0.08, 0.04);
        const tickCount = Math.max(6, Math.floor(rackH / 1.2));
        for (let t = 1; t <= tickCount; t++) {
          const ty = 0.6 + (t / (tickCount + 1)) * (rackH - 1.2);
          for (const px of [
            bayCenterX - rackW / 2 + postThickness / 2,
            bayCenterX + rackW / 2 - postThickness / 2,
          ]) {
            const tick = new THREE.Mesh(tickGeo, stainlessMat);
            tick.position.set(px, ty, frontZ + postThickness / 2 + 0.02);
            group.add(tick);
          }
        }

        // Horizontal Depth Side Rails (connecting front and rear posts on left and right sides)
        const sideRailGeo = new THREE.BoxGeometry(0.14, 0.22, rackD - postThickness);
        for (const sy of [cabH * 0.25, cabH * 0.5, cabH * 0.75]) {
          const sRailL = new THREE.Mesh(sideRailGeo, darkSteelMat);
          sRailL.position.set(
            bayCenterX - rackW / 2 + postThickness / 2,
            sy,
            (frontZ + rearZ) / 2
          );
          group.add(sRailL);

          const sRailR = new THREE.Mesh(sideRailGeo, darkSteelMat);
          sRailR.position.set(
            bayCenterX + rackW / 2 - postThickness / 2,
            sy,
            (frontZ + rearZ) / 2
          );
          group.add(sRailR);
        }

        // Top Horizontal Cross Beams connecting left and right posts (front and rear)
        const topBeamGeo = new THREE.BoxGeometry(rackW, 0.24, 0.16);
        const topFrontBeam = new THREE.Mesh(topBeamGeo, darkSteelMat);
        topFrontBeam.position.set(bayCenterX, cabH - 0.7, frontZ);
        group.add(topFrontBeam);

        const topRearBeam = new THREE.Mesh(topBeamGeo, darkSteelMat);
        topRearBeam.position.set(bayCenterX, cabH - 0.7, rearZ);
        group.add(topRearBeam);

        // Top Cable Runway Entry Bracket
        const topDuctGeo = new THREE.BoxGeometry(rackW * 0.65, 0.35, 0.35);
        const topDuct = new THREE.Mesh(
          topDuctGeo,
          new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            metalness: 0.6,
            roughness: 0.4,
          })
        );
        topDuct.position.set(bayCenterX, cabH - 0.45, (frontZ + rearZ) / 2);
        group.add(topDuct);

        // Bottom Base Mounting Cross Angles & Seismic Anchors
        const botBeamGeo = new THREE.BoxGeometry(rackW, 0.28, 0.2);
        const botFrontBeam = new THREE.Mesh(botBeamGeo, darkSteelMat);
        botFrontBeam.position.set(bayCenterX, 0.45, frontZ);
        group.add(botFrontBeam);

        const botRearBeam = new THREE.Mesh(botBeamGeo, darkSteelMat);
        botRearBeam.position.set(bayCenterX, 0.45, rearZ);
        group.add(botRearBeam);
      }

      // 3. Internal Installed Equipments (Mounted directly in 19" Open Bay Rack U-Slots or Vertical Subrack)
      const equips = options?.rackEquipments || [];
      const totalU = options?.totalU || (heightRatio === 1.0 ? 36 : heightRatio > 0.35 ? 18 : 12);
      const isVerticalPlacement =
        options?.placementOrientation === 'vertical' ||
        (options?.bayType === 'mini-odc' && brand === 'fhodc') ||
        (heightRatio <= 0.35 && (brand === 'fhodc' || (options?.name || '').toLowerCase().includes('fh')));

      if (equips && equips.length > 0) {
        const availH = cabH - 1.8;
        const equipDepth = Math.max(1.5, Math.min(d - 1.2, 3.2));
        const bayCenterX = bays === 1 ? 0 : -w / 2 + wallT + bayW / 2;
        const equipW = Math.max(2.0, bayW - 0.9);

        if (isVerticalPlacement) {
          // Vertical subrack cassettes (FH Mini ODC style)
          const bladeH = Math.max(1.5, availH);
          const centerY = 0.9 + bladeH / 2;
          const slotUnitW = equipW / totalU;

          equips.forEach((eq: any) => {
            const slot = Math.max(1, Math.min(totalU, eq.uSlot || 1));
            const uCount = Math.max(1, eq.uHeight || 1);
            const bladeW = Math.max(0.18, uCount * slotUnitW - 0.04);
            const startX = bayCenterX - equipW / 2 + (slot - 1) * slotUnitW;
            const bladeCenterX = startX + bladeW / 2;

            const eqGeo = new THREE.BoxGeometry(bladeW, bladeH - 0.08, equipDepth);
            const eqMat = new THREE.MeshStandardMaterial({
              color: eq.color ? new THREE.Color(eq.color) : new THREE.Color(0x1e293b),
              roughness: 0.4,
              metalness: 0.6,
            });
            const eqMesh = new THREE.Mesh(eqGeo, eqMat);
            eqMesh.position.set(bladeCenterX, centerY, d / 2 - 1.0 - equipDepth / 2);
            group.add(eqMesh);

            // LED status at top of blade faceplate
            const ledGeo = new THREE.SphereGeometry(0.06, 8, 8);
            const ledMat = new THREE.MeshBasicMaterial({
              color: eq.category === 'power' ? 0xf59e0b : eq.category === 'bbu' ? 0x22c55e : 0x38bdf8,
            });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(bladeCenterX, centerY + bladeH / 2 - 0.25, d / 2 - 0.95);
            group.add(led);

            // Top & bottom cassette latch handles
            const latchGeo = new THREE.BoxGeometry(Math.max(0.12, bladeW - 0.04), 0.12, 0.06);
            const latchTop = new THREE.Mesh(latchGeo, stainlessMat);
            latchTop.position.set(bladeCenterX, centerY + bladeH / 2 - 0.08, d / 2 - 0.95);
            group.add(latchTop);

            const latchBot = new THREE.Mesh(latchGeo, stainlessMat);
            latchBot.position.set(bladeCenterX, centerY - bladeH / 2 + 0.08, d / 2 - 0.95);
            group.add(latchBot);
          });
        } else {
          // Standard Horizontal EIA mounting
          equips.forEach((eq: any) => {
            const slot = Math.max(1, Math.min(totalU, eq.uSlot || 1));
            const uH = Math.max(1, eq.uHeight || 1);
            const normY = Math.max(0, (slot - 1) / totalU);
            const eqH = Math.max(0.4, (uH / totalU) * availH);
            const eqY = 0.8 + normY * availH + eqH / 2;

            const eqGeo = new THREE.BoxGeometry(equipW, eqH - 0.05, equipDepth);
            const eqMat = new THREE.MeshStandardMaterial({
              color: eq.color ? new THREE.Color(eq.color) : new THREE.Color(0x1e293b),
              roughness: 0.4,
              metalness: 0.6,
            });
            const eqMesh = new THREE.Mesh(eqGeo, eqMat);
            eqMesh.position.set(bayCenterX, eqY, d / 2 - 1.0 - equipDepth / 2);
            group.add(eqMesh);

            // LED Status light on faceplate
            const ledGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const ledMat = new THREE.MeshBasicMaterial({
              color: eq.category === 'power' ? 0xf59e0b : eq.category === 'bbu' ? 0x22c55e : 0x38bdf8,
            });
            const led = new THREE.Mesh(ledGeo, ledMat);
            led.position.set(bayCenterX - equipW / 2 + 0.3, eqY, d / 2 - 0.95);
            group.add(led);

            // Left & right rack mounting ears flush with front 19" vertical rails
            const earGeo = new THREE.BoxGeometry(0.18, eqH - 0.05, 0.08);
            const earL = new THREE.Mesh(earGeo, stainlessMat);
            earL.position.set(bayCenterX - equipW / 2 - 0.06, eqY, d / 2 - 0.95);
            group.add(earL);

            const earR = new THREE.Mesh(earGeo, stainlessMat);
            earR.position.set(bayCenterX + equipW / 2 + 0.06, eqY, d / 2 - 0.95);
            group.add(earR);
          });
        }
      }
      // Note: If no equipments are installed, the 4-post open-bay rack frame inside remains clean, open, and unobstructed with NO horizontal platform/shelves.

      // 4. Hinged Cabinet Front Doors
      let leftPivot: THREE.Group | null = null;
      let rightPivot: THREE.Group | null = null;

      if (bays === 1) {
        // Single Bay Cabinet: 1 hinged door leaf on left front corner
        const doorW = w - 0.2;
        leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2 + 0.15, 0, d / 2);
        leftPivot.rotation.y = isOpen ? Math.PI * 0.58 : 0;

        const doorLeafGeo = new THREE.BoxGeometry(doorW, cabH - 0.6, 0.3);
        const doorLeaf = new THREE.Mesh(doorLeafGeo, housingMat);
        doorLeaf.position.set(doorW / 2, cabH / 2, 0);
        doorLeaf.castShadow = true;
        leftPivot.add(doorLeaf);

        // Weather gasket inside edge
        const gasketGeo = new THREE.BoxGeometry(doorW - 0.4, cabH - 1.0, 0.05);
        const gasketMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
        const gasket = new THREE.Mesh(gasketGeo, gasketMat);
        gasket.position.set(doorW / 2, cabH / 2, -0.16);
        leftPivot.add(gasket);

        // Stainless flush handle on open edge
        const hndlH = Math.max(0.8, Math.min(2.5, cabH * 0.22));
        const hndlGeo = new THREE.BoxGeometry(0.5, hndlH, 0.4);
        const hndlMat = new THREE.MeshStandardMaterial({
          color: brand === 'eltek' ? 0x0284c7 : 0x1e293b,
          roughness: 0.3,
          metalness: 0.8,
        });
        const hndl = new THREE.Mesh(hndlGeo, hndlMat);
        hndl.position.set(doorW - 0.8, cabH * 0.5, 0.2);
        leftPivot.add(hndl);

        // Brand emblem badge on door exterior
        if (brand === 'huawei') {
          const emblemMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
          const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 16), emblemMat);
          emblem.rotation.x = Math.PI / 2;
          emblem.position.set(doorW / 2, cabH * 0.82, 0.18);
          leftPivot.add(emblem);
        } else if (brand === 'eltek') {
          const logoBadge = new THREE.Mesh(new THREE.BoxGeometry(Math.min(doorW * 0.45, 3.5), 0.8, 0.05), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
          logoBadge.position.set(doorW / 2, cabH * 0.82, 0.18);
          leftPivot.add(logoBadge);
        }

        group.add(leftPivot);
      } else {
        // 2-Bay Cabinet: Dual doors hinged on left and right edges
        const doorW = bayW + 0.1;

        // Left door pivot
        leftPivot = new THREE.Group();
        leftPivot.position.set(-w / 2 + 0.15, 0, d / 2);
        leftPivot.rotation.y = isOpen ? -Math.PI * 0.58 : 0;

        const leafL = new THREE.Mesh(new THREE.BoxGeometry(doorW, cabH - 0.6, 0.3), housingMat);
        leafL.position.set(doorW / 2, cabH / 2, 0);
        leafL.castShadow = true;
        leftPivot.add(leafL);

        const hndlL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.4), stainlessMat);
        hndlL.position.set(doorW - 0.6, cabH * 0.5, 0.2);
        leftPivot.add(hndlL);

        group.add(leftPivot);

        // Right door pivot
        rightPivot = new THREE.Group();
        rightPivot.position.set(w / 2 - 0.15, 0, d / 2);
        rightPivot.rotation.y = isOpen ? Math.PI * 0.58 : 0;

        const leafR = new THREE.Mesh(new THREE.BoxGeometry(doorW, cabH - 0.6, 0.3), housingMat);
        leafR.position.set(-doorW / 2, cabH / 2, 0);
        leafR.castShadow = true;
        rightPivot.add(leafR);

        const hndlR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.4), stainlessMat);
        hndlR.position.set(-doorW + 0.6, cabH * 0.5, 0.2);
        rightPivot.add(hndlR);

        group.add(rightPivot);
      }

      // Proximity interaction anchor at front center of cabinet
      const cabinetAnchor = new THREE.Object3D();
      cabinetAnchor.position.set(0, cabH / 2, d / 2 + 0.6);
      group.add(cabinetAnchor);

      // Register with doorInteractiveNodesRef for Roam / 3D Walkthrough Key [Z] interaction
      const targetMap =
        doorInteractiveNodesRef?.current ??
        (doorInteractiveNodesRef instanceof Map ? doorInteractiveNodesRef : null);

      if (options?.objId && targetMap && typeof targetMap.set === 'function') {
        let openState = isOpen;
        targetMap.set(options.objId, {
          id: options.objId,
          name: options.name || `${brand.toUpperCase()} Cabinet Door`,
          doorType: 'cabinet-door',
          mesh: group,
          anchor: cabinetAnchor,
          isOpen: () => openState,
          setOpen: (open: boolean) => {
            openState = open;
            if (leftPivot) {
              leftPivot.rotation.y = open ? (bays > 1 ? -Math.PI * 0.58 : Math.PI * 0.58) : 0;
            }
            if (rightPivot) {
              rightPivot.rotation.y = open ? Math.PI * 0.58 : 0;
            }
            interiorLight.visible = open;
          },
          getWorldPosition: (outVec?: THREE.Vector3) => {
            const v = outVec || new THREE.Vector3();
            cabinetAnchor.getWorldPosition(v);
            return v;
          },
        });
      }

      return group;
    };

    // Helper: Wall-Attached Equipment Roof Canopy (Lean-to Shade for Electrical Equipment)
    const buildWallRoofCanopy3D = (
      w: number,
      d: number,
      wallTop = 22.0,
      slopeDeg = 12,
      roofColor = 0x38bdf8
    ): THREE.Group => {
      const group = new THREE.Group();
      const wallH = wallTop; // Exact height of perimeter wall coping cap where canopy attaches
      const slopeDrop = Math.max(1.8, Math.min(5.0, Math.tan((slopeDeg * Math.PI) / 180) * d));
      const canopyFrontH = Math.max(6.0, wallH - slopeDrop); // Downward slope away from wall for rain runoff
      const ledgerThick = 1.0;

      // 1. Heavy Structural C-Channel Ledger attached flush to top of wall
      const ledgerGeo = new THREE.BoxGeometry(w, 1.2, ledgerThick);
      const ledger = new THREE.Mesh(ledgerGeo, galvSteelMat);
      ledger.position.set(0, wallH - 0.6, -d / 2);
      group.add(ledger);

      // 2. Corrugated Galvanized Metal Canopy Sheet (Sloped roof)
      const slopeLen = Math.hypot(d, wallH - canopyFrontH);
      const slopeAngle = Math.atan2(wallH - canopyFrontH, d);

      const roofGeo = new THREE.BoxGeometry(w + 1.2, 0.4, slopeLen);
      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        metalness: 0.75,
        roughness: 0.35,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, (wallH + canopyFrontH) / 2, 0);
      roof.rotation.x = slopeAngle;
      roof.castShadow = true;
      group.add(roof);

      // Corrugated ribs on canopy top
      for (let rx = -w / 2 + 1.5; rx <= w / 2 - 1.5; rx += 3.0) {
        const ribGeo = new THREE.BoxGeometry(0.3, 0.25, slopeLen);
        const rib = new THREE.Mesh(ribGeo, galvSteelMat);
        rib.position.set(rx, (wallH + canopyFrontH) / 2 + 0.3, 0);
        rib.rotation.x = slopeAngle;
        group.add(rib);
      }

      // 3. Structural Cantilever Rafters & Horizontal Wall Ties (Parallel to ground, NO posts to ground)
      const rafterPositions = [-w / 2 + 1.5, 0, w / 2 - 1.5];
      rafterPositions.forEach((rx) => {
        // Heavy Horizontal Cantilever Outrigger Structural Beam:
        // Connected from the outer end of the roof (d / 2) HORIZONTALLY back to the wall (-d / 2), PARALLEL TO THE GROUND!
        const beamGeo = new THREE.BoxGeometry(0.6, 0.8, d);
        const beam = new THREE.Mesh(beamGeo, galvSteelMat);
        beam.position.set(rx, canopyFrontH, 0); // Horizontal, parallel to ground
        beam.castShadow = true;
        group.add(beam);

        // Heavy Wall Connection Flange Plate at the wall
        const wallFlange = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.4), galvSteelMat);
        wallFlange.position.set(rx, canopyFrontH, -d / 2);
        group.add(wallFlange);

        // Outer Eave Connection Bracket at end of roof
        const eaveBracket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.4), galvSteelMat);
        eaveBracket.position.set(rx, canopyFrontH, d / 2);
        group.add(eaveBracket);

        // Diagonal Cantilever Gusset Knee-Brace Bracket tying horizontal beam back to wall
        const braceHeight = Math.min(4.0, wallH - canopyFrontH + 1.0);
        const braceLen = Math.hypot(d * 0.4, braceHeight);
        const braceAngle = Math.atan2(braceHeight, d * 0.4);
        const braceGeo = new THREE.CylinderGeometry(0.3, 0.3, braceLen, 6);
        const brace = new THREE.Mesh(braceGeo, galvSteelMat);
        brace.position.set(rx, canopyFrontH - 1.8, -d / 2 + (d * 0.2));
        brace.rotation.x = braceAngle;
        group.add(brace);
      });

      // 4. Front Gutter Eave
      const gutterGeo = new THREE.BoxGeometry(w + 1.4, 0.8, 0.8);
      const gutter = new THREE.Mesh(gutterGeo, galvSteelMat);
      gutter.position.set(0, canopyFrontH, d / 2 + 0.4);
      group.add(gutter);

      // Area underneath is intentionally hollow & open so equipment placed inside sits shaded underneath
      return group;
    };

    // Helper: ATS (Automatic Transfer Switch - Wall Mounted Enclosure / Cabinet)

    const buildSmallHouse3D = (w: number, d: number, props?: Record<string, any>): THREE.Group => {
      const group = new THREE.Group();
      const wallH = 12.0;

      // Concrete foundation base
      const fnd = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 1.4, d + 1), cementMat);
      fnd.position.y = 0.7;
      fnd.receiveShadow = true;
      group.add(fnd);

      // Stucco Exterior House Walls
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.85,
      });
      const walls = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
      walls.position.y = 1.4 + wallH / 2;
      walls.castShadow = true;
      walls.receiveShadow = true;
      group.add(walls);

      // Pitched Gable Roof with Terracotta Tiles
      const roofH = 8.0;
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.65,
      });

      // North roof slope
      const slopeW = w + 2.5;
      const slopeD = Math.hypot(d / 2, roofH) + 1.2;
      const ang = Math.atan2(roofH, d / 2);

      const roofNorth = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.8, slopeD), roofMat);
      roofNorth.position.set(0, 1.4 + wallH + roofH / 2, -d / 4);
      roofNorth.rotation.x = ang;
      roofNorth.castShadow = true;
      group.add(roofNorth);

      // South roof slope
      const roofSouth = new THREE.Mesh(new THREE.BoxGeometry(slopeW, 0.8, slopeD), roofMat);
      roofSouth.position.set(0, 1.4 + wallH + roofH / 2, d / 4);
      roofSouth.rotation.x = -ang;
      roofSouth.castShadow = true;
      group.add(roofSouth);

      // White Roof Ridge Cap
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(slopeW + 0.2, 0.9, 1.2), ridgeMat);
      ridge.position.set(0, 1.4 + wallH + roofH + 0.4, 0);
      group.add(ridge);

      // Brick Chimney
      const chimMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 });
      const chim = new THREE.Mesh(new THREE.BoxGeometry(2.8, 6.0, 2.8), chimMat);
      chim.position.set(w / 2 - 4.5, 1.4 + wallH + roofH * 0.7, -d * 0.2);
      chim.castShadow = true;
      group.add(chim);

      // Front Doorway with Wooden Panel on South Side (Interactive Door)
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
      const doorW = 4.0;
      const doorH = 7.5;
      const isDoorOpen = props?.doorsOpen === true;
      const doorPivot = new THREE.Group();
      doorPivot.position.set(-doorW / 2, 1.4, d / 2 + 0.2);
      doorPivot.rotation.y = isDoorOpen ? Math.PI * 0.48 : 0;

      const door = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.1, doorH - 0.1, 0.4), doorMat);
      door.position.set(doorW / 2, doorH / 2, 0);
      door.castShadow = true;
      doorPivot.add(door);

      const hndl = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.3), stainlessMat);
      hndl.position.set(doorW * 0.85, doorH * 0.5, 0.3);
      doorPivot.add(hndl);
      group.add(doorPivot);

      const doorAnchor = new THREE.Object3D();
      doorAnchor.position.set(0, 1.4 + doorH / 2, d / 2 + 0.2);
      group.add(doorAnchor);

      if (props?.objId) {
        let openState = isDoorOpen;
        doorInteractiveNodesRef.current.set(props.objId, {
          id: props.objId,
          name: 'Guardhouse Door',
          doorType: 'cabin-door',
          mesh: doorPivot,
          anchor: doorAnchor,
          isOpen: () => openState,
          setOpen: (open: boolean) => {
            openState = open;
            doorPivot.rotation.y = open ? Math.PI * 0.48 : 0;
          },
          getWorldPosition: (outVec?: THREE.Vector3) => {
            const v = outVec || new THREE.Vector3();
            doorAnchor.getWorldPosition(v);
            return v;
          },
        });
      }

      // Door Porch Canopy Overhang
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.6, 3.5), cementMat);
      canopy.position.set(0, 1.4 + 8.2, d / 2 + 1.5);
      canopy.castShadow = true;
      group.add(canopy);

      // Double-pane Glass Windows with White Trim
      const winGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        transmission: 0.8,
        transparent: true,
      });

      [-w * 0.28, w * 0.28].forEach((wx) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.5, 0.4), winGlassMat);
        win.position.set(wx, 1.4 + 5.5, d / 2 + 0.2);
        group.add(win);
      });

      return group;
    };

    // Helper: 3D Lush Organic Shade Tree


  return {
    buildCabinets3D,
    buildWallRoofCanopy3D,
    buildSmallHouse3D,
  };
}
