import * as THREE from "three";
import { CAD3DSharedMaterials } from "../../materials";
import { addBarbedWireTopping } from "./barbed-wire";

export function createFence3DBuilder(mats: CAD3DSharedMaterials) {
  const { cementMat, galvSteelMat, chainlinkTex } = mats;

  return (w: number, isCement = false, excavationDepth = 0): THREE.Group => {
    const group = new THREE.Group();
    const fenceH = 20;

    if (isCement) {
      const totalWallH = fenceH + excavationDepth;
      const wallGeo = new THREE.BoxGeometry(w, totalWallH, 1.8);
      const wall = new THREE.Mesh(wallGeo, cementMat);
      wall.position.y = (fenceH - excavationDepth) / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      group.add(wall);

      const capGeo = new THREE.BoxGeometry(w + 1, 1.2, 2.6);
      const cap = new THREE.Mesh(capGeo, cementMat);
      cap.position.y = fenceH + 0.6;
      group.add(cap);

      const numPosts = Math.max(2, Math.floor(w / 16));
      const pilH = fenceH + 1.2 + excavationDepth;
      const pilCenterY = (fenceH + 1.2 - excavationDepth) / 2;
      for (let i = 0; i <= numPosts; i++) {
        const px = -w / 2 + (i / numPosts) * w;
        const pilGeo = new THREE.BoxGeometry(2.4, pilH, 2.4);
        const pil = new THREE.Mesh(pilGeo, cementMat);
        pil.position.set(px, pilCenterY, 0);
        pil.castShadow = true;
        group.add(pil);
      }

      addBarbedWireTopping(group, w, fenceH + 1.2, numPosts + 1, true, mats);
    } else {
      const postMat = galvSteelMat;
      const postH = fenceH + 1 + excavationDepth;
      const postCenterY = (fenceH + 1 - excavationDepth) / 2;
      const numPosts = Math.max(2, Math.round(w / 16));

      const sillH = 1.2 + excavationDepth;
      const sillCenterY = (1.2 - excavationDepth) / 2;
      const sillGeo = new THREE.BoxGeometry(w, sillH, 1.6);
      const sill = new THREE.Mesh(sillGeo, cementMat);
      sill.position.y = sillCenterY;
      sill.castShadow = true;
      sill.receiveShadow = true;
      group.add(sill);

      for (let i = 0; i <= numPosts; i++) {
        const px = -w / 2 + (i / numPosts) * w;
        const isEndPost = i === 0 || i === numPosts;
        const postR = isEndPost ? 0.65 : 0.42;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, postH, 8), postMat);
        post.position.set(px, postCenterY, 0);
        post.castShadow = true;
        group.add(post);

        if (isEndPost) {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), postMat);
          cap.position.set(px, fenceH + 1, 0);
          group.add(cap);

          const footingGeo = new THREE.BoxGeometry(2.6, 2.0, 2.6);
          const footing = new THREE.Mesh(footingGeo, cementMat);
          footing.position.set(px, -excavationDepth + 1.0, 0);
          group.add(footing);
        }
      }

      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, w, 8), postMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, fenceH, 0);
      group.add(rail);

      const totalFenceH = fenceH + excavationDepth;
      const numMidRails = totalFenceH > 24 ? 2 : 1;
      for (let r = 1; r <= numMidRails; r++) {
        const ry = -excavationDepth + (r / (numMidRails + 1)) * totalFenceH;
        const midRail = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, w, 8), postMat);
        midRail.rotation.z = Math.PI / 2;
        midRail.position.set(0, ry, 0);
        group.add(midRail);
      }

      const bottomRail = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, w, 8), postMat);
      bottomRail.rotation.z = Math.PI / 2;
      bottomRail.position.set(0, -excavationDepth + 0.8, 0);
      group.add(bottomRail);

      const meshMat = new THREE.MeshStandardMaterial({
        map: chainlinkTex,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const meshH = fenceH + excavationDepth;
      const meshPlane = new THREE.Mesh(new THREE.PlaneGeometry(w, meshH), meshMat);
      meshPlane.position.set(0, (fenceH - excavationDepth) / 2, 0);
      group.add(meshPlane);

      addBarbedWireTopping(group, w, fenceH, numPosts + 1, true, mats);
    }

    return group;
  };
}
