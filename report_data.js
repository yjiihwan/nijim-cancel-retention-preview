// v1.6(11-18) «회유 성과» 시험 데이터 — 서버 cancel_requests(+결제·일시정지·쿠폰 연결)를 화면용으로 펼친 모양. 더미 회원·연락처.
// 칸: c 센터 · mid 회원 · nm 이름 · ph 연락처 · pr 멤버십 · r 해지 이유 · rt 직접 입력 · o 보여 준 제안(offer_type, null=제안 없음)
//     amt 할인 금액 · ok 혜택 받음(offer_accepted) · res 결과 · at 회유 화면 본 때(=혜택 받은 때) · nx 다음 결제일(할인 결제·쉬어가기 시작)
//     paid 할인가 결제한 날 · rs 쉬어가기 끝(다시 결제) · exp 체험권 기한 · used 체험권 쓴 날 · eff 해지 종료일 · later 혜택 받은 뒤 다시 해지({at, eff})
'use strict';
const RP_CENTERS = [
  { id: 'c_ydp', n: '엔짐 영등포점' },
  { id: 'c_gn', n: '엔짐 강남역점' },
  { id: 'c_pg', n: '엔짐 판교점' },
  { id: 'c_ss', n: '엔짐 성수점' }, // 회유 기록 0건 센터(빈 화면 확인용)
];
const RP_H = '헬스 구독멤버십', RP_PT = 'PT 1:1 프리미엄 24회 + 헬스 6개월 패키지';
const RP_SEED = [
  // ── 엔짐 영등포점 · 10월(이번 달) — 회유 화면 17건 = 혜택 11(할인 4·쉬어가기 3·체험권 3·가격 유지 1) + 결국 해지 4 + 그 밖 2
  { c: 'c_ydp', mid: 'm_2001', nm: '김서연', ph: '010-3812-4471', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-10-02 19:12', nx: '2026-10-09', paid: '2026-10-09' },
  { c: 'c_ydp', mid: 'm_2002', nm: '박준호', ph: '010-5527-0193', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-10-06 08:40', nx: '2026-10-14', paid: '2026-10-14', later: { at: '2026-10-19 22:05', eff: '2026-11-14' } },
  { c: 'c_ydp', mid: 'm_2003', nm: '이하은', ph: '010-7744-2089', pr: RP_PT, r: 'busy', o: 'discount', amt: 100000, ok: true, res: 'kept', at: '2026-10-11 21:03', nx: '2026-10-20', paid: '2026-10-20' },
  { c: 'c_ydp', mid: 'm_2004', nm: '정민재', ph: '010-2290-6618', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-10-21 12:30', nx: '2026-11-03' },
  { c: 'c_ydp', mid: 'm_2005', nm: '최유나', ph: '010-4471-3350', pr: RP_H, r: 'busy', o: 'skip_payment', ok: true, res: 'kept', at: '2026-10-03 07:55', nx: '2026-10-08', rs: '2026-11-08' },
  { c: 'c_ydp', mid: 'm_2006', nm: '한도윤', ph: '010-6630-1187', pr: '헬스+GX 구독멤버십', r: 'hurt', o: 'skip_payment', ok: true, res: 'kept', at: '2026-10-15 22:10', nx: '2026-10-28', rs: '2026-11-28' },
  { c: 'c_ydp', mid: 'm_2007', nm: '윤채원', ph: '010-9915-4402', pr: '필라테스 그룹 주 2회 구독멤버십', r: 'trip', o: 'skip_payment', ok: true, res: 'kept', at: '2026-10-17 13:20', nx: '2026-10-25', rs: '2026-11-25', later: { at: '2026-10-22 18:40', eff: '2026-10-25' } },
  { c: 'c_ydp', mid: 'm_2008', nm: '강지후', ph: '010-3307-5521', pr: RP_H, r: 'effect', o: 'pt_coupon', ok: true, res: 'kept', at: '2026-10-04 18:00', exp: '2026-11-03', used: '2026-10-12' },
  { c: 'c_ydp', mid: 'm_2009', nm: '조아린', ph: '010-8826-1049', pr: RP_H, r: 'effect', o: 'pt_coupon', ok: true, res: 'kept', at: '2026-10-10 20:45', exp: '2026-11-09' },
  { c: 'c_ydp', mid: 'm_2010', nm: '임시우', ph: '010-1158-7730', pr: RP_H, r: 'effect', o: 'pt_coupon', ok: true, res: 'kept', at: '2026-10-19 09:30', exp: '2026-11-18', used: '2026-10-22' },
  { c: 'c_ydp', mid: 'm_2011', nm: '오세훈', ph: '010-2741-6655', pr: RP_H, r: 'etc', rt: '주차가 너무 불편해서요.', o: 'keep_notice', ok: true, res: 'kept', at: '2026-10-08 11:15' },
  { c: 'c_ydp', mid: 'm_2012', nm: '서지민', ph: '010-4402-8813', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: false, res: 'ended', at: '2026-10-05 23:02', eff: '2026-10-12' },
  { c: 'c_ydp', mid: 'm_2013', nm: '신예준', ph: '010-7718-2264', pr: RP_H, r: 'busy', o: 'skip_payment', ok: false, res: 'reserved', at: '2026-10-13 07:21', eff: '2026-11-13' },
  { c: 'c_ydp', mid: 'm_2014', nm: '권나윤', ph: '010-5590-3378', pr: RP_PT, r: 'effect', o: 'pt_coupon', ok: false, res: 'reserved', at: '2026-10-18 16:48', eff: '2026-11-02' },
  { c: 'c_ydp', mid: 'm_2015', nm: '황민서', ph: '010-6083-9921', pr: RP_H, r: 'etc', rt: '회사가 멀리 옮겨서 다니기 어려워요.', o: 'keep_notice', ok: false, res: 'reserved', at: '2026-10-22 20:11', eff: '2026-11-15' },
  { c: 'c_ydp', mid: 'm_2016', nm: '송하람', ph: '010-3349-0072', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: false, res: 'withdrawn', at: '2026-10-09 10:02' },
  { c: 'c_ydp', mid: 'm_2017', nm: '배수아', ph: '010-8810-4436', pr: RP_H, r: 'busy', o: 'skip_payment', ok: false, res: 'abandoned', at: '2026-10-16 14:37' },
  // 회유 화면 없이 해지(이사·이미 제안 본 회원) — 회유 성과에 넣지 않음
  { c: 'c_ydp', mid: 'm_2018', nm: '문태오', ph: '010-2219-8840', pr: RP_H, r: 'move', o: null, ok: false, res: 'reserved', at: '2026-10-14 09:12', eff: '2026-11-06' },
  { c: 'c_ydp', mid: 'm_2002', nm: '박준호', ph: '010-5527-0193', pr: RP_H, r: 'price', o: null, skipped: 'already_seen', ok: false, res: 'reserved', at: '2026-10-19 22:05', eff: '2026-11-14' },
  // ── 엔짐 영등포점 · 9월(지난 달) — 회유 화면 6건 = 혜택 5 + 결국 해지 1
  { c: 'c_ydp', mid: 'm_2101', nm: '장윤서', ph: '010-2203-5518', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-09-03 20:20', nx: '2026-09-10', paid: '2026-09-10' },
  { c: 'c_ydp', mid: 'm_2102', nm: '남궁윤재현', ph: '010-9930-1145', pr: '헬스+GX+필라테스 무제한 구독멤버십(연말 D-100 이벤트)', r: 'busy', o: 'skip_payment', ok: true, res: 'kept', at: '2026-09-05 06:58', nx: '2026-09-10', rs: '2026-10-10' },
  { c: 'c_ydp', mid: 'm_2103', nm: '류가은', ph: '010-6612-0089', pr: RP_H, r: 'hurt', o: 'skip_payment', ok: true, res: 'kept', at: '2026-09-20 19:44', nx: '2026-09-28', rs: '2026-10-28' },
  { c: 'c_ydp', mid: 'm_2104', nm: '김태현', ph: '010-4458-2290', pr: RP_H, r: 'effect', o: 'pt_coupon', ok: true, res: 'kept', at: '2026-09-14 21:30', exp: '2026-10-14' },
  { c: 'c_ydp', mid: 'm_2105', nm: '이준서', ph: '010-7739-6620', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: false, res: 'ended', at: '2026-09-25 08:15', eff: '2026-10-02' },
  { c: 'c_ydp', mid: 'm_2106', nm: '표지민', ph: '010-1180-4475', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-09-27 17:05', nx: '2026-10-01', paid: '2026-10-01', later: { at: '2026-10-10 12:00', eff: '2026-11-01' } },
  // ── 엔짐 강남역점 · 10월 — 4건
  { c: 'c_gn', mid: 'm_3001', nm: '오지훈', ph: '010-3021-7745', pr: RP_H, r: 'price', o: 'discount', amt: 15000, ok: true, res: 'kept', at: '2026-10-07 19:50', nx: '2026-10-12', paid: '2026-10-12' },
  { c: 'c_gn', mid: 'm_3002', nm: '백소희', ph: '010-6650-2218', pr: RP_H, r: 'trip', o: 'skip_payment', ok: true, res: 'kept', at: '2026-10-11 08:05', nx: '2026-10-20', rs: '2026-11-20' },
  { c: 'c_gn', mid: 'm_3003', nm: '진우성', ph: '010-8873-0051', pr: RP_H, r: 'effect', o: 'pt_coupon', ok: true, res: 'kept', at: '2026-10-16 12:12', exp: '2026-11-15' },
  { c: 'c_gn', mid: 'm_3004', nm: '하예린', ph: '010-2287-6634', pr: RP_H, r: 'price', o: 'discount', amt: 15000, ok: false, res: 'reserved', at: '2026-10-20 23:40', eff: '2026-11-10' },
  // ── 엔짐 판교점 · 10월 — 2건
  { c: 'c_pg', mid: 'm_4001', nm: '마동현', ph: '010-5501-2290', pr: RP_H, r: 'price', o: 'discount', amt: 10000, ok: true, res: 'kept', at: '2026-10-02 07:30', nx: '2026-10-06', paid: '2026-10-06' },
  { c: 'c_pg', mid: 'm_4002', nm: '여수빈', ph: '010-9087-1123', pr: RP_H, r: 'busy', o: 'skip_payment', ok: false, res: 'ended', at: '2026-10-01 21:00', eff: '2026-10-05' },
];
