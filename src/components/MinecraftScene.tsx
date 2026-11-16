import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import type { Mesh, Group } from 'three';
import { projects } from '../data/projects';
import { getVoxelTextures, type VoxelTextureName } from '../utils/textures';

export type MinecraftPanel = 'stats' | 'projects' | 'about' | 'contact' | 'resume';

type MinecraftSceneProps = {
  activePanel: MinecraftPanel;
  breakingIndex: number | null;
  onProjectSelect: (index: number) => void;
};

type BlockKind = 'grass' | 'dirt' | 'stone' | 'wood' | 'diamond';

const textures = getVoxelTextures();

const projectBlocks: { position: [number, number, number]; kind: BlockKind; index: number | null }[] = [
  { position: [3.15, 1.0, -1.55], kind: 'diamond', index: 0 },
  { position: [4.55, 1.0, -1.55], kind: 'stone', index: 1 },
  { position: [5.95, 1.0, -1.55], kind: 'wood', index: 2 },
  { position: [3.15, 1.0, -0.15], kind: 'dirt', index: 3 },
  { position: [4.55, 1.0, -0.15], kind: 'diamond', index: null },
  { position: [5.95, 1.0, -0.15], kind: 'stone', index: null },
  { position: [3.15, 1.0, 1.25], kind: 'wood', index: null },
  { position: [4.55, 1.0, 1.25], kind: 'dirt', index: null },
  { position: [5.95, 1.0, 1.25], kind: 'diamond', index: null },
];

function textureFor(kind: BlockKind): VoxelTextureName {
  if (kind === 'diamond') return 'diamondOre';
  return kind;
}

function VoxelBlock({
  kind,
  position,
  onClick,
  onHover,
  title,
  stack,
  breaking,
}: {
  kind: BlockKind;
  position: [number, number, number];
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
  title?: string;
  stack?: string;
  breaking?: boolean;
}) {
  const map = textures[textureFor(kind)];
  const interactive = Boolean(onClick);
  const sideTexture = kind === 'grass' ? textures.grassSide : kind === 'diamond' ? textures.stone : map;
  const topTexture = kind === 'grass' ? textures.grassTop : map;
  const bottomTexture = kind === 'grass' ? textures.dirt : map;
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current && breaking) ref.current.rotation.y = clock.getElapsedTime() * 5;
  });

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow={false}
      receiveShadow={false}
      onClick={onClick ? (event) => { event.stopPropagation(); onClick(); } : undefined}
      onPointerOver={onHover ? (event) => { event.stopPropagation(); onHover(true); } : undefined}
      onPointerOut={onHover ? () => onHover(false) : undefined}
      scale={breaking ? 1.04 : 1}
      userData={{ interactive }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial attach="material-0" map={sideTexture} roughness={1} />
      <meshStandardMaterial attach="material-1" map={sideTexture} roughness={1} />
      <meshStandardMaterial attach="material-2" map={topTexture} roughness={1} />
      <meshStandardMaterial attach="material-3" map={bottomTexture} roughness={1} />
      <meshStandardMaterial attach="material-4" map={sideTexture} roughness={1} />
      <meshStandardMaterial attach="material-5" map={sideTexture} roughness={1} />
      {title && (
        <Html position={[0, 0.74, 0]} center distanceFactor={8} occlude={false} style={{ pointerEvents: 'none' }}>
          <div className="voxel-tooltip"><strong>{title}</strong><span>{stack}</span></div>
        </Html>
      )}
    </mesh>
  );
}

function Character() {
  const avatar = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (avatar.current) avatar.current.position.y = -0.45 + Math.sin(time * 1.7) * 0.055;
    if (leftArm.current) leftArm.current.rotation.x = Math.sin(time * 1.7) * 0.035;
    if (rightArm.current) rightArm.current.rotation.x = -Math.sin(time * 1.7) * 0.035;
  });

  return (
    <group ref={avatar} position={[1.45, -0.45, 0.1]}>
      <mesh position={[0, 1.55, 0]} castShadow={false}>
        <boxGeometry args={[0.86, 0.86, 0.86]} />
        <meshStandardMaterial map={textures.skin} roughness={1} />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow={false}>
        <boxGeometry args={[0.86, 1.0, 0.48]} />
        <meshStandardMaterial map={textures.wood} roughness={1} />
      </mesh>
      <group ref={leftArm} position={[-0.63, 0.67, 0]}>
        <mesh position={[0, -0.09, 0]} castShadow={false}>
          <boxGeometry args={[0.34, 0.95, 0.38]} />
          <meshStandardMaterial map={textures.skin} roughness={1} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.63, 0.67, 0]}>
        <mesh position={[0, -0.09, 0]} castShadow={false}>
          <boxGeometry args={[0.34, 0.95, 0.38]} />
          <meshStandardMaterial map={textures.skin} roughness={1} />
        </mesh>
      </group>
      <mesh position={[-0.23, -0.15, 0]} castShadow={false}>
        <boxGeometry args={[0.38, 0.8, 0.4]} />
        <meshStandardMaterial map={textures.stone} roughness={1} />
      </mesh>
      <mesh position={[0.23, -0.15, 0]} castShadow={false}>
        <boxGeometry args={[0.38, 0.8, 0.4]} />
        <meshStandardMaterial map={textures.stone} roughness={1} />
      </mesh>
    </group>
  );
}

function BreakParticles({ origin }: { origin: [number, number, number] }) {
  const particles = useMemo(() => Array.from({ length: 10 }, (_, index) => ({
    position: [((index * 7) % 5 - 2) * 0.16, ((index * 3) % 5 - 1) * 0.16, ((index * 11) % 5 - 2) * 0.16] as [number, number, number],
    scale: 0.09 + (index % 3) * 0.025,
  })), []);
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      const phase = (clock.getElapsedTime() * 2.8) % 1;
      group.current.position.y = origin[1] + phase * 0.65;
      group.current.scale.setScalar(Math.max(0.02, 1 - phase));
    }
  });
  return (
    <group ref={group} position={origin}>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          <boxGeometry />
          <meshBasicMaterial map={index % 2 ? textures.dirt : textures.stone} />
        </mesh>
      ))}
    </group>
  );
}

function Island() {
  return (
    <group position={[1.45, 0, 0.1]}>
      {[-1, 0, 1].map((x) => [-1, 0, 1].map((z) => (
        <VoxelBlock key={`grass-${x}-${z}`} kind="grass" position={[x, -1, z]} />
      )))}
      {[-0.5, 0.5].map((x) => [-0.5, 0.5].map((z) => (
        <VoxelBlock key={`dirt-${x}-${z}`} kind="dirt" position={[x, -2, z]} />
      ))}
      <VoxelBlock kind="stone" position={[0, -2, 0]} />
    </group>
  );
}

function World({ activePanel, breakingIndex, onProjectSelect }: MinecraftSceneProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const selectedBlock = breakingIndex === null ? undefined : projectBlocks[breakingIndex];

  return (
    <>
      <color attach="background" args={['#7A7A7A']} />
      <fog attach="fog" args={['#7A7A7A', 12, 31]} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[8, 12, 6]} intensity={2.1} />
      <Island />
      <Character />
      {projectBlocks.map((block, index) => {
        const project = block.index === null ? undefined : projects[block.index];
        const isHovered = hoveredIndex === index;
        return (
          <VoxelBlock
            key={`project-block-${index}`}
            kind={block.kind}
            position={block.position}
            onClick={block.index === null ? undefined : () => {
              setHoveredIndex(null);
              onProjectSelect(block.index!);
            }}
            onHover={block.index === null ? undefined : (hovered) => setHoveredIndex(hovered ? index : null)}
            title={isHovered ? project?.title : undefined}
            stack={isHovered ? project?.stack.join(' / ') : undefined}
            breaking={breakingIndex === index}
          />
        );
      })}
      {selectedBlock && <BreakParticles origin={selectedBlock.position} />}
      <OrbitControls
        makeDefault
        target={[2.3, 0.4, 0]}
        enablePan={false}
        enableZoom={false}
        enableRotate
        minPolarAngle={0.65}
        maxPolarAngle={1.55}
        rotateSpeed={0.55}
        enabled={activePanel !== 'contact'}
      />
    </>
  );
}

export function MinecraftScene(props: MinecraftSceneProps) {
  return (
    <div className="minecraft-scene" aria-label="Interactive voxel world background">
      <Canvas
        camera={{ position: [8.5, 6.1, 12], fov: 42, near: 0.1, far: 60 }}
        dpr={[1, 1.35]}
        gl={{ antialias: false, powerPreference: 'low-power', alpha: false }}
        onCreated={({ gl }) => { gl.setClearColor('#7A7A7A'); }}
      >
        <World {...props} />
      </Canvas>
    </div>
  );
}
