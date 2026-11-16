import { m } from 'framer-motion';

export function PlayerCharacter({ left, jumping }: { left: number; jumping: boolean }) {
  return (
    <m.div
      className="player-position"
      animate={{ left, y: jumping ? -54 : 0 }}
      transition={{
        left: { type: 'spring', stiffness: 115, damping: 18 },
        y: { duration: jumping ? 0.22 : 0.26, ease: 'easeOut' },
      }}
      aria-hidden="true"
    >
      <m.svg
        className="player-svg"
        viewBox="0 0 120 190"
        role="img"
        aria-label="Pixel adventurer"
        shapeRendering="crispEdges"
        animate={{ scaleY: [1, 1.015, 1], rotate: [0, -0.5, 0] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'center bottom' }}
      >
        <g stroke="#111" strokeWidth="5" strokeLinejoin="round" strokeLinecap="square">
          <rect x="31" y="9" width="58" height="54" fill="#d7a67d" />
          <path d="M31 13h58v12H31zM31 24h10v20H31zM79 24h10v20H79z" fill="#553b2e" />
          <rect x="44" y="34" width="8" height="7" fill="#19212b" strokeWidth="2" />
          <rect x="68" y="34" width="8" height="7" fill="#19212b" strokeWidth="2" />
          <path d="M51 51h18" fill="none" strokeWidth="3" />

          <path d="M34 67h52v59H34z" fill="#2889a6" />
          <path d="M19 69h15v49H19zM86 69h15v49H86z" fill="#d7a67d" />
          <path d="M20 69h14v22H20zM87 69h14v22H87z" fill="#2889a6" />

          <path d="M36 128h21v42H36zM63 128h21v42H63z" fill="#354e7a" />
          <path d="M32 169h26v12H32zM62 169h27v12H62z" fill="#33363b" />
        </g>
        <path d="M45 78h30M44 94h32" stroke="#71c5df" strokeWidth="3" />
        <path d="M40 133v22M69 133v22" stroke="#5877a5" strokeWidth="3" />
      </m.svg>
      <span className="player-shadow" />
    </m.div>
  );
}
