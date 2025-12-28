import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DIvIve6v.mjs';
import 'es-module-lexer';
import { h as decodeKey } from './chunks/astro/server_DHA3jqpl.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/Usuario/Documents/Platzi/BFF/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-image]{width:100%;height:auto;-o-object-fit:var(--fit);object-fit:var(--fit);-o-object-position:var(--pos);object-position:var(--pos);aspect-ratio:var(--w) / var(--h)}[data-astro-image=responsive]{max-width:calc(var(--w) * 1px);max-height:calc(var(--h) * 1px)}[data-astro-image=fixed]{width:calc(var(--w) * 1px);height:calc(var(--h) * 1px)}\n"}],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.B7bfNlMR.css"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.B7bfNlMR.css"},{"type":"inline","content":"[data-astro-image]{width:100%;height:auto;-o-object-fit:var(--fit);object-fit:var(--fit);-o-object-position:var(--pos);object-position:var(--pos);aspect-ratio:var(--w) / var(--h)}[data-astro-image=responsive]{max-width:calc(var(--w) * 1px);max-height:calc(var(--h) * 1px)}[data-astro-image=fixed]{width:calc(var(--w) * 1px);height:calc(var(--h) * 1px)}\n"}],"routeData":{"route":"/admin","isIndex":false,"type":"page","pattern":"^\\/admin\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin.astro","pathname":"/admin","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-image]{width:100%;height:auto;-o-object-fit:var(--fit);object-fit:var(--fit);-o-object-position:var(--pos);object-position:var(--pos);aspect-ratio:var(--w) / var(--h)}[data-astro-image=responsive]{max-width:calc(var(--w) * 1px);max-height:calc(var(--h) * 1px)}[data-astro-image=fixed]{width:calc(var(--w) * 1px);height:calc(var(--h) * 1px)}\n"}],"routeData":{"route":"/api/check-consecutive","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/check-consecutive\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"check-consecutive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/check-consecutive.ts","pathname":"/api/check-consecutive","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/fix-verses","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/fix-verses\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"fix-verses","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/fix-verses.ts","pathname":"/api/fix-verses","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/format-book","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/format-book\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"format-book","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/format-book.ts","pathname":"/api/format-book","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/prepare-book","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/prepare-book\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"prepare-book","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/prepare-book.ts","pathname":"/api/prepare-book","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"[data-astro-image]{width:100%;height:auto;-o-object-fit:var(--fit);object-fit:var(--fit);-o-object-position:var(--pos);object-position:var(--pos);aspect-ratio:var(--w) / var(--h)}[data-astro-image=responsive]{max-width:calc(var(--w) * 1px);max-height:calc(var(--h) * 1px)}[data-astro-image=fixed]{width:calc(var(--w) * 1px);height:calc(var(--h) * 1px)}\n"}],"routeData":{"route":"/api/search","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/search\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/search.ts","pathname":"/api/search","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.B7bfNlMR.css"},{"type":"inline","content":"aside[data-astro-cid-fpxq2pdv]::-webkit-scrollbar{width:6px}aside[data-astro-cid-fpxq2pdv]::-webkit-scrollbar-track{background:#f1f1f1}aside[data-astro-cid-fpxq2pdv]::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}aside[data-astro-cid-fpxq2pdv]::-webkit-scrollbar-thumb:hover{background:#aaa}\n[data-astro-image]{width:100%;height:auto;-o-object-fit:var(--fit);object-fit:var(--fit);-o-object-position:var(--pos);object-position:var(--pos);aspect-ratio:var(--w) / var(--h)}[data-astro-image=responsive]{max-width:calc(var(--w) * 1px);max-height:calc(var(--h) * 1px)}[data-astro-image=fixed]{width:calc(var(--w) * 1px);height:calc(var(--h) * 1px)}\n"}],"routeData":{"route":"/biblia","isIndex":true,"type":"page","pattern":"^\\/biblia\\/?$","segments":[[{"content":"biblia","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/biblia/index.astro","pathname":"/biblia","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.B7bfNlMR.css"}],"routeData":{"route":"/buscar","isIndex":false,"type":"page","pattern":"^\\/buscar\\/?$","segments":[[{"content":"buscar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/buscar.astro","pathname":"/buscar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/admin.B7bfNlMR.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/404.astro",{"propagation":"none","containsHead":true}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/[...id].astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro",{"propagation":"in-tree","containsHead":true}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/buscar.astro",{"propagation":"none","containsHead":true}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/index.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/admin@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/api/check-consecutive.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/api/check-consecutive@_@ts",{"propagation":"in-tree","containsHead":false}],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/api/search.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/api/search@_@ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/biblia/[...id]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/biblia/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/admin@_@astro":"pages/admin.astro.mjs","\u0000@astro-page:src/pages/api/check-consecutive@_@ts":"pages/api/check-consecutive.astro.mjs","\u0000@astro-page:src/pages/api/fix-verses@_@ts":"pages/api/fix-verses.astro.mjs","\u0000@astro-page:src/pages/api/format-book@_@ts":"pages/api/format-book.astro.mjs","\u0000@astro-page:src/pages/api/prepare-book@_@ts":"pages/api/prepare-book.astro.mjs","\u0000@astro-page:src/pages/api/search@_@ts":"pages/api/search.astro.mjs","\u0000@astro-page:src/pages/biblia/index@_@astro":"pages/biblia.astro.mjs","\u0000@astro-page:src/pages/biblia/[...id]@_@astro":"pages/biblia/_---id_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/buscar@_@astro":"pages/buscar.astro.mjs","\u0000@astro-renderers":"renderers.mjs","C:/Users/Usuario/Documents/Platzi/BFF/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_BkR_XoPb.mjs","C:/Users/Usuario/Documents/Platzi/BFF/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_Bgda2JX9.mjs","C:\\Users\\Usuario\\Documents\\Platzi\\BFF\\.astro\\content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","C:\\Users\\Usuario\\Documents\\Platzi\\BFF\\.astro\\content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_-n5uY718.mjs","\u0000@astrojs-manifest":"manifest_Dl-BVX5-.mjs","C:/Users/Usuario/Documents/Platzi/BFF/src/components/BibleSearch":"_astro/BibleSearch.BRZVS5lo.js","@astrojs/react/client.js":"_astro/client.BKX-yLGW.js","C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin.astro?astro&type=script&index=0&lang.ts":"_astro/admin.astro_astro_type_script_index_0_lang.DDWARf03.js","C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.DE3h9sCi.js","C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/[...id].astro?astro&type=script&index=0&lang.ts":"_astro/_...id_.astro_astro_type_script_index_0_lang.DE3h9sCi.js","C:/Users/Usuario/Documents/Platzi/BFF/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":"_astro/ClientRouter.astro_astro_type_script_index_0_lang.BScVxmeO.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro?astro&type=script&index=0&lang.ts","const i=document.getElementById(\"menuToggle\"),e=document.getElementById(\"sidebar\"),t=document.getElementById(\"sidebarOverlay\"),d=document.getElementById(\"menuIcon\"),n=document.getElementById(\"closeIcon\");let s=!1;function l(){s=!s,s?(e?.classList.remove(\"-translate-x-full\"),e?.classList.add(\"translate-x-0\"),t?.classList.remove(\"hidden\"),d?.classList.add(\"hidden\"),n?.classList.remove(\"hidden\")):(e?.classList.add(\"-translate-x-full\"),e?.classList.remove(\"translate-x-0\"),t?.classList.add(\"hidden\"),d?.classList.remove(\"hidden\"),n?.classList.add(\"hidden\"))}i?.addEventListener(\"click\",l);t?.addEventListener(\"click\",l);e?.querySelectorAll(\"a\").forEach(a=>{a.addEventListener(\"click\",()=>{window.innerWidth<768&&s&&l()})});window.addEventListener(\"resize\",()=>{window.innerWidth>=768&&s&&(s=!1,e?.classList.add(\"-translate-x-full\"),e?.classList.remove(\"translate-x-0\"),t?.classList.add(\"hidden\"),d?.classList.remove(\"hidden\"),n?.classList.add(\"hidden\"))});"],["C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/[...id].astro?astro&type=script&index=0&lang.ts","const i=document.getElementById(\"menuToggle\"),e=document.getElementById(\"sidebar\"),t=document.getElementById(\"sidebarOverlay\"),d=document.getElementById(\"menuIcon\"),n=document.getElementById(\"closeIcon\");let s=!1;function l(){s=!s,s?(e?.classList.remove(\"-translate-x-full\"),e?.classList.add(\"translate-x-0\"),t?.classList.remove(\"hidden\"),d?.classList.add(\"hidden\"),n?.classList.remove(\"hidden\")):(e?.classList.add(\"-translate-x-full\"),e?.classList.remove(\"translate-x-0\"),t?.classList.add(\"hidden\"),d?.classList.remove(\"hidden\"),n?.classList.add(\"hidden\"))}i?.addEventListener(\"click\",l);t?.addEventListener(\"click\",l);e?.querySelectorAll(\"a\").forEach(a=>{a.addEventListener(\"click\",()=>{window.innerWidth<768&&s&&l()})});window.addEventListener(\"resize\",()=>{window.innerWidth>=768&&s&&(s=!1,e?.classList.add(\"-translate-x-full\"),e?.classList.remove(\"translate-x-0\"),t?.classList.add(\"hidden\"),d?.classList.remove(\"hidden\"),n?.classList.add(\"hidden\"))});"]],"assets":["/_astro/admin.B7bfNlMR.css","/blog-placeholder-1.jpg","/blog-placeholder-2.jpg","/blog-placeholder-3.jpg","/blog-placeholder-4.jpg","/blog-placeholder-5.jpg","/blog-placeholder-about.jpg","/favicon.svg","/_astro/admin.astro_astro_type_script_index_0_lang.DDWARf03.js","/_astro/BibleSearch.BRZVS5lo.js","/_astro/client.BKX-yLGW.js","/_astro/ClientRouter.astro_astro_type_script_index_0_lang.BScVxmeO.js","/_astro/index.CcfSqGrV.js"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"IEfEue6Kf1f3hnCp/0TY5plidiOQzvwiqShREgZOKGg="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
