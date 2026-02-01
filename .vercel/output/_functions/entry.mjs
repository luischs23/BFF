import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_Djn12udZ.mjs';
import { manifest } from './manifest_Dac0nqoV.mjs';

const serverIslandMap = new Map([
]);;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/admin/titulos.astro.mjs');
const _page3 = () => import('./pages/admin.astro.mjs');
const _page4 = () => import('./pages/api/bible-content.astro.mjs');
const _page5 = () => import('./pages/api/bible-files.astro.mjs');
const _page6 = () => import('./pages/api/check-consecutive.astro.mjs');
const _page7 = () => import('./pages/api/fix-letter-verses.astro.mjs');
const _page8 = () => import('./pages/api/fix-verses.astro.mjs');
const _page9 = () => import('./pages/api/format-book.astro.mjs');
const _page10 = () => import('./pages/api/format-comments.astro.mjs');
const _page11 = () => import('./pages/api/get-comment.astro.mjs');
const _page12 = () => import('./pages/api/get-parallels.astro.mjs');
const _page13 = () => import('./pages/api/get-parallels-list.astro.mjs');
const _page14 = () => import('./pages/api/link-notes.astro.mjs');
const _page15 = () => import('./pages/api/prepare-book.astro.mjs');
const _page16 = () => import('./pages/api/search.astro.mjs');
const _page17 = () => import('./pages/biblia/_---id_.astro.mjs');
const _page18 = () => import('./pages/buscar.astro.mjs');
const _page19 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/admin/titulos.astro", _page2],
    ["src/pages/admin.astro", _page3],
    ["src/pages/api/bible-content.ts", _page4],
    ["src/pages/api/bible-files.ts", _page5],
    ["src/pages/api/check-consecutive.ts", _page6],
    ["src/pages/api/fix-letter-verses.ts", _page7],
    ["src/pages/api/fix-verses.ts", _page8],
    ["src/pages/api/format-book.ts", _page9],
    ["src/pages/api/format-comments.ts", _page10],
    ["src/pages/api/get-comment.ts", _page11],
    ["src/pages/api/get-parallels.ts", _page12],
    ["src/pages/api/get-parallels-list.ts", _page13],
    ["src/pages/api/link-notes.ts", _page14],
    ["src/pages/api/prepare-book.ts", _page15],
    ["src/pages/api/search.ts", _page16],
    ["src/pages/biblia/[...id].astro", _page17],
    ["src/pages/buscar.astro", _page18],
    ["src/pages/index.astro", _page19]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "2bb1340f-2905-4593-a597-745c9ce0b331",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
