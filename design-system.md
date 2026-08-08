# @thejeewon Design System

> **소스 기준:** Weight / Workout / School / Log In & Settings 섹션 실제 페이지 프레임만 참조
> Reference, Claude Generated, Components 섹션 완전 배제

---

## 1. Color Tokens

| Token | Hex | 역할 |
|---|---|---|
| `Primary` | `#E65787` | Brand 핑크 — CTA, 강조 수치, 활성 nav, 활성 토글, 오늘 날짜 |
| `Black` | `#1C1C21` | 사이드바 배경, 페이지 제목, 카드 제목, 입력값 텍스트 |
| `Gray` | `#6B6B76` | 보조 텍스트, 비활성 nav, 인풋 레이블, Cancel 버튼, 시간표 레이블 |
| `Light Gray` | `#9B9BA5` | 카드 레이블, placeholder, 차트 축 텍스트, 테이블 헤더 |
| `Off White` | `#FAFAFA` | 카드 배경, 인풋 배경, 비활성 토글 배경, Save 버튼 텍스트 |
| `White` | `#F8F9FA` | 테이블 홀수 행 배경 |
| `Gray for Backgrounds` | `#F5F5F5` | 전체 페이지 배경, Tip 박스, 테이블 짝수 행 |
| `Gray for Texts and Strokes` | `#E8E8ED` | 카드/인풋 테두리, 구분선, 비활성 토글 테두리 |
| `Green` | `#34A853` | 긍정 변화 (▼ Down ...) |
| `Red` | `#EA4335` | 부정 변화, 오류 상태 |
| `Dim` | `rgba(22,22,22,0.8)` | 모달 dim 오버레이 |

---

## 2. Typography

**Font Family:** `Pretendard`

| Token | Size | Weight | Color | 사용처 |
|---|---|---|---|---|
| `text-logo-sidebar` | 20px | Bold | `Primary` | GNB `@thejeewon` (underline) |
| `text-logo-login` | 32px | Bold | `Primary` | 로그인 카드 `@thejeewon` (underline) |
| `text-tagline` | 14px | Regular | `Gray` | 로그인 서브카피 |
| `text-page-title` | 26px | Bold | `Black` | 페이지 제목 |
| `text-page-desc` | 15px | Regular | `Gray` | 페이지 제목 하단 설명 |
| `text-card-title` | 16px | Bold | `Black` | 카드 제목 |
| `text-metric-value` | 42px | Bold | `Primary` | 주요 지표 수치 (Default / WeightChange) |
| `text-metric-value-muted` | 42px | Bold | `Gray` | 지표 수치 — Starting 상태 |
| `text-metric-unit` | 26px | Bold | `Gray` | 수치 단위 (kg 등) |
| `text-card-label` | 16px | Bold | `Light Gray` | 카드 레이블 (e.g. CURRENT WEIGHT) |
| `text-sub-value` | 15px | Regular | `Light Gray` | 카드 보조 설명 (일반) |
| `text-sub-positive` | 15px | Regular | `Green` | 카드 보조 설명 (긍정, ▼) |
| `text-sub-negative` | 15px | Regular | `Red` | 카드 보조 설명 (부정, ▲) |
| `text-nav-active` | 14px | SemiBold | `Primary` | GNB 활성 nav |
| `text-nav-inactive` | 14px | Medium | `Gray` | GNB 비활성 nav |
| `text-toggle-active` | 12px | SemiBold | `Primary` | 활성 토글 (Week/26-1 등) |
| `text-toggle-inactive` | 12px | Regular | `Gray` | 비활성 토글 |
| `text-axis` | 10px | Regular | `Light Gray` | 차트 Y축 값 |
| `text-axis-x` | 10px | Regular | `Light Gray` | 차트 X축 (일반 요일) |
| `text-axis-x-today` | 10px | Regular | `Primary` | 차트 X축 (오늘, e.g. Sun) |
| `text-table-header` | 12px | SemiBold | `Light Gray` | 테이블 헤더 (DATE, WEIGHT 등) |
| `text-table-date` | 12px | Regular | `Black` | 테이블 날짜 |
| `text-table-time` | 10px | Regular | `Gray` | 테이블 시간 범위 (Workout) |
| `text-table-value-latest` | 12px | SemiBold | `Primary` | 테이블 최신 행 수치 |
| `text-table-value` | 12px | SemiBold | `Black` | 테이블 이전 행 수치 |
| `text-modal-title` | 20px | Bold | `Black` | 모달 제목 |
| `text-input-label` | 12px | SemiBold | `Gray` | 모달 인풋 레이블 |
| `text-input-value` | 14px | Regular | `Black` | 인풋 입력값 |
| `text-placeholder` | 14px | Regular | `Light Gray` | 인풋 placeholder |
| `text-login-label` | 13px | Regular | `Black` | 로그인 인풋 레이블 |
| `text-cta` | 14px | SemiBold | `#FAFAFA` | CTA 버튼 |
| `text-btn-cancel` | 14px | Regular | `Gray` | Cancel 버튼 |
| `text-btn-save` | 14px | SemiBold | `#FAFAFA` | Save Record 버튼 |
| `text-btn-login` | 15px | SemiBold | `White` | Log In 버튼 |
| `text-tip` | 11px | Regular | `Gray` | Tip 박스 |
| `text-timetable-header` | 11px | SemiBold | `Gray` | 시간표 컬럼 헤더 (TIME, MON…) |
| `text-timetable-header-today` | 11px | Bold | `Primary` | 시간표 오늘 컬럼 헤더 |
| `text-timetable-time` | 12px | Regular | `Gray` | 시간표 시간 레이블 (9:00…) |
| `text-timeblock-name` | 12px | SemiBold | `#7C2D12` | Time Block 수업명 |
| `text-timeblock-detail` | 9px | Regular | `#7C2D12` | Time Block 교수명/강의실 |
| `text-footer` | 10px | Regular | `Gray` | 푸터 |

---

## 3. Spacing & Sizing

### 레이아웃

| 항목 | 값 |
|---|---|
| 전체 프레임 | 1440 × 900px |
| GNB 너비 | 240px |
| 콘텐츠 영역 | 1200px |
| 콘텐츠 시작 left | `left-[300px]` |
| 콘텐츠 시작 top | `top-[32px]` |
| 콘텐츠 내부 너비 | 1081px (Weight/Workout) / 1080px (School) |
| 페이지 배경 | `#F5F5F5` |

### GNB

| 항목 | 값 |
|---|---|
| 너비 × 높이 | 240 × 900px |
| 배경 | `#1C1C21` |
| 로고 패딩 | `px-[45px] py-[12px]` |
| 로고 높이 | 64px |
| Nav 시작 top | 111px |
| Nav 항목 높이 | 49px |
| Nav 항목 패딩 | `px-[20px] py-[14px]` |
| 아이콘 ↔ 텍스트 gap | 12px |
| 활성 좌측 바 | 4 × 49px, `#E65787` |
| 활성 배경 | `bg-[rgba(230,87,135,0.15)]` |
| 활성 배경 radius | `rounded-br-[7px] rounded-tr-[7px]` |

### 페이지 타이틀 컴포넌트

| 항목 | 값 |
|---|---|
| 제목 ↔ 설명 gap | 5px |

### Stat Box

| 항목 | 값 |
|---|---|
| 너비 | 345px |
| 패딩 | `px-[24px] py-[22px]` |
| 배경 | `#FAFAFA` |
| 테두리 | `1px solid #E8E8ED` |
| 카드 간 gap | 22px |
| 레이블 ↔ 수치 gap | 5px |
| 수치 ↔ 단위 gap | 7px, `items-end` |

### 차트 카드

| 항목 | 값 |
|---|---|
| 크기 | 714 × 340px |
| 패딩 | `px-[26px] py-[16px]` |
| 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| 헤더 ↔ 차트 gap | 45px (Weight) |
| 토글 간 gap | 9px |

### 테이블 카드

| 항목 | 값 |
|---|---|
| 크기 | 345 × 340px |
| 패딩 | `px-[24px] py-[16px]` |
| 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| 제목 ↔ 테이블 gap | 20px |
| Weight 행 높이 | 40px, `px-[16px] py-[10px]` |
| Workout 행 높이 | 50px, `px-[10px] py-[8px]` |
| 교번 배경 | `#F5F5F5` / `#F8F9FA` |

### Week/Month 토글 (학기 탭도 동일)

| 항목 | 값 |
|---|---|
| 크기 | 64 × 29px |
| 패딩 | `px-[15px] py-[9px]` |
| 간격 | 9px |
| 활성 배경 | `bg-[rgba(230,87,135,0.15)]` |
| 비활성 배경 | `bg-[#FAFAFA] border border-[#E8E8ED]` |

### CTA Button

| 항목 | 값 |
|---|---|
| 크기 | full-width × 48px |
| 패딩 | `px-[399px] py-[15px]` |
| 배경 | `#E65787` |

### 모달

| 항목 | Weight | Workout |
|---|---|---|
| 패딩 | `px-[37px] py-[34px]` | 동일 |
| 내부 너비 | 323px | 동일 |
| 배경 | `#FAFAFA` | 동일 |
| 전체 내부 gap | 60px | 동일 |
| 헤더 gap | 20px (제목↔구분선) | 동일 |
| 헤더↔필드 gap | 30px | 동일 |
| 필드 간 gap | 19px | 동일 |
| 레이블↔인풋 gap | 10px | 동일 |
| 버튼 gap | 20px | 동일 |
| 닫기 버튼 | 28px | 동일 |
| Tip 박스 높이 | 87px | 74px |

### 모달 인풋 / 버튼

| 항목 | 값 |
|---|---|
| 인풋 높이 | 48px |
| 인풋 패딩 | `px-[20px] py-[14px]` |
| 인풋 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| 버튼 크기 | 150 × 48px |
| 버튼 패딩 | `px-[15px] py-[9px]` |
| Cancel 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| Save 배경 | `#E65787` |

### Tip 박스

| 항목 | 값 |
|---|---|
| 배경 | `#F5F5F5` |
| 패딩 | `px-[20px] py-[5px]` |

### Log In

| 항목 | 값 |
|---|---|
| 카드 크기 | 400 × 400px |
| 카드 패딩 | `px-[40px] py-[28px]` |
| 카드 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| 내부 너비 | 320px |
| 로고↔필드 gap | 30px |
| 로고 텍스트 gap | 10px |
| 필드 간 gap | 19px |
| 레이블↔인풋 gap | 7px |
| 인풋 높이 | 48px |
| 인풋 패딩 | `px-[20px] py-[15px]` |
| 인풋 배경 | `#FAFAFA`, `1px solid #E8E8ED` |
| Log In 버튼 크기 | full-width × 48px |
| Log In 버튼 패딩 | `px-[139px] py-[14px]` |
| Log In 버튼 배경 | `#E65787` |

### School Timetable

| 항목 | 값 |
|---|---|
| 시간표 컨테이너 | 1080 × 680px, `bg-white` |
| 컨테이너 위치 | `left-[300px] top-[112px]` |
| Time Block 크기 | 182 × 168px |
| Time Block 패딩 | `px-[14px] py-[16px]` |
| Time Block 배경 | `rgba(254,215,170,0.9)` |
| Time Block 테두리 | `2px solid #F97316` |
| Time Block 텍스트 | `#7C2D12` |
| 수업명↔상세 gap | 7px |
| 교수명↔강의실 gap | 2px |

### Footer

| 항목 | 값 |
|---|---|
| 크기 | 174 × 12px |
| 위치 | `left-[1206px] top-[853px]` |

---

## 4. Border Radius Tokens

| Token | 값 | 사용처 |
|---|---|---|
| `radius-card` | `12px` | Stat Box, Chart Card, Table Card, 시간표 컨테이너, Login 카드 |
| `radius-modal` | `12px` | 모달 컨테이너 전체 |
| `radius-cta` | `12px` | CTA 버튼 |
| `radius-nav-active` | `rounded-br-[7px] rounded-tr-[7px]` | GNB 활성 nav 배경 (우측만) |
| `radius-table-row` | `7px` | 테이블 행 전체 (헤더·데이터) |
| `radius-sm` | `4px` | 모달 인풋, 모달 버튼(Cancel/Save), Toggle, Tip 박스, Time Block, 로그인 인풋, Log In 버튼 |
| `radius-bar` | `5px` | Workout 바 차트 bar 요소 |

---

## 5. Effects

| Token | 값 |
|---|---|
| `shadow-modal` | `0 0 0 1px rgba(84,72,49,0.10)` + `0 4px 12px -1px rgba(0,0,0,0.12)` + `0 20px 48px -8px rgba(17,17,17,0.24)` |

---

## 6. Components

### GNB
```
배경: #1C1C21, 240 × 900px

로고: @thejeewon — 20px Bold, #E65787, underline
  패딩: px-[45px] py-[12px], h-[64px]

Nav (상단): Weight / Workout / School
Nav (하단 고정): Settings

[활성]
  배경: bg-[rgba(230,87,135,0.15)], rounded-br-[7px] rounded-tr-[7px]
  좌측 바: 4 × 49px, #E65787
  텍스트: 14px SemiBold, #E65787

[비활성]
  배경 없음, 좌측 바 없음
  텍스트: 14px Medium, #6B6B76
```

### Stat Box
```
w-[345px], 패딩 px-[24px] py-[22px]
bg-[#FAFAFA], border 1px solid #E8E8ED, rounded-[12px]

레이블: 16px Bold, #9B9BA5
수치: 42px Bold
  Default / WeightChange → #E65787
  Starting → #6B6B76
단위: 26px Bold, #6B6B76, gap-[7px] items-end

보조: 15px Regular
  일반 → #9B9BA5 | 긍정 → #34A853 | 부정 → #EA4335
```

### Chart Card
```
714 × 340px, px-[26px] py-[16px]
bg-[#FAFAFA], border 1px solid #E8E8ED, rounded-[12px]

제목: 16px Bold, #1C1C21

[Toggle] 64 × 29px, px-[15px] py-[9px], rounded-[4px], gap 9px
  Active:   bg-[rgba(230,87,135,0.15)], 12px SemiBold, #E65787
  Inactive: bg-[#FAFAFA] border-[#E8E8ED], 12px Regular, #6B6B76

차트 라인: #E65787, fill rgba(230,87,135,0.2~0.3)
데이터 포인트: 10px 원, #E65787
Today 포인트: 12px 원, #E65787
X축: 10px Regular, #9B9BA5 (일반) / #E65787 (오늘)
Y축: 10px Regular, #9B9BA5

Workout 바 차트 bar: #E65787, rounded-[5px]
```

### Table Card (Weight)
```
345 × 340px, px-[24px] py-[16px]
bg-[#FAFAFA], border 1px solid #E8E8ED, rounded-[12px]

제목: 16px Bold, #1C1C21
제목↔테이블 gap: 20px

헤더 행: 40px, px-[16px] py-[10px], rounded-[7px]
  DATE / WEIGHT: 10px SemiBold, #9B9BA5

데이터 행: 40px, px-[16px] py-[10px], rounded-[7px]
  교번: #F5F5F5 / #F8F9FA
  날짜: 12px Regular, #1C1C21
  수치(최신): 14px SemiBold, #E65787
  수치(이전): 14px SemiBold, #1C1C21
```

### Table Card (Workout)
```
345 × 340px, px-[24px] py-[16px]
bg-[#FAFAFA], border 1px solid #E8E8ED, rounded-[12px]

제목: "Recent Workouts" — 16px Bold, #1C1C21

헤더 행: 40px, px-[16px] py-[10px], rounded-[7px]
  DATE & TIME / DURATION: 10px SemiBold, #9B9BA5

데이터 행: 50px, px-[10px] py-[8px], rounded-[7px]
  교번: #F5F5F5 / #F8F9FA
  날짜: 12px Regular, #1C1C21
  시간: 10px Regular, #6B6B76
  수치(최신): 14px SemiBold, #E65787
  수치(이전): 14px SemiBold, #1C1C21
```

### CTA Button
```
w-full × 48px, px-[399px] py-[15px]
bg-[#E65787], rounded-[12px]
텍스트: 14px SemiBold, #FAFAFA

Weight:  + Add New Weight Record
Workout: + Add New Workout Session
```

### Modal — Weight
```
px-[37px] py-[34px], 내부 323px
bg-[#FAFAFA], rounded-[12px], shadow-modal
전체 gap: 60px

[헤더] gap: 20px
  제목: "Add New Weight Record" — 20px Bold, #1C1C21
  닫기: 28px
  구분선: 1px, #E8E8ED

[헤더↔필드] gap: 30px

[필드] 간 gap: 19px, 레이블↔인풋: 10px
  DATE
    레이블: 12px SemiBold, #6B6B76
    인풋: 48px, bg-[#FAFAFA] border-[#E8E8ED] rounded-[4px] px-[20px] py-[14px]
    값: 14px Regular, #1C1C21

  WEIGHT
    레이블: 12px SemiBold, #6B6B76
    인풋: 48px, 동일
    placeholder 좌: "Enter weight" — 14px Regular, #9B9BA5
    placeholder 우: "kg" — 14px Regular, #9B9BA5

  Tip 박스: h-[87px], bg-[#F5F5F5] rounded-[4px] px-[20px] py-[5px]
    11px Regular, #6B6B76
    "💡 Tip / Weigh yourself at the same time each day..."

[버튼] gap: 20px
  Cancel:      150 × 48px, bg-[#FAFAFA] border-[#E8E8ED] rounded-[4px] px-[15px] py-[9px], 14px Regular, #6B6B76
  Save Record: 150 × 48px, bg-[#E65787] rounded-[4px] px-[15px] py-[9px], 14px SemiBold, #FAFAFA
```

### Modal — Workout
```
패딩/배경/shadow: Weight 모달과 동일
Tip 박스 높이: 74px (Weight는 87px)

[헤더] 제목: "Add New Workout Session"

[필드]
  DATE: Weight 모달과 동일

  START TIME
    레이블: 12px SemiBold, #6B6B76
    인풋: 48px, 동일 스타일
    placeholder: "Select time" — 14px Regular, #9B9BA5

  DURATION
    레이블: 12px SemiBold, #6B6B76
    인풋: 48px, 동일 스타일
    placeholder 좌: "Enter duration" — 14px Regular, #9B9BA5
    placeholder 우: "min" — 14px Regular, #9B9BA5

  Tip 박스: h-[74px]
    "💡 Tip / Log your workout right after you finish..."

[버튼] Cancel / Save Record — Weight 모달과 동일
```

### Log In
```
전체: 1440 × 900px, 배경 이미지

카드: 400 × 400px
  bg-[#FAFAFA] border 1px solid #E8E8ED rounded-[12px]
  px-[40px] py-[28px], 내부 너비: 320px

로고: "@thejeewon" — 32px Bold, #E65787, underline, 중앙
  로고↔서브카피 gap: 10px
서브카피: "Dear diary, I love my life." — 14px Regular, #6B6B76, 중앙

로고 섹션↔필드 gap: 30px
필드 간 gap: 19px
레이블↔인풋 gap: 7px

레이블: 13px Regular, #1C1C21
인풋: 48px, bg-[#FAFAFA] border-[#E8E8ED] rounded-[4px] px-[20px] py-[15px]
placeholder: 14px Regular, #9B9BA5

Log In 버튼: full-width × 48px, bg-[#E65787] rounded-[4px] px-[139px] py-[14px]
  텍스트: 15px SemiBold, White
```

### School Timetable
```
시간표 컨테이너: 1080 × 680px, bg-white, rounded-[12px]
위치: left-[300px] top-[112px]

컬럼 헤더: TIME / MON / TUE / WED / THU / FRI
  11px SemiBold, #6B6B76 (일반) / 11px Bold, #E65787 (오늘)

시간 레이블: 12px Regular, #6B6B76

학기 탭 (26-1 / 26-2): Week/Month 토글과 동일 스타일
  → 64 × 29px, rounded-[4px], px-[15px] py-[9px]

[Time Block] 182 × 168px
  bg-[rgba(254,215,170,0.9)]
  border: 2px solid #F97316
  rounded-[4px]
  px-[14px] py-[16px]
  텍스트: #7C2D12
  수업명: 12px SemiBold / 상세: 9px Regular
  수업명↔상세 gap: 7px / 교수↔강의실 gap: 2px
```

### Footer
```
174 × 12px
"Copyright © 황지원. All rights reserved." — 10px Regular, #6B6B76
위치: left-[1206px] top-[853px]
```

---

## 7. Page Structure

| Page | Frame ID | 구성 |
|---|---|---|
| Weight Dashboard | `11:2306` | GNB + Stat Box ×3 + Chart Card + Recent Records + CTA |
| Weight Modal | `84:1215` | Weight Dashboard + Dim + Modal |
| Workout Dashboard | `84:1471` | GNB + Stat Box ×3 + Chart Card + Recent Workouts + CTA |
| Workout Modal | `94:658` | Workout Dashboard + Dim + Modal |
| School 26-1 | `104:1086` | GNB + 시간표 컨테이너 + 학기 탭 |
| School 26-2 | `142:2172` | placeholder |
| School Class Workspace | `133:778` | 시간표 + 우측 슬라이드 패널 |
| Log In | `142:2322` | 배경 이미지 + 로그인 카드 + Footer |
| Settings | `158:2385` | placeholder |

---

## 8. Interaction Rules

- 버튼 / 행 hover: `transition-colors duration-200`
- Input focus: `border-[#E65787]` focus ring
- 활성 nav 전환: `transition-colors`
- 모달 dim: `bg-[rgba(22,22,22,0.8)]`
- 데이터 저장: `localStorage`
- 로그인: 하드코딩 인증 (ID: `jeewonhwang` / PW: `jeewonhwang`)