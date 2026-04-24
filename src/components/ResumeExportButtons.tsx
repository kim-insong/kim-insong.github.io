import { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const A4_W = 794;
const A4_H = 1123;
const SCALE = 2;
const PAGE_PAD = 40;
const USABLE_H = A4_H - PAGE_PAD * 2;

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
        needNewPage = next.top + next.h - pageStartY > USABLE_H;
      } else {
        needNewPage = b.top + b.h - pageStartY > USABLE_H;
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
  const contentH = Math.max(1, page.contentH);
  const pageH = Math.max(A4_H, contentH + PAGE_PAD * 2);

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
  ctx.drawImage(content, 0, PAGE_PAD * SCALE);
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
    try {
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
          const pageH = Math.max(A4_H, pages[i].contentH + PAGE_PAD * 2);
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
        {state === 'pdf' ? '내보내는 중...' : 'PDF 다운로드'}
      </button>
    </div>
  );
}
