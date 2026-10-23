import { isAdActive, type AdSlotId, type AdSlotSetting } from "@/api/ad-slots";

export class AdLoadRegistry {
  private loaded = new Set<AdSlotId>();
  claim(id: AdSlotId, setting: AdSlotSetting): boolean {
    if (!isAdActive(setting) || this.loaded.has(id)) return false;
    this.loaded.add(id);
    return true;
  }
}

// No browser operations or mutable server-side state at module evaluation.
interface AdRuntime { registry: AdLoadRegistry; queue: Promise<void> }
type AdWindow = Window & { __usagiAdRuntime?: AdRuntime };
function runtime(): AdRuntime {
  const target = window as AdWindow;
  if (!target.__usagiAdRuntime) target.__usagiAdRuntime = { registry: new AdLoadRegistry(), queue: Promise.resolve() };
  return target.__usagiAdRuntime;
}

// Global snippets intentionally run as trusted admin code. Banner snippets run
// in isolated frames instead, including their own parser/document.write context.
async function executeGlobal(host: HTMLElement, code: string): Promise<void> {
  const template = document.createElement("template");
  template.innerHTML = code;
  const scripts = Array.from(template.content.querySelectorAll("script"));
  host.append(template.content);
  for (const original of scripts) {
    if (!host.isConnected) return;
    const script = document.createElement("script");
    for (const attr of Array.from(original.attributes)) script.setAttribute(attr.name, attr.value);
    script.textContent = original.textContent;
    // Traditional advertising tags often document.write their markup. Keep
    // writes inside the slot instead of allowing them to erase the app page.
    const write = document.write;
    const writeln = document.writeln;
    const capture = (...values: string[]) => {
      const fragment = document.createRange().createContextualFragment(values.join(""));
      host.append(fragment);
    };
    document.write = capture;
    document.writeln = (...values: string[]) => capture(...values, "\n");
    try {
      if (script.src) {
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => { script.remove(); reject(new Error("Sumber iklan tidak merespons.")); }, 15000);
          const done = (error?: Error) => { window.clearTimeout(timer); error ? reject(error) : resolve(); };
          script.onload = () => done();
          script.onerror = () => done(new Error("Sumber iklan gagal dimuat."));
          // Preserve snippet order (config before provider), even if a tag
          // advertises async execution. Each global slot is queued separately.
          script.async = false;
          original.replaceWith(script);
        });
      } else { original.replaceWith(script); }
    } finally { document.write = write; document.writeln = writeln; }
  }
}

export function loadGlobalAd(id: "social_bar" | "popunder", setting: AdSlotSetting, host: HTMLElement): void {
  const state = runtime();
  if (!state.registry.claim(id, setting)) return;
  state.queue = state.queue.then(() => executeGlobal(host, setting.code)).catch((error: unknown) => {
    console.warn(`Gagal memuat slot iklan ${id}.`, error);
  });
}

export function bannerDocument(code: string, channel: string): string {
  // Full snippets retain their script tags; nothing is extracted by admins.
  const message = JSON.stringify(channel).replace(/</g, "\\u003c");
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;overflow-x:hidden}body{display:flow-root}img,iframe,video{max-width:100%}</style></head><body>${code}<script>(()=>{const send=()=>parent.postMessage({channel:${message},height:Math.max(document.body.scrollHeight,document.body.offsetHeight)},'*');new ResizeObserver(send).observe(document.body);addEventListener('load',send);send()})()</script></body></html>`;
}