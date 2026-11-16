# Reference analysis: [sadok.mx](https://sadok.mx/)

## Method and evidence

I reviewed the `morluto/rea` Reverse Engineer Anything skill’s browser-target workflow. Its instructions route a user-owned live browser to REA browser tools, but this session has no REA MCP server connected, and the `rea` CLI is not installed on PATH. I used the available public page extraction for the [homepage](https://sadok.mx/) and its [About page](https://sadok.mx/about/) instead. This is manual web inspection, not a REA capture or runtime observation.

The extraction shows headings, content order, keyboard guidance, and font credits. It does not expose computed styles, viewport dimensions, element bounds, or a screenshot. Exact reference font sizes, line heights, letter spacing, and grid measurements cannot be reported from this evidence.

## Layout hierarchy and flow

- The homepage introduces the creator and role, then presents a Game Boy-inspired interactive portfolio. Its 3D device and clickable controls are the visual anchor.
- The work area is a numbered sequence of nine projects. Each item pairs a title with a short description and organization/date metadata. A plain project-list link offers an alternate route to the same work.
- The homepage includes a blog link, player count, movement/button instructions, and a back control. The About page expands the profile into story, speaking, skills, off-work interests, contact, experience, and credits.
- The text view confirms a sequence of projects and a device-centered interface; it does not establish the reference’s exact CSS column or card grid.

## Typography

The About page credits Pokémon Emerald Pro for the pixel headings and screen text, with adapted bold and bitmap variants. The extracted hierarchy places the creator identity first, the role beneath it, project titles and descriptions next, then organization/date metadata and compact control legends. These are relative observations; numeric reference measurements are unavailable.

For this portfolio, the hierarchy is translated into its own responsive scale (these are implementation values, not measurements of sadok.mx):

| Element | Portfolio scale |
| --- | --- |
| Player name | `clamp(52px, 7.6vw, 106px)`, line height `0.82` |
| Panel headings | `clamp(26px, 4vw, 40px)`, line height `1` |
| Menu labels | `12px`, bold, uppercase |
| Body copy | `12–13px`, line height `1.6–1.8` |
| HUD labels and metadata | `8–9px`, letter spacing `0.08–0.13em` |

The new build uses a system monospace stack and its own SVG artwork; it does not reuse the reference’s font files, copy, or brand assets.

## Interaction patterns

- The homepage asks visitors to power on by clicking or pressing a key.
- Left/right or A/D choose a project; Up/Down or W/S move through the menu. P or Enter opens a project, L or Backspace goes back, Space is Start, Shift is Select, and Escape closes a project.
- Visitors can click the Game Boy controls, and the plain project list provides a conventional navigation path.

These mappings are documented on the page. The available inspection did not capture their runtime behavior independently.

## Design choices carried into this build

The new portfolio uses the reference’s creator-to-work hierarchy, explicit game controls, and keyboard-first navigation as structural cues. It translates them into an original tactical terminal with selectable menu rows, project disks, a player profile panel, and a CLI-style contact form.
