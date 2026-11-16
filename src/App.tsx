import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { MinecraftScene, type MinecraftPanel } from './components/MinecraftScene';
import { projects, type Project } from './data/projects';
import { useSound } from './hooks/useSound';

const hotbarItems: { id: MinecraftPanel; label: string; key: string; symbol: string }[] = [
  { id: 'stats', label: 'STATS', key: '1', symbol: '✣' },
  { id: 'projects', label: 'PROJECTS', key: '2', symbol: '▧' },
  { id: 'about', label: 'ABOUT', key: '3', symbol: '☺' },
  { id: 'contact', label: 'CONTACT', key: '4', symbol: '⌘' },
  { id: 'resume', label: 'RESUME', key: '5', symbol: '▤' },
];

const skills = [
  { label: '3D MODELING', value: 85 },
  { label: 'ENVIRONMENT ART', value: 72 },
  { label: 'GAME DESIGN', value: 68 },
  { label: 'TEXTURING', value: 76 },
];

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
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="modal-scrim" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="voxel-modal" role="dialog" aria-modal="true" aria-labelledby="project-title">
        <header className="panel-titlebar modal-titlebar">
          <div><p className="panel-eyebrow">ITEM INSPECTOR // {project.code}</p><h2 id="project-title">{project.title}</h2></div>
          <button ref={closeRef} className="voxel-close" type="button" onClick={onClose} aria-label="Close project details">×</button>
        </header>
        <div className="modal-content">
          <div className="project-pixel-art" aria-hidden="true"><span /><span /><span /></div>
          <p className="project-category">{project.category} / {project.year}</p>
          <p className="project-description">{project.description}</p>
          <p>{project.detail}</p>
          <div className="project-tools"><strong>TOOLS</strong><span>{project.stack.join(' / ')}</span></div>
        </div>
        <footer className="modal-footer"><span>PROJECT DATA // READ ONLY</span><button className="voxel-button" type="button" onClick={onClose}>CLOSE</button></footer>
      </section>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<MinecraftPanel>('stats');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [breakingIndex, setBreakingIndex] = useState<number | null>(null);
  const [transmission, setTransmission] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const playSound = useSound();
  const breakTimer = useRef<number | null>(null);

  const openScreen = useCallback((target: MinecraftPanel, withSound = true) => {
    if (withSound) playSound('select');
    setScreen(target);
    setTransmission('');
  }, [playSound]);

  const openProject = useCallback((index: number) => {
    const project = projects[index];
    if (!project) return;
    if (breakTimer.current !== null) window.clearTimeout(breakTimer.current);
    playSound('break');
    setScreen('projects');
    setBreakingIndex(index);
    breakTimer.current = window.setTimeout(() => {
      setBreakingIndex(null);
      setSelectedProject(project);
      playSound('open');
      breakTimer.current = null;
    }, 460);
  }, [playSound]);

  const closeProject = useCallback(() => {
    playSound('open');
    setSelectedProject(null);
  }, [playSound]);

  useEffect(() => () => {
    if (breakTimer.current !== null) window.clearTimeout(breakTimer.current);
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
        const item = hotbarItems[Number(event.key) - 1];
        openScreen(item.id);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const index = hotbarItems.findIndex((item) => item.id === screen);
        const next = (index + delta + hotbarItems.length) % hotbarItems.length;
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
    <main className="app-shell">
      <MinecraftScene activePanel={screen} breakingIndex={breakingIndex} onProjectSelect={openProject} />
      <a className="skip-link" href="#active-panel">SKIP TO CURRENT PANEL</a>
      <div className="game-ui">
        <header className="world-header">
          <div className="brand-lockup"><span className="brand-pixel" aria-hidden="true">GJ</span><span>GOURAV JANGIR <small>WORLD / PORTFOLIO</small></span></div>
          <div className="world-status"><i aria-hidden="true" /> AVAILABLE FOR INTERNSHIP</div>
        </header>

        <section id="active-panel" className={`minecraft-panel panel-${screen}`} aria-label={`${screen} panel`} tabIndex={-1}>
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
                <p className="world-hint">DRAG THE WORLD TO LOOK AROUND</p>
              </div>
            </>
          )}

          {screen === 'projects' && (
            <>
              <PanelTitle eyebrow="WORLD BUILD // 04 SAVED ITEMS" title="PROJECT BLOCKS" code="3 × 3 GRID" />
              <div className="projects-content">
                <p className="panel-help">SELECT A FLOATING BLOCK OR ITEM BELOW TO INSPECT ITS BUILD.</p>
                <div className="project-access-grid">
                  {projects.map((project, index) => (
                    <button type="button" key={project.id} className="project-access" onClick={() => openProject(index)}>
                      <span className={`mini-block block-${index}`} aria-hidden="true" />
                      <span><b>{project.title}</b><small>{project.category}</small></span>
                      <i aria-hidden="true">↗</i>
                    </button>
                  ))}
                </div>
                <p className="panel-footnote">WORLD BLOCKS USE RAYCAST SELECTION // 4 BUILDS SAVED</p>
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
                  <button className="voxel-button transmit-button" type="submit" disabled={isTransmitting}>{isTransmitting ? '[ TRANSMITTING... ]' : '[ TRANSMIT ]'} <span aria-hidden="true">↗</span></button>
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
                <div className="resume-section"><span>CORE SKILLS</span><p>CHARACTER MODELING · ENVIRONMENT ART · PROPS · GAME DESIGN</p></div>
                <div className="resume-section"><span>TOOLS</span><p>BLENDER · UNREAL ENGINE · SUBSTANCE · UNITY</p></div>
                <div className="resume-section"><span>AVAILABILITY</span><p>OPEN TO INTERNSHIPS AND COLLABORATION</p></div>
                <a className="voxel-button resume-contact" href="mailto:hello@example.com">REQUEST FULL RESUME <span aria-hidden="true">↗</span></a>
                <p className="panel-footnote">CONTACT LINK: HELLO@EXAMPLE.COM</p>
              </div>
            </>
          )}
        </section>

        <footer className="world-footer"><span>OVERWORLD // PORTFOLIO SAVE 001</span><span>USE KEYS 1–5 OR SELECT A HOTBAR SLOT</span></footer>
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
              aria-label={`${item.key}: ${item.label}`}
            >
              <span className="hotbar-key">{item.key}</span><span className={`hotbar-symbol hotbar-${item.id}`} aria-hidden="true">{item.symbol}</span>
              <span className="hotbar-tooltip" role="tooltip">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="touch-hotbar" aria-label="Touch hotbar navigation">
        {hotbarItems.map((item) => <button key={item.id} type="button" onClick={() => openScreen(item.id)} aria-label={`Open ${item.label}`}>{item.key}</button>)}
      </div>

      {selectedProject && <ProjectReadout project={selectedProject} onClose={closeProject} />}
    </main>
  );
}

export default App;
