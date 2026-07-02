// Generates the app icon (build/icon.png + build/icon.ico) from an inline
// newspaper SVG, using Electron to rasterize (no image dependencies needed).
// Run with:  electron scripts/generate-icon.js
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

// Newspaper icon: blue rounded background, a folded newspaper page with a
// masthead, headline, text columns, and a small bar chart (business/stock hint).
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2E5BFF"/>
      <stop offset="1" stop-color="#16337A"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" fill="url(#bg)"/>
  <g transform="rotate(-4 256 256)">
    <rect x="128" y="120" width="264" height="300" rx="14" fill="#0F224E" opacity="0.35"/>
    <rect x="120" y="104" width="264" height="300" rx="14" fill="#FFFFFF"/>
    <rect x="148" y="134" width="208" height="36" rx="6" fill="#16337A"/>
    <rect x="148" y="180" width="208" height="7" rx="3" fill="#E23B3B"/>
    <rect x="148" y="204" width="150" height="20" rx="4" fill="#2B2B2B"/>
    <rect x="148" y="240" width="104" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="258" width="104" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="276" width="104" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="294" width="84" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="266" y="204" width="90" height="66" rx="6" fill="#DCE6FF"/>
    <rect x="278" y="246" width="11" height="16" rx="1" fill="#2E5BFF"/>
    <rect x="295" y="238" width="11" height="24" rx="1" fill="#3BAA6B"/>
    <rect x="312" y="230" width="11" height="32" rx="1" fill="#E23B3B"/>
    <rect x="329" y="242" width="11" height="20" rx="1" fill="#F2A93B"/>
    <rect x="266" y="284" width="90" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="322" width="208" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="340" width="208" height="9" rx="4" fill="#C7CDD6"/>
    <rect x="148" y="358" width="164" height="9" rx="4" fill="#C7CDD6"/>
  </g>
</svg>`;

const HTML = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
</head><body>${SVG}</body></html>`;

// Wrap a PNG buffer in a minimal single-image .ico (PNG-compressed, 256x256).
function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0); // width 0 => 256
  entry.writeUInt8(0, 1); // height 0 => 256
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // size of PNG data
  entry.writeUInt32LE(6 + 16, 12); // offset to PNG data
  return Buffer.concat([header, entry, png]);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    show: true,
    frame: false,
    skipTaskbar: true,
    backgroundColor: '#16337A',
  });

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(HTML));
  await new Promise((r) => setTimeout(r, 800));

  let image = await win.webContents.capturePage();
  if (image.isEmpty()) {
    await new Promise((r) => setTimeout(r, 800));
    image = await win.webContents.capturePage();
  }
  const buildDir = path.join(__dirname, '..', 'build');
  fs.mkdirSync(buildDir, { recursive: true });

  const png1024 = image.resize({ width: 1024, height: 1024 }).toPNG();
  fs.writeFileSync(path.join(buildDir, 'icon.png'), png1024);

  const png256 = image.resize({ width: 256, height: 256 }).toPNG();
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), pngToIco(png256));

  console.log(`Wrote build/icon.png (${png1024.length} bytes) and build/icon.ico`);
  app.quit();
});
