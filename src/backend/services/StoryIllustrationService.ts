/**
 * Produces polished, hand-designed SVG illustrations for stories, one style per
 * category, filled with a key figure pulled from the story. This replaces
 * LLM-drawn SVGs (which came out messy/inconsistent) with consistent, clean art.
 *
 * Single responsibility: turning a story's category + text into an image data URI.
 */
export class StoryIllustrationService {
  static generate(category: string, headline: string, summary: string): string {
    const label = this.extractFigure(`${headline} ${summary}`);
    const svg = this.buildSvg(category, label);
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /** Picks a prominent number/figure from the text to feature in the artwork. */
  private static extractFigure(text: string): string {
    const patterns = [
      /(?:₹|Rs\.?|\$)\s?\d[\d,]*(?:\.\d+)?(?:\s?(?:crore|lakh|billion|million|bn|cr))?/i,
      /\d+(?:\.\d+)?\s?%/,
      /\b\d{1,3}\s?[-–]\s?\d{1,3}\b/, // scores like 3-2
      /\b\d{1,3}(?:,\d{2,3})+(?:\.\d+)?\b/,
      /\b\d{2,}(?:\.\d+)?\b/,
    ];
    for (const p of patterns) {
      const m = text.match(p);
      if (m) return this.escapeXml(m[0].trim()).slice(0, 16);
    }
    return '';
  }

  private static escapeXml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private static buildSvg(category: string, label: string): string {
    switch (category) {
      case 'stock-market':
        return this.stockMarket(label);
      case 'sports':
        return this.sports(label);
      case 'math':
        return this.math(label);
      case 'business':
      default:
        return this.business(label);
    }
  }

  /** A rounded "chip" badge (top-right) showing the featured figure. */
  private static chip(label: string, fill: string, stroke: string, text: string): string {
    if (!label) return '';
    return `<g filter="url(#sh)"><rect x="244" y="22" width="136" height="32" rx="16" fill="${fill}" stroke="${stroke}" stroke-opacity="0.6"/><text x="312" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="${text}">${label}</text></g>`;
  }

  private static frame(inner: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${inner}</svg>`;
  }

  private static stockMarket(label: string): string {
    const inner = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B2A4A"/><stop offset="1" stop-color="#123E6B"/></linearGradient>
  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34D399" stop-opacity="0.5"/><stop offset="1" stop-color="#34D399" stop-opacity="0"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#04121f" flood-opacity="0.45"/></filter>
</defs>
<rect width="400" height="300" fill="url(#bg)"/>
<g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"><line x1="0" y1="110" x2="400" y2="110"/><line x1="0" y1="170" x2="400" y2="170"/><line x1="0" y1="230" x2="400" y2="230"/></g>
<path d="M20 235 C 95 220, 135 190, 195 182 S 305 120, 384 72 L 384 262 L 20 262 Z" fill="url(#area)"/>
<path d="M20 235 C 95 220, 135 190, 195 182 S 305 120, 384 72" fill="none" stroke="#34D399" stroke-width="5" stroke-linecap="round" filter="url(#sh)"/>
<circle cx="384" cy="72" r="7" fill="#EAFBF3" stroke="#34D399" stroke-width="3"/>
<g filter="url(#sh)"><ellipse cx="74" cy="252" rx="36" ry="13" fill="#E7B23C"/><ellipse cx="74" cy="241" rx="36" ry="13" fill="#F5C654"/><ellipse cx="74" cy="230" rx="36" ry="13" fill="#FFD86B"/><text x="74" y="235" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#7A4E00">₹ $ €</text></g>
<g filter="url(#sh)"><circle cx="338" cy="126" r="21" fill="#34D399"/><path d="M338 114 l 11 15 h -7 v 9 h -8 v -9 h -7 z" fill="#06331F"/></g>
<text x="22" y="42" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="bold" fill="#DCE9FF">Markets</text>
${this.chip(label, '#0A2038', '#34D399', '#EAFBF3')}`;
    return this.frame(inner);
  }

  private static business(label: string): string {
    const inner = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#312E81"/><stop offset="1" stop-color="#1E1B4B"/></linearGradient>
  <radialGradient id="sun" cx="82%" cy="18%" r="45%"><stop offset="0" stop-color="#F9A8D4" stop-opacity="0.55"/><stop offset="1" stop-color="#F9A8D4" stop-opacity="0"/></radialGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0b1220" flood-opacity="0.45"/></filter>
</defs>
<rect width="400" height="300" fill="url(#bg)"/>
<rect width="400" height="300" fill="url(#sun)"/>
<g filter="url(#sh)" fill="#4338CA">
  <path d="M40 262 V 150 q 0 -8 8 -8 h 42 q 8 0 8 8 V 262 Z"/>
  <path d="M112 262 V 108 q 0 -8 8 -8 h 46 q 8 0 8 8 V 262 Z"/>
  <path d="M190 262 V 176 q 0 -8 8 -8 h 40 q 8 0 8 8 V 262 Z"/>
  <path d="M260 262 V 126 q 0 -8 8 -8 h 44 q 8 0 8 8 V 262 Z"/>
</g>
<g fill="#C7D2FE" opacity="0.85">
  <rect x="52" y="162" width="10" height="12" rx="2"/><rect x="70" y="162" width="10" height="12" rx="2"/><rect x="52" y="184" width="10" height="12" rx="2"/><rect x="70" y="184" width="10" height="12" rx="2"/>
  <rect x="126" y="120" width="11" height="13" rx="2"/><rect x="146" y="120" width="11" height="13" rx="2"/><rect x="126" y="144" width="11" height="13" rx="2"/><rect x="146" y="144" width="11" height="13" rx="2"/><rect x="126" y="168" width="11" height="13" rx="2"/><rect x="146" y="168" width="11" height="13" rx="2"/>
  <rect x="274" y="138" width="11" height="13" rx="2"/><rect x="294" y="138" width="11" height="13" rx="2"/><rect x="274" y="162" width="11" height="13" rx="2"/><rect x="294" y="162" width="11" height="13" rx="2"/>
</g>
<path d="M40 232 C 120 205, 200 210, 300 150 S 360 96, 384 78" fill="none" stroke="#34D399" stroke-width="5" stroke-linecap="round" filter="url(#sh)"/>
<path d="M366 74 l 20 4 l -6 19 z" fill="#34D399" filter="url(#sh)"/>
<text x="22" y="42" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="bold" fill="#E0E7FF">Business</text>
${this.chip(label, '#241F5C', '#818CF8', '#EEF2FF')}`;
    return this.frame(inner);
  }

  private static sports(label: string): string {
    const inner = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#134E4A"/><stop offset="0.6" stop-color="#0F766E"/><stop offset="1" stop-color="#065F46"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset="1" stop-color="#D97706"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#052e2b" flood-opacity="0.5"/></filter>
</defs>
<rect width="400" height="300" fill="url(#bg)"/>
<path d="M0 250 C 120 220, 280 220, 400 250 L 400 300 L 0 300 Z" fill="#ffffff" fill-opacity="0.06"/>
<g filter="url(#sh)">
  <path d="M150 92 h 100 v 26 a 50 46 0 0 1 -100 0 Z" fill="url(#gold)"/>
  <path d="M150 100 h -26 a 22 22 0 0 0 26 30 Z" fill="url(#gold)"/>
  <path d="M250 100 h 26 a 22 22 0 0 1 -26 30 Z" fill="url(#gold)"/>
  <rect x="190" y="162" width="20" height="24" fill="#B45309"/>
  <path d="M168 186 q 32 -14 64 0 v 12 h -64 Z" fill="url(#gold)"/>
  <rect x="158" y="198" width="84" height="14" rx="4" fill="#92400E"/>
</g>
<path d="M200 104 l 6 13 14 1 -11 9 4 14 -13 -8 -13 8 4 -14 -11 -9 14 -1 z" fill="#FFFBEB" filter="url(#sh)"/>
<g fill="#FCD34D" opacity="0.9"><circle cx="70" cy="80" r="5"/><circle cx="330" cy="70" r="5"/><circle cx="300" cy="120" r="4"/><circle cx="96" cy="140" r="4"/><circle cx="60" cy="200" r="5"/><circle cx="345" cy="180" r="4"/></g>
<text x="22" y="42" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="bold" fill="#ECFDF5">Sports</text>
${this.chip(label, '#0B3B36', '#5EEAD4', '#ECFDF5')}`;
    return this.frame(inner);
  }

  private static math(label: string): string {
    const inner = `
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4C1D95"/><stop offset="1" stop-color="#2E1065"/></linearGradient>
  <linearGradient id="tri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F472B6"/><stop offset="1" stop-color="#DB2777"/></linearGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#1b0a3f" flood-opacity="0.5"/></filter>
</defs>
<rect width="400" height="300" fill="url(#bg)"/>
<g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1"><line x1="0" y1="150" x2="400" y2="150"/><line x1="200" y1="60" x2="200" y2="260"/></g>
<path d="M40 240 Q 150 60 360 210" fill="none" stroke="#22D3EE" stroke-width="5" stroke-linecap="round" filter="url(#sh)"/>
<circle cx="150" cy="140" r="46" fill="none" stroke="#A78BFA" stroke-width="6" filter="url(#sh)"/>
<path d="M262 108 l 52 0 -26 46 z" fill="url(#tri)" filter="url(#sh)"/>
<g fill="#FBCFE8" font-family="Georgia, serif" font-weight="bold"><text x="120" y="150" font-size="34">&#960;</text><text x="300" y="240" font-size="26">&#8734;</text></g>
<g stroke="#FDE68A" stroke-width="5" stroke-linecap="round"><line x1="70" y1="86" x2="94" y2="86"/><line x1="82" y1="74" x2="82" y2="98"/></g>
<g stroke="#FDE68A" stroke-width="5" stroke-linecap="round"><line x1="330" y1="96" x2="350" y2="116"/><line x1="350" y1="96" x2="330" y2="116"/></g>
<text x="22" y="42" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="bold" fill="#F5F3FF">Math</text>
${this.chip(label, '#2B1560', '#C4B5FD', '#F5F3FF')}`;
    return this.frame(inner);
  }
}
