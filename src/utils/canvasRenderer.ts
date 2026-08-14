import { StoryTemplateId, TemplateCustomization, WalkRecord } from '../types';

interface RenderOptions {
  record: WalkRecord;
  template: StoryTemplateId;
  copyText: string;
  customization?: TemplateCustomization;
}

// Color schemes configuration
const COLOR_THEMES = {
  'warm-sand': {
    bg: '#F5F2EB',
    cardBg: '#FFFFFF',
    textMain: '#24211D',
    textMuted: '#79746D',
    accent: '#8C6D4F',
    border: '#E3DDD2',
    pillBg: '#EFEBE2',
    pillText: '#5A544C',
  },
  'raw-concrete': {
    bg: '#EBECEE',
    cardBg: '#F7F8FA',
    textMain: '#1F242A',
    textMuted: '#6C757F',
    accent: '#475569',
    border: '#D5D9DE',
    pillBg: '#DFE3E8',
    pillText: '#3B444F',
  },
  'deep-noir': {
    bg: '#141416',
    cardBg: '#1D1E22',
    textMain: '#F2F2F4',
    textMuted: '#9699A0',
    accent: '#D4AF37',
    border: '#2E3038',
    pillBg: '#2A2C34',
    pillText: '#D1D4DC',
  },
  'sage-green': {
    bg: '#EFF3EF',
    cardBg: '#FFFFFF',
    textMain: '#1C2920',
    textMuted: '#65776B',
    accent: '#4A6B53',
    border: '#DCE4DD',
    pillBg: '#E3EBE4',
    pillText: '#3B5242',
  },
  'terracotta': {
    bg: '#F9F3EF',
    cardBg: '#FFFFFF',
    textMain: '#2D1F1A',
    textMuted: '#826A61',
    accent: '#B85D3B',
    border: '#ECDCD5',
    pillBg: '#F3E5DF',
    pillText: '#734636',
  },
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS or loading error, create a fallback visual canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1080;
      fallbackCanvas.height = 1080;
      const fctx = fallbackCanvas.getContext('2d')!;
      const grad = fctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#3A3937');
      grad.addColorStop(1, '#201F1E');
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, 1080, 1080);
      fctx.fillStyle = '#E5E0D8';
      fctx.font = '36px sans-serif';
      fctx.textAlign = 'center';
      fctx.fillText('A WALK IN THE CITY', 540, 540);
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      fallbackImg.onload = () => resolve(fallbackImg);
    };
    img.src = src;
  });
}

export async function renderStoryToCanvas(
  options: RenderOptions,
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1920;

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context');

  const { record, template, copyText, customization } = options;
  const colorKey = customization?.colorScheme || 'warm-sand';
  const theme = COLOR_THEMES[colorKey] || COLOR_THEMES['warm-sand'];
  const isDark = colorKey === 'deep-noir';

  const img = await loadImage(record.image);

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  if (template === 'templateA') {
    // -------------------------------------------------------------
    // TEMPLATE A: Minimalist Typography (Full-bleed Photo with subtle scrim)
    // -------------------------------------------------------------
    // Draw photo full width, cropped top-to-bottom
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;

    let drawW, drawH, drawX, drawY;
    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = height * imgAspect;
      drawX = (width - drawW) / 2;
      drawY = 0;
    } else {
      drawW = width;
      drawH = width / imgAspect;
      drawX = 0;
      drawY = (height - drawH) / 2;
    }
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Gradient Scrim from bottom up
    const gradient = ctx.createLinearGradient(0, height * 0.35, 0, height);
    gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
    gradient.addColorStop(0.5, 'rgba(10, 10, 10, 0.45)');
    gradient.addColorStop(0.85, 'rgba(10, 10, 10, 0.88)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Top Header Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 24px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText('A WALK\'S PERSPECTIVE', 80, 120);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(record.date.replace(/-/g, '.') || '2026.08.13', width - 80, 120);

    // Top thin divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 145);
    ctx.lineTo(width - 80, 145);
    ctx.stroke();

    // Bottom Content Area
    const bottomStartY = height - 520;

    // Location tag
    ctx.fillStyle = '#E5E0D8';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📍 ${record.location || '도심 산책로'}`, 80, bottomStartY);

    // Main Quote / Sentence
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '400 44px "Noto Serif KR", serif';
    wrapText(ctx, `"${copyText}"`, 80, bottomStartY + 70, width - 160, 68);

    // Keywords Pills
    const keywords = record.spatialAnalysis?.keywords || ['#빛', '#그림자', '#시간'];
    let kwX = 80;
    const kwY = height - 160;

    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    keywords.slice(0, 4).forEach((kw) => {
      const tagText = kw.startsWith('#') ? kw : `#${kw}`;
      const tagWidth = ctx.measureText(tagText).width + 36;
      
      // Pill Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      roundRect(ctx, kwX, kwY - 26, tagWidth, 42, 21);
      ctx.fill();

      // Pill Text
      ctx.fillStyle = '#F0EFEA';
      ctx.fillText(tagText, kwX + 18, kwY);

      kwX += tagWidth + 14;
    });

    // Branding Footer with Instagram Author Watermark
    const authorTag = customization?.authorHandle || '@duweon_choo';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ARCHIVED BY ${authorTag.toUpperCase()} • 산책의 시선`, width / 2, height - 70);

  } else if (template === 'templateB') {
    // -------------------------------------------------------------
    // TEMPLATE B: Editorial Statement (Bold Quote + Framed Photo + Lines)
    // -------------------------------------------------------------
    // Large top/middle photo in high-contrast card
    const cardMargin = 70;
    const photoTop = 200;
    const photoHeight = 840;
    const photoWidth = width - cardMargin * 2;

    // Draw Image in Center Card with subtle rounded corners
    ctx.save();
    roundRect(ctx, cardMargin, photoTop, photoWidth, photoHeight, 16);
    ctx.clip();
    
    // Fit Image inside
    const srcRatio = img.width / img.height;
    const destRatio = photoWidth / photoHeight;
    let sW, sH, sX, sY;
    if (srcRatio > destRatio) {
      sH = img.height;
      sW = img.height * destRatio;
      sX = (img.width - sW) / 2;
      sY = 0;
    } else {
      sW = img.width;
      sH = img.width / destRatio;
      sX = 0;
      sY = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, cardMargin, photoTop, photoWidth, photoHeight);
    ctx.restore();

    // Top Architectural Magazine Header
    ctx.fillStyle = theme.accent;
    ctx.font = '700 20px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText('VOL. 08 — SPATIAL DIALOGUE', cardMargin, 110);

    ctx.fillStyle = theme.textMuted;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${record.date.replace(/-/g, '.')} / ${record.location}`, width - cardMargin, 110);

    // Thin header border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cardMargin, 140);
    ctx.lineTo(width - cardMargin, 140);
    ctx.stroke();

    // Bottom Editorial Quote Box
    const quoteY = photoTop + photoHeight + 80;

    // Decorative quote mark
    ctx.fillStyle = theme.accent;
    ctx.font = '700 72px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText('“', cardMargin, quoteY);

    // Large Copy Text
    ctx.fillStyle = theme.textMain;
    ctx.font = '600 42px "Noto Serif KR", serif';
    const textEndY = wrapText(ctx, copyText, cardMargin + 50, quoteY - 10, photoWidth - 60, 64);

    // Keywords in editorial row
    const keywords = record.spatialAnalysis?.keywords || ['#빛', '#그림자', '#소재'];
    ctx.fillStyle = theme.textMuted;
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(keywords.join('   '), cardMargin, height - 140);

    // Bottom accent line
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardMargin, height - 100);
    ctx.lineTo(cardMargin + 120, height - 100);
    ctx.stroke();

    // Watermark & Author
    const authorTag = customization?.authorHandle || '@duweon_choo';
    ctx.fillStyle = theme.accent;
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`ARCHIVED BY ${authorTag.toUpperCase()}`, cardMargin, height - 60);

    ctx.fillStyle = theme.textMuted;
    ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ARCHITECTURAL EYE • 산책의 시선', width - cardMargin, height - 60);

  } else {
    // -------------------------------------------------------------
    // TEMPLATE C: Design Magazine Archive (Grid & Observation Index)
    // -------------------------------------------------------------
    const padding = 60;
    
    // Outer Frame Border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    // Inner Corner Crosshairs (Architectural Drafting marks)
    drawCrosshair(ctx, padding, padding, theme.accent);
    drawCrosshair(ctx, width - padding, padding, theme.accent);
    drawCrosshair(ctx, padding, height - padding, theme.accent);
    drawCrosshair(ctx, width - padding, height - padding, theme.accent);

    // Magazine Masthead
    ctx.fillStyle = theme.textMain;
    ctx.font = '700 32px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPATIAL OBSERVATION', width / 2, 140);

    ctx.fillStyle = theme.accent;
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ARCHIVE & URBAN DICTIONARY', width / 2, 175);

    // Photo Box with fine double border
    const photoX = padding + 40;
    const photoY = 220;
    const photoW = width - (padding + 40) * 2;
    const photoH = 880;

    ctx.save();
    ctx.rect(photoX, photoY, photoW, photoH);
    ctx.clip();
    
    // Draw cropped photo
    const srcRatio = img.width / img.height;
    const destRatio = photoW / photoH;
    let sW, sH, sX, sY;
    if (srcRatio > destRatio) {
      sH = img.height;
      sW = img.height * destRatio;
      sX = (img.width - sW) / 2;
      sY = 0;
    } else {
      sW = img.width;
      sH = img.width / destRatio;
      sX = 0;
      sY = (img.height - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Photo fine border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Middle Meta Bar
    const metaY = photoY + photoH + 50;
    ctx.fillStyle = theme.accent;
    ctx.font = '700 20px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.fillText('INDEX [ 01 ]', photoX, metaY);

    ctx.fillStyle = theme.textMuted;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(record.location || 'SEOUL, KR', width / 2, metaY);

    ctx.textAlign = 'right';
    ctx.fillText(record.date.replace(/-/g, '.'), photoX + photoW, metaY);

    // Divider
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(photoX, metaY + 20);
    ctx.lineTo(photoX + photoW, metaY + 20);
    ctx.stroke();

    // Body Text
    const bodyY = metaY + 75;
    ctx.fillStyle = theme.textMain;
    ctx.font = '400 38px "Noto Serif KR", serif';
    ctx.textAlign = 'left';
    wrapText(ctx, copyText, photoX, bodyY, photoW, 58);

    // Keywords Pills at bottom
    const keywords = record.spatialAnalysis?.keywords || ['#빛', '#그림자', '#소재'];
    let kwX = photoX;
    const kwY = height - 160;

    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    keywords.slice(0, 4).forEach((kw) => {
      const tagText = kw.startsWith('#') ? kw : `#${kw}`;
      const tagWidth = ctx.measureText(tagText).width + 32;
      
      ctx.fillStyle = theme.pillBg;
      roundRect(ctx, kwX, kwY - 26, tagWidth, 42, 8);
      ctx.fill();

      ctx.fillStyle = theme.pillText;
      ctx.fillText(tagText, kwX + 16, kwY);

      kwX += tagWidth + 12;
    });

    // Bottom Footer text with Instagram author
    const authorTag = customization?.authorHandle || '@duweon_choo';
    ctx.fillStyle = theme.textMuted;
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`OBSERVED BY ${authorTag.toUpperCase()} • SANCHAEK UI SISEON`, width / 2, height - 90);
  }

  return canvas;
}

function drawCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const size = 12;
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.stroke();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string = 'story.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
