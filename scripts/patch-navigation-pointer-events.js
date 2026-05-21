/**
 * react-navigation Screen still passes pointerEvents as a prop on web (deprecated).
 * Patch until @react-navigation/elements ships the style-based fix everywhere.
 */
const fs = require('fs');
const path = require('path');

const screenJs = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-navigation',
  'elements',
  'lib',
  'module',
  'Screen.js',
);

if (!fs.existsSync(screenJs)) {
  process.exit(0);
}

const src = fs.readFileSync(screenJs, 'utf8');
const old =
  'pointerEvents: "box-none",\n          onLayout:';
const replacement =
  "style: {\n            pointerEvents: 'box-none'\n          },\n          onLayout:";

if (src.includes(old)) {
  fs.writeFileSync(screenJs, src.replace(old, replacement));
}
