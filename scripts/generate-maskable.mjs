import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const size = 512;
const safeZone = 0.8; // contenido ocupa 80% central
const contentSize = Math.round(size * safeZone);
const padding = Math.round((size - contentSize) / 2);

await sharp(path.join(root, 'public/icons/icon-512.png'))
  .resize(contentSize, contentSize, { fit: 'contain', background: { r: 232, g: 232, b: 224, alpha: 1 } })
  .extend({
    top: padding,
    bottom: padding,
    left: padding,
    right: padding,
    background: { r: 232, g: 232, b: 224, alpha: 1 }, // #e8e8e0 — fondo real del logo
  })
  .png()
  .toFile(path.join(root, 'public/icons/icon-512-maskable.png'));

console.log(`Generado: public/icons/icon-512-maskable.png (${size}x${size}, padding ${padding}px por lado)`);
