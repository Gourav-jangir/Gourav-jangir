import { CanvasTexture, NearestFilter, RepeatWrapping, SRGBColorSpace } from 'three';

export type VoxelTextureName = 'grassTop' | 'grassSide' | 'dirt' | 'stone' | 'wood' | 'diamondOre' | 'skin';
export type VoxelTextures = Record<VoxelTextureName, CanvasTexture>;

let textureCache: VoxelTextures | undefined;

type Pixel = readonly [number, number, number];

function seededNoise(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function drawTexture(name: VoxelTextureName): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas 2D is required to create voxel textures.');
  context.imageSmoothingEnabled = false;

  const random = seededNoise(name.split('').reduce((seed, letter) => seed + letter.charCodeAt(0), 17));
  const pixel = (x: number, y: number, color: Pixel) => {
    context.fillStyle = `rgb(${color[0]} ${color[1]} ${color[2]})`;
    context.fillRect(x, y, 1, 1);
  };
  const noise = (base: Pixel, spread: number) => {
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const delta = Math.round((random() - 0.5) * spread);
        pixel(x, y, [base[0] + delta, base[1] + delta, base[2] + delta]);
      }
    }
  };

  switch (name) {
    case 'grassTop':
      noise([96, 151, 58], 46);
      break;
    case 'grassSide':
      noise([119, 79, 44], 42);
      for (let y = 0; y < 4; y += 1) {
        for (let x = 0; x < 16; x += 1) {
          const fade = y === 3 && x % 3 === 0 ? [111, 105, 51] : [89, 143, 52];
          pixel(x, y, fade as Pixel);
        }
      }
      for (let x = 0; x < 16; x += 1) {
        if (x % 4 !== 1) pixel(x, 4, [116, 123, 52]);
      }
      break;
    case 'dirt':
      noise([126, 83, 48], 48);
      break;
    case 'stone':
      noise([126, 129, 128], 44);
      break;
    case 'wood':
      noise([169, 124, 71], 34);
      for (const y of [0, 1, 7, 8, 14, 15]) {
        context.fillStyle = y === 0 || y === 15 ? '#684a2c' : '#87613a';
        context.fillRect(0, y, 16, 1);
      }
      for (const x of [3, 11]) {
        context.fillStyle = '#9a7144';
        context.fillRect(x, 2, 1, 4);
        context.fillRect((x + 7) % 16, 9, 1, 4);
      }
      break;
    case 'diamondOre':
      noise([113, 117, 118], 38);
      for (const [x, y] of [[2, 3], [10, 2], [7, 8], [13, 12], [3, 13]]) {
        pixel(x, y, [74, 226, 224]);
        pixel(x + 1, y, [119, 250, 239]);
        pixel(x, y + 1, [44, 179, 190]);
        pixel(x + 1, y + 1, [80, 218, 219]);
      }
      break;
    case 'skin':
      noise([188, 137, 100], 18);
      for (let y = 0; y < 5; y += 1) {
        for (let x = 0; x < 16; x += 1) pixel(x, y, x < 8 ? [70, 48, 37] : [99, 69, 45]);
      }
      for (let y = 7; y < 10; y += 1) {
        pixel(4, y, [44, 74, 112]);
        pixel(11, y, [44, 74, 112]);
      }
      break;
  }

  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Creates the tiny pixel textures once and reuses the same GPU resources for the app lifetime. */
export function getVoxelTextures(): VoxelTextures {
  if (!textureCache) {
    textureCache = {
      grassTop: drawTexture('grassTop'),
      grassSide: drawTexture('grassSide'),
      dirt: drawTexture('dirt'),
      stone: drawTexture('stone'),
      wood: drawTexture('wood'),
      diamondOre: drawTexture('diamondOre'),
      skin: drawTexture('skin'),
    };
  }
  return textureCache;
}
