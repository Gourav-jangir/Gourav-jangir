import { m } from 'framer-motion';

const blocks = [
  { texture: '/imgs/blocks/diamond-ore.png', label: 'DIAMOND ORE' },
  { texture: '/imgs/blocks/stone.png', label: 'STONE' },
  { texture: '/imgs/blocks/planks-oak.png', label: 'OAK PLANKS' },
  { texture: '/imgs/blocks/dirt.png', label: 'DIRT BLOCK' },
];

const clouds = [
  { top: '13%', duration: 42, delay: -7, scale: 1 },
  { top: '25%', duration: 54, delay: -28, scale: 0.75 },
  { top: '9%', duration: 62, delay: -41, scale: 1.2 },
];

const particleDirections = [
  [-28, -30], [-8, -42], [16, -34], [34, -14], [28, 12], [5, 24], [-20, 16], [-34, -2],
];

function MiningBurst() {
  return (
    <span className="mining-burst" aria-hidden="true">
      {particleDirections.map(([x, y], index) => (
        <m.i
          key={index}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x, y, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.48, delay: index * 0.012, ease: 'easeOut' }}
        />
      ))}
    </span>
  );
}

export function PixelWorld({
  breakingIndex,
  onProjectSelect,
}: {
  breakingIndex: number | null;
  onProjectSelect: (index: number, bounds: DOMRect) => void;
}) {
  return (
    <div className="pixel-world" role="group" aria-label="2D side-scrolling world">
      <div className="pixel-sky" aria-hidden="true" />
      <div className="cloud-layer" aria-hidden="true">
        {clouds.map((cloud, index) => (
          <m.div
            className={`pixel-cloud cloud-${index + 1}`}
            key={index}
            style={{ top: cloud.top, scale: cloud.scale }}
            initial={{ x: '-20vw' }}
            animate={{ x: '120vw' }}
            transition={{ duration: cloud.duration, delay: cloud.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="world-blocks" role="group" aria-label="Project blocks">
        {blocks.map((block, index) => (
          <m.button
            className={`world-block block-${index + 1}`}
            key={block.label}
            type="button"
            aria-label={`Open ${block.label} project`}
            onClick={(event) => onProjectSelect(index, event.currentTarget.getBoundingClientRect())}
            whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0] }}
            whileFocus={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.24 }}
          >
            <span className="block-face">
              <img src={block.texture} alt="" draggable={false} />
            </span>
            <span className="block-tooltip">{block.label}<br /><small>CLICK TO INSPECT</small></span>
            {breakingIndex === index && <MiningBurst />}
          </m.button>
        ))}
      </div>

      <div className="world-floor" aria-hidden="true">
        <div className="grass-strip" />
        <div className="dirt-strip" />
      </div>
    </div>
  );
}
