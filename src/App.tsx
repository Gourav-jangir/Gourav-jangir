import type { EmailJSResponseStatus } from '@emailjs/browser';
import { AnimatePresence, domAnimation, LazyMotion, MotionConfig, m } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { PixelWorld } from './components/PixelWorld';
import { PlayerCharacter } from './components/PlayerCharacter';
import { projects, type Project } from './data/projects';
import { useSound } from './hooks/useSound';

type Screen = 'stats' | 'projects' | 'about' | 'contact' | 'resume';

const hotbarItems: { id: Screen; label: string; key: string; symbol: string }[] = [
  { id: 'stats', label: 'STATS', key: '1', symbol: 'S' },
  { id: 'projects', label: 'PROJECTS', key: '2', symbol: 'P' },
  { id: 'about', label: 'ABOUT', key: '3', symbol: 'A' },
  { id: 'contact', label: 'CONTACT', key: '4', symbol: '@' },
  { id: 'resume', label: 'RESUME', key: '5', symbol: 'R' },
];

const skills = [
  { label: '3D MODELING', value: 85 },
  { label: 'ENVIRONMENT ART', value: 72 },
  { label: 'GAME DESIGN', value: 68 },
  { label: 'TEXTURING', value: 76 },
];

const playerStops = [0.36, 0.49, 0.59, 0.71, 0.82];

function PanelTitle({ eyebrow, title, code }: { eyebrow: string; title: string; code: string }) {
  return (
    <header className="panel-titlebar">
      <div><p className="panel-eyebrow">{eyebrow}</p><h1>{title}</h1></div>
      <span className="panel-code">{code}</span>
    </header>
  );
}

function ProjectReadout({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  return (
    <m.div
      className="modal-scrim"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <m.section
        className="comic-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        initial={{ x: 90, rotate: 1.5, opacity: 0 }}
        animate={{ x: 0, rotate: 0, opacity: 1 }}
        exit={{ x: 80, rotate: -1, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 19 }}
      >
        <header className="panel-titlebar modal-titlebar">
          <div><p className="panel-eyebrow">ITEM INSPECTOR // {project.code}</p><h2 id="project-title">{project.title}</h2></div>
          <button ref={closeRef} className="comic-close" type="button" onClick={onClose} aria-label="Close project details">X</button>
        </header>
        <div className="modal-content">
          <div className="project-pixel-art" aria-hidden="true"><span /><span /><span /></div>
          <p className="project-category">{project.category} / {project.year}</p>
          <p className="project-description">{project.description}</p>
          <p>{project.detail}</p>
          <div className="project-tools"><strong>TOOLS</strong><span>{project.stack.join(' / ')}</span></div>
        </div>
        <footer className="modal-footer"><span>PROJECT DATA // READ ONLY</span><button className="comic-button" type="button" onClick={onClose}>CLOSE</button></footer>
      </m.section>
    </m.div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>('stats');
  const [playerLeft, setPlayerLeft] = useState(() => window.innerWidth * 0.36);
  const [isJumping, setIsJumping] = useState(false);
  const [breakingIndex, setBreakingIndex] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [transmission, setTransmission] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const playSound = useSound();
  const modalTimer = useRef<number | null>(null);
  const jumpTimer = useRef<number | null>(null);

  const movePlayerToScreen = useCallback((target: Screen) => {
    const index = hotbarItems.findIndex((item) => item.id === target);
    const maxLeft = Math.max(20, window.innerWidth - 110);
    setPlayerLeft(Math.min(maxLeft, Math.max(12, window.innerWidth * playerStops[index])));
  }, []);

  const openScreen = useCallback((target: Screen, withSound = true) => {
    if (withSound) playSound('select');
    setScreen(target);
    setTransmission('');
    movePlayerToScreen(target);
  }, [movePlayerToScreen, playSound]);

  const openProject = useCallback((index: number, blockBounds?: DOMRect) => {
    const project = projects[index];
    if (!project) return;
    if (modalTimer.current !== null) window.clearTimeout(modalTimer.current);
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);

    playSound('break');
    setScreen('projects');
    setIsJumping(true);
    setBreakingIndex(index);
    if (blockBounds) {
      const targetLeft = blockBounds.left + blockBounds.width / 2 - 48;
      setPlayerLeft(Math.max(8, Math.min(window.innerWidth - 105, targetLeft)));
    } else {
      movePlayerToScreen('projects');
    }
    jumpTimer.current = window.setTimeout(() => setIsJumping(false), 420);
    modalTimer.current = window.setTimeout(() => {
      setBreakingIndex(null);
      setSelectedProject(project);
      playSound('open');
      modalTimer.current = null;
    }, 560);
  }, [movePlayerToScreen, playSound]);

  const closeProject = useCallback(() => {
    playSound('open');
    setSelectedProject(null);
  }, [playSound]);

  useEffect(() => () => {
    if (modalTimer.current !== null) window.clearTimeout(modalTimer.current);
    if (jumpTimer.current !== null) window.clearTimeout(jumpTimer.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (selectedProject) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeProject();
        }
        return;
      }
      if (event.key >= '1' && event.key <= '5') {
        event.preventDefault();
        openScreen(hotbarItems[Number(event.key) - 1].id);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const activeIndex = hotbarItems.findIndex((item) => item.id === screen);
        const next = (activeIndex + direction + hotbarItems.length) % hotbarItems.length;
        playSound('move');
        openScreen(hotbarItems[next].id, false);
      } else if (event.key === 'Escape') {
        openScreen('stats');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeProject, openScreen, playSound, screen, selectedProject]);

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isTransmitting) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get('email') ?? '').trim();
    const message = String(values.get('message') ?? '').trim();
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim();
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim();
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim();

    setIsTransmitting(true);
    setTransmission('> TRANSMITTING DATA...');
    await new Promise<void>((resolve) => window.setTimeout(resolve, 420));

    try {
      if (!serviceId || !templateId || !publicKey) throw new Error('EmailJS environment variables are not configured.');
      const { default: emailjs } = await import('@emailjs/browser');
      const response: EmailJSResponseStatus = await emailjs.send(serviceId, templateId, {
        from_email: email,
        reply_to: email,
        message,
      }, { publicKey });
      if (response.status < 200 || response.status >= 300) throw new Error(`EmailJS returned ${response.status}.`);
      setTransmission('> TRANSMISSION SUCCESSFUL. AWAITING RESPONSE.');
      form.reset();
    } catch {
      setTransmission('> ERROR: CONNECTION FAILED. RETRY?');
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
      <main className="app-shell">
        <PixelWorld breakingIndex={breakingIndex} onProjectSelect={openProject} />
        <PlayerCharacter left={playerLeft} jumping={isJumping} />
        <a className="skip-link" href="#active-panel">SKIP TO CURRENT PANEL</a>

        <header className="world-header">
          <div className="brand-lockup"><span className="brand-pixel" aria-hidden="true">GJ</span><span>GOURAV JANGIR <small>2D WORLD / PORTFOLIO</small></span></div>
          <div className="world-status" role="status" aria-label="Available for internship"><i aria-hidden="true" /><span>AVAILABLE</span><span className="status-extra">FOR INTERNSHIP</span></div>
        </header>

        <div className="game-ui">
          <AnimatePresence mode="wait" initial={false}>
            <m.section
              key={screen}
              id="active-panel"
              className={`comic-panel panel-${screen}`}
              aria-label={`${screen} panel`}
              tabIndex={-1}
              initial={{ x: -26, y: 8, opacity: 0, rotate: -0.8 }}
              animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -16, opacity: 0, rotate: 0.4 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {screen === 'stats' && (
                <>
                  <PanelTitle eyebrow="PLAYER PROFILE // LEVEL 07" title="PLAYER STATS" code="ID: GJ-001" />
                  <div className="stats-content">
                    <div className="stats-summary"><span className="pixel-avatar" aria-hidden="true">GJ</span><div><h2>GOURAV JANGIR</h2><p>3D MODELER / GAME ENTHUSIAST</p></div></div>
                    <div className="skill-list">
                      {skills.map((skill) => (
                        <div className="skill-row" key={skill.label}>
                          <div><span>{skill.label}</span><b>{skill.value}%</b></div>
                          <div className="skill-meter" role="meter" aria-label={skill.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={skill.value}>
                            <span style={{ '--skill-level': `${skill.value}%` } as CSSProperties} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="stats-bottom"><span>PRIMARY TOOLS</span><b>BLENDER / UNREAL / SUBSTANCE</b></div>
                    <p className="world-hint">CLICK A BLOCK TO INSPECT A PROJECT</p>
                  </div>
                </>
              )}

              {screen === 'projects' && (
                <>
                  <PanelTitle eyebrow="WORLD BUILD // 04 SAVED ITEMS" title="PROJECT BLOCKS" code="SIDE QUESTS" />
                  <div className="projects-content">
                    <p className="panel-help">PICK A BLOCK IN THE WORLD OR SELECT A BUILD.</p>
                    <div className="project-access-grid">
                      {projects.map((project, index) => (
                        <button type="button" key={project.id} className="project-access" onClick={(event) => openProject(index, event.currentTarget.getBoundingClientRect())}>
                          <span className={`mini-block block-${index}`} aria-hidden="true" />
                          <span><b>{project.title}</b><small>{project.category}</small></span>
                          <i aria-hidden="true">OPEN</i>
                        </button>
                      ))}
                    </div>
                    <p className="panel-footnote">4 BUILDS SAVED // CLICK OR PRESS ENTER</p>
                  </div>
                </>
              )}

              {screen === 'about' && (
                <>
                  <PanelTitle eyebrow="PLAYER NOTES // 001" title="ABOUT THE BUILDER" code="CLASS: CREATOR" />
                  <div className="about-content">
                    <p className="about-lede">I BUILD CHARACTERS, PROPS, AND WORLDS THAT FEEL LIKE THEY BELONG IN A GAME.</p>
                    <p>My work moves between 3D modeling and game ideas: finding a strong silhouette, shaping a readable space, then adding details that give it a point of view.</p>
                    <div className="about-tiles">
                      <div><span>FOCUS</span><b>CHARACTERS<br />ENVIRONMENTS<br />GAME WORLDS</b></div>
                      <div><span>PLAYSTYLE</span><b>MAKE / TEST<br />ITERATE / SHIP</b></div>
                      <div><span>TEAM MODE</span><b>REMOTE<br />OPEN TO TEAMS</b></div>
                    </div>
                    <p className="panel-footnote">SAVE FILE UPDATED // BUILDING WHAT COMES NEXT</p>
                  </div>
                </>
              )}

              {screen === 'contact' && (
                <>
                  <PanelTitle eyebrow="COMMAND BLOCK // OPEN CHANNEL" title="CONTACT" code="TTY 01" />
                  <div className="contact-content">
                    <div className="command-topline"><span>GJ_COMMAND.EXE</span><span>READY</span></div>
                    <p className="command-message">&gt; ENTER YOUR EMAIL AND MESSAGE TO START A TRANSMISSION.</p>
                    <form className="contact-form" onSubmit={handleContactSubmit}>
                      <label htmlFor="contact-email">&gt; EMAIL ADDRESS</label>
                      <input id="contact-email" name="email" type="email" inputMode="email" enterKeyHint="next" autoComplete="email" placeholder="YOU@DOMAIN.COM" required />
                      <label htmlFor="contact-message">&gt; MESSAGE</label>
                      <textarea id="contact-message" name="message" rows={3} enterKeyHint="send" placeholder="TYPE YOUR MESSAGE..." required />
                      <button className="comic-button transmit-button" type="submit" disabled={isTransmitting}>{isTransmitting ? '[ TRANSMITTING... ]' : '[ TRANSMIT ]'} <span aria-hidden="true">&gt;</span></button>
                      <p key={transmission} className={`terminal-feedback${isTransmitting ? ' is-typing' : ''}`} role="status" aria-live="polite">{transmission || '> SYSTEM READY // ENTER EMAIL + MESSAGE.'}</p>
                    </form>
                  </div>
                </>
              )}

              {screen === 'resume' && (
                <>
                  <PanelTitle eyebrow="PLAYER ITEM // PROFILE CARD" title="RESUME DATA" code="GJ-001" />
                  <div className="resume-content">
                    <div className="resume-card"><span className="resume-mark" aria-hidden="true">GJ</span><div><h2>GOURAV JANGIR</h2><p>3D MODELER / GAME ARTIST</p></div></div>
                    <div className="resume-section"><span>CORE SKILLS</span><p>CHARACTER MODELING / ENVIRONMENT ART / PROPS / GAME DESIGN</p></div>
                    <div className="resume-section"><span>TOOLS</span><p>BLENDER / UNREAL ENGINE / SUBSTANCE / UNITY</p></div>
                    <div className="resume-section"><span>AVAILABILITY</span><p>OPEN TO INTERNSHIPS AND COLLABORATION</p></div>
                    <button className="comic-button resume-contact" type="button" onClick={() => openScreen('contact')}>REQUEST FULL RESUME <span aria-hidden="true">&gt;</span></button>
                    <p className="panel-footnote">OPEN THE CONTACT SLOT TO REQUEST A COPY</p>
                  </div>
                </>
              )}
            </m.section>
          </AnimatePresence>

        </div>

        <nav className="hotbar-wrap" aria-label="Portfolio sections">
          <div className="hotbar">
            {hotbarItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`hotbar-slot${screen === item.id ? ' is-active' : ''}`}
                onClick={() => openScreen(item.id)}
                aria-current={screen === item.id ? 'page' : undefined}
                aria-label={`${item.key} ${item.label}`}
              >
                <span className="hotbar-key">{item.key}</span><span className="hotbar-symbol" aria-hidden="true">{item.symbol}</span>
                <span className="hotbar-tooltip" role="tooltip">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <AnimatePresence>{selectedProject && <ProjectReadout key={selectedProject.id} project={selectedProject} onClose={closeProject} />}</AnimatePresence>
      </main>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;
