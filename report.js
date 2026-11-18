// v1.6(11-18) 센터 관리자 «회유 성과» — 회유 화면을 거친 해지 시도의 결과(할인가 결제·쉬어가기·체험권·결국 해지)를 건수·회원 명단·CSV로.
// reportApi()가 서버 역할: 로그인한 계정의 센터로만 거른다(센터 관리자가 다른 센터 id를 보내도 무시). 화면은 받은 결과만 그린다.
'use strict';
const RP_SESSIONS = {
  c_ydp: { role: 'center', center: 'c_ydp', who: '박지훈' },
  c_gn: { role: 'center', center: 'c_gn', who: '김도희' },
  c_ss: { role: 'center', center: 'c_ss', who: '이수민' },
  hq: { role: 'hq', center: null, who: '본사 운영팀' },
};
const RP_CLOCK0 = '2026-10-23 14:30'; // 프로토타입 «오늘»(회원 앱과 같은 날). 조작판 «결제일 11/15»를 누르면 11-15로 넘어감
const RPS = { clock: RP_CLOCK0, live: [], login: 'c_ydp', period: 'this', from: '', to: '', tab: 'all', center: 'all', seq: 0, run: 0 };
const PHONE_MASK = true; // 기존 센터 관리자 회원 목록 표시 방식에 맞춰 바꿀 한 곳(README 19-6)
const rpPhone = (p) => PHONE_MASK ? p.replace(/^(\d{3})-(\d{3,4})-(\d{4})$/, '$1-****-$3') : p;
const rpIc = (d, c, s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC_CHART = '<path d="M4 20h16M7 16v-4M12 16V8M17 16v-7"/>', IC_DL = '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>';
const rpCenter = (id) => RP_CENTERS.find((c) => c.id === id);
const rpToday = () => RPS.clock.slice(0, 10);

// ── 날짜
const pad2 = (n) => String(n).padStart(2, '0');
const ymd = (dt) => `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
const toDate = (s) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
const md = (s) => `${Number(s.slice(5, 7))}/${Number(s.slice(8, 10))}`;
const DOW = '일월화수목금토';
const fmtAt = (s) => `${s.slice(0, 4)}.${s.slice(5, 7)}.${s.slice(8, 10)}(${DOW[toDate(s).getDay()]}) ${s.slice(11, 16)}`;
function monthRange(today, back) {
  const d = toDate(today); d.setDate(1); d.setMonth(d.getMonth() - back);
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return [ymd(d), ymd(e)];
}
function rpRange() {
  if (RPS.period === 'last') return monthRange(rpToday(), 1);
  if (RPS.period === 'custom') { const [f, t] = monthRange(rpToday(), 0); return [RPS.from || f, RPS.to || rpToday() || t]; }
  return monthRange(rpToday(), 0);
}

// ── 서버 역할: 권한 → 기간 → 회유 화면(offer_type 있음)만
function reportApi(session, q) {
  const all = RP_CENTERS.map((c) => c.id);
  const allowed = session.role === 'hq' ? (q.center && q.center !== 'all' && all.includes(q.center) ? [q.center] : all) : [session.center];
  const rows = [...RP_SEED, ...RPS.live].filter((r) => allowed.includes(r.c) && r.o && r.at.slice(0, 10) >= q.from && r.at.slice(0, 10) <= q.to)
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const out = { centers: allowed, rows, sum: rpSum(rows, q.today) };
  if (session.role === 'hq') out.byCenter = all.map((id) => ({ id, sum: rpSum(rows.filter((r) => r.c === id), q.today) }));
  return out;
}
const LOST = (r) => !r.ok && (r.res === 'reserved' || r.res === 'ended');
const isCpn = (r) => r.o === 'pt_coupon' || r.o === 'inbody_coupon';
function skipStage(r, today) { return r.later ? 'later' : today < r.nx ? 'before' : today < r.rs ? 'on' : 'back'; }
function rpSum(rows, today) {
  const acc = rows.filter((r) => r.ok), disc = acc.filter((r) => r.o === 'discount'), paid = disc.filter((r) => r.paid);
  const skip = acc.filter((r) => r.o === 'skip_payment'), cpn = acc.filter(isCpn), lost = rows.filter(LOST);
  const st = (k) => skip.filter((r) => skipStage(r, today) === k).length;
  return {
    shown: rows.length, acc: acc.length, keep: acc.filter((r) => r.o === 'keep_notice').length,
    disc: disc.length, discPaid: paid.length, discSum: paid.reduce((s, r) => s + r.amt, 0), discWait: disc.filter((r) => !r.paid && !r.later).length,
    skip: skip.length, skipBefore: st('before'), skipOn: st('on'), skipBack: st('back'), skipLater: st('later'),
    cpn: cpn.length, cpnPt: cpn.filter((r) => r.o === 'pt_coupon').length, cpnUsed: cpn.filter((r) => r.used).length,
    lost: lost.length, withdrawn: rows.filter((r) => !r.ok && r.res === 'withdrawn').length, abandoned: rows.filter((r) => !r.ok && r.res === 'abandoned').length,
    open: rows.filter((r) => !r.ok && !r.res).length,
  };
}

// ── 명단 한 줄의 글자
const OFFER_NM = { discount: '다음 결제 할인', skip_payment: '한 달 쉬어가기', pt_coupon: 'PT 1회 체험권', inbody_coupon: '인바디 측정권', keep_notice: '가격 유지 안내', etc_menu: '기타 제안' };
const offerText = (r) => (r.o === 'discount' ? `할인 ${won(r.amt)}` : OFFER_NM[r.o]);
const resultText = (r) => (r.ok ? (r.o === 'keep_notice' ? '계속 이용 선택' : `${offerText(r)} 받음`) : r.o === 'keep_notice' ? '가격 유지 안내만 봄' : `${offerText(r)} 안 받음`);
function rpStatus(r, today) {
  const ch = [];
  if (!r.ok) {
    if (r.res === 'reserved') ch.push(today < r.eff ? ['bad', `해지 예약 · ${md(r.eff)} 종료`] : ['bad', '해지 완료']);
    else if (r.res === 'ended') ch.push(['bad', '해지 완료']);
    else if (r.res === 'withdrawn') ch.push(['ok', '해지 철회 · 계속 이용']);
    else if (r.res === 'abandoned') ch.push(['ok', '해지 그만둠 · 계속 이용']);
    else ch.push(['mute', '진행 중']);
    return ch;
  }
  let sub = true;
  if (r.o === 'discount') ch.push(r.paid ? ['ok', `할인가 결제 완료 · ${md(r.paid)}`] : r.later ? ['mute', '할인 결제 전 해지'] : ['warn', `할인 결제 예정 · ${md(r.nx)}`]);
  if (r.o === 'skip_payment' && !r.later) {
    const s = skipStage(r, today);
    if (s === 'before') { ch.push(['warn', `쉬어가기 예정 · ${md(r.nx)}부터`]); sub = false; }
    else if (s === 'on') { ch.push(['warn', `쉬어가기 중 · ${md(addDays(r.rs, -1))}까지`]); sub = false; }
    else ch.push(['ok', '쉬어가기 후 복귀']);
  }
  if (isCpn(r)) ch.push(r.used ? ['ok', `체험권 사용 · ${md(r.used)}`] : today > r.exp ? ['mute', '체험권 미사용 · 기한 지남'] : ['warn', `체험권 미사용 · ${md(r.exp)}까지`]);
  if (r.later) ch.push(today < r.later.eff ? ['bad', `이후 해지 예약 · ${md(r.later.eff)} 종료`] : ['bad', '이후 해지']);
  else if (sub) ch.push(['ok', '계속 이용']);
  return ch;
}
const TABS = [['all', '전체'], ['disc', '할인가 결제'], ['skip', '한 달 쉬어가기'], ['cpn', '체험권'], ['lost', '결국 해지']];
const tabRows = (rows, tab) => tab === 'disc' ? rows.filter((r) => r.ok && r.o === 'discount') : tab === 'skip' ? rows.filter((r) => r.ok && r.o === 'skip_payment')
  : tab === 'cpn' ? rows.filter((r) => r.ok && isCpn(r)) : tab === 'lost' ? rows.filter(LOST) : rows;
const reasonText = (r) => RL[r.r] ? (r.r === 'etc' ? '기타' : RL[r.r]) : r.r;

// ── 화면
const rpPct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '–');
function rpCards(s) {
  const cpnTitle = s.cpn && s.cpnPt !== s.cpn ? '체험권 (PT·인바디)' : 'PT 1회 체험권';
  const card = (k, t, big, unit, sub, foot) => `<div class="rp-card" data-k="${k}"><div class="t">${t}</div><div class="big">${big}<span class="u">${unit}</span></div>`
    + `<div class="s">${sub}</div><div class="f">${foot}</div></div>`;
  return '<div class="rp-cards">'
    + card('disc', '할인가 결제', s.discPaid, '건', `할인 합계 <b>${won(s.discSum)}</b>`, `할인 받음 ${s.disc}건 · 결제 예정 ${s.discWait}건`)
    + card('skip', '한 달 쉬어가기', s.skip, '건', `쉬는 중 ${s.skipOn} · 예정 ${s.skipBefore}`, `복귀 ${s.skipBack}건 · 이후 해지 ${s.skipLater}건`)
    + card('cpn', cpnTitle, s.cpn, '건 발급', `사용 <b>${s.cpnUsed}건</b>`, `미사용 ${s.cpn - s.cpnUsed}건`)
    + card('lost', '결국 해지', s.lost, '건', '회유 화면을 보고도 해지', '해지 예약 + 해지 완료')
    + card('rate', '방어율', rpPct(s.acc, s.shown), '', `혜택 받음 <b>${s.acc}</b> ÷ 회유 화면 <b>${s.shown}</b>`, '혜택을 받고 계속 이용한 비율')
    + '</div>';
}
function rpBreak(s) {
  if (!s.shown) return '';
  const etc = [s.withdrawn && `철회 ${s.withdrawn}`, s.abandoned && `그만둠 ${s.abandoned}`, s.open && `진행 중 ${s.open}`].filter(Boolean).join(' · ');
  return `<div class="rp-break">회유 화면 <b>${s.shown}건</b> = 혜택 받음 <b>${s.acc}</b> (할인 ${s.disc} · 쉬어가기 ${s.skip} · 체험권 ${s.cpn} · 가격 유지 ${s.keep})`
    + ` + 결국 해지 <b>${s.lost}</b>${etc ? ` + 그 밖 <b>${s.shown - s.acc - s.lost}</b> (${etc})` : ''}</div>`;
}
function rpTable(rows, hq, today) {
  const head = `<tr>${hq ? '<th class="c-cn">센터</th>' : ''}<th class="c-nm">회원</th><th class="c-pr">멤버십</th><th class="c-of">회유 결과</th><th class="c-at">회유 화면 본 일시</th><th class="c-rs">해지 사유</th><th class="c-st">현재 상태</th></tr>`;
  const body = rows.map((r) => `<tr>${hq ? `<td class="c-cn" data-l="센터">${esc(rpCenter(r.c).n)}</td>` : ''}`
    + `<td class="c-nm" data-l="회원"><b>${esc(r.nm)}</b><span class="c-ph">${esc(rpPhone(r.ph))}</span></td>`
    + `<td class="c-pr" data-l="멤버십">${esc(r.pr)}</td>`
    + `<td class="c-of" data-l="회유 결과"><span class="${r.ok ? 'c-y' : 'c-n'}">${esc(resultText(r))}</span></td>`
    + `<td class="c-at" data-l="회유 화면 본 일시">${fmtAt(r.at)}</td>`
    + `<td class="c-rs" data-l="해지 사유">${esc(reasonText(r))}${r.rt ? `<span class="c-q">«${esc(r.rt)}»</span>` : ''}</td>`
    + `<td class="c-st" data-l="현재 상태">${rpStatus(r, today).map(([k, t]) => `<span class="rp-chip ${k}">${t}</span>`).join('')}</td></tr>`).join('');
  return `<table class="rp-tbl"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}
const EMPTY_TAB = { all: '이 기간에 회유 화면을 본 회원이 없어요.', disc: '이 기간에 할인 혜택을 받은 회원이 없어요.', skip: '이 기간에 쉬어가기를 받은 회원이 없어요.', cpn: '이 기간에 체험권을 받은 회원이 없어요.', lost: '이 기간에 회유 화면을 보고 해지한 회원이 없어요.' };
function rpEmpty(tab, shown) {
  return `<div class="rp-empty"><div class="ei">${rpIc(IC_CHART, '#B8B8C0', 28)}</div><div class="et">${EMPTY_TAB[tab]}</div>`
    + `<div class="es">${shown ? '다른 탭이나 기간을 골라 보세요.' : '회원이 해지 화면에서 이유를 고르고 회유 화면을 보면 여기에 쌓여요. 기간을 바꿔 보거나 «해지 회유 설정»에서 켜진 제안을 확인해 주세요.'}</div></div>`;
}
function rpHqTable(by) {
  const row = (id, s) => `<tr class="${RPS.center === id ? 'on' : ''}" data-act="rpCenter" data-v="${id}"><td class="n">${esc(rpCenter(id).n)}</td><td>${s.shown}</td><td>${s.discPaid} <span class="m">(${won(s.discSum)})</span></td><td>${s.skip}</td><td>${s.cpn} <span class="m">(사용 ${s.cpnUsed})</span></td><td>${s.lost}</td><td><b>${rpPct(s.acc, s.shown)}</b></td></tr>`;
  return '<div class="rp-hq"><div class="rp-st">센터별 보기 <span>줄을 누르면 그 센터만 봐요</span></div><table class="rp-ht"><thead><tr><th class="n">센터</th><th>회유 화면</th><th>할인가 결제</th><th>쉬어가기</th><th>체험권</th><th>결국 해지</th><th>방어율</th></tr></thead><tbody>'
    + by.map((b) => row(b.id, b.sum)).join('') + '</tbody></table></div>';
}
function rpQuery() { const [from, to] = rpRange(); return { from, to, today: rpToday(), center: RPS.center }; }
function reportScreen() {
  const ses = RP_SESSIONS[RPS.login], hq = ses.role === 'hq', q = rpQuery(), res = reportApi(ses, q);
  const rows = tabRows(res.rows, RPS.tab), s = res.sum;
  const cn = hq ? (RPS.center === 'all' ? '전체 센터' : rpCenter(RPS.center).n) : rpCenter(ses.center).n;
  const seg = [['this', '이번 달'], ['last', '지난 달'], ['custom', '직접 지정']].map(([v, t]) => `<span class="${RPS.period === v ? 'on' : ''}" data-act="rpPeriod" data-v="${v}">${t}</span>`).join('');
  const custom = RPS.period === 'custom' ? `<span class="rp-dt"><input type="date" id="rpf" value="${q.from}" max="${q.to}" aria-label="시작일"><i>~</i><input type="date" id="rpt" value="${q.to}" min="${q.from}" aria-label="종료일"></span>` : '';
  const csel = hq ? `<div class="sel rp-csel"><select id="rpc" aria-label="센터">${[['all', '전체 센터'], ...RP_CENTERS.map((c) => [c.id, c.n])].map(([v, t]) => `<option value="${v}"${RPS.center === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></div>` : '';
  const tools = `<div class="rp-tools"><div class="rp-seg">${seg}</div>${custom}${csel}<span class="rp-range">${q.from.replace(/-/g, '.')} ~ ${q.to.replace(/-/g, '.')}</span></div>`;
  const tabs = `<div class="rp-tabs">${TABS.map(([v, t]) => `<span class="${RPS.tab === v ? 'on' : ''}" data-act="rpTab" data-v="${v}">${t} <i>${tabRows(res.rows, v).length}</i></span>`).join('')}`
    + `<span class="b sec rp-csv${rows.length ? '' : ' dis'}" data-act="rpCsv" aria-disabled="${!rows.length}">${rpIc(IC_DL, 'currentColor', 16)}엑셀(CSV) 내려받기</span></div>`;
  const list = `<div class="rp-list">${tabs}${rows.length ? rpTable(rows, hq, q.today) : rpEmpty(RPS.tab, s.shown)}</div>`;
  const note = `<div class="rp-note">기간은 <b>회원이 해지 화면에서 회유 화면을 본 날(혜택 받은 날)</b> 기준이에요. 연락처는 회원 관리 화면과 같은 방식으로 가려서 보여요. ${hq ? '본사 계정은 모든 센터를 볼 수 있어요.' : '우리 센터 회원만 보여요.'}</div>`;
  const main = `<div class="content rp"><div class="ph"><div><h1>회유 성과</h1><div class="sub">구독 멤버십 · ${esc(cn)} · 로그인 ${esc(ses.who)}${hq ? ' (본사)' : ''}</div></div></div>`
    + tools + note + rpCards(s) + rpBreak(s) + (hq ? rpHqTable(res.byCenter) : '') + list + '</div>';
  return `<div class="app">${side('report')}<div class="main">${main}</div></div>`;
}

// ── CSV(엑셀에서 한글 깨지지 않게 BOM). 화면과 같은 결과·같은 연락처 가림
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"` : s; };
function rpCsvText() {
  const ses = RP_SESSIONS[RPS.login], q = rpQuery(), res = reportApi(ses, q), rows = tabRows(res.rows, RPS.tab);
  const head = ['센터', '회원 이름', '연락처', '멤버십', '회유 결과', '회유 화면 본 일시', '해지 사유', '사유 직접 입력', '현재 상태'];
  const lines = rows.map((r) => [rpCenter(r.c).n, r.nm, rpPhone(r.ph), r.pr, resultText(r), r.at, reasonText(r), r.rt || '', rpStatus(r, q.today).map((c) => c[1]).join(' · ')]);
  const cn = ses.role === 'hq' ? (RPS.center === 'all' ? '전체센터' : rpCenter(RPS.center).n) : rpCenter(ses.center).n;
  return { name: `회유성과_${cn.replace(/\s/g, '')}_${q.from}_${q.to}_${TABS.find((t) => t[0] === RPS.tab)[1].replace(/\s/g, '')}.csv`, text: '﻿' + [head, ...lines].map((l) => l.map(csvCell).join(',')).join('\r\n'), n: rows.length };
}
const RP_ADM = {
  nav(el) { S.ui.page = el.dataset.v; render(); },
  rpPeriod(el) { RPS.period = el.dataset.v; if (RPS.period === 'custom' && !RPS.from) { const [f] = monthRange(rpToday(), 0); RPS.from = f; RPS.to = rpToday(); } render(); },
  rpTab(el) { RPS.tab = el.dataset.v; render(); },
  rpCenter(el) { RPS.center = RPS.center === el.dataset.v ? 'all' : el.dataset.v; render(); },
  rpCsv() {
    const c = rpCsvText(); if (!c.n) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([c.text], { type: 'text/csv;charset=utf-8' })); a.download = c.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    S.log = `CSV 내려받기 ${c.n}건 — ${c.name}`; renderPanel();
  },
};
function bindReport() {
  const sd = $('#adm .side'), on = sd && sd.querySelector('.nav.on'); // 좁은 화면 가로 메뉴: 지금 메뉴가 보이게
  if (on && sd.scrollWidth > sd.clientWidth) sd.scrollLeft = on.offsetLeft - (sd.clientWidth - on.offsetWidth) / 2;
  $('#rpf')?.addEventListener('change', (e) => { if (e.target.value) { RPS.from = e.target.value; render(); } });
  $('#rpt')?.addEventListener('change', (e) => { if (e.target.value) { RPS.to = e.target.value; render(); } });
  $('#rpc')?.addEventListener('change', (e) => { RPS.center = e.target.value; render(); });
}
const RP_PANEL = {
  login(v) { RPS.login = v; RPS.center = 'all'; S.mode = 'admin'; S.ui.page = 'report'; S.log = `로그인 계정 → ${v === 'hq' ? '본사 관리자' : rpCenter(v).n + ' 관리자'}`; render(); },
};

// ── 회원 앱 흐름 → 기록(서버의 cancel_requests 저장과 같은 시점). 이 회원 = 엔짐 영등포점 m_1024
const LIVE = { c: 'c_ydp', mid: 'm_1024', ph: '010-2410-1024' };
function rpOnOffer(a, d, kind, cfg) {
  const row = { ...LIVE, id: `live_${++RPS.seq}`, live: true, run: RPS.run, pid: a.product_id, nm: d.uname, pr: d.product, r: a.reason, rt: a.reason_text || '', o: a.offer_type,
    amt: a.offer_type === 'discount' ? cfg.disc : undefined, ok: false, res: null, at: RPS.clock };
  RPS.live.push(row); a.rp = row;
}
function rpOnAccept(a) {
  const r = a && a.rp; if (!r) return;
  r.ok = true; r.res = 'kept';
  if (r.o === 'discount' || r.o === 'skip_payment') { r.nx = '2026-11-15'; if (r.o === 'skip_payment') r.rs = '2026-12-15'; }
  if (isCpn(r)) r.exp = addDays(rpToday(), 30);
}
function rpOnReserve(a) {
  if (a && a.rp && !a.rp.res) { a.rp.res = 'reserved'; a.rp.eff = '2026-11-15'; }
  // 혜택을 받았던 회원이 같은 상품을 다시 해지 → 그 혜택 줄은 «이후 해지»(조작판 «처음부터» 전 기록은 다른 시험이라 제외)
  a.rpLater = RPS.live.filter((r) => r.ok && r.run === RPS.run && r.pid === a.product_id && !r.later);
  a.rpLater.forEach((r) => { r.later = { at: RPS.clock, eff: '2026-11-15' }; });
}
function rpOnWithdraw(a) {
  if (!a) return;
  if (a.rp && a.rp.res === 'reserved') a.rp.res = 'withdrawn';
  (a.rpLater || []).forEach((r) => { delete r.later; });
}
function rpOnPay(sub, pid, a) {
  const day = '2026-11-15';
  if (sub.discountPending) RPS.live.filter((r) => r.ok && r.o === 'discount' && r.pid === pid && !r.paid).forEach((r) => { r.paid = day; });
  if (sub.status === 'reserved' && a && a.rp && a.rp.res === 'reserved') a.rp.res = 'ended';
  RPS.clock = `${day} 10:00`;
}
function rpReset() { RPS.clock = RP_CLOCK0; RPS.run++; }
