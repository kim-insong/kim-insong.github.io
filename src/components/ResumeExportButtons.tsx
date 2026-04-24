import { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const A4_W = 794;
const A4_H = 1123;
const SCALE = 2;
const PAGE_PAD_V = 80;    // top/bottom page margin (doubled from 40)
const PAGE_PAD_H = 48;    // left/right section padding (doubled from px-6 = 24px)
const USABLE_H = A4_H - PAGE_PAD_V * 2;
const PAGE_SAFE_MARGIN = 8; // conservative buffer to prevent sub-pixel item cuts

interface BlockInfo {
  el: HTMLElement;
  type: string;
  top: number;
  h: number;
}

interface Page {
  startY: number;
  contentH: number;
}

function injectExportStyles(): HTMLStyleElement {
  const el = document.createElement('style');
  el.textContent = `
    .export-clone section[data-export-section] {
      padding-top: 20px !important;
      padding-bottom: 20px !important;
      padding-left: ${PAGE_PAD_H}px !important;
      padding-right: ${PAGE_PAD_H}px !important;
    }
    .export-clone section[data-export-section] > div {
      max-width: none !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
    .export-clone .section-label {
      font-size: 0.55rem !important;
      margin-bottom: 4px !important;
    }
    .export-clone h1 {
      font-size: 1.05rem !important;
      line-height: 1.3 !important;
      margin-bottom: 6px !important;
    }
    .export-clone h2 {
      font-size: 0.88rem !important;
      line-height: 1.3 !important;
    }
    .export-clone p {
      font-size: 0.67rem !important;
      line-height: 1.3 !important;
    }
    .export-clone .text-3xl,
    .export-clone .text-4xl {
      font-size: 1.05rem !important;
      line-height: 1.3 !important;
    }
    .export-clone .text-2xl {
      font-size: 0.88rem !important;
      line-height: 1.3 !important;
    }
    .export-clone .text-sm {
      font-size: 0.67rem !important;
      line-height: 1.3 !important;
    }
    .export-clone .text-xs {
      font-size: 0.59rem !important;
      line-height: 1.25 !important;
    }
    .export-clone .leading-relaxed {
      line-height: 1.3 !important;
    }
    .export-clone .mb-8 { margin-bottom: 10px !important; }
    .export-clone .mb-4 { margin-bottom: 6px !important; }
    .export-clone .mb-3 { margin-bottom: 4px !important; }
    .export-clone .mb-1\\.5 { margin-bottom: 3px !important; }
    .export-clone .py-5 {
      padding-top: 6px !important;
      padding-bottom: 6px !important;
    }
    .export-clone .py-24,
    .export-clone .py-20 {
      padding-top: 20px !important;
      padding-bottom: 20px !important;
    }
    .export-clone .gap-3 { gap: 2px !important; }
    .export-clone .gap-6 { gap: 8px !important; }
    .export-clone .gap-2 { gap: 3px !important; }
    .export-clone .gap-1\\.5 { gap: 2px !important; }
  `;
  document.head.appendChild(el);
  return el;
}

async function buildClone(): Promise<{ wrap: HTMLElement; wrapTop: number }> {
  const source = document.getElementById('resume-content');
  if (!source) throw new Error('#resume-content not found');

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: A4_W + 'px',
    background: 'white',
    zIndex: '-9999',
    overflow: 'visible',
  });

  const clone = source.cloneNode(true) as HTMLElement;
  clone.classList.add('export-clone');
  clone.querySelectorAll('[data-export-hide]').forEach(el => el.remove());

  wrap.appendChild(clone);
  document.body.appendChild(wrap);

  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 200));

  return { wrap, wrapTop: wrap.getBoundingClientRect().top };
}

function collectBlocks(wrap: HTMLElement, wrapTop: number): BlockInfo[] {
  const blocks: BlockInfo[] = [];
  wrap.querySelectorAll('[data-export-block]').forEach(el => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    blocks.push({
      el: el as HTMLElement,
      type: (el as HTMLElement).dataset.exportBlock ?? '',
      top: rect.top - wrapTop,
      h: rect.height,
    });
  });
  return blocks;
}

function paginate(blocks: BlockInfo[], wrapTop: number): Page[] {
  if (blocks.length === 0) return [];

  const pages: Page[] = [];
  let pageStartY = 0;
  let blocksOnPage = 0;

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let needNewPage = false;

    if (blocksOnPage > 0) {
      if (b.type === 'section-header' && i + 1 < blocks.length) {
        const next = blocks[i + 1];
        needNewPage = next.top + next.h - pageStartY > USABLE_H - PAGE_SAFE_MARGIN;
      } else {
        needNewPage = b.top + b.h - pageStartY > USABLE_H - PAGE_SAFE_MARGIN;
      }
    }

    if (needNewPage) {
      const prev = blocks[i - 1];
      pages.push({ startY: pageStartY, contentH: prev.top + prev.h - pageStartY });

      if (b.type === 'section-header') {
        const sectionEl = b.el.closest('[data-export-section]') as HTMLElement | null;
        pageStartY = sectionEl
          ? sectionEl.getBoundingClientRect().top - wrapTop
          : b.top;
      } else {
        pageStartY = b.top;
      }
      blocksOnPage = 0;
    }

    blocksOnPage++;
  }

  const last = blocks[blocks.length - 1];
  pages.push({ startY: pageStartY, contentH: last.top + last.h - pageStartY });
  return pages;
}

async function renderPage(cloneEl: HTMLElement, page: Page): Promise<HTMLCanvasElement> {
  const contentH = Math.max(1, Math.ceil(page.contentH));
  const pageH = Math.max(A4_H, contentH + PAGE_PAD_V * 2);

  const content = await (html2canvas as unknown as (
    el: HTMLElement,
    opts: Record<string, unknown>
  ) => Promise<HTMLCanvasElement>)(cloneEl, {
    scale: SCALE,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    x: 0,
    y: page.startY,
    width: A4_W,
    height: contentH,
    windowWidth: A4_W,
    windowHeight: 30000,
  });

  const out = document.createElement('canvas');
  out.width = A4_W * SCALE;
  out.height = pageH * SCALE;
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(content, 0, PAGE_PAD_V * SCALE);
  return out;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }
      resolve();
    }, 'image/png');
  });
}

export default function ResumeExportButtons() {
  const [state, setState] = useState<'idle' | 'png' | 'pdf'>('idle');

  async function run(mode: 'png' | 'pdf') {
    setState(mode);
    let wrap: HTMLElement | null = null;
    let styleEl: HTMLStyleElement | null = null;
    try {
      styleEl = injectExportStyles();
      const built = await buildClone();
      wrap = built.wrap;
      const blocks = collectBlocks(wrap, built.wrapTop);
      const pages = paginate(blocks, built.wrapTop);
      const cloneEl = wrap.firstElementChild as HTMLElement;

      if (mode === 'png') {
        for (let i = 0; i < pages.length; i++) {
          const canvas = await renderPage(cloneEl, pages[i]);
          await downloadCanvas(canvas, `resume-${i + 1}.png`);
        }
      } else {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        for (let i = 0; i < pages.length; i++) {
          const canvas = await renderPage(cloneEl, pages[i]);
          const pageH = Math.max(A4_H, pages[i].contentH + PAGE_PAD_V * 2);
          const heightMM = Math.round((pageH / A4_H) * 297);
          if (i > 0) pdf.addPage([210, heightMM]);
          pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, heightMM);
        }
        pdf.save('김인송_이력서.pdf');
      }
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      wrap?.remove();
      styleEl?.remove();
      setState('idle');
    }
  }

  const btnCls =
    'inline-flex items-center gap-1.5 text-xs font-medium text-text-sub ' +
    'bg-bg-alt border border-border rounded-lg px-3 py-1.5 ' +
    'hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
    'cursor-pointer select-none';

  return (
    <div className="flex items-center gap-2 mt-3 mb-5" data-export-hide="true">
      <button className={btnCls} disabled={state !== 'idle'} onClick={() => run('png')}>
        {state === 'png' ? '내보내는 중...' : 'PNG 다운로드'}
      </button>
      <button className={btnCls} disabled={state !== 'idle'} onClick={() => run('pdf')}>
        {state === 'pdf' ? '내보내는 중...' : '이미지 PDF'}
      </button>
      <button className={btnCls} disabled={state !== 'idle'} onClick={() => window.print()}>
        텍스트 PDF
      </button>
    </div>
  );
}
