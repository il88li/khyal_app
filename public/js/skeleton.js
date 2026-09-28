const s = (cls, style = '') => `<div class="sk ${cls}"${style ? ` style="${style}"` : ''}></div>`;
const skText = (w = '100%', h = '12px') => s('sk-text', `width:${w};height:${h}`);
const skCircle = (size) => s('sk-circle', `width:${size}px;height:${size}px`);

export function skeletonCard() {
  return `
  <article class="prompt-card sk-card" aria-busy="true">
    <div class="sk sk-cover"></div>
    <div class="pc-body">
      ${skText('50px', '11px')}
      <div style="height:8px"></div>
      ${skText('90%', '16px')}
      <div style="height:6px"></div>
      ${skText('70%', '16px')}
      <div style="height:12px"></div>
      ${skText('100%', '13px')}
      <div style="height:6px"></div>
      ${skText('80%', '13px')}
      <div style="height:14px"></div>
      <div class="row gap-6">
        ${s('sk-pill', 'width:52px;height:18px')}
        ${s('sk-pill', 'width:64px;height:18px')}
      </div>
    </div>
    <footer class="pc-foot">
      <span class="row gap-8">${skCircle(24)}${skText('70px', '13px')}</span>
      <span class="row gap-12">${skText('30px', '12px')}${skText('30px', '12px')}</span>
    </footer>
  </article>`;
}

export function skeletonGrid(count = 6) {
  return `<div class="grid-cards">${Array.from({ length: count }, skeletonCard).join('')}</div>`;
}

export function skeletonStatCard() {
  return `<div class="stat-card" aria-busy="true">${skText('70px', '11px')}<div style="height:10px"></div>${skText('50px', '24px')}</div>`;
}

export function skeletonStatCards(n = 4) {
  return `<div class="stat-cards">${Array.from({ length: n }, skeletonStatCard).join('')}</div>`;
}

export function skeletonTableRow(cols = 5) {
  const widths = ['40%', '60%', '30%', '20%', '25%', '28%'];
  return `<tr class="sk-row">${Array.from({ length: cols }, (_, i) => `<td>${skText(widths[i % widths.length], '13px')}</td>`).join('')}</tr>`;
}

export function skeletonTable(rows = 6, cols = 5) {
  return `<div class="table-wrap"><table><tbody>${Array.from({ length: rows }, () => skeletonTableRow(cols)).join('')}</tbody></table></div>`;
}

export function skeletonSectionHead() {
  return `<div class="section-head">${skText('100px', '11px')}<div style="height:10px"></div>${skText('280px', '26px')}</div>`;
}

export function skeletonPromptDetail() {
  return `<div class="detail-hero" aria-busy="true">
    <div class="sk sk-detail-cover"></div>
    <div class="detail-body">
      <div class="row gap-8" style="margin-bottom:14px">
        ${s('sk-pill', 'width:60px')}${s('sk-pill', 'width:80px')}${s('sk-pill', 'width:70px')}
      </div>
      ${skText('75%', '28px')}
      <div style="height:20px"></div>
      <div class="author-bar">
        ${skCircle(40)}
        <div style="flex:1">${skText('110px', '14px')}<div style="height:6px"></div>${skText('70px', '12px')}</div>
        ${s('sk-pill', 'width:90px;height:30px')}${s('sk-pill', 'width:120px;height:30px')}
      </div>
      <div class="sk sk-code"></div>
      <div style="height:16px"></div>
      <div class="row" style="justify-content:space-between">
        <div class="row gap-6">${s('sk-pill', 'width:60px')}${s('sk-pill', 'width:70px')}</div>
        ${s('sk-pill', 'width:140px;height:36px')}
      </div>
    </div>
  </div>`;
}

export function skeletonProfile() {
  return `<div class="profile-head" aria-busy="true">
    ${s('sk-circle', 'width:88px;height:88px')}
    <div style="flex:1;min-width:200px">
      ${skText('180px', '24px')}
      <div style="height:8px"></div>
      ${skText('100px', '13px')}
      <div style="height:14px"></div>
      ${skText('320px', '14px')}
      <div style="height:6px"></div>
      ${skText('240px', '14px')}
    </div>
  </div>
  <div class="stat-strip">
    ${[1,2,3].map(() => `<div class="stat-pill">${skText('44px', '22px')}<div style="height:6px"></div>${skText('40px', '11px')}</div>`).join('')}
  </div>
  ${skeletonGrid(6)}`;
}

export function skeletonAdminTab(kind = 'overview') {
  if (kind === 'overview') {
    return `${skeletonStatCards(4)}
      <div class="two-col" style="margin-top:20px">
        <div class="card card-white">${skText('110px', '14px')}<div style="height:14px"></div>
          ${Array.from({ length: 4 }).map(() => `<div class="row gap-12" style="padding:12px 0;border-bottom:1px solid var(--grid)"><div style="flex:1">${skText('60%', '13px')}<div style="height:6px"></div>${skText('40%', '11px')}</div>${skText('30px', '12px')}</div>`).join('')}
        </div>
        <div class="card card-white">${skText('110px', '14px')}<div style="height:14px"></div>
          ${Array.from({ length: 4 }).map(() => `<div class="row gap-12" style="padding:12px 0;border-bottom:1px solid var(--grid)">${skCircle(26)}<div style="flex:1">${skText('50%', '13px')}</div>${skText('22px', '12px')}</div>`).join('')}
        </div>
      </div>`;
  }
  return skeletonTable(6, kind === 'users' ? 6 : 5);
}

export function skeletonComments(n = 3) {
  return Array.from({ length: n }, () => `
    <div class="comment-item" aria-busy="true" style="pointer-events:none">
      ${s('sk-circle', 'width:36px;height:36px')}
      <div class="c-body" style="flex:1">
        <div class="row gap-8" style="margin-bottom:6px">
          ${skText('100px', '13px')}
          ${skText('50px', '11px')}
        </div>
        ${skText('100%', '13px')}
        <div style="height:6px"></div>
        ${skText('70%', '13px')}
      </div>
    </div>
  `).join('');
}

export function skeletonNotifications(n = 5) {
  return Array.from({ length: n }, () => `
    <div class="notif-item" aria-busy="true" style="pointer-events:none">
      ${s('sk-circle', 'width:32px;height:32px')}
      <div class="n-body" style="flex:1">
        ${skText('85%', '13px')}
        <div style="height:6px"></div>
        ${skText('40%', '11px')}
      </div>
    </div>
  `).join('');
}