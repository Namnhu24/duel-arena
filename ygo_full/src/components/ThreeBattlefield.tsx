/**
 * ThreeBattlefield - Full 3D Master Duel Arena & Hologram Engine
 * Implements wide perspective, ancient ruins stadium, 3D monster characters, and combat VFX.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CardInstance, DuelState, Phase } from '../types/duel';

interface ThreeBattlefieldProps {
  state: DuelState;
  onZoneClick: (side: 'player' | 'ai', zoneType: 'monsters' | 'spells' | 'fieldSpell', index: number) => void;
  onEMZClick: (index: number) => void;
}

export const ThreeBattlefield: React.FC<ThreeBattlefieldProps> = ({
  state,
  onZoneClick,
  onEMZClick
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // References for dynamic 3D objects
  const monsterHologramsRef = useRef<Map<number, THREE.Group>>(new Map());
  const vfxGroupRef = useRef<THREE.Group>(new THREE.Group());
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fieldAuraGroupRef = useRef<THREE.Group>(new THREE.Group());

  // 1. Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060c18);
    scene.fog = new THREE.FogExp2(0x071120, 0.015);

    // Camera (angled high perspective matching Master Duel in image.png)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 36, 42);
    camera.lookAt(0, -2, -2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lights
    const amb = new THREE.AmbientLight(0xd4e9ff, 0.9);
    scene.add(amb);
    ambientLightRef.current = amb;

    const dir = new THREE.DirectionalLight(0xfff1cf, 1.6);
    dir.position.set(15, 45, 20);
    scene.add(dir);
    dirLightRef.current = dir;

    const fillLight = new THREE.DirectionalLight(0x75b8ff, 0.7);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);

    // Create Arena Base & Environment
    createArenaEnvironment(scene);

    // VFX Container
    scene.add(vfxGroupRef.current);
    scene.add(fieldAuraGroupRef.current);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Animate Monster Holograms (hover breathing & rune spin)
      monsterHologramsRef.current.forEach((group) => {
        const floatOffset = Math.sin(elapsedTime * 2.2 + group.id * 1.5) * 0.15;
        group.position.y = 1.3 + floatOffset;
        
        // Spin the holographic rune seal
        const seal = group.getObjectByName('runeSeal');
        if (seal) {
          seal.rotation.z += 0.012;
        }

        // Animate wings if dragon
        const leftWing = group.getObjectByName('leftWing');
        const rightWing = group.getObjectByName('rightWing');
        if (leftWing && rightWing) {
          const wingFlap = Math.sin(elapsedTime * 3.5) * 0.18;
          leftWing.rotation.y = -0.4 + wingFlap;
          rightWing.rotation.y = 0.4 - wingFlap;
        }
      });

      // Animate field spell environmental particles
      fieldAuraGroupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Points) {
          child.rotation.y += 0.002;
        }
      });

      // Animate attack VFX if any
      vfxGroupRef.current.children.forEach((child) => {
        if (child.userData.lifespan) {
          child.userData.age = (child.userData.age || 0) + delta;
          child.rotation.y += 0.08;
          child.scale.multiplyScalar(1.02);
          if (child.userData.age > child.userData.lifespan) {
            vfxGroupRef.current.remove(child);
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 2. React to Field Spell Atmosphere Changes
  useEffect(() => {
    if (!sceneRef.current || !ambientLightRef.current || !dirLightRef.current) return;
    const activeSpell = state.player.fieldSpell || state.ai.fieldSpell;
    const auraGroup = fieldAuraGroupRef.current;
    auraGroup.clear();

    if (activeSpell) {
      if (activeSpell.name === 'Mountain') {
        ambientLightRef.current.color.setHex(0x5ca7d9);
        dirLightRef.current.color.setHex(0xa6d8ff);
        createLightningCloudAura(auraGroup, 0x88ccff);
      } else if (activeSpell.name === 'Yami') {
        ambientLightRef.current.color.setHex(0x59367d);
        dirLightRef.current.color.setHex(0x9d65d9);
        createLightningCloudAura(auraGroup, 0x8544ba);
      } else if (activeSpell.name === 'Dragon Ravine') {
        ambientLightRef.current.color.setHex(0xb86337);
        dirLightRef.current.color.setHex(0xffaa5e);
        createLightningCloudAura(auraGroup, 0xff6622);
      } else if (activeSpell.name === 'Necrovalley') {
        ambientLightRef.current.color.setHex(0xbaa663);
        dirLightRef.current.color.setHex(0xffe28a);
        createLightningCloudAura(auraGroup, 0xdfbe53);
      } else if (activeSpell.name === 'Prank-Kids Place') {
        ambientLightRef.current.color.setHex(0x40a875);
        dirLightRef.current.color.setHex(0x71e8a8);
        createLightningCloudAura(auraGroup, 0x38e888);
      }
    } else {
      ambientLightRef.current.color.setHex(0xd4e9ff);
      dirLightRef.current.color.setHex(0xfff1cf);
    }
  }, [state.player.fieldSpell, state.ai.fieldSpell]);

  // 3. Update 3D Monster Holograms on Field
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Collect all face-up monsters currently on the board
    const currentMonsterCards: { card: CardInstance; side: 'player' | 'ai'; zoneIndex: number; isEMZ?: boolean }[] = [];
    
    // Player monsters
    state.player.monsters.forEach((m, idx) => {
      if (m && m.faceUp) currentMonsterCards.push({ card: m, side: 'player', zoneIndex: idx });
    });
    // AI monsters
    state.ai.monsters.forEach((m, idx) => {
      if (m && m.faceUp) currentMonsterCards.push({ card: m, side: 'ai', zoneIndex: idx });
    });
    // Extra Monster Zones
    if (state.extraMonsterZone[0] && state.extraMonsterZone[0].faceUp) {
      currentMonsterCards.push({ card: state.extraMonsterZone[0], side: 'player', zoneIndex: 0, isEMZ: true });
    }
    if (state.extraMonsterZone[1] && state.extraMonsterZone[1].faceUp) {
      currentMonsterCards.push({ card: state.extraMonsterZone[1], side: 'player', zoneIndex: 1, isEMZ: true });
    }

    const currentUids = new Set(currentMonsterCards.map(c => c.card.uid));

    // Remove old holograms that left the field
    monsterHologramsRef.current.forEach((group, uid) => {
      if (!currentUids.has(uid)) {
        scene.remove(group);
        monsterHologramsRef.current.delete(uid);
      }
    });

    // Add or update holograms
    currentMonsterCards.forEach(({ card, side, zoneIndex, isEMZ }) => {
      const position = getZoneWorldCoords(side, isEMZ ? 'emz' : 'monster', zoneIndex);
      let group = monsterHologramsRef.current.get(card.uid);

      if (!group) {
        group = create3DMonsterModel(card);
        scene.add(group);
        monsterHologramsRef.current.set(card.uid, group);
      }

      // Position group
      group.position.x = position.x;
      group.position.z = position.z;
      // Facing: Player monsters face north (towards AI), AI monsters face south
      group.rotation.y = side === 'player' ? 0 : Math.PI;
    });
  }, [state.player.monsters, state.ai.monsters, state.extraMonsterZone]);

  // 4. Trigger Attack Animation / Damage Numbers in 3D
  useEffect(() => {
    if (!state.lastAttackAnimation || !sceneRef.current) return;
    const { attackerUid, targetUid, damage } = state.lastAttackAnimation;
    
    const attackerGroup = monsterHologramsRef.current.get(attackerUid);
    let targetPos = new THREE.Vector3(0, 1.5, -9); // default direct attack
    if (targetUid) {
      const targetGroup = monsterHologramsRef.current.get(targetUid);
      if (targetGroup) targetPos = targetGroup.position.clone();
    }

    if (attackerGroup) {
      // Spawn beam from attacker to target
      spawnAttackBeam(vfxGroupRef.current, attackerGroup.position, targetPos);
    }

    // Spawn green whirlwind impact & damage indicator at target
    spawnImpactWhirlwind(vfxGroupRef.current, targetPos, damage);
  }, [state.lastAttackAnimation]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-auto overflow-hidden" 
      style={{ zIndex: 0 }}
    />
  );
};

// =========================================================================
// HELPER FUNCTIONS: World Coordinates, 3D Mesh Generation & VFX
// =========================================================================

/** Zone spacing mapping to 3D world space */
function getZoneWorldCoords(side: 'player' | 'ai', type: 'monster' | 'spell' | 'fieldSpell' | 'emz', index: number): THREE.Vector3 {
  const colX = (index - 2) * 5.4; // 5 columns (-2, -1, 0, 1, 2)
  if (type === 'emz') {
    return new THREE.Vector3(index === 0 ? -4.5 : 4.5, 0.4, 0);
  }
  if (type === 'fieldSpell') {
    return new THREE.Vector3(-18.5, 0.2, side === 'player' ? 7.5 : -7.5);
  }
  if (side === 'player') {
    return new THREE.Vector3(colX, 0.2, type === 'monster' ? 5.2 : 11.8);
  } else {
    return new THREE.Vector3(colX, 0.2, type === 'monster' ? -5.2 : -11.8);
  }
}

/** Builds the Master Duel ancient ruins stadium floor and runic tiles */
function createArenaEnvironment(scene: THREE.Scene) {
  // 1. Main Stone Field Slab
  const floorGeo = new THREE.PlaneGeometry(62, 38, 32, 32);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x14202d,
    roughness: 0.85,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  scene.add(floor);

  // 2. Grassy / Ancient Ruin Border Surround
  const borderGeo = new THREE.RingGeometry(18, 38, 32);
  const borderMat = new THREE.MeshStandardMaterial({
    color: 0x10261f,
    roughness: 0.95,
    metalness: 0.1
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = -0.07;
  scene.add(border);

  // 3. Center Line Glowing Energy Divider
  const centerLineGeo = new THREE.PlaneGeometry(54, 0.25);
  const centerLineMat = new THREE.MeshBasicMaterial({ color: 0x58d6ff, transparent: true, opacity: 0.65 });
  const centerLine = new THREE.Mesh(centerLineGeo, centerLineMat);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.set(0, 0.05, 0);
  scene.add(centerLine);

  // 4. Center Line Diamond Emblems
  for (let i = -2; i <= 2; i++) {
    const diamondGeo = new THREE.CircleGeometry(0.5, 4);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0xe8c158 });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.rotation.x = -Math.PI / 2;
    diamond.rotation.z = Math.PI / 4;
    diamond.position.set(i * 10, 0.06, 0);
    scene.add(diamond);
  }

  // 5. Build 3D Octagonal Card Pedestals for each zone
  // Player & AI Monster Zones (5 each)
  for (let s of ['player', 'ai'] as const) {
    for (let c = 0; c < 5; c++) {
      const posM = getZoneWorldCoords(s, 'monster', c);
      createZonePedestal(scene, posM, 0x47a8ff, s === 'player');

      const posS = getZoneWorldCoords(s, 'spell', c);
      createZonePedestal(scene, posS, 0x48c774, s === 'player');
    }
  }

  // 6. Extra Monster Zones (EMZ) in the center
  createZonePedestal(scene, new THREE.Vector3(-4.5, 0.25, 0), 0xa277ff, true, 1.2);
  createZonePedestal(scene, new THREE.Vector3(4.5, 0.25, 0), 0xa277ff, true, 1.2);

  // 7. Field Spell Zones on the far left
  createZonePedestal(scene, new THREE.Vector3(-18.5, 0.2, 7.5), 0x2cd98b, true, 1.3);
  createZonePedestal(scene, new THREE.Vector3(-18.5, 0.2, -7.5), 0x2cd98b, false, 1.3);

  // 8. Graveyard & Deck Plinths on the far right
  createPedestalPlinth(scene, new THREE.Vector3(18.5, 0.2, 7.5), 'GY', 0x589bff);
  createPedestalPlinth(scene, new THREE.Vector3(18.5, 0.2, 12), 'DECK', 0xd9b343);
  createPedestalPlinth(scene, new THREE.Vector3(18.5, 0.2, -7.5), 'GY', 0x589bff);
  createPedestalPlinth(scene, new THREE.Vector3(18.5, 0.2, -12), 'DECK', 0xd9b343);
}

/** Creates a glowing runic octagonal tile for card placement */
function createZonePedestal(scene: THREE.Scene, pos: THREE.Vector3, glowColor: number, isPlayer: boolean, scale = 1.0) {
  const group = new THREE.Group();
  group.position.copy(pos);

  // Stone Octagon Tile
  const tileGeo = new THREE.CylinderGeometry(2.1 * scale, 2.3 * scale, 0.15, 8);
  const tileMat = new THREE.MeshStandardMaterial({
    color: 0x1b2838,
    roughness: 0.7,
    metalness: 0.3
  });
  const tile = new THREE.Mesh(tileGeo, tileMat);
  group.add(tile);

  // Outer Glowing Inscribed Ring
  const ringGeo = new THREE.RingGeometry(1.6 * scale, 1.9 * scale, 8);
  const ringMat = new THREE.MeshBasicMaterial({
    color: glowColor,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.085;
  group.add(ring);

  // Inner Rune Cross
  const innerCircleGeo = new THREE.CircleGeometry(0.7 * scale, 8);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x88d4ff,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  const inner = new THREE.Mesh(innerCircleGeo, innerMat);
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.086;
  group.add(inner);

  scene.add(group);
}

function createPedestalPlinth(scene: THREE.Scene, pos: THREE.Vector3, label: string, color: number) {
  const geo = new THREE.BoxGeometry(3.6, 0.4, 4.8);
  const mat = new THREE.MeshStandardMaterial({ color: 0x182635, roughness: 0.6, metalness: 0.4 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(pos);

  // Runic border
  const borderGeo = new THREE.EdgesGeometry(geo);
  const borderMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
  const wire = new THREE.LineSegments(borderGeo, borderMat);
  mesh.add(wire);

  scene.add(mesh);
}

/**
 * Creates rich, animated 3D character holograms for monsters on the battlefield!
 * Adheres to 3-12 composite part rule per Three.js skill directives.
 */
function create3DMonsterModel(card: CardInstance): THREE.Group {
  const group = new THREE.Group();
  group.name = `monster_${card.uid}`;

  // 1. Holographic Pedestal / Summoning Seal
  const sealGeo = new THREE.RingGeometry(1.2, 1.9, 16);
  const sealMat = new THREE.MeshBasicMaterial({
    color: card.attribute === 'LIGHT' ? 0xffdf78 : card.attribute === 'DARK' ? 0x9b54e3 : 0x4de3a3,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.name = 'runeSeal';
  seal.rotation.x = -Math.PI / 2;
  seal.position.y = -0.9;
  group.add(seal);

  // 2. Build 3D Character Body based on Monster Model Type
  const modelType = card.modelType || 'warrior';

  if (modelType === 'dragon' || modelType === 'stardust') {
    // DRAGON: Torso, Neck, Horned Head, Giant Wings, Tail
    const isBlueEyes = card.name.includes('Blue-Eyes');
    const isStardust = card.name.includes('Stardust');
    const dragonColor = isBlueEyes ? 0xd0e8ff : isStardust ? 0xf0f5ff : 0x8a1a1a;
    const bodyMat = new THREE.MeshStandardMaterial({
      color: dragonColor,
      roughness: 0.25,
      metalness: 0.65,
      emissive: isStardust ? 0x224488 : 0x112244,
      emissiveIntensity: 0.3
    });

    // Body/Chest
    const torso = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.8, 6), bodyMat);
    torso.rotation.x = 0.3;
    torso.position.y = 0.6;
    group.add(torso);

    // Neck & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.2, 6), bodyMat);
    neck.position.set(0, 1.6, 0.3);
    neck.rotation.x = -0.4;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 5), bodyMat);
    head.position.set(0, 2.1, 0.7);
    head.rotation.x = 1.3;
    group.add(head);

    // Horns
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.8 });
    const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 4), hornMat);
    horn1.position.set(-0.25, 2.4, 0.5);
    horn1.rotation.set(-0.4, 0, -0.4);
    group.add(horn1);
    const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 4), hornMat);
    horn2.position.set(0.25, 2.4, 0.5);
    horn2.rotation.set(-0.4, 0, 0.4);
    group.add(horn2);

    // Left & Right Wings
    const wingGeo = new THREE.PlaneGeometry(1.9, 1.5);
    const wingMat = new THREE.MeshStandardMaterial({
      color: dragonColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      metalness: 0.5
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.name = 'leftWing';
    leftWing.position.set(-1.1, 1.3, -0.3);
    leftWing.rotation.set(0.2, -0.4, 0.3);
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.name = 'rightWing';
    rightWing.position.set(1.1, 1.3, -0.3);
    rightWing.rotation.set(0.2, 0.4, -0.3);
    group.add(rightWing);

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 1.6, 5), bodyMat);
    tail.position.set(0, 0.1, -0.8);
    tail.rotation.x = -0.9;
    group.add(tail);

  } else if (modelType === 'wizard') {
    // WIZARD (Dark Magician / Dark Magician Girl): Robe, Wizard Hat, Magical Staff
    const isDmg = card.name.includes('Girl');
    const robeColor = isDmg ? 0xda4c8f : 0x4a2a7a;
    const robeMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.5, metalness: 0.3 });

    // Robe Cone
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.0, 8), robeMat);
    robe.position.y = 0.5;
    group.add(robe);

    // Wizard Peaked Hat
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.4, 7), robeMat);
    hat.position.set(0, 1.9, -0.1);
    hat.rotation.x = -0.2;
    group.add(hat);

    // Head
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffe2c7 }));
    face.position.set(0, 1.4, 0.1);
    group.add(face);

    // Magical Staff with Glowing Orb
    const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x9c7530, metalness: 0.8 }));
    staffPole.position.set(0.7, 0.9, 0.3);
    group.add(staffPole);

    const staffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshStandardMaterial({ color: 0x58f5ff, emissive: 0x2cd2ff, emissiveIntensity: 0.8 }));
    staffOrb.position.set(0.7, 2.1, 0.3);
    group.add(staffOrb);

  } else if (modelType === 'cyber_dragon' || modelType === 'machine') {
    // CYBER DRAGON: Chrome Segmented Mechanical Coils
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcedee8, roughness: 0.15, metalness: 0.95 });
    for (let i = 0; i < 4; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.45 - i * 0.06, 0.55 - i * 0.06, 0.6, 8), chromeMat);
      seg.position.set(Math.sin(i * 0.8) * 0.3, 0.4 + i * 0.55, Math.cos(i * 0.8) * 0.3);
      seg.rotation.z = Math.sin(i * 0.8) * 0.2;
      group.add(seg);
    }
    // Head with glowing cyan optics
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.9), chromeMat);
    head.position.set(0, 2.5, 0.3);
    group.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f7ff });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
    eye1.position.set(-0.2, 2.55, 0.7);
    group.add(eye1);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
    eye2.position.set(0.2, 2.55, 0.7);
    group.add(eye2);

  } else if (modelType === 'rock_prank') {
    // PRANK-KIDS Elemental Sprite
    const spriteMat = new THREE.MeshStandardMaterial({ color: 0xff9c38, roughness: 0.3, metalness: 0.2, emissive: 0xaa4411, emissiveIntensity: 0.4 });
    const rockBody = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 1), spriteMat);
    rockBody.position.y = 1.0;
    group.add(rockBody);

    // Playful Horns/Ears
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 5), spriteMat);
    ear1.position.set(-0.45, 1.7, 0);
    ear1.rotation.z = 0.5;
    group.add(ear1);
    const ear2 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 5), spriteMat);
    ear2.position.set(0.45, 1.7, 0);
    ear2.rotation.z = -0.5;
    group.add(ear2);

  } else {
    // WARRIOR / UTOPIA / GENERAL: Torso armor, Pauldrons, Helm, Sword & Shield
    const isUtopia = card.name.includes('Utopia');
    const armorColor = isUtopia ? 0xf0eedb : 0x3d5a80;
    const armorMat = new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.3, metalness: 0.7 });

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 1.2, 6), armorMat);
    torso.position.y = 0.8;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), armorMat);
    head.position.y = 1.6;
    group.add(head);

    // Pauldrons
    const pauldronGeo = new THREE.SphereGeometry(0.28, 6, 6);
    const pLeft = new THREE.Mesh(pauldronGeo, armorMat);
    pLeft.position.set(-0.65, 1.3, 0);
    group.add(pLeft);
    const pRight = new THREE.Mesh(pauldronGeo, armorMat);
    pRight.position.set(0.65, 1.3, 0);
    group.add(pRight);

    // Golden Blade
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xffd147, metalness: 0.9, roughness: 0.1 });
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 0.25), bladeMat);
    blade.position.set(0.8, 1.1, 0.4);
    blade.rotation.x = 0.4;
    group.add(blade);
  }

  // 3. Floating 3D Stats Badge (Canvas Texture with ATK/DEF)
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 256;
  badgeCanvas.height = 96;
  const ctx = badgeCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(7, 18, 32, 0.85)';
    ctx.roundRect(8, 8, 240, 80, 12);
    ctx.fill();
    ctx.strokeStyle = '#e0b84f';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ff7866';
    ctx.font = 'bold 30px Orbitron, sans-serif';
    ctx.fillText(`ATK ${card.atk || 0}`, 20, 56);

    ctx.fillStyle = '#73c7ff';
    ctx.font = 'bold 24px Orbitron, sans-serif';
    ctx.fillText(`DEF ${card.def || 0}`, 150, 56);
  }

  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  const badgePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 0.68),
    new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, side: THREE.DoubleSide })
  );
  badgePlane.position.set(0, 3.2, 0);
  group.add(badgePlane);

  return group;
}

/** Spawns a laser attack beam from attacker position to target position */
function spawnAttackBeam(vfxGroup: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) {
  const distance = from.distanceTo(to);
  const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, distance, 8);
  const cylMat = new THREE.MeshBasicMaterial({ color: 0x6effe8, transparent: true, opacity: 0.9 });
  const beam = new THREE.Mesh(cylGeo, cylMat);

  // Position between from and to
  beam.position.copy(from).add(to).multiplyScalar(0.5);
  beam.position.y += 0.8;
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());

  beam.userData = { age: 0, lifespan: 0.35 };
  vfxGroup.add(beam);
}

/** Spawns the green swirling wind vortex and large red damage numbers (exactly as in image.png) */
function spawnImpactWhirlwind(vfxGroup: THREE.Group, pos: THREE.Vector3, damage: number) {
  // 1. Swirling Green Energy Rings (like in image.png: swirling bright green lines)
  for (let i = 0; i < 3; i++) {
    const torusGeo = new THREE.TorusGeometry(1.8 + i * 0.6, 0.12, 8, 32);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x39ff74,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(torusGeo, torusMat);
    ring.position.copy(pos);
    ring.position.y += 1.2 + i * 0.5;
    ring.rotation.x = Math.PI / 2 + (i - 1) * 0.25;
    ring.rotation.z = i * 1.2;
    ring.userData = { age: 0, lifespan: 0.95 };
    vfxGroup.add(ring);
  }

  // 2. Giant Red Damage Number Badge (Matching the red '1200' in image.png)
  const dmgCanvas = document.createElement('canvas');
  dmgCanvas.width = 512;
  dmgCanvas.height = 256;
  const ctx = dmgCanvas.getContext('2d');
  if (ctx) {
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ff1a35';
    ctx.font = '900 110px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${damage > 0 ? damage : 'BLOCKED'}`, 256, 160);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeText(`${damage > 0 ? damage : 'BLOCKED'}`, 256, 160);
  }

  const dmgTex = new THREE.CanvasTexture(dmgCanvas);
  dmgTex.colorSpace = THREE.SRGBColorSpace;
  const dmgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 1.8),
    new THREE.MeshBasicMaterial({ map: dmgTex, transparent: true, side: THREE.DoubleSide })
  );
  dmgMesh.position.copy(pos);
  dmgMesh.position.y += 2.8;
  dmgMesh.userData = { age: 0, lifespan: 1.2 };
  vfxGroup.add(dmgMesh);
}

/** Atmospheric field spell particle clouds */
function createLightningCloudAura(group: THREE.Group, colorHex: number) {
  const particleCount = 180;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 55;
    positions[i * 3 + 1] = 2 + Math.random() * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: colorHex,
    size: 0.65,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);
}
