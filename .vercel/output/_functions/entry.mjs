import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BXh8EdI_.mjs';
import { manifest } from './manifest_Dl-BVX5-.mjs';

const serverIslandMap = new Map([
]);;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/admin.astro.mjs');
const _page3 = () => import('./pages/api/check-consecutive.astro.mjs');
const _page4 = () => import('./pages/api/fix-verses.astro.mjs');
const _page5 = () => import('./pages/api/format-book.astro.mjs');
const _page6 = () => import('./pages/api/prepare-book.astro.mjs');
const _page7 = () => import('./pages/api/search.astro.mjs');
const _page8 = () => import('./pages/biblia.astro.mjs');
const _page9 = () => import('./pages/biblia/_---id_.astro.mjs');
const _page10 = () => import('./pages/buscar.astro.mjs');
const _page11 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/admin.astro", _page2],
    ["src/pages/api/check-consecutive.ts", _page3],
    ["src/pages/api/fix-verses.ts", _page4],
    ["src/pages/api/format-book.ts", _page5],
    ["src/pages/api/prepare-book.ts", _page6],
    ["src/pages/api/search.ts", _page7],
    ["src/pages/biblia/index.astro", _page8],
    ["src/pages/biblia/[...id].astro", _page9],
    ["src/pages/buscar.astro", _page10],
    ["src/pages/index.astro", _page11]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d5683eed-f64a-4874-ad43-b4cfb30da369",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
