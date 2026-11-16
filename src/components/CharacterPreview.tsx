import { Component, Suspense, useMemo, type ErrorInfo, type ReactNode } from 'react';
import { ContactShadows } from '@react-three/drei/core/ContactShadows.js';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js';
import { Html } from '@react-three/drei/web/Html.js';
import { Canvas } from '@react-three/fiber';
import { Box3, Color, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { clone as cloneSkinnedScene } from 'three/addons/utils/SkeletonUtils.js';

type CharacterPreviewProps = {
  className?: string;
};

type ModelBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ModelBoundaryState = {
  hasError: boolean;
};

class ModelBoundary extends Component<ModelBoundaryProps, ModelBoundaryState> {
  state: ModelBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ModelBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('Could not load /models/character.glb.', error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function PreviewImage({ className = '' }: { className?: string }) {
  return (
    <img
      className={`character-preview-image ${className}`}
      src="/models/character-preview.svg"
      alt="Low-poly monochrome character preview"
      draggable={false}
    />
  );
}

function LoadingImage() {
  return (
    <Html center>
      <PreviewImage className="character-preview-loading" />
    </Html>
  );
}

function CharacterModel() {
  const { scene } = useGLTF('/models/character.glb');
  const normalizedScene = useMemo(() => {
    const model = cloneSkinnedScene(scene);
    const initialBounds = new Box3().setFromObject(model);
    if (initialBounds.isEmpty()) return model;

    const size = initialBounds.getSize(new Vector3());
    const longestAxis = Math.max(size.x, size.y, size.z);
    if (longestAxis <= 0) return model;

    model.scale.multiplyScalar(2 / longestAxis);
    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    model.position.x -= center.x;
    model.position.y -= bounds.min.y + 1;
    model.position.z -= center.z;

    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;

      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const monochromeMaterials = sourceMaterials.map((sourceMaterial) => {
        const sourceColor = 'color' in sourceMaterial && sourceMaterial.color instanceof Color
          ? sourceMaterial.color
          : new Color(1, 1, 1);
        const luminance = sourceColor.r * 0.2126 + sourceColor.g * 0.7152 + sourceColor.b * 0.0722;
        return new MeshStandardMaterial({
          color: luminance < 0.38 ? '#000000' : '#ffffff',
          roughness: 1,
          metalness: 0,
          flatShading: true,
          dithering: true,
        });
      });

      object.material = Array.isArray(object.material) ? monochromeMaterials : monochromeMaterials[0]!;
    });

    return model;
  }, [scene]);

  return <primitive object={normalizedScene} />;
}

export function CharacterPreview({ className = '' }: CharacterPreviewProps) {
  const fallback = <PreviewImage />;

  return (
    <div className={`character-preview ${className}`} role="group" aria-label="Interactive 3D character preview. Drag to rotate the model.">
      <ModelBoundary fallback={fallback}>
        <Canvas
          aria-hidden="true"
          camera={{ position: [0, 0.12, 4], fov: 34 }}
          dpr={[1, 1.25]}
          frameloop="demand"
          gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
          shadows
          fallback={fallback}
        >
          <ambientLight intensity={0.6} />
          <directionalLight castShadow intensity={2.1} position={[3, 5, 4]} />
          <Suspense fallback={<LoadingImage />}>
            <CharacterModel />
            <ContactShadows
              color="#ffffff"
              opacity={0.24}
              position={[0, -1.05, 0]}
              scale={2.4}
              blur={1.2}
              far={2}
              resolution={128}
            />
            <OrbitControls
              makeDefault
              enablePan={false}
              enableZoom={false}
              enableDamping={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(Math.PI * 3) / 4}
            />
          </Suspense>
        </Canvas>
      </ModelBoundary>
    </div>
  );
}
