// 니짐내짐 구독 «해지예약 회유» B안 — 화면 그리기. 시안(_src/build.py·admin.py) 마크업을 그대로 옮겼다(클래스·문구·숫자 동일).
// v1.3(10-23): 시안 v3 «시크릿 제안» A안 — A2-1(+A2-2b)·A2-2 문안, A3 «시크릿 혜택이/쉬어가기 찬스가 적용됐어요», 제안은 회원 ID + 상품 ID마다 1번(resolveOffer 4번째 인자) · 센터 기본 + 상품별 따로 설정(effCfg).
// v1.2(10-23): K1 알림톡 = 카카오 정보성 검수 수정본(금액·정가·재가입 문장 삭제), 알림톡 [구독해지 철회하기] → K2 철회 페이지(결제 기능 없음).
// v1.1(10-23): 시안 v2 = 형 실제 앱 «내 멤버십» 화면 기준 A0·A5·A6 재작성(rm* 함수). 진입=기존 [구독해지], 철회=기존 초록 [구독해지 철회].
// 시안에 없는 «제안 적용 완료» 변형(쉬어가기·쿠폰·지점·유지)은 A3 틀을 그대로 쓰고 문구만 바꿨다 → README_SPEC 9번.
'use strict';
const won = (n) => `${n.toLocaleString('ko-KR')}원`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const BASE = {
  user: '김민지', uname: '윤재현', center: '엔짐 영등포점', product: '헬스 구독멤버십', ty: '헬스', price: 43800, listp: 90000,
  next_md: '11월 15일', next_long: '2026년 11월 15일', next_full: '2026.11.15(일)', next_dot: '2026.11.15', use_end_md: '11월 14일', use_period: '2026.10.15 ~ 2026.11.14',
  alarm_md: '11월 12일', skip_end: '12월 14일', resume: '12월 15일',
  visits: 12, period: '10월 1일~23일', days_left: 22, daily: '하루 2회 이용가능(1/2)', open_msg: '오후 11시 30분 영업종료',
  others: [{ name: '개인락커', period: '2026.10.15 ~ 2026.11.14', extra: ['자리정보', 'A302'], fee: 5000, due: false }],
  pay: ['토스체크카드', '체크 9230', '토스뱅크청소년맞춤 할인혜택 팡팡 카드'], peek: '니짐이내짐 휘트니스',
  branchPool: [['엔짐 답십리점', '서울 동대문구 답십리로 78'], ['엔짐 신도림점', '서울 구로구 경인로 662'], ['엔짐 목동점', '서울 양천구 목동동로 257']],
  etc_text: '주차가 너무 불편해서요.',
};
const STRESS = {
  ...BASE, uname: '남궁윤재현', center: '엔짐 영등포타임스퀘어 프리미엄 피트니스 앤 스파 2호점', product: '헬스+GX+필라테스 무제한 구독멤버십(연말 D-100 이벤트)', ty: '헬스+GX+필라테스',
  price: 1290000, listp: 2580000, visits: 31, days_left: 122, daily: '하루 10회 이용가능(10/10)',
  others: [{ name: '개인락커(대형 · 샤워실 옆 프리미엄 존, 2단 선반 포함)', period: '2026.10.15 ~ 2026.11.14', extra: ['자리정보', 'B-1207 (지하 1층 남자 탈의실 안쪽)'], fee: 150000, due: false },
    { name: '운동복 대여 서비스(상하의 세트 + 수건 2장 무제한 교체)', period: '2026.10.15 ~ 2026.11.14', extra: null, fee: 1290000, due: true },
    { name: '월정기 주차권(지하 2층 기계식 주차장 · SUV 불가)', period: '2026.10.15 ~ 2026.11.14', extra: ['차량번호', '123가 4567'], fee: 1290000, due: false }],
  pay: ['삼성카드 taptap O 모바일 단독 프리미엄 에디션 체크카드', '신용 1234', '삼성카드 taptap O 모바일 단독 프리미엄 에디션 · 통신·스트리밍·편의점 할인'],
  branchPool: [['엔짐 경기도 고양시 일산동구 라페스타 프리미엄 피트니스점', '경기 고양시 일산동구 중앙로 1305번길 14, 라페스타 B동 지하 2층'], ['엔짐 답십리점', '서울 동대문구 답십리로 78'], ['엔짐 영등포점', '서울 영등포구 영중로 15']],
  etc_text: '회사 근무 시간이 매주 바뀌는 교대 근무로 바뀌어서 정해진 시간에 운동하기가 어렵고, 집에서 센터까지 거리도 멀어서 당분간은 홈트로 해 보려고 합니다.',
};
// 형 예시 긴 값(시안 v3 LONGNAME): 긴 이름 + 긴 지점명, 금액은 보통
const LONGNAME = { ...BASE, uname: '남궁윤재현', center: '엔짐 영등포타임스퀘어점' };
// v1.3 구독 상품 9개(시안 v3/admin_settings P와 같은 값). 1번째 = 회원의 지금 상품(d.product), 3번째(PT 패키지) = 구독 2개 회원의 두 번째 상품.
const BIG = (d) => d.price >= 1000000; // «긴 값·큰 금액»이면 두 번째 상품도 긴 이름·큰 금액
function products(d) {
  return [
    { id: 'p_health', n: d.product, p: d.price, ev: true },
    { id: 'p_hgx', n: '헬스+GX 구독멤버십', p: 59000 },
    { id: 'p_pt', n: BIG(d) ? 'PT 1:1 프리미엄 48회 + 헬스 12개월 패키지(바디프로필 촬영·식단 코칭 포함)' : 'PT 1:1 프리미엄 24회 + 헬스 6개월 패키지', p: BIG(d) ? 2490000 : 390000 },
    { id: 'p_pil', n: '필라테스 그룹 주 2회 구독멤버십', p: 129000 },
    { id: 'p_stu', n: '학생 헬스 구독멤버십(만 24세 이하)', p: 33000 },
    { id: 'p_dawn', n: '새벽 얼리버드 헬스 구독멤버십(06~09시)', p: 35000 },
    { id: 'p_couple', n: '커플 헬스 구독멤버십(2인)', p: 79000 },
    { id: 'p_locker', n: '개인락커 포함 헬스 구독멤버십', p: 49000 },
    { id: 'p_yoga', n: '요가·필라테스 무제한 구독멤버십', p: 159000, added: '10월 22일 추가 · 자동으로 센터 기본 적용' },
  ];
}
const ownDefaults = (d) => ({ p_pt: { price_on: true, disc: BIG(d) ? 1000000 : 100000, skip_on: true }, p_pil: { price_on: true, disc: 20000, skip_on: false }, p_locker: { price_on: false, disc: 0, skip_on: true } });
// 따로 설정한 상품은 할인(켜기·금액)·쉬어가기(켜기)만 덮어쓴다. 이사·효과·기타·5번은 언제나 센터 기본(README_SPEC 15번).
const effCfg = (center, own) => own ? { ...center, price_on: own.price_on, disc: own.disc, discRaw: own.discRaw, skip_on: own.skip_on } : center;
// 회원 화면용 상품 데이터: 회원·센터·날짜는 그대로, 상품 이름·가격·이용횟수만 그 상품 것
function prodData(d, pid) {
  if (pid === 'p_health') return d;
  const p = products(d).find((x) => x.id === pid);
  return { ...d, pid, product: p.n, ty: pid === 'p_pt' ? 'PT+헬스' : d.ty, price: p.p, listp: p.p, daily: pid === 'p_pt' ? '하루 1회 이용가능(0/1)' : d.daily };
}
const REASONS = [['price', '가격이 부담돼요'], ['busy', '바빠서 갈 시간이 없어요'], ['hurt', '다쳐서 쉬어야 해요'], ['trip', '여행·출장을 가요'],
  ['move', '이사를 가요'], ['effect', '운동 효과가 없어요'], ['etc', '기타(직접 입력)']];
const RL = Object.fromEntries(REASONS);

function ic(name, c = 'currentColor', s = 24, w = 1.8) {
  const P = {
    back: '<path d="m15 5-7 7 7 7"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    pin: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    run: '<circle cx="14" cy="4.5" r="1.8"/><path d="m8 21 3-6 3 2v5M6 11l3-3 4 1 2 4 3 1M11 15l1.5-5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    calx: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>',
    mappin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    ticket: '<path d="M3 8h18v2.5a1.8 1.8 0 0 0 0 3.5V16.5H3V14a1.8 1.8 0 0 0 0-3.5z"/><path d="M15 8.5v7.5" stroke-dasharray="1.6 1.6"/>',
  }[name];
  return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${P}</svg>`;
}
const SB = '<div class="sb"><span>12:58</span><span class="ic"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8" fill="#111"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8" fill="#111"/><rect x="10" y="3" width="3" height="9" rx=".8" fill="#111"/><rect x="15" y="0" width="3" height="12" rx=".8" fill="#C7C7CC"/></svg>'
  + '<svg width="16" height="12" viewBox="0 0 16 12" fill="#111"><path d="M8 9.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM4.7 7.4a4.7 4.7 0 0 1 6.6 0l-1.1 1.1a3.1 3.1 0 0 0-4.4 0zM2.2 4.9a8.2 8.2 0 0 1 11.6 0l-1.1 1.1a6.6 6.6 0 0 0-9.4 0zM0 2.5A11.3 11.3 0 0 1 16 2.5l-1.1 1.1a9.7 9.7 0 0 0-13.8 0z"/></svg>'
  + '<svg width="27" height="12" viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3" fill="none" stroke="#111" stroke-opacity=".4"/><rect x="2" y="2" width="15" height="8" rx="1.5" fill="#111"/><rect x="25" y="4" width="1.5" height="4" rx=".7" fill="#111" fill-opacity=".4"/></svg></span></div>';
const hdr = (t, back = true) => `<div class="hdr">${back ? `<div class="back" data-act="back">${ic('back', '#111')}</div>` : ''}${t}</div>`;
const DOOR = '<svg width="26" height="26" viewBox="0 0 26 26" fill="none"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A45"/><stop offset="1" stop-color="#FF0065"/></linearGradient></defs>'
  + '<path d="M4 3.5h11.5a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H4z" fill="url(#dg)"/><circle cx="13" cy="13" r="1.3" fill="#fff" fill-opacity=".9"/>'
  + '<path d="M24 13H16.5M19.5 9.8 16.3 13l3.2 3.2" stroke="#FF0065" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SYM = '<img src="nijim_symbol_black.svg" width="24" height="24" alt="">';
// 본문 스크롤 틀: 시안의 일반 흐름 위치(top)와 같은 자리에서 시작하고, 하단 버튼 바만큼 아래 여백을 둔다.
const scr = (top, inner, pad = 0) => `<div class="scr" style="top:${top}px">${inner}<div class="padb" style="height:${pad}px"></div></div>`;

// ───────── 내 멤버십 = 형 실제 앱 캡처 재현(시안 v2 rm_* 그대로, 구성·색·버튼 톤 임의 변경 금지) ─────────
const CHEV = '<svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#F0397D"/><path d="m7.5 5.5 3.5 3.5-3.5 3.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const I_LOC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2577E8" stroke-width="2.2"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.6" fill="#2577E8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
const I_TEL = '<svg width="17" height="17" viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="#3B9F44"/></svg>';
const I_KAKAO = '<svg width="19" height="19" viewBox="0 0 20 20"><rect width="20" height="20" rx="5" fill="#FAE100"/><path d="M10 4.6c-3.3 0-5.9 2.1-5.9 4.6 0 1.6 1 3 2.6 3.8l-.6 2.3 2.6-1.7c.4.1.9.1 1.3.1 3.3 0 5.9-2.1 5.9-4.5S13.3 4.6 10 4.6z" fill="#3C1E1E"/>'
  + '<text x="10" y="11.4" text-anchor="middle" font-size="5.2" font-weight="800" fill="#FAE100" font-family="Helvetica,Arial,sans-serif">Ch</text></svg>';
function rmTabbar(fix) {
  const P = { home: '<path d="M4 10.5 12 4l8 6.5V20h-5v-5.5h-6V20H4z"/>',
    near: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.8"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    card: '<rect x="3" y="6" width="18" height="13" rx="2.5" transform="rotate(-12 12 12)"/><path d="M3.5 10.5 20 7" /><circle cx="16" cy="14" r="1.2"/>',
    chat: '<path d="M12 4c4.7 0 8.5 3 8.5 6.8s-3.8 6.8-8.5 6.8c-.9 0-1.8-.1-2.6-.3L5 19.5l1-3.6C4.4 14.7 3.5 12.9 3.5 10.8 3.5 7 7.3 4 12 4z"/><circle cx="8.3" cy="10.8" r=".6" fill="currentColor"/><circle cx="12" cy="10.8" r=".6" fill="currentColor"/><circle cx="15.7" cy="10.8" r=".6" fill="currentColor"/>',
    all: '<path d="M4 6h16M4 12h16M4 18h16"/>' };
  const its = [['home', '홈'], ['near', '내주변'], ['card', '회원권'], ['chat', '채팅'], ['all', '전체']].map(([k, l]) => `<div class="it${k === 'card' ? ' on' : ''}"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${P[k]}</svg><span>${l}</span></div>`).join('');
  return `<div class="rm-tab${fix ? ' fix' : ''}">${its}<div class="hi"></div></div>`;
}
// 회유가 붙는 곳은 «이용중인 서비스»(구독멤버십) 버튼 2개뿐: 회색 [구독해지]=startCancel(→A1), 초록 [구독해지 철회]=withdraw(원탭).
function rmMainService(d, due) {
  const acts = due ? `<div class="rm-acts"><div class="rm-btn grn" data-k="withdraw" data-act="withdraw">구독해지 철회</div><span class="rm-due">${d.next_dot} 해지예정</span></div>`
    : '<div class="rm-acts"><div class="rm-btn" data-k="cancel" data-act="startCancel">구독해지</div></div>';
  return `<div class="rm-box rm-svc" id="svc"><div class="t">이용중인 서비스</div><div class="rm-sv"><div class="nm">${esc(d.product)}</div>`
    + `<div class="ln">이용기간 : ${d.use_period}</div><div class="ln">이용횟수 : ${d.daily}</div><div class="ln">월 구독료 : ${won(d.price)}</div>${acts}</div></div>`;
}
// 기타 서비스(개인락커 등) 버튼은 지금 앱 동작 그대로 — 회유 흐름 없음(형 확인 항목).
function rmOtherServices(d) {
  if (!d.others.length) return '';
  const items = d.others.map((o, i) => {
    const ex = o.extra ? `<div class="ln">${esc(o.extra[0])} : ${esc(o.extra[1])}</div>` : '';
    const acts = o.due ? `<div class="rm-acts"><div class="rm-btn grn" data-act="otherWithdraw" data-i="${i}">구독해지 철회</div><span class="rm-due">${d.next_dot} 해지예정</span></div>`
      : `<div class="rm-acts"><div class="rm-btn" data-act="otherCancel" data-i="${i}">구독해지</div></div>`;
    return `<div class="rm-sv"><div class="nm">${esc(o.name)}</div><div class="ln">이용기간 : ${o.period}</div>${ex}<div class="ln">월 구독료 : ${won(o.fee)}</div>${acts}</div>`;
  }).join('');
  return `<div class="rm-box"><div class="t">이용중인 기타 서비스</div>${items}</div>`;
}
function rmContent(d, due, pk) {
  const card = `<div class="rm-card"><div class="cn"><span>${esc(d.center)}</span>${CHEV}</div>`
    + `<div><div class="ty">${esc(d.ty)}</div><div class="ty">구독멤버십</div><div class="dl"><b>${d.days_left}</b>일 남음</div><div class="dy">${d.daily}</div></div></div>`;
  // pk: 구독 2개 회원이면 옆 카드 = 다른 구독 상품(누르면 그 상품으로 바뀜). 없으면 지금 앱 캡처 그대로.
  const peek = pk ? `<div class="rm-card rm-peek" data-act="switchSub" data-k="peek"><div class="cn"><span>${esc(pk.center)}</span></div><div><div class="ty">${esc(pk.ty)}</div><div class="ty">구독멤버십</div><div class="dl"><b>${pk.days_left}</b>일 남음</div><div class="dy">${esc(pk.daily)}</div></div></div>`
    : `<div class="rm-card rm-peek"><div class="cn"><span>${d.peek}</span></div><div><div class="ty">헬스</div><div class="ty">3개월</div><div class="dl"><b>51</b>일 남음</div><div class="dy">하루 1회</div></div></div>`;
  const pay = d.pay;
  return `<div class="rm-cards">${card}${peek}</div>`
    + `<div class="rm-enters"><div class="rm-enter">${DOOR}입장하기</div><div class="rm-enter rm-peek"></div></div>`
    + `<div class="rm-open">${d.open_msg}</div><div class="rm-band"></div><div class="rm-sect">회원권 상세정보</div>`
    + `<div class="rm-box"><div class="t">센터정보</div><div class="nm" style="font-weight:500">센터명</div><div class="ln">${esc(d.center)}</div>`
    + `<div class="rm-cbs"><div class="rm-cb b">${I_LOC}위치보기</div><div class="rm-cb g">${I_TEL}전화문의</div><div class="rm-cb k">${I_KAKAO}카톡문의</div></div></div>`
    + rmMainService(d, due) + rmOtherServices(d)
    + '<div class="rm-add">서비스추가</div>'
    + `<div class="rm-box"><div class="t">결제정보</div><div class="nm" style="font-weight:500">결제카드</div>`
    + `<div class="rm-pay"><div class="rm-cc"><div class="a">${esc(pay[0])}</div><div class="b">${esc(pay[1])}</div><div class="c">${esc(pay[2])}</div></div><div class="rm-chg">결제카드<br>변경하기</div></div>`
    + `<div class="ln" style="margin-top:12px">다음결제일 : ${d.next_dot}</div></div>`;
}
// long=true: 시안 A0·A5처럼 세로로 긴 전체 화면(캡처 비교용). 평소엔 탭 고정 + 본문 스크롤.
const rmScreen = (d, due, long, toast = '', pk = null) => long
  ? SB + '<div class="hdr mm-hdr">내 멤버십</div>' + rmContent(d, due, pk) + rmTabbar(false)
  : SB + '<div class="hdr mm-hdr">내 멤버십</div>' + `<div class="rm-view scr">${rmContent(d, due, pk)}<div class="padb" style="height:18px"></div></div>` + toast + rmTabbar(true);
const A0 = (d, long, pk) => rmScreen(d, false, long, '', pk);
const A5 = (d, long, pk) => rmScreen(d, true, long, '', pk);
const A6 = (d, pk) => rmScreen(d, false, false,
  `<div class="toast" style="bottom:100px" data-act="hideToast">${ic('check', '#5BE0A6', 20, 2.4)}<div><b>구독해지를 철회했어요</b><div class="s">${d.next_md}에 월 구독료 ${won(d.price)}이 결제돼요.</div></div></div>`, pk);

// ───────── A1 해지 이유(1화면) ─────────
function A1(d, sel, etcText, off) {
  let rows = '';
  for (const [k, l] of REASONS) {
    rows += `<div class="ro${k === sel ? ' on' : ''}" data-act="reason" data-r="${k}"><span class="rd"></span>${l}</div>`;
    if (k === 'etc' && sel === 'etc') rows += `<div class="ta"><textarea id="etc" maxlength="100" rows="1" placeholder="이유를 적어 주세요(선택)">${esc(etcText)}</textarea><div class="cnt"><span id="etcn">${[...etcText].length}</span>/100</div></div>`;
  }
  const cta = !sel ? '<div class="btn dis">다음</div>' : off ? '<div class="btn ink" data-act="reserve">해지 예약하기</div>' : '<div class="btn ink" data-act="next">다음</div>';
  const hint = sel && off ? `<div class="hint">누르면 바로 해지 예약돼요. ${d.use_end_md}까지는 지금처럼 이용할 수 있어요.</div>` : '';
  return SB + hdr('구독해지') + scr(91, '<div class="body"><div class="h1" style="margin-top:14px">해지하려는 이유를<br>하나만 골라 주세요</div>'
    + `<div class="info">지금 해지해도 <b>${d.use_end_md}까지</b> 이용할 수 있어요. ${d.next_md} 다음 결제가 되지 않고 구독이 해지돼요.</div>`
    + `<div class="rlist">${rows}</div><div class="end"></div></div>`, sel && off ? 130 : 110)
    + `<div class="bar">${hint}${cta}</div>`;
}

// ───────── A2 이유별 제안(2화면째, 한 번만) ─────────
function losses(d) {
  const vis = d.visits ? `이번 달 <b>${d.visits}번</b> 운동했어요<span class="s">${d.period} 입장 기록</span>` : `이번 달은 아직 입장 기록이 없어요<span class="s">${d.period}</span>`;
  return '<div class="lt">해지하면 달라져요</div><div class="cmp">'
    + `<div class="c keep"><div class="l ev">지금 내 구독 · 이벤트가</div><div class="pr"><small>월</small>${won(d.price)}</div><div class="d">유지하면 이 가격 그대로</div></div>`
    + `<div class="c"><div class="l">해지 후 다시 가입하면</div><div class="pr"><small>월</small>${won(d.listp)}</div><div class="d">정가</div></div></div>`
    + `<div class="facts"><div class="fact"><span class="i">${ic('run', '#6B6B73', 16)}</span><span>${vis}</span></div>`
    + `<div class="fact"><span class="i">${ic('calx', '#6B6B73', 16)}</span><span>해지하면 <b>${d.next_md}</b> 해지예정<span class="s">${d.use_end_md}까지는 지금처럼 이용할 수 있어요</span></span></div></div>`;
}
const LOCK = '<svg width="11" height="11" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10.5" rx="2.2" fill="#fff"/><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" stroke="#fff" stroke-width="2.6" fill="none"/></svg>';
const SX = `<div class="sx">${LOCK}시크릿 제안</div>`;
// 지점명 끝 글자 받침 → 이/가 (괄호로 끝나면 괄호 앞 글자 기준)
const josa = (w) => { const c = w.replace(/\)+$/, '').slice(-1); return c >= '가' && c <= '힣' && (c.charCodeAt(0) - 0xAC00) % 28 ? '이' : '가'; };
const secretP = (d, lead) => `${lead ? lead + ' ' : ''}${esc(d.center)}${josa(d.center)} ${esc(d.uname)}님을 위해 따로 준비했어요. 이 화면을 닫으면 다시 받을 수 없어요.`;
const visitLead = (d) => d.visits ? `이번 달 ${d.visits}번이나 운동하셨잖아요.` : '그동안 함께해 주셔서 고마워요.';
const OFFER_BTN = { price: '시크릿 혜택 받기', skip_off: '시크릿 혜택 받기', skip: '쉬어가기 찬스 받기', move: '지점 보러 갈게요', pt: '체험권 받을게요', inbody: '측정권 받을게요', keep: '계속 이용할게요' };
function A2(d, kind, reason, cfg, etcText) {
  let eb = `<div class="eyebrow">고른 이유 · <b>${reason !== 'etc' ? RL[reason] : '기타'}</b></div>`;
  if (reason === 'etc' && etcText) eb += `<div class="quote">${esc(etcText)}</div>`;
  const disc = cfg.disc, after = d.price - disc;
  let head, sub, box;
  if (kind === 'price' || kind === 'skip_off') {
    eb = SX;
    head = `${esc(d.uname)}님께만 드리는 혜택<br>다음 결제 <em>${won(disc)}</em> 할인`;
    sub = secretP(d, visitLead(d));
    box = `<div class="box sec"><div class="kv"><span class="k">${d.next_md} 결제</span><span class="v"><s>${won(d.price)}</s><span class="big">${won(after)}</span></span></div>`
      + `<div class="kv"><span class="k">그다음 결제부터</span><span class="v">월 ${won(d.price)}</span></div></div>`;
  } else if (kind === 'skip') {
    eb = SX;
    head = `${esc(d.uname)}님께만 드리는<br>쉬어가기 찬스`;
    sub = secretP(d, '');
    box = `<div class="box sec"><div class="kv"><span class="k">${d.next_md} 결제</span><span class="v"><span class="big">건너뛰기</span></span></div>`
      + `<div class="kv"><span class="k">다시 결제</span><span class="v">${d.resume} · 월 ${won(d.price)}</span></div>`
      + `<div class="note">쉬는 기간(${d.next_md}~${d.skip_end})엔 센터에 입장할 수 없어요.</div></div>`;
  } else if (kind === 'move') {
    head = '이사 가는 곳 가까이<br><em>다른 지점</em>이 있어요';
    sub = `${esc(d.center)}에서 안내하는 지점이에요. 옮겨서 이용하는 방법은 지점에서 안내해 드려요.`;
    box = '<div class="box">' + cfg.branches.map(([n, a]) => `<div class="br"><span class="pin">${ic('mappin', '#FE2167', 16)}</span><div style="min-width:0"><div class="n">${esc(n)}</div><div class="a">${esc(a)}</div></div></div>`).join('') + '</div>';
  } else if (kind === 'pt' || kind === 'inbody') {
    const nm = kind === 'pt' ? 'PT 1회 체험권' : '인바디 측정권';
    head = kind === 'pt' ? '<em>PT 1회 체험</em>을<br>무료로 드릴게요' : '<em>인바디 측정</em>을<br>무료로 해 드릴게요';
    sub = kind === 'pt' ? '트레이너와 함께 운동 방법을 다시 잡아 보세요.' : '지금까지 달라진 몸을 숫자로 확인해 보세요.';
    box = `<div class="box"><div class="kv"><span class="k">받는 것</span><span class="v"><span class="big">${nm}</span> · 0원</span></div>`
      + '<div class="kv"><span class="k">받는 곳</span><span class="v">내 쿠폰함 · 30일 안에 사용</span></div></div>';
  } else {
    head = `지금 해지하지 않으면<br><em>월 ${won(d.price)}</em>이 유지돼요`;
    sub = '해지는 언제든 다시 할 수 있어요.';
    box = '';
  }
  return SB + hdr('구독해지') + scr(91, '<div class="body">' + eb + `<div class="h1">${head}</div><div class="p">${sub}</div>` + box + losses(d) + '<div class="end"></div></div>', 110)
    + `<div class="bar"><div class="two"><div class="eq go" data-act="reserve">그래도 해지할게요</div><div class="eq keep" data-act="accept">${OFFER_BTN[kind]}</div></div></div>`;
}

// ───────── A3 제안 적용 완료 (할인·쉬어가기 = 시안 v3 A3·A3b 그대로, 나머지는 같은 틀에 문구만) ─────────
function A3(d, kind, cfg) {
  const after = d.price - cfg.disc;
  const ok = (h, box, sx = '', info = '') => SB + hdr('', false) + scr(91, '<div class="done">'
    + `<div class="ok" style="background:#FFE6EE">${ic('check', '#FE2167', 28, 2.4)}</div>${sx}`
    + `<div class="h1">${h}</div><div class="what">${esc(d.center)} · ${esc(d.product)}</div>${box}${info}<div class="end"></div></div>`, 96)
    + '<div class="stack"><div class="btn pri" data-act="toMembership">내 멤버십으로</div></div>';
  const kv = (k, v) => `<div class="kv"><span class="k">${k}</span><span class="v">${v}</span></div>`;
  if (kind === 'price' || kind === 'skip_off') return ok('시크릿 혜택이<br>적용됐어요',
    `<div class="box sec">${kv(`${d.next_md} 결제`, `<s>${won(d.price)}</s><span class="big">${won(after)}</span>`)}${kv('그다음 결제부터', `월 ${won(d.price)}`)}</div>`, SX);
  if (kind === 'skip') return ok('쉬어가기 찬스가<br>적용됐어요',
    `<div class="box sec">${kv(`${d.next_md} 결제`, '<span class="big">건너뛰기</span>')}${kv('쉬는 기간', `${d.next_md}~${d.skip_end}`)}${kv('다시 결제', `${d.resume} · 월 ${won(d.price)}`)}</div>`, SX,
    `<div class="info" style="margin-top:14px">${d.use_end_md}까지는 지금처럼 이용하고, 푹 쉬고 ${d.resume}부터 다시 만나요.</div>`);
  if (kind === 'pt' || kind === 'inbody') return ok(`${kind === 'pt' ? 'PT 1회 체험권' : '인바디 측정권'}을<br>쿠폰함에 넣었어요`,
    `<div class="box">${kv('받은 것', `<span class="big">${kind === 'pt' ? 'PT 1회 체험권' : '인바디 측정권'}</span> · 0원`)}${kv('사용 기한', '받은 날부터 30일')}</div>`);
  if (kind === 'move') return ok('가까운 지점을<br>확인해 보세요',
    '<div class="box">' + cfg.branches.map(([n, a]) => `<div class="br"><span class="pin">${ic('mappin', '#FE2167', 16)}</span><div style="min-width:0"><div class="n">${esc(n)}</div><div class="a">${esc(a)}</div></div></div>`).join('') + '</div>');
  return ok('지금 가격 그대로<br>이용해요', `<div class="box">${kv('다음 결제', `${d.next_md} · 월 ${won(d.price)}`)}</div>`);
}

// ───────── A4 해지예약 완료 ─────────
const A4 = (d) => SB + hdr('', false) + scr(91, '<div class="done">'
  + `<div class="ok">${ic('cal', '#202024', 26)}</div>`
  + `<div class="h1">해지 예약됐어요</div><div class="what">${esc(d.center)} · ${esc(d.product)}</div>`
  + `<div class="box"><div class="kv"><span class="k">이용</span><span class="v">${d.use_end_md}까지 지금처럼</span></div>`
  + `<div class="kv"><span class="k">해지예정일</span><span class="v">${d.next_dot}</span></div>`
  + '<div class="kv"><span class="k">다음 결제</span><span class="v">없음</span></div>'
  + `<div class="kv"><span class="k">알림</span><span class="v">${d.alarm_md} 카카오 알림톡</span></div></div>`
  + `<div class="info" style="margin-top:14px">마음이 바뀌면 <b>${d.use_end_md}까지 언제든</b> 내 멤버십의 <b>[구독해지 철회]</b>로 되돌릴 수 있어요. 철회하면 <b>월 ${won(d.price)}</b> 그대로 이어져요.</div><div class="end"></div></div>`, 158)
  + '<div class="stack"><div class="btn pri" data-act="toMembership">확인</div><div class="btn line" data-act="withdraw">구독해지 철회</div></div>';

// ───────── K1 알림톡(해지예정 3일 전) ─────────
const KAKAO_CSS = `<style>
.kk{position:absolute;inset:0;background:#B2C7D9}
.kk .top{height:91px;background:#B2C7D9}
.kk .tt{position:absolute;top:47px;left:0;right:0;height:44px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#111}
.kk .msg{position:absolute;left:12px;top:110px;display:flex;gap:8px}
.kk .pf{width:40px;height:40px;border-radius:15px;background:#fff;display:flex;align-items:center;justify-content:center;flex:none}
.kk .nm{font-size:13px;color:#3A4A5A;margin-bottom:5px}
.kk .bub{width:278px;background:#fff;border-radius:4px 14px 14px 14px;overflow:hidden}
.kk .ah{background:#FEE500;height:38px;display:flex;align-items:center;padding:0 14px;font-size:14px;font-weight:700;color:#191919}
.kk .bd{padding:14px 14px 4px;font-size:14px;line-height:21px;color:#191919}
.kk .bd .t{font-weight:700;font-size:15px;margin-bottom:8px}
.kk .bd .r{margin-top:2px}
.kk .bts{padding:10px 14px 14px;display:flex;flex-direction:column;gap:6px}
.kk .kb{height:40px;border-radius:6px;background:#F2F3F5;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#191919}
.kk .time{font-size:11px;color:#3A4A5A;align-self:flex-end;margin-left:6px}
</style>`;
function K1(d) {
  // 10-23 카카오 검수 수정(시안 v2 _src/build.py K()와 같은 문안): 광고성 한 줄이면 템플릿 전체 반려 → 금액·정가·재가입 문장 없음
  const body = '<div class="t">구독 해지 예정 안내</div>'
    + `${esc(d.user)}님, 이용 중인 ${esc(d.product)}이 ${d.next_long}에 해지될 예정이에요.<br><br>`
    + `<div class="r">- 센터: ${esc(d.center)}</div><div class="r">- 멤버십: ${esc(d.product)}</div>`
    + `<div class="r">- 해지 예정일: ${d.next_long}</div><br>`
    + '계속 이용하시려면 해지 예정일 전에 아래 버튼으로 해지를 철회할 수 있어요.';
  return KAKAO_CSS + '<div class="kk">' + SB.replace('class="sb"', 'class="sb" style="background:#B2C7D9"') + '<div class="tt">니짐내짐</div>'
    + `<div class="msg"><div class="pf">${SYM}</div><div><div class="nm">니짐내짐</div><div style="display:flex"><div class="bub"><div class="ah">알림톡 도착</div><div class="bd">${body}</div>`
    + '<div class="bts"><div class="kb eqk" data-act="kakaoWithdraw">구독해지 철회하기</div><div class="kb eqk" data-act="kakaoView">내 멤버십 보기</div></div></div><span class="time">오전 10:00</span></div></div></div><div class="end"></div></div>';
}

// ───────── K2 알림톡 [구독해지 철회하기] 철회 페이지 ─────────
// 카카오 알림톡 블랙리스트 8번: 버튼으로 연결되는 페이지에 결제 기능 금지 → 금액·결제카드·결제 버튼 없이 철회만 한다(README_SPEC 12번).
// 링크를 연 것만으로는 철회하지 않고(GET 금지) 로그인 확인 뒤 버튼 한 번으로 철회한다.
const K2 = (d, st) => {
  const done = st === 'done', ended = st === 'ended';
  const head = ended ? `<div class="ok">${ic('cal', '#202024', 26)}</div><div class="h1">이미 종료된 구독이에요</div>`
    : done ? `<div class="ok" style="background:#E3F8EE">${ic('check', '#1BAA6B', 28, 2.4)}</div><div class="h1">구독해지를 철회했어요</div>`
    : `<div class="ok">${ic('cal', '#202024', 26)}</div><div class="h1">해지 예정인 멤버십이에요</div>`;
  const v = ended ? `${d.next_dot} 해지됨` : done ? `<s>${d.next_dot}</s> 취소됨` : d.next_dot;
  const info = ended ? `${d.next_dot}에 해지돼서 철회할 수 없어요.` : done ? '해지 예정이 취소됐어요. 지금처럼 계속 이용할 수 있어요.'
    : `<b>${d.use_end_md}까지</b> 철회할 수 있어요. 철회하면 해지 예정이 취소되고 지금처럼 계속 이용해요.`;
  return SB + hdr('구독해지 철회', false) + scr(91, `<div class="done">${head}<div class="what">${esc(d.center)} · ${esc(d.product)}</div>`
    + `<div class="box"><div class="kv"><span class="k">해지 예정일</span><span class="v">${v}</span></div></div>`
    + `<div class="info" style="margin-top:14px">${info}</div><div class="end"></div></div>`, 96)
    + `<div class="stack">${st === 'ask' ? '<div class="btn pri" data-act="kakaoConfirm">구독해지 철회</div>' : '<div class="btn pri" data-act="toMembership">내 멤버십으로</div>'}</div>`;
};

// ───────── 사유 → 제안 결정 (README_SPEC 5번 표와 같은 규칙) ─────────
// seen: 이 회원이 «이 상품»에서 제안 화면(A2)을 이미 봤으면 이유·설정과 관계없이 제안 없이 해지 예약(회원 ID + 상품 ID마다 1번, README_SPEC 5-4).
// pending: 이미 받아 둔 할인·쉬어가기가 다음 결제에 걸려 있으면 금전 제안(1·2번)은 다시 주지 않는다(중복 적용 금지).
function resolveOffer(reason, cfg, sub, seen) {
  if (seen) return null;
  const money = !(sub && (sub.discountPending || sub.skipPending));
  const keep = cfg.keep_on ? 'keep' : null;
  if (reason === 'price') return cfg.price_on && money ? 'price' : keep;
  if (reason === 'busy' || reason === 'hurt' || reason === 'trip') {
    if (cfg.skip_on && money) return 'skip';
    if (cfg.price_on && money) return 'skip_off';
    return keep;
  }
  if (reason === 'move') return cfg.move_on && cfg.branches.length ? 'move' : keep;
  if (reason === 'effect') return cfg.eff_on && !(sub && sub.couponIssued) ? cfg.eff_kind : keep;
  return keep;
}

// ───────── 관리자 «해지 회유 설정» (admin.py screen() 그대로) ─────────
const ERR = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E5342B" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.2"/></svg>';
function side() {
  const navs = [['g', '운영'], ['n', '홈'], ['n', '회원 관리'], ['n', '출석'], ['g', '상품'], ['n', '멤버십 상품'], ['n', '구독 멤버십'], ['s', '구독 회원'], ['son', '해지 회유 설정'], ['g', '매출'], ['n', '결제·정산'], ['g', '설정'], ['n', '센터 정보'], ['n', '온라인광고']];
  return `<div class="side"><div class="brand">${SYM}니짐내짐 센터 관리</div>` + navs.map(([k, l]) => k === 'g' ? `<div class="grp">${l}</div>`
    : `<div class="nav${k === 's' || k === 'son' ? ' sub' : ''}${k === 'son' ? ' on' : ''}">${l}</div>`).join('') + '</div>';
}
// 할인 금액 검사: 1,000원 이상 · 1,000원 단위 · 상한(센터 기본 = 기본을 따르는 상품 중 가장 낮은 월 결제금액, 상품별 = 그 상품 월 결제금액) 미만
function discError(raw, maxExcl, own = false) {
  const n = Number(String(raw).replace(/[^0-9]/g, '') || 0);
  if (n < 1000) return '1,000원 이상 입력해 주세요. 0원 할인은 제안할 수 없어요.';
  if (n >= maxExcl) return `${own ? '이 상품 ' : ''}월 결제금액(${won(maxExcl)})보다 적게 입력해 주세요. 할인 후 결제금액이 0원 이하가 돼요.`;
  if (n % 1000) return '1,000원 단위로 입력해 주세요.';
  return null;
}
const brError = (cfg) => cfg.move_on && !cfg.branches.length ? '지점을 1곳 이상 골라 주세요. 안내할 지점이 없으면 이 제안을 꺼 주세요.' : null;
const following = (d, cfg) => products(d).filter((p) => !cfg.own[p.id]);
// 따로 설정한 상품은 센터 기본 상한 계산에서 뺀다. 모두 따로 설정이면 새 상품에만 쓰이므로 상한 없음.
const minFollow = (d, cfg) => { const f = following(d, cfg); return f.length ? Math.min(...f.map((p) => p.p)) : Infinity; };
function adminErrors(d, cfg) {
  const own = {};
  for (const p of products(d)) { const o = cfg.own[p.id]; const e = o && o.price_on ? discError(o.discRaw, p.p, true) : null; if (e) own[p.id] = e; }
  return { disc: cfg.price_on ? discError(cfg.discRaw, minFollow(d, cfg)) : null, br: brError(cfg), own, n: (cfg.price_on && discError(cfg.discRaw, minFollow(d, cfg)) ? 1 : 0) + (brError(cfg) ? 1 : 0) + Object.keys(own).length };
}

function adminCard(no, key, reasons, offer, on, body) {
  const st = on ? '<span class="chip ok">켜짐</span>' : '<span class="chip off">꺼짐</span>';
  return `<div class="c${on ? '' : ' offc'}" data-card="${key}"><div class="ch"><span class="no">${no}</span><div class="ti"><div class="r">회원이 고른 이유 · ${reasons}</div><div class="o">${offer}</div></div>`
    + `${st}<span class="sw${on ? ' on' : ''}" data-act="sw" data-k="${key}" role="switch" aria-checked="${on}"></span></div><div class="cb">${body}</div></div>`;
}
const RULE_NOTICE = (mt) => `<div class="notice" style="margin-top:${mt}px"><b>구독 상품을 2개 이상 쓰는 회원에게는 제안을 상품마다 한 번씩 보여줘요.</b> 같은 상품은 해지를 철회하고 다시 들어와도 제안이 다시 보이지 않아요.</div>`;
const summ = (c) => [c.price_on ? `할인 ${won(c.disc)}` : '할인 안 함', c.skip_on ? '쉬어가기 켜짐' : '쉬어가기 꺼짐'];
const ownN = (cfg) => Object.values(cfg.own).filter(Boolean).length;
function adminTabs(d, cfg, tab) {
  return `<div class="tabs2"><span class="${tab === 'center' ? 'on' : ''}" data-act="tab" data-v="center">센터 기본 설정</span>`
    + `<span class="${tab === 'prod' ? 'on' : ''}" data-act="tab" data-v="prod">상품별 설정 <span class="n">${products(d).length}개 중 따로 ${ownN(cfg)}</span></span></div>`;
}
function centerCards(d, cfg, e) {
  const FALL = cfg.keep_on ? '<div class="fall">꺼져 있어요. 이 이유를 고른 회원에겐 <b>5번 «지금 가격 유지 안내»</b>를 보여줘요.</div>'
    : '<div class="fall">꺼져 있어요. 5번도 꺼져 있어서 이 이유를 고른 회원은 <b>제안 없이 바로 해지 예약</b>돼요.</div>';
  const min = minFollow(d, cfg);
  let b1 = FALL;
  if (cfg.price_on) {
    b1 = `<div class="f"><div class="lb">할인 금액 <span class="chip req">필수</span></div><div class="inl"><div class="in num${e.disc ? ' bad' : ''}"><input id="disc" inputmode="numeric" autocomplete="off" value="${esc(cfg.discRaw)}" aria-label="할인 금액"></div><span class="unit">원 · 다음 결제 1회</span></div>`
      + (e.disc ? `<div class="errt">${ERR}<span id="discErr">${e.disc}</span></div>` : `<div class="hint">1,000원 단위 · 1,000원 이상, <b>회원의 월 결제금액보다 적게</b>${min < Infinity ? `(센터 기본을 따르는 상품 중 가장 낮은 월 결제금액 ${won(min)} 기준)` : '(지금은 모든 상품이 따로 설정 — 새로 만든 상품에 적용)'}</div>`) + '</div>';
    if (!e.disc) { const dn = cfg.disc; b1 += `<div class="prev">회원에게 보이는 문구 · «다음 결제 <b>${won(dn)}</b> 할인» — ${d.next_md} 결제 ${won(d.price)} → <b>${won(d.price - dn)}</b></div>`; }
  }
  const c1 = adminCard(1, 'price_on', '가격이 부담돼요', '다음 결제 1회 할인', cfg.price_on, b1);
  let b2;
  if (cfg.skip_on) b2 = '<div class="fall">다음 결제를 한 번 건너뛰고 한 달 쉬어요(쉬는 동안 입장 불가). 이후 <b>같은 금액으로 자동 재개</b>돼요. 설정할 값은 없어요.</div>';
  else {
    const tgt = cfg.price_on ? '<b>1번 «다음 결제 1회 할인»</b>으로 대신 보여줘요' : cfg.keep_on ? '1번 할인도 꺼져 있어서 <b>5번 «지금 가격 유지 안내»</b>를 보여줘요' : '1번·5번도 꺼져 있어서 <b>제안 없이 바로 해지 예약</b>돼요';
    b2 = `<div class="fall">꺼져 있으면 이 이유를 고른 회원에게 ${tgt}.</div>`;
  }
  const c2 = adminCard(2, 'skip_on', '바빠서 갈 시간이 없어요 · 다쳐서 쉬어야 해요 · 여행·출장을 가요', '한 달 쉬어가기 (결제 1회 건너뛰기)', cfg.skip_on, b2);
  let b3 = FALL;
  if (cfg.move_on) {
    const brs = cfg.branches.map(([n, a], i) => `<div class="brr"><div style="min-width:0"><div class="n">${esc(n)}</div><div class="a">${esc(a)}</div></div><span class="x" data-act="brDel" data-i="${i}">빼기</span></div>`).join('');
    b3 = `<div class="f"><div class="lb">안내할 지점 <span class="chip req">필수</span><span style="font-weight:500;color:var(--text3);font-size:12px">1~3곳 · ${cfg.branches.length}/3</span></div>`
      + `<div class="brs">${brs}<div class="add${e.br ? ' bad' : ''}" data-act="brAdd">+ 지점 추가 (니짐내짐 센터 검색)</div></div>`
      + (e.br ? `<div class="errt">${ERR}${e.br}</div>` : '<div class="hint">회원 화면엔 지점 이름·주소만 보여요. 지점을 옮겨 이용하는 방법은 각 지점이 안내해요.</div>') + '</div>';
  }
  const c3 = adminCard(3, 'move_on', '이사를 가요', '가까운 다른 지점 안내', cfg.move_on, b3);
  let b4 = FALL;
  if (cfg.eff_on) {
    const k = cfg.eff_kind;
    b4 = `<div class="f"><div class="lb">드릴 혜택 <span class="chip req">필수</span></div><div class="rads"><div class="rad${k === 'pt' ? ' on' : ''}" data-act="eff" data-v="pt"><span class="d"></span>PT 1회 체험권</div><div class="rad${k === 'inbody' ? ' on' : ''}" data-act="eff" data-v="inbody"><span class="d"></span>인바디 측정권</div></div>`
      + '<div class="hint">받으면 회원 <b>내 쿠폰함</b>에 들어가요 · 사용 기한 30일 · 1인 1회</div></div>';
  }
  const c4 = adminCard(4, 'eff_on', '운동 효과가 없어요', 'PT 1회 체험 또는 인바디 측정 무료', cfg.eff_on, b4);
  const b5 = cfg.keep_on ? '<div class="fall">«기타(직접 입력)»을 고른 회원에게 지금 이용 금액이 유지된다는 안내만 보여줘요. 설정할 값은 없어요.</div>'
    : '<div class="fall">꺼져 있어요. «기타»를 고른 회원은 제안 없이 바로 해지 예약돼요.</div>';
  const c5 = adminCard(5, 'keep_on', '기타(직접 입력) · 그리고 위에서 꺼진 이유', '지금 가격 유지 안내', cfg.keep_on, b5);
  return c1 + c2 + c3 + c4 + c5;
}
// 상품 줄 편집칸(스위치 켠 상품만): ①할인 켜기·금액 ②쉬어가기 켜기 — 시안 C2·C3 editor()
function prodEditor(d, cfg, p, o, err) {
  const fiveOr = cfg.keep_on ? '<b>5번 «지금 가격 유지 안내»</b>를 보여줘요' : '5번도 꺼져 있어서 <b>제안 없이 바로 해지 예약</b>돼요';
  const tg = (k, on) => `<div class="tg"><span class="sw${on ? ' on' : ''}" data-act="osw" data-p="${p.id}" data-k="${k}" role="switch" aria-checked="${on}"></span>${on ? '켜짐' : '꺼짐'}</div>`;
  let r1;
  if (o.price_on) {
    r1 = tg('price_on', true) + `<div class="f" style="margin-top:10px"><div class="lb">할인 금액 <span class="chip req">필수</span></div>`
      + `<div class="inl"><div class="in num${err ? ' bad' : ''}"><input id="od-${p.id}" class="odisc" data-p="${p.id}" inputmode="numeric" autocomplete="off" value="${esc(o.discRaw)}" aria-label="${esc(p.n)} 할인 금액"></div><span class="unit">원 · 다음 결제 1회</span></div>`
      + (err ? `<div class="errt">${ERR}<span class="oerr">${err}</span></div>`
        : `<div class="hint">1,000원 단위 · 1,000원 이상, <b>이 상품 월 결제금액(${won(p.p)})보다 적게</b></div>`
        + `<div class="prev" style="margin-top:8px">회원에게 보이는 문구 · «다음 결제 <b>${won(o.disc)}</b> 할인» — <span style="white-space:nowrap">${d.next_md} 결제 ${won(p.p)} → <b>${won(p.p - o.disc)}</b></span></div>`) + '</div>';
  } else r1 = tg('price_on', false) + `<div class="fall" style="margin-top:8px">이 상품은 «가격이 부담돼요»를 고른 회원에게 ${fiveOr}.</div>`;
  const r2 = o.skip_on ? tg('skip_on', true) + '<div class="fall" style="margin-top:8px">다음 결제를 한 번 건너뛰고 한 달 쉬어요. 이후 같은 금액으로 자동 재개돼요.</div>'
    : tg('skip_on', false) + `<div class="fall" style="margin-top:8px">이 이유를 고른 회원에게 ${o.price_on ? '<b>위 할인 제안</b>을 대신 보여줘요' : fiveOr}.</div>`;
  const [a, b] = summ(cfg);
  return `<div class="ped"><div class="rw"><div class="rl">가격이 부담돼요<b>다음 결제 1회 할인</b></div><div>${r1}</div></div>`
    + `<div class="rw"><div class="rl">바빠서 · 다쳐서 · 여행·출장<b>한 달 쉬어가기</b></div><div>${r2}</div></div>`
    + `<div class="ft">이사·운동 효과·기타 제안은 이 상품도 <b>센터 기본 설정</b>을 따라요. 스위치를 끄면 위 값은 지워지고 센터 기본(${a} · ${b})으로 돌아가요.</div></div>`;
}
function prodRow(d, cfg, p, open, err) {
  const o = cfg.own[p.id];
  const meta = `월 ${won(p.p)}` + (p.ev ? ' · <span class="ev">이벤트가</span>' : '') + (p.added && !o ? ` · ${p.added}` : '');
  let st;
  if (o) {
    const [a, b] = summ(o);
    st = `<div class="ps own${err ? ' bad' : ''}"><div class="h"><span class="chip own">따로 설정</span><span class="lnk" data-act="popen" data-p="${p.id}">${open ? '접기' : '수정'}</span></div>`
      + `<div class="v">${err ? '할인 금액을 고쳐 주세요' : `<b>${a}</b> · <b>${b}</b>`}</div></div>`;
  } else { const [a, b] = summ(cfg); st = `<div class="ps"><div class="h">센터 기본 따름</div><div class="v">${a} · ${b}</div></div>`; }
  const sw = `<div class="pw"><span class="l${o ? ' on' : ''}">이 상품만 따로 설정</span><span class="sw${o ? ' on' : ''}" data-act="psw" data-p="${p.id}" role="switch" aria-checked="${!!o}" aria-label="${esc(p.n)} 따로 설정"></span></div>`;
  return `<div class="prow" data-pid="${p.id}"><div class="pr"><div class="pn"><div class="t">${esc(p.n)}</div><div class="m">${meta}</div></div>${st}${sw}</div>`
    + (o && open ? prodEditor(d, cfg, p, o, err) : '') + '</div>';
}
function adminScreen(d, cfg, ui) {
  const e = adminErrors(d, cfg), tab = ui.tab || 'center', P = products(d);
  const onN = ['price_on', 'skip_on', 'move_on', 'eff_on', 'keep_on'].filter((k) => cfg[k]).length;
  const errs = e.n;
  let top = '<div class="notice"><b>회원이 구독을 해지할 때 이유를 하나 고르면, 이유에 맞는 제안을 보여줘요.</b> 회원은 같은 화면에서 언제든 «그래도 해지할게요»로 바로 해지 예약할 수 있어요(해지를 막지 않아요). '
    + '라벨 옆 <span class="chip req">필수</span>는 켰을 때 꼭 입력, <span class="chip">선택</span>은 비워도 돼요.</div>';
  let warn = '';
  if (onN === 0) warn += '<div class="notice" style="margin-top:8px;background:#FFF8E6;border-color:#F3DFA8;color:#7A5A00"><b style="color:#7A5A00">제안이 모두 꺼져 있어요.</b> 회원은 이유만 고르고 바로 해지 예약돼요.</div>';
  if (errs) warn += `<div class="notice err" style="margin-top:8px"><b>고칠 곳이 ${errs}개 있어요.</b> 빨간 칸을 고쳐야 저장할 수 있어요.${tab === 'center' && Object.keys(e.own).length ? ' (상품별 설정 탭에도 있어요)' : tab === 'prod' && (e.disc || e.br) ? ' (센터 기본 설정 탭에도 있어요)' : ''}</div>`;
  const pvI = onN === 0 ? -1 : ui.pvI;
  const tabs = ['가격 부담', '바빠서·부상·여행', '이사', '효과 없음', '기타'].map((t, i) => `<span class="tb${i === pvI ? ' on' : ''}" data-act="pv" data-i="${i}">${t}</span>`).join('');
  const sel = tab === 'prod' ? `<div class="sel"><select id="pvsel" aria-label="미리볼 상품">${P.map((p) => `<option value="${p.id}"${p.id === ui.pvP ? ' selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>` : '';
  const pv = `<div class="pv"><div class="t">회원에게 이렇게 보여요</div><div class="s">${tab === 'prod' ? '고른 상품에 실제로 적용되는 값 기준 미리보기' : '저장 전 미리보기 · 실제 회원 화면과 같은 구성'}</div>${sel}<div class="tabs">${tabs}</div>`
    + '<div class="ph"><iframe id="pvf" title="회원 화면 미리보기" tabindex="-1"></iframe></div></div>';
  const fm = errs ? `고칠 곳 ${errs}개 · 저장할 수 없어요` : tab === 'prod' ? `따로 설정 ${ownN(cfg)}개 · ${ui.savedAt}` : `센터 기본 · 켜진 제안 ${onN}/5 · ${ui.savedAt}`;
  const foot = `<div class="foot"><span class="m${errs ? ' e' : ''}" id="footMsg">${fm}</span>`
    + `<span class="b sec" data-act="revert">되돌리기</span><span class="b ${errs ? 'dis' : 'pri'}" data-act="save" aria-disabled="${!!errs}">저장</span></div>`;
  let body;
  if (tab === 'center') {
    const f = following(d, cfg);
    const scope = `<div class="scope"><span>이 설정이 적용되는 상품 <b>${f.length}개</b> / 구독 상품 ${P.length}개 · 새로 만든 구독 상품도 자동으로 적용돼요.</span>`
      + (ownN(cfg) ? `<span class="lnk" data-act="tab" data-v="prod">따로 설정한 상품 ${ownN(cfg)}개 보기</span>` : '') + '</div>';
    body = top + warn + adminTabs(d, cfg, tab) + scope + RULE_NOTICE(10) + `<div class="wrap"><div>${centerCards(d, cfg, e)}</div>${pv}</div>`;
  } else {
    const [a, b] = summ(cfg);
    const t2 = '<div class="notice"><b>상품마다 «이 상품만 따로 설정»을 켜면 할인 금액과 쉬어가기를 그 상품에만 따로 정할 수 있어요.</b> '
      + `끈 상품은 센터 기본 설정(${a} · ${b})을 따르고, 새로 만든 구독 상품도 자동으로 센터 기본을 따라요.</div>` + RULE_NOTICE(8);
    const lst = `<div class="plist"><div class="plh"><span>구독 상품 ${P.length}개</span><span>해지 회유 제안</span><span style="text-align:right">상품별 설정</span></div>`
      + P.map((p) => prodRow(d, cfg, p, ui.open === p.id || !!e.own[p.id], e.own[p.id])).join('') + '</div>';
    body = adminTabs(d, cfg, tab) + t2 + warn + `<div class="wrap">${lst}${pv}</div>`;
  }
  const main = `<div class="content"><div class="ph"><div><h1>해지 회유 설정</h1><div class="sub">구독 멤버십 · ${esc(d.center)}</div></div></div>` + body + '</div>' + foot;
  return `<div class="app">${side()}<div class="main">${main}</div></div>`;
}
// 미리보기 탭 → 그 이유를 고른 회원이 보게 될 화면(제안 없으면 A1 «바로 해지 예약»)
const PV_REASON = ['price', 'busy', 'move', 'effect', 'etc'];
function previewHTML(d, cfg, pvI) {
  const onN = ['price_on', 'skip_on', 'move_on', 'eff_on', 'keep_on'].filter((k) => cfg[k]).length;
  const reason = pvI < 0 || onN === 0 ? 'busy' : PV_REASON[pvI];
  const kind = resolveOffer(reason, cfg, null, null);
  const inner = kind ? A2(d, kind, reason, cfg, reason === 'etc' ? d.etc_text : '') : A1(d, reason, '', true);
  return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
    + '<link rel="stylesheet" href="app.css"><link rel="stylesheet" href="proto.css"></head><body class="pvbody"><div class="phone">' + inner + '</div></body></html>';
}
