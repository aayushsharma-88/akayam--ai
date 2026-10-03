const fs = require('fs');

// 1. USE GEMINI-3.6-FLASH WHICH HAS 0 OUTAGES
let providerCode = fs.readFileSync('src/lib/ai/providers/gemini-provider.ts', 'utf8');
providerCode = providerCode.replace(/const DEFAULT_TEXT_MODEL = 'gemini-3\.8-flash'/g, "const DEFAULT_TEXT_MODEL = 'gemini-3.6-flash'");
providerCode = providerCode.replace(/const fallbackModel = .*/, "const fallbackModel = 'gemini-flash-latest'");
fs.writeFileSync('src/lib/ai/providers/gemini-provider.ts', providerCode);

// 2. REVERT TO GEMINI TEXT PROVIDER (Keep FreeImage, FreeVideo, FreeTTS)
let routerCode = fs.readFileSync('src/lib/ai/router.ts', 'utf8');
routerCode = routerCode.replace(/return new FreeTextProvider\(\)/, "return new GeminiTextProvider()");
fs.writeFileSync('src/lib/ai/router.ts', routerCode);

// 3. FIX REGEX IN ROUTE.TS TO BE SUPER FORGIVING
let routeCode = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');
routeCode = routeCode.replace(/const imageMatch = .*/, "const imageMatch = message.match(/(?:generate|make|create)?.*(?:image|photo|pic).*of\\s+(.*)/i) || message.match(/generate image\\s*(.*)/i)");
routeCode = routeCode.replace(/const videoMatch = .*/, "const videoMatch = message.match(/(?:generate|make|create)?.*video.*of\\s+(.*)/i) || message.match(/generate video\\s*(.*)/i)");
routeCode = routeCode.replace(/const audioMatch = .*/, "const audioMatch = message.match(/(?:generate|make|create)?.*(?:voice|audio|speak).*of\\s+(.*)/i) || message.match(/create a voice of\\s*(.*)/i)");
fs.writeFileSync('src/app/api/chat/route.ts', routeCode);

// 4. FIX MARKDOWN RENDERER HYDRATION CRASH
let mdCode = fs.readFileSync('src/components/chat/markdown-renderer.tsx', 'utf8');
if (!mdCode.includes('img: ({src')) {
  const customImg = `img: ({src, alt}) => src ? <img src={src} alt={alt || ''} className="rounded-lg max-w-full my-4 border border-white/10" /> : null,
          audio: ({src}) => src ? <audio src={src} controls className="w-full my-4" /> : null,`;
  mdCode = mdCode.replace(/p: \(\{children\}\)/, `${customImg}\n          p: ({children})`);
  fs.writeFileSync('src/components/chat/markdown-renderer.tsx', mdCode);
}

console.log("Ultimate fix applied.");
