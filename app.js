// 니짐내짐 «해지예약 회유» B안 프로토타입 — 상태·이동·조작판. 더미 데이터, 서버 없음(새로고침하면 처음으로).
'use strict';
const qs = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const SAVED0 = '마지막 저장 10월 23일 14:02 (관리자 박지훈)';
const PRESETS = {
  b1: { price_on: true, discRaw: '10,000', skip_on: false, move_on: true, nBr: 24, eff_on: true, eff_kind: 'pt', keep_on: true },
  all: { price_on: true, discRaw: '10,000', skip_on: true, move_on: true, nBr: 24, eff_on: true, eff_kind: 'pt', keep_on: true },
  inbody: { price_on: true, discRaw: '10,000', skip_on: true, move_on: true, nBr: 24, eff_on: true, eff_kind: 'inbody', keep_on: true },
  off: { price_on: false, discRaw: '10,000', skip_on: false, move_on: false, nBr: 0, eff_on: false, eff_kind: 'pt', keep_on: false },
};
const S = {
  mode: 'app', data: 'base', visits0: false, feature: true,
  preset: 'b1', cfg: null, draft: null, ui: { page: 'settings', pvI: 0, savedAt: SAVED0, tab: 'center', open: null, pvP: 'p_pt', brq: '', brf: '', brBad: false, editI: null, editV: null },
  screen: 'A0', reason: null, etc: '', kind: null, scrollTop: 0, toast: true,
  sub: null, subs: null, member: null, attempts: [], log: '',
  subsN: 1, cur: 'p_health', // 구독 상품 1개(헬스) / 2개(헬스 + PT 패키지), 지금 보는 상품
};
// two/zero: 기타 서비스 2개·0개(시안 X_A0_기타서비스2개·0개와 같은 값, 캡처 전용)
const TWO = { ...BASE, others: [...BASE.others, { name: '운동복 대여', period: '2026.10.15 ~ 2026.11.14', extra: null, fee: 10000, due: true }] }, ZERO = { ...BASE, others: [] };
const DB = () => { const d = S.data === 'stress' ? STRESS : S.data === 'long' ? LONGNAME : S.data === 'two' ? TWO : S.data === 'zero' ? ZERO : BASE; return S.visits0 ? { ...d, visits: 0 } : d; };
const D = () => prodData(DB(), S.cur); // 지금 보는 구독 상품 기준 회원 화면 값
const OTHER = { p_health: 'p_pt', p_pt: 'p_health' };
const peekD = () => S.subsN === 2 ? { ...prodData(DB(), OTHER[S.cur]), days_left: OTHER[S.cur] === 'p_pt' ? 22 : DB().days_left } : null;
const discNum = (raw) => Number(String(raw).replace(/[^0-9]/g, '') || 0);
// 기본 등록 지점: 3곳 = 서울·경기·부산 1곳씩, 24곳 = 서울 10·경기 7·인천 2·부산 3·대구 1·대전 1, 그 밖 = 앞에서부터
const DEF3 = ['엔짐 강남역점', '엔짐 판교점', '엔짐 해운대점'];
const DEF24 = [...DEF3, '엔짐 잠실점', '엔짐 성수점', '엔짐 답십리점', '엔짐 노원점', '엔짐 광화문점', '엔짐 홍대점', '엔짐 여의도점', '엔짐 목동점', '엔짐 신림점', '엔짐 사당점',
  '엔짐 수원역점', '엔짐 광교점', '엔짐 동탄점', '엔짐 일산점', '엔짐 의정부점', '엔짐 하남점', '엔짐 부평점', '엔짐 송도점', '엔짐 부산서면점', '엔짐 센텀점', '엔짐 대구동성로점', '엔짐 대전둔산점'];
function pickBr(d, n) {
  const long = d.branchPool.filter((b) => b[0].length > 20); // «긴 값» 데이터의 긴 지점명은 늘 맨 앞에
  const names = n === 3 ? DEF3 : n === 24 ? DEF24 : null;
  const rest = names ? names.map((x) => d.branchPool.find((b) => b[0] === x)).filter(Boolean) : d.branchPool.filter((b) => b[0].length <= 20);
  return [...long, ...rest].slice(0, n).map((b) => [...b]);
}
function mkCfg(p) {
  const d = DB();
  const c = { ...PRESETS[p], branches: pickBr(d, PRESETS[p].nBr) };
  delete c.nBr; c.disc = discNum(c.discRaw);
  c.own = Object.fromEntries(Object.entries(ownDefaults(d)).map(([k, o]) => [k, { ...o, discRaw: o.disc ? o.disc.toLocaleString('ko-KR') : '' }]));
  return c;
}
const clone = (c) => ({ ...c, branches: c.branches.map((b) => [...b]), own: Object.fromEntries(Object.entries(c.own).map(([k, o]) => [k, o && { ...o }])) });
// 회원이 지금 보는 상품에 실제로 적용되는 설정(센터 기본 + 그 상품 따로 설정 덮어쓰기)
const curCfg = () => effCfg(S.cfg, S.cfg.own[S.cur]);
const seenNow = () => S.member.seen[S.cur] || null;
const newSub = () => ({ status: 'active', discountPending: 0, skipPending: false, couponIssued: null });
// 회원 ID + 상품 ID마다 1번 — seen[상품 ID] = {at, type}. 한 번 보면 남고, 해지 철회·재진입·재가입해도 지워지지 않는다(조작판 «처음부터»만 지움).
// 다른 상품(구독 2개 회원의 두 번째 상품)은 따로 센다.
const newMember = () => ({ seen: {} });
const newMove = () => ({ place: '', near: [], busy: false, result: null });
const useSub = (pid) => { S.cur = pid; S.sub = S.subs[pid]; };
function reset() { rpReset(); S.subs = { p_health: newSub(), p_pt: newSub() }; useSub(S.subsN === 2 ? S.cur : 'p_health'); S.member = newMember(); S.attempts = []; S.move = newMove(); S.screen = 'A0'; S.scrollTop = 0; S.reason = null; S.etc = ''; S.kind = null; S.log = ''; }
const OFFER_TYPE = { price: 'discount', skip_off: 'discount', skip: 'skip_payment', pt: 'pt_coupon', inbody: 'inbody_coupon', keep: 'keep_notice' };
const cur = () => S.attempts[S.attempts.length - 1];
// 이사 사유: 주소 검색으로 찾은 가까운 지점(S.move.near). 센터 설정이 켜져 있고 위치가 저장된 지점이 1곳 이상일 때만 검색 단계를 보여 준다.
const moveOK = () => { const c = curCfg(); return c.move_on && c.branches.some(hasPt); };
const isMove = () => { const a = cur(); return !!(a && a.reason === 'move'); };
// ───────── 주소 → 위치(위도·경도) ─────────
// 시험판은 키가 필요 없는 OpenStreetMap Nominatim(1초에 1번 이하)을 쓴다. 실서비스는 서버에서 카카오 로컬 «주소로 좌표 변환» API 권장(README_SPEC 18-5).
const SIDO_FULL = { 서울: '서울특별시', 부산: '부산광역시', 대구: '대구광역시', 인천: '인천광역시', 광주: '광주광역시', 대전: '대전광역시', 울산: '울산광역시', 세종: '세종특별자치시', 경기: '경기도', 강원: '강원특별자치도', 충북: '충청북도', 충남: '충청남도', 전북: '전북특별자치도', 전남: '전라남도', 경북: '경상북도', 경남: '경상남도', 제주: '제주특별자치도' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function nomi(q) {
  const key = 'geo:' + q, hit = sessionStorage.getItem(key);
  if (hit) return JSON.parse(hit);
  if (qs.get('geo') === 'off') return null; // 검사용: 위치 변환 실패 흉내
  const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&countrycodes=kr&limit=1&accept-language=ko&q=' + encodeURIComponent(q));
  const j = await r.json(); const pt = j[0] ? [Number(j[0].lat), Number(j[0].lon)] : null;
  sessionStorage.setItem(key, JSON.stringify(pt)); return pt;
}
async function geocodeTries(tries) {
  for (let i = 0; i < tries.length; i++) {
    if (i) await sleep(1100);
    const pt = await nomi(tries[i]).catch(() => null);
    if (pt) return { pt, q: tries[i] };
  }
  return null;
}
const fullSido = (a) => { const [h, ...t] = a.split(' '); return SIDO_FULL[h] ? [SIDO_FULL[h], ...t].join(' ') : null; };
// 관리자 주소 저장: 정확한 주소로만(동네 단위로 대충 맞추지 않음) — 실패하면 «주소를 확인해 주세요»
const geocodeAdmin = (addr) => geocodeTries([...new Set([addr, fullSido(addr), addr.split(',')[0].trim()].filter(Boolean))]);
// 회원 이사 주소: 도로명 → 도로 → 지번 → 동 → 시군구 순으로 넓혀 가며 찾기(이사 갈 동네 근처면 충분)
const geocodeMove = (dt) => { const sf = SIDO_FULL[dt.sido] || dt.sido; return geocodeTries([...new Set([dt.roadAddress, dt.roadname && `${sf} ${dt.sigungu} ${dt.roadname}`, dt.jibunAddress, dt.bname && `${sf} ${dt.sigungu} ${dt.bname}`, `${sf} ${dt.sigungu}`].filter(Boolean))]); };

// ───────── 렌더 ─────────
function render() {
  document.body.classList.toggle('mode-app', S.mode === 'app');
  document.body.classList.toggle('mode-admin', S.mode === 'admin');
  document.body.classList.toggle('page-report', S.mode === 'admin' && S.ui.page === 'report');
  const d = D(), c = curCfg(), pk = peekD();
  let h;
  switch (S.screen) {
    case 'A0': h = A0(d, LONG, pk); break;
    case 'A1': h = A1(d, S.reason, S.etc, S.reason && !resolveOffer(S.reason, c, S.sub, seenNow())); break;
    case 'A2': h = A2(d, S.kind, S.reason, c, S.etc.trim()); break;
    case 'A3': h = A3(d, S.kind, c); break;
    case 'A4': h = A4(d, S.move.near, S.move.place, isMove()); break;
    case 'A4s': h = A4s(d, S.move.busy); break;
    case 'A5': h = A5(d, LONG, pk); break;
    case 'A6': h = A6(d, pk); break;
    case 'K1': h = K1(d); break;
    case 'K2': h = K2(d, S.k2); break;
  }
  const app = $('#app'); app.innerHTML = h;
  app.classList.toggle('long', LONG && (S.screen === 'A0' || S.screen === 'A5'));
  app.dataset.screen = S.screen; app.dataset.kind = S.kind || '';
  const sc = app.querySelector('.scr');
  // 흐름에서 돌아오면 «이용중인 서비스»가 보이게(시안 A6와 같은 위치), 처음 열 때는 맨 위(실제 앱 그대로)
  if (sc) sc.scrollTop = /^A[056]$/.test(S.screen) && (S.screen !== 'A0' || S.scrollTop === 'svc') ? $('#svc').offsetTop - 20 : 0;
  const ta = $('#etc');
  if (ta) { autosize(ta); ta.addEventListener('input', () => { S.etc = ta.value; $('#etcn').textContent = [...ta.value].length; autosize(ta); }); }
  if (S.screen === 'A6' && !S.toast) app.querySelector('.toast')?.classList.add('gone');
  renderAdmin(); renderPanel();
}
function autosize(t) { t.style.height = 'auto'; t.style.height = Math.max(20, t.scrollHeight) + 'px'; }
function renderAdmin() {
  const adm = $('#adm'), d = DB();
  adm.classList.toggle('rp', S.ui.page === 'report');
  if (S.ui.page === 'report') { adm.innerHTML = reportScreen(); bindReport(); return; }
  const ae = document.activeElement, fid = ae && ae.tagName === 'INPUT' && adm.contains(ae) ? ae.id : null, fpos = fid ? ae.selectionStart : null;
  const bl = $('#blist'), blTop = bl ? bl.scrollTop : 0;
  adm.innerHTML = adminScreen(d, S.draft, S.ui);
  if ($('#blist')) $('#blist').scrollTop = blTop;
  $('#brq')?.addEventListener('input', (ev) => { S.ui.brq = ev.target.value; renderAdmin(); });
  $('#brf')?.addEventListener('input', (ev) => { S.ui.brf = ev.target.value; renderAdmin(); });
  $('#bre')?.addEventListener('input', (ev) => { S.ui.editV = ev.target.value; });
  $('#bre')?.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ADM.brEditSave(); if (ev.key === 'Escape') ADM.brEditCancel(); });
  // 할인 칸에 오류가 있으면 미리보기는 마지막 저장값으로 보여준다(0원·초과 금액 화면을 만들지 않음)
  const e = adminErrors(d, S.draft);
  const center = e.disc ? { ...S.draft, disc: S.cfg.disc, discRaw: S.cfg.discRaw } : S.draft;
  if (S.ui.tab === 'prod') {
    const pid = S.ui.pvP, o = S.draft.own[pid];
    const own = e.own[pid] ? (S.cfg.own[pid] || null) : o;
    $('#pvf').srcdoc = previewHTML(prodData(d, pid), effCfg(center, own), S.ui.pvI);
  } else $('#pvf').srcdoc = previewHTML(d, center, S.ui.pvI);
  $('#disc')?.addEventListener('input', onDisc);
  adm.querySelectorAll('.odisc').forEach((i) => i.addEventListener('input', onOwnDisc));
  $('#pvsel')?.addEventListener('change', (ev) => { S.ui.pvP = ev.target.value; renderAdmin(); });
  const fi = fid && document.getElementById(fid);
  if (fi) { fi.focus(); const p = Math.min(fpos, fi.value.length); fi.setSelectionRange(p, p); }
}
function onOwnDisc(e) {
  const o = S.draft.own[e.target.dataset.p];
  const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
  o.discRaw = digits ? Number(digits).toLocaleString('ko-KR') : ''; o.disc = discNum(o.discRaw);
  renderAdmin();
}
function onDisc(e) {
  const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
  S.draft.discRaw = digits ? Number(digits).toLocaleString('ko-KR') : '';
  S.draft.disc = discNum(S.draft.discRaw);
  renderAdmin();
}
function stateText() {
  const s = S.sub, d = D(), a = cur(), seen = seenNow();
  const next = s.status === 'reserved' ? `없음 (${d.next_md} 해지)` : s.skipPending ? `${d.next_md} 건너뜀 → ${d.resume} ${won(d.price)}` : `${d.next_md} ${won(d.price - s.discountPending)}`;
  const lines = [
    `— 보는 구독: ${S.cur}${S.cfg.own[S.cur] ? ' (따로 설정)' : ' (센터 기본)'} · 구독 ${S.subsN}개 —`,
    `subscription.status        = ${s.status}`,
    `cancel_effective_date      = ${s.status === 'reserved' ? '2026-11-15' : 'null'}`,
    `next_charge                = ${next}`,
    `pending_discount_amount    = ${s.discountPending}`,
    `skip_next_payment          = ${s.skipPending}`,
    `issued_coupon              = ${s.couponIssued || 'null'}`,
    '— cancel_offer_views (회원 ID + 상품 ID마다 1번) —',
    ...(Object.keys(S.member.seen).length ? Object.entries(S.member.seen).map(([pid, v]) => `m_1024 + ${pid.padEnd(9)} = ${v.at.slice(5, 16)} ${v.type}`) : ['(기록 없음)']),
    `→ 지금 상품(${S.cur}) 제안 ${seen ? '이미 봄 → 안 보임' : '아직 안 봄 → 보일 수 있음'}`,
  ];
  if (a) lines.push('— 마지막 cancel_request —',
    `reason_code   = ${a.reason}${a.reason_text ? ` («${a.reason_text.slice(0, 20)}${a.reason_text.length > 20 ? '…' : ''}»)` : ''}`,
    `offer_type    = ${a.offer_type || (a.offer_skipped ? `null (${a.offer_skipped})` : 'null')}`, `offer_accepted= ${a.offer_accepted}`, `result        = ${a.result || '(진행 중)'}`,
    `withdrawn_via = ${a.withdrawn_via || 'null'}`, ...(a.reason === 'move' ? [`move_search   = ${S.move.result || '(검색 전)'} · 이사 주소는 저장 안 함`] : []),
    ...(a.info_branches ? [`info_branches = ${a.info_branches.join(', ')} (정보 안내만)`] : []));
  return lines.join('\n');
}
function renderPanel() {
  const set = (sel, v) => document.querySelectorAll(`${sel} button`).forEach((b) => b.classList.toggle('on', b.dataset.v === String(v)));
  set('#p-mode', S.mode === 'admin' && S.ui.page === 'report' ? 'report' : S.mode); set('#p-login', RPS.login); set('#p-data', S.data); set('#p-seen', seenNow() ? '1' : '0'); set('#p-subs', S.subsN); set('#p-cur', S.subsN === 2 ? S.cur : ''); set('#p-vis', S.visits0 ? '0' : '12'); set('#p-feat', S.feature ? '1' : '0');
  set('#p-preset', S.preset); set('#p-nbr', S.cfg.branches.length);
  set('#p-reason', S.screen === 'A2' || S.screen === 'A1' ? S.reason : '');
  $('#p-state').textContent = stateText();
  $('#p-log').textContent = S.log;
}

// ───────── 회원 앱 동작 ─────────
const go = (screen) => { S.screen = screen; render(); };
const ACT = {
  startCancel() {
    if (S.sub.status === 'reserved') return go('A5'); // 이미 해지예약된 회원: 다시 해지 흐름에 들어가지 않고 상태 화면으로
    if (S.sub.status === 'ended') { S.log = '이미 종료된 구독이에요(현행 만료 화면).'; return render(); }
    if (!S.feature) { S.log = '기능 꺼짐 → 지금 앱의 해지 동작 그대로 실행(이 프로토타입엔 그 화면이 없어요).'; return render(); }
    S.reason = null; S.etc = ''; S.kind = null; S.log = ''; go('A1');
  },
  back() { if (S.screen === 'A2') return go('A1'); S.scrollTop = 'svc'; go('A0'); },
  reason(el) { S.reason = el.dataset.r; render(); if (S.reason === 'etc') $('#etc')?.focus(); },
  next() {
    S.kind = resolveOffer(S.reason, curCfg(), S.sub, seenNow());
    if (!S.kind) return ACT.reserve();
    S.attempts.push({ product_id: S.cur, reason: S.reason, reason_text: S.reason === 'etc' ? S.etc.trim() : '', offer_type: OFFER_TYPE[S.kind], offer_accepted: false, result: null, withdrawn_via: null });
    // 화면을 띄우는 순간 기록(수락 여부·뒤로가기와 무관) — «이 화면을 닫으면 다시 받을 수 없어요»
    if (!seenNow()) S.member.seen[S.cur] = { at: '2026-10-23T14:30:00+09:00', type: OFFER_TYPE[S.kind] };
    rpOnOffer(cur(), D(), S.kind, curCfg());
    go('A2');
  },
  reserve() {
    const skipped = S.screen === 'A1' && seenNow();
    if (S.screen === 'A1') S.attempts.push({ product_id: S.cur, reason: S.reason, reason_text: S.reason === 'etc' ? S.etc.trim() : '', offer_type: null, offer_skipped: skipped ? 'already_seen' : null, offer_accepted: false, result: null, withdrawn_via: null });
    if (S.sub.status !== 'reserved') { S.sub.status = 'reserved'; cur().result = 'reserved'; rpOnReserve(cur()); }
    S.move = newMove();
    // 해지 예약을 먼저 저장하고 나서 주소 검색 → 회원이 건너뛰거나 앱을 꺼도 해지는 이미 끝난 상태
    const step = isMove() && moveOK();
    if (isMove() && !step) S.move.result = 'no_branches';
    S.log = (skipped ? '이 상품에서 이미 제안을 본 회원 → 제안 없이 바로 해지예약. ' : '') + '해지예약 저장. 다음 결제일(11/15)에 결제하지 않고 종료돼요.'
      + (step ? ' 이사 → 이사 갈 곳 주소 검색 단계(건너뛰어도 해지 예약 그대로).' : isMove() ? ' 이사 → 추천할 지점이 없어 해지 완료 안내만.' : '');
    go(step ? 'A4s' : 'A4');
  },
  accept() {
    const k = S.kind, a = cur();
    if (k === 'price' || k === 'skip_off') S.sub.discountPending = curCfg().disc;
    if (k === 'skip') S.sub.skipPending = true;
    if (k === 'pt' || k === 'inbody') S.sub.couponIssued = k === 'pt' ? 'PT 1회 체험권(30일)' : '인바디 측정권(30일)';
    a.offer_accepted = true; a.result = 'kept'; rpOnAccept(a);
    S.log = { price: '다음 결제 1회 할인 예약', skip_off: '다음 결제 1회 할인 예약', skip: '다음 결제 1회 건너뛰기 예약', pt: '쿠폰함에 체험권 발급', inbody: '쿠폰함에 측정권 발급', keep: '구독 그대로' }[k];
    go('A3');
  },
  switchSub() { if (S.subsN !== 2) return; useSub(OTHER[S.cur]); S.scrollTop = 0; S.log = `보는 구독 → ${D().product}`; go(S.sub.status === 'reserved' ? 'A5' : 'A0'); },
  toMembership() { S.scrollTop = 'svc'; go(S.sub.status === 'reserved' ? 'A5' : 'A0'); },
  withdraw(via = 'app') {
    if (S.sub.status !== 'reserved') { S.log = '이미 철회됐어요 — 변화 없음(두 번 눌러도 안전).'; S.scrollTop = 'svc'; return go('A0'); }
    S.sub.status = 'active'; const a = cur(); if (a) { a.result = 'withdrawn'; a.withdrawn_via = via; } rpOnWithdraw(a);
    S.toast = true; S.log = via === 'alimtalk' ? '알림톡 링크 → 앱 로그인 확인 후 철회(링크를 연 것만으로는 철회 안 됨).' : '해지예약 철회. 다음 결제 그대로.';
    go('A6'); setTimeout(() => { if (S.screen === 'A6' && !qs.get('shot')) { S.toast = false; $('.toast')?.classList.add('gone'); } }, 3500);
  },
  otherCancel(el) { S.log = `기타 서비스(${D().others[el.dataset.i].name}) [구독해지] → 지금 앱 동작 그대로(회유 흐름 없음, 이 프로토타입엔 그 화면이 없어요).`; render(); },
  otherWithdraw(el) { S.log = `기타 서비스(${D().others[el.dataset.i].name}) [구독해지 철회] → 지금 앱 동작 그대로.`; render(); },
  viewBranch(el) { S.log = `[지점 보기] ${S.move.near[el.dataset.i].n} 센터 상세로 이동(해지 예약은 그대로 reserved, 상태 변화 없음).`; render(); },
  skipMove() { S.move = { ...newMove(), result: 'skipped' }; S.log = '주소 검색 건너뜀 → 해지 완료 안내만(해지 예약 그대로).'; go('A4'); },
  reSearch() { S.move.busy = false; go('A4s'); },
  openSearch() {
    if (S.move.busy || $('#pcl')) return;
    $('#app').insertAdjacentHTML('beforeend', PCL);
    loadPostcode().then(() => {
      if (!$('#pcw')) return;
      new window.daum.Postcode({ width: '100%', height: '100%', maxSuggestItems: 5, oncomplete: (dt) => ACT.pickAddr(dt) }).embed($('#pcw'), { autoClose: false });
    }).catch(() => { $('#pcw').innerHTML = '<div class="pcerr">주소 검색을 불러오지 못했어요. 닫고 [건너뛰기]를 눌러도 해지 예약은 그대로예요.</div>'; });
  },
  closeSearch() { $('#pcl')?.remove(); },
  // 카카오 우편번호 서비스에서 주소를 고르면 → 위치로 바꾸고 → 등록 지점 중 가까운 순 5곳
  async pickAddr(dt) {
    ACT.closeSearch();
    const place = dt.roadAddress || dt.jibunAddress || dt.address;
    S.move.busy = true; S.log = `주소 고름: ${place} → 위치 찾는 중…`; render();
    const g = await geocodeMove(dt);
    ACT.setMovePt(place, g && g.pt, g && g.q);
  },
  setMovePt(place, pt, q) {
    const near = pt ? nearest(curCfg().branches, pt) : [];
    S.move = { ...newMove(), place, pt, near, result: !pt ? 'geocode_failed' : near.length ? `found ${near.length}` : 'none_within_limit' };
    if (near.length) cur().info_branches = near.map((b) => b.n); else delete cur().info_branches;
    S.log = !pt ? `«${place}» 위치를 찾지 못함 → 추천 없이 해지 완료 안내만.` : !near.length ? `«${place}» → 직선거리 ${MOVE_MAX_KM}km 안 등록 지점 0곳 → 지점 칸 없이 해지 완료 안내만.` : `«${place}»${q && q !== place ? ` (위치 기준: ${q})` : ''} → 가까운 ${near.length}곳: ${near.map((b) => `${b.n} ${fmtKm(b.km)}`).join(' · ')}`;
    if (S.screen === 'A4s' || S.screen === 'A4') go('A4'); else render();
  },
  hideToast() { S.toast = false; $('.toast')?.classList.add('gone'); },
  kakaoWithdraw() { S.k2 = { reserved: 'ask', ended: 'ended' }[S.sub.status] || 'done'; S.log = S.k2 === 'ended' ? '해지예정일이 지난 뒤 연 링크 → «이미 종료된 구독이에요» 안내만(구매·결제 화면으로 보내지 않음).' : '알림톡 [구독해지 철회하기] → 앱 로그인 확인 → 철회 페이지(결제 기능 없음). 링크를 연 것만으로는 철회 안 됨.'; go('K2'); },
  kakaoConfirm() {
    if (S.sub.status !== 'reserved') { S.k2 = S.sub.status === 'ended' ? 'ended' : 'done'; S.log = '이미 철회됐어요 — 변화 없음(두 번 눌러도 안전).'; return render(); }
    S.sub.status = 'active'; const a = cur(); if (a) { a.result = 'withdrawn'; a.withdrawn_via = 'alimtalk'; } rpOnWithdraw(a);
    S.k2 = 'done'; S.log = '알림톡 철회 페이지에서 철회. 다음 결제 그대로(이 페이지엔 결제·금액 표시 없음).'; render();
  },
  kakaoView() { S.scrollTop = 'svc'; go(S.sub.status === 'reserved' ? 'A5' : 'A0'); },
};

// ───────── 관리자 동작 ─────────
function addBranches(list) {
  const room = BR_MAX - S.draft.branches.length, add = list.slice(0, Math.max(0, room)).map((b) => [...b]);
  S.draft.branches.push(...add); S.ui.brq = ''; renderAdmin();
  add.filter((b) => !hasPt(b)).forEach(async (b) => { b[4] = 'checking'; renderAdmin(); const g = await geocodeAdmin(b[1]); b[2] = g ? g.pt[0] : null; b[3] = g ? g.pt[1] : null; b.length = 4; renderAdmin(); });
}
function setNbr(n) {
  for (const c of [S.cfg, S.draft]) { c.branches = pickBr(DB(), n); if (n) c.move_on = true; }
}
const ADM = {
  sw(el) { const k = el.dataset.k; S.draft[k] = !S.draft[k]; if (k === 'move_on' && S.draft.move_on && !S.draft.branches.length) S.draft.branches = D().branchPool.slice(0, 1); renderAdmin(); },
  eff(el) { S.draft.eff_kind = el.dataset.v; renderAdmin(); },
  brDel(el) { S.draft.branches.splice(Number(el.dataset.i), 1); S.ui.editI = null; renderAdmin(); },
  // 니짐내짐 센터 검색으로 추가 — 센터 주소는 등록 때 이미 위치로 바뀌어 있다(위치가 없는 센터면 추가하면서 변환)
  brAddOne(el) { addBranches(D().branchPool.filter((b) => b[0] === el.dataset.k)); },
  brAddAll() { const q = S.ui.brq.trim(), have = new Set(S.draft.branches.map((b) => b[0])); addBranches(D().branchPool.filter((b) => !have.has(b[0]) && (b[0].includes(q) || b[1].includes(q)))); },
  brEdit(el) { S.ui.editI = Number(el.dataset.i); S.ui.editV = null; renderAdmin(); $('#bre')?.focus(); },
  brBad() { S.ui.brBad = !S.ui.brBad; renderAdmin(); },
  brEditCancel() { S.ui.editI = null; renderAdmin(); },
  async brEditSave() {
    const i = S.ui.editI, b = S.draft.branches[i], v = (S.ui.editV ?? b[1]).trim();
    if (!v) return;
    S.ui.editI = null; b[1] = v; b[2] = b[3] = null; b[4] = 'checking'; renderAdmin();
    const g = await geocodeAdmin(v);
    if (S.draft.branches[i] !== b) return;
    b[2] = g ? Number(g.pt[0].toFixed(6)) : null; b[3] = g ? Number(g.pt[1].toFixed(6)) : null; b.length = 4;
    if (!S.draft.branches.some((x) => !hasPt(x))) S.ui.brBad = false;
    S.ui.savedAt = g ? `${b[0]} 주소를 위치로 바꿔 저장했어요` : `${b[0]}: 주소를 확인해 주세요(위치로 바꾸지 못함 · 추천에서 빠져요)`; renderAdmin();
  },
  pv(el) { S.ui.pvI = Number(el.dataset.i); renderAdmin(); },
  tab(el) { S.ui.tab = el.dataset.v; renderAdmin(); },
  // «이 상품만 따로 설정» 켜기 = 지금 센터 기본 값을 복사해 편집칸 열기, 끄기 = 넣은 값 지우고 센터 기본으로
  psw(el) {
    const pid = el.dataset.p, c = S.draft;
    if (c.own[pid]) { c.own[pid] = null; if (S.ui.open === pid) S.ui.open = null; }
    else { c.own[pid] = { price_on: c.price_on, disc: c.disc, discRaw: c.discRaw, skip_on: c.skip_on }; S.ui.open = pid; S.ui.pvP = pid; }
    renderAdmin();
  },
  popen(el) { const pid = el.dataset.p; S.ui.open = S.ui.open === pid ? null : pid; if (S.ui.open) S.ui.pvP = pid; renderAdmin(); },
  osw(el) {
    const o = S.draft.own[el.dataset.p], k = el.dataset.k; o[k] = !o[k];
    if (k === 'price_on' && o.price_on && !o.disc) { o.discRaw = S.draft.discRaw; o.disc = S.draft.disc; }
    renderAdmin();
  },
  revert() { S.draft = clone(S.cfg); renderAdmin(); },
  save() {
    if (adminErrors(DB(), S.draft).n) return;
    S.cfg = clone(S.draft); S.preset = ''; S.ui.savedAt = '방금 저장됨 (관리자 박지훈) · 회원 화면에 바로 반영'; render();
  },
};

// ───────── 조작판 ─────────
const PANEL = {
  mode(v) { if (v === 'report') { S.mode = 'admin'; S.ui.page = 'report'; } else { S.mode = v; if (v === 'admin') S.ui.page = 'settings'; } render(); },
  data(v) { S.data = v; S.cfg = mkCfg(S.preset || 'b1'); S.draft = clone(S.cfg); render(); },
  vis(v) { S.visits0 = v === '0'; render(); },
  seen(v) {
    if (v === '1') S.member.seen[S.cur] = { at: '2026-09-02T21:10:00+09:00', type: 'discount' }; else delete S.member.seen[S.cur];
    S.log = v === '1' ? `이 상품(${D().product})에서 제안을 이미 본 회원으로 설정(9/2 할인 제안) → 이 상품은 이유를 골라도 제안 없이 해지 예약.` : `이 상품(${D().product}) 제안 본 기록 지움.`; render();
  },
  subs(v) { S.subsN = Number(v); if (S.subsN === 1) useSub('p_health'); S.mode = 'app'; S.scrollTop = 0; S.screen = S.sub.status === 'reserved' ? 'A5' : 'A0'; S.log = S.subsN === 2 ? '구독 2개 회원 — 위 카드(오른쪽)를 누르거나 아래 «보는 구독»으로 바꿔요.' : ''; render(); },
  cur(v) { if (S.subsN !== 2) S.subsN = 2; useSub(v); S.mode = 'app'; S.scrollTop = 0; S.screen = S.sub.status === 'reserved' ? 'A5' : 'A0'; S.log = `보는 구독 → ${D().product}`; render(); },
  feat(v) { S.feature = v === '1'; S.log = S.feature ? '' : '기능 꺼짐: [구독해지]를 누르면 지금 앱 동작 그대로(회유 화면 없음).'; render(); },
  preset(v) { S.preset = v; S.cfg = mkCfg(v); S.draft = clone(S.cfg); S.ui.savedAt = SAVED0; render(); },
  nbr(v) { setNbr(Number(v)); S.log = `이사 추천 지점 ${v}곳 등록(센터 기본 · 저장된 값)`; if (S.mode === 'app' && (S.screen === 'A4s' || (S.screen === 'A4' && isMove()))) return PANEL.reason('move'); render(); },
  reason(v) {
    if (S.sub.status !== 'active') { S.subs[S.cur] = newSub(); useSub(S.cur); }
    S.mode = 'app'; S.screen = 'A1'; S.reason = v; S.etc = v === 'etc' ? D().etc_text : '';
    S.log = seenNow() ? '이 상품에서 이미 제안을 본 회원이라 제안 화면이 뜨지 않아요(조작판 «제안 본 기록 → 없음»으로 지우면 다시 보여요).' : '';
    if (resolveOffer(v, curCfg(), S.sub, seenNow())) ACT.next(); else render();
  },
  time(v) {
    const d = D(), s = S.sub;
    if (v === 'reset') { reset(); return render(); }
    if (v === 'k1') {
      if (s.status !== 'reserved') { S.log = '해지예약 상태가 아니라 3일 전 알림톡을 보내지 않아요(이미 철회했으면 안 보냄).'; return render(); }
      S.log = '11월 12일 10:00 — 종료 3일 전 알림톡 발송'; S.mode = 'app'; return go('K1');
    }
    if (v === 'pay') {
      if (s.status !== 'ended') rpOnPay(s, S.cur, cur());
      if (s.status === 'reserved') { s.status = 'ended'; S.log = `${d.next_md} — 결제하지 않고 구독 종료(현행 만료 처리, 이번 범위 밖)`; S.scrollTop = 0; S.screen = 'A0'; return render(); }
      if (s.status === 'ended') { S.log = '이미 종료된 구독이에요.'; return render(); }
      if (s.skipPending) { s.skipPending = false; S.log = `${d.next_md} — 결제 건너뜀(쉬는 기간 입장 불가) → ${d.resume}에 ${won(d.price)} 결제 재개`; }
      else if (s.discountPending) { S.log = `${d.next_md} — ${won(d.price - s.discountPending)} 결제(1회 할인 ${won(s.discountPending)} 사용) → 그다음 ${won(d.price)}`; s.discountPending = 0; }
      else S.log = `${d.next_md} — ${won(d.price)} 결제(정상)`;
      return render();
    }
  },
};

Object.assign(ADM, RP_ADM); Object.assign(PANEL, RP_PANEL);
document.addEventListener('click', (e) => {
  const pb = e.target.closest('.demo button');
  if (pb) { const g = pb.parentElement.dataset.g; PANEL[g](pb.dataset.v); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const a = el.dataset.act;
  if (el.closest('#adm')) { ADM[a]?.(el); return; }
  if (el.closest('#app')) ACT[a]?.(el);
});

// ───────── 시작: ?go=시안 화면 이름(검사·캡처용) ─────────
const GO = {
  A0: () => {}, 'A0-2': () => { S.data = 'two'; }, 'A0-0': () => { S.data = 'zero'; }, A1: () => { PANEL.reason('price'); S.screen = 'A1'; S.attempts = []; S.member = newMember(); },
  A1b: () => { S.screen = 'A1'; S.reason = 'etc'; S.etc = D().etc_text; },
  A1c: () => { PANEL.preset('off'); S.screen = 'A1'; S.reason = 'busy'; },
  'A2-1': () => PANEL.reason('price'),
  'A2-1z': () => { S.visits0 = true; PANEL.reason('price'); },
  A1seen: () => { PANEL.seen('1'); PANEL.reason('price'); },
  'A2-2': () => { PANEL.preset('all'); PANEL.reason('busy'); },
  'A2-2b': () => PANEL.reason('busy'),
  'A2-3': () => { PANEL.preset('all'); PANEL.reason('move'); },
  A4s: () => { PANEL.preset('all'); PANEL.reason('move'); ACT.reserve(); },
  A4m: () => { GO.A4s(); ACT.setMovePt('서울 강남구 테헤란로 152', [37.500019, 127.036548]); },
  // 50km 상한 확인용: 부산 해운대(부산 지점만) · 제주(50km 안 0곳 → 완료 안내만)
  A4mb: () => { GO.A4s(); ACT.setMovePt('부산 해운대구 해운대해변로 264', [35.158496, 129.1563676]); },
  A4mj: () => { GO.A4s(); ACT.setMovePt('제주특별자치도 제주시 첨단로 242', [33.450701, 126.570667]); },
  A4m0: () => { PANEL.preset('all'); setNbr(0); PANEL.reason('move'); ACT.reserve(); },
  'A2-4': () => PANEL.reason('effect'),
  'A2-4b': () => { PANEL.preset('inbody'); PANEL.reason('effect'); },
  'A2-5': () => PANEL.reason('etc'),
  A3: () => { PANEL.reason('price'); ACT.accept(); },
  A3b: () => { PANEL.preset('all'); PANEL.reason('busy'); ACT.accept(); },
  A4: () => { PANEL.reason('price'); ACT.reserve(); },
  A5: () => { PANEL.reason('price'); ACT.reserve(); ACT.toMembership(); },
  A6: () => { PANEL.reason('price'); ACT.reserve(); ACT.withdraw(); },
  K1: () => { PANEL.reason('price'); ACT.reserve(); PANEL.time('k1'); },
  K2: () => { GO.K1(); ACT.kakaoWithdraw(); },
  K2done: () => { GO.K2(); ACT.kakaoConfirm(); },
  K2ended: () => { GO.K1(); PANEL.time('pay'); ACT.kakaoWithdraw(); },
  'A2-1p': () => { PANEL.cur('p_pt'); PANEL.reason('price'); },
  'A2-2p': () => { PANEL.cur('p_pt'); PANEL.reason('busy'); },
  A3p: () => { PANEL.cur('p_pt'); PANEL.reason('price'); ACT.accept(); },
  A0two: () => { PANEL.subs('2'); },
  C1: () => { S.mode = 'admin'; },
  // v1.6 회유 성과: R1 영등포점(이번 달=10월) · R1b 강남역점 · R1z 성수점(0건) · R1h 본사 · R1l 지난 달 · R1c 직접 지정(6월=0건)
  R1: () => { RP_PANEL.login('c_ydp'); }, R1b: () => { RP_PANEL.login('c_gn'); }, R1z: () => { RP_PANEL.login('c_ss'); }, R1h: () => { RP_PANEL.login('hq'); },
  R1l: () => { RP_PANEL.login('c_ydp'); RPS.period = 'last'; }, R1c: () => { RP_PANEL.login('c_ydp'); RPS.period = 'custom'; RPS.from = '2026-06-01'; RPS.to = '2026-06-30'; },
  C2: () => { S.mode = 'admin'; S.ui.tab = 'prod'; S.ui.open = 'p_pt'; S.ui.pvP = 'p_pt'; },
  C3: () => { S.mode = 'admin'; S.ui.tab = 'prod'; S.ui.open = 'p_pil'; S.ui.pvP = 'p_pil'; S.ui.pvI = 1; },
  C4: () => { S.mode = 'admin'; S.ui.tab = 'prod'; S.draft.own.p_stu = { price_on: true, disc: 50000, discRaw: '50,000', skip_on: false }; S.ui.open = 'p_stu'; S.ui.pvP = 'p_stu'; },
  B1: () => { S.mode = 'admin'; },
  B2: () => { S.mode = 'admin'; S.draft.discRaw = '0'; S.draft.disc = 0; S.draft.branches = []; S.draft.eff_kind = 'inbody'; },
  B3: () => { PANEL.data('stress'); PANEL.preset('all'); S.mode = 'admin'; S.draft.discRaw = '1,290,000'; S.draft.disc = 1290000; },
  B4: () => { PANEL.preset('off'); S.mode = 'admin'; },
};
if (qs.get('shot') === '1') document.body.classList.add('shot');
const LONG = qs.get('long') === '1'; // 캡처 비교용: A0·A5를 시안처럼 세로로 긴 전체 화면으로
S.data = ['stress', 'long'].includes(qs.get('d')) ? qs.get('d') : 'base';
if (qs.get('v') === '0') S.visits0 = true;
S.cfg = mkCfg('b1'); S.draft = clone(S.cfg); reset();
const g = qs.get('go');
if (g && GO[g]) GO[g]();
// 시안 긴 값 화면과 같은 조건으로 맞출 때만 쓰는 값(할인 금액·안내 지점 수)
if (qs.get('disc')) for (const c of [S.cfg, S.draft]) { c.disc = Number(qs.get('disc')); c.discRaw = c.disc.toLocaleString('ko-KR'); }
if (qs.get('nbr')) setNbr(Number(qs.get('nbr')));
render();
window.__proto = { S, ACT, PANEL, ADM, RPS, reportApi, rpCsvText, rpSum, RP_SEED, RP_CENTERS, resolveOffer, render, curCfg, seenNow, D, DB, setNbr, nearest, distKm };
// 카카오 우편번호 서비스(키 필요 없음) — 이사 주소 검색 창을 처음 열 때만 불러온다
let pcP = null;
function loadPostcode() {
  if (window.daum && window.daum.Postcode) return Promise.resolve();
  return pcP ||= new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'; sc.onload = ok; sc.onerror = () => { pcP = null; no(); }; document.head.appendChild(sc); });
}
