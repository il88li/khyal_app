/* ═══════════════════════════════════════════════
   خيال — مكتبة Skeletons
   كل skeleton يحاكي الأبعاد الحقيقية للعنصر
   ═══════════════════════════════════════════════ */

const s = (cls, style = '') =>
  `<div class="sk ${cls}"${style ? ` style="${style}"` : ''}></div>`;

const skText = (w = '100%', h = '14px') => s('sk-text', `width:${w};height:${h}`);
const skCircle = (size) => s('sk-circle', `width:${size}px;height:${size}px`);

/* ─── بطاقة برومبت ─── */
export function skeletonCard() {
  return `
  <article class="prompt-card sk-card" aria-busy="true" aria-label="جارٍ التحميل">
    <div class="sk sk-cover"></div>
    <div class="pc-body">
      ${skText('70px', '11px')}
      <div style="height:8px"></div>
      ${skText('90%', '16px')}
      <div style="height:6px"></div>
      ${skText('75%', '16px')}
      <div style="height:14px"></div>
      ${skText('100%', '12px')}
      <div style="height:6px"></div>
      ${skText('85%', '12px')}
      <div style="height:16px"></div>
      <div class="row gap-8">
        ${s('sk-pill', 'width:52px')}
        ${s('sk-pill', 'width:64px')}
        ${s('sk-pill', 'width:44px')}
      </div>
    </div>
    <footer class="pc-foot">
      <span class="row gap-8">
        ${skCircle(24)}
        ${skText('80px', '13px')}
      </span>
      <span class="row gap-12">
        ${skText('32px', '12px')}
        ${skText('32px', '12px')}
      </span>
    </footer>
  </article>`;
}

export function skeletonGrid(count = 6) {
  return `<div class="grid-cards">${Array.from({ length: count }, skeletonCard).join('')}</div>`;
}

/* ─── بطاقة إحصائية ─── */
export function skeletonStatCard() {
  return `
  <div class="stat-card" aria-busy="true">
    ${skText('80px', '11px')}
    <div style="height:10px"></div>
    ${skText('56px', '26px')}
  </div>`;
}

export function skeletonStatCards(n = 4) {
  return `<div class="stat-cards">${Array.from({ length: n }, skeletonStatCard).join('')}</div>`;
}

/* ─── صف جدول ─── */
export function skeletonTableRow(cols = 5) {
  const widths = ['40%', '60%', '30%', '20%', '25%', '28%'];
  return `<tr class="sk-row" aria-busy="true">${
    Array.from({ length: cols }, (_, i) =>
      `<td>${skText(widths[i % widths.length], '14px')}</td>`
    ).join('')
  }</tr>`;
}

export function skeletonTable(rows = 6, cols = 5) {
  return `
  <div class="table-wrap" aria-busy="true">
    <table><tbody>${Array.from({ length: rows }, () => skeletonTableRow(cols)).join('')}</tbody></table>
  </div>`;
}

/* ─── بطاقة ميزة ─── */
export function skeletonFeature() {
  return `
  <div class="feature" aria-busy="true" style="text-align:center">
    ${s('sk-circle', 'width:40px;height:40px;margin:0 auto 16px')}
    ${skText('80px', '16px')}
    <div style="height:10px"></div>
    ${skText('100%', '13px')}
    <div style="height:6px"></div>
    ${skText('80%', '13px')}
  </div>`;
}

export function skeletonFeatures(n = 4) {
  return `<div class="features">${Array.from({ length: n }, skeletonFeature).join('')}</div>`;
}

/* ─── هيدر قسم ─── */
export function skeletonSectionHead() {
  return `
  <div class="section-head">
    ${skText('120px', '12px')}
    <div style="height:12px"></div>
    ${skText('320px', '30px')}
  </div>`;
}

/* ─── تفاصيل البرومبت ─── */
export function skeletonPromptDetail() {
  return `
  <div class="detail-hero" aria-busy="true">
    <div class="sk sk-detail-cover"></div>
    <div class="detail-body">
      <div class="row gap-8" style="margin-bottom:16px">
        ${s('sk-pill', 'width:72px')}
        ${s('sk-pill', 'width:96px')}
        ${s('sk-pill', 'width:84px')}
      </div>
      ${skText('80%', '32px')}
      <div style="height:8px"></div>
      ${skText('60%', '32px')}
      <div style="height:20px"></div>
      ${skText('100%', '15px')}
      <div style="height:8px"></div>
      ${skText('85%', '15px')}
      <div style="height:24px"></div>
      <div class="author-bar">
        ${skCircle(40)}
        <div style="flex:1">
          ${skText('120px', '14px')}
          <div style="height:6px"></div>
          ${skText('80px', '12px')}
        </div>
        ${s('sk-pill', 'width:100px;height:32px')}
        ${s('sk-pill', 'width:130px;height:32px')}
      </div>
      <div class="sk sk-code"></div>
      <div style="height:20px"></div>
      <div class="row" style="justify-content:space-between">
        <div class="row gap-8">
          ${s('sk-pill', 'width:70px')}${s('sk-pill', 'width:80px')}${s('sk-pill', 'width:60px')}
        </div>
        ${s('sk-pill', 'width:160px;height:38px')}
      </div>
    </div>
  </div>`;
}

/* ─── بروفايل ─── */
export function skeletonProfile() {
  return `
  <div class="profile-head" aria-busy="true">
    ${s('sk-circle', 'width:80px;height:80px')}
    <div style="flex:1;min-width:220px">
      ${skText('200px', '26px')}
      <div style="height:8px"></div>
      ${skText('100px', '13px')}
      <div style="height:14px"></div>
      ${skText('380px', '14px')}
      <div style="height:6px"></div>
      ${skText('300px', '14px')}
      <div style="height:16px"></div>
      <div class="row gap-8">
        ${s('sk-pill', 'width:76px')}
        ${s('sk-pill', 'width:120px')}
      </div>
    </div>
  </div>
  <div class="stats-row">
    ${['برومبت', 'إعجاب', 'نسخة'].map(() => `
      <div class="stat">
        ${skText('48px', '24px')}
        <div style="height:6px"></div>
        ${skText('40px', '12px')}
      </div>`).join('')}
  </div>
  ${skeletonSectionHead()}
  ${skeletonGrid(3)}`;
}

/* ─── تبويب إدارة ─── */
export function skeletonAdminTab(kind = 'overview') {
  if (kind === 'overview') {
    return `${skeletonStatCards(4)}
      <div class="two-col" style="margin-top:24px">
        <div class="card card-white">
          ${skText('120px', '15px')}
          <div style="height:16px"></div>
          ${Array.from({ length: 5 }, () => `
            <div class="item row gap-12" style="padding:14px 0;border-bottom:1px solid var(--grid)">
              <div style="flex:1">
                ${skText('60%', '14px')}
                <div style="height:6px"></div>
                ${skText('40%', '12px')}
              </div>
              ${skText('32px', '13px')}
            </div>`).join('')}
        </div>
        <div class="card card-white">
          ${skText('120px', '15px')}
          <div style="height:16px"></div>
          ${Array.from({ length: 5 }, () => `
            <div class="item row gap-12" style="padding:14px 0;border-bottom:1px solid var(--grid)">
              ${skCircle(28)}
              <div style="flex:1">
                ${skText('50%', '14px')}
                <div style="height:6px"></div>
                ${skText('35%', '12px')}
              </div>
              ${skText('24px', '13px')}
            </div>`).join('')}
        </div>
      </div>`;
  }
  return skeletonTable(8, kind === 'users' ? 6 : 5);
}