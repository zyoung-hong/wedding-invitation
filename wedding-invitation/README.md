# 신조현 · 홍지영 모바일 청첩장

2027년 1월 31일 일요일 낮 12시. React + Vite, 8개 에디토리얼 섹션, 모바일 우선 반응형 웹입니다. RSVP는 없습니다.

## 현재 상태

첨부한 최종 시안을 바탕으로 에디토리얼 구성을 구현하고, 한복·레트로 사진 10장을 원본 바이트 그대로 반영했습니다. 영문 이름은 JOHYUN · JIYOUNG입니다. 크림색 지면, 이탤릭 문구, 사진 겹침, 세로 캡션, 날짜 타이포그래피를 더했습니다. 예식장은 제이오스티엘(서울특별시 구로구 경인로 565)이며 지도 연결과 구로역 교통 안내를 반영했습니다. 홀/층·주차 조건·연락처·계좌·음원은 확인 또는 입력이 필요합니다. 업로드는 실제 저장소 설정 전에는 비활성화됩니다. 이 프로젝트는 배포되지 않았습니다.

주소·교통 확인 출처: [예식장 채용 공고의 사업장 주소](https://m.saramin.co.kr/job-search/view?rec_idx=55151381&searchword=%EC%A0%9C%EC%9D%B4%EC%9B%A8%EB%94%A9&t_category=search&t_content=connect_recruit), [마이웨딩프렌즈 예식장 안내](https://app.myweddingfriendz.com/weddinghall/weddinghall_view.asp?PartnerNo=388). 운영 조건이 달라질 수 있으므로 하객 공유 전에 계약서의 홀·주차 안내를 확인하세요.

## 내 컴퓨터에서 실행

Node.js 22.12 이상에서 프로젝트 폴더를 열고 실행합니다.

```sh
npm install
npm run dev
npm run test
npm run build
```

표시된 로컬 주소를 여세요. `src/config.js`에 장소·주소·교통·연락처·계좌·사진 목록·음원 경로를 적습니다. 빈 정보는 입력 예정으로 표시되며 복사/연결 버튼이 활성화되지 않습니다. 원본 사진은 `public/photos/`, 사용 권한이 있는 음원은 `public/audio/`에 넣습니다. 사진 배열 예:

```js
photos: [
  {src:'/photos/hanbok-01.jpg', alt:'한복을 입은 신조현과 홍지영'},
  {src:'/photos/retro-01.jpg', alt:'레트로 웨딩 촬영'}
],
music: '/audio/wedding.mp3',
```

공개 웨딩사진과 하객 사진은 별개입니다. 사진은 원본 비율로 표시하고 생성형 편집·필터·얼굴 변형을 하지 않습니다. 음원은 버튼을 눌러야 재생됩니다. 스크롤 모션은 동작 줄이기 설정을 존중합니다. 갤러리에서 사진 확대, 이전/다음, Escape 닫기를 지원합니다.

## 비공개 하객 사진 수집 설정

1. **새 전용 Supabase 프로젝트**를 만듭니다. `supabase/migrations/001_private_photos.sql`을 SQL Editor에서 실행합니다. `wedding-guests` 버킷은 private이며 하객에게 읽기·목록·직접 쓰기 권한이 없습니다. 다른 프로젝트의 광범위한 Storage 정책을 재사용하지 마세요.
2. Authentication > Users에서 신랑·신부 이메일 계정 2개를 관리자 측에서 생성합니다. 공개 회원가입은 끕니다. SQL 파일 마지막 예시대로 실제 UUID 두 개만 `wedding_admins`에 등록합니다. 비밀번호는 청첩장 코드에 쓰지 마세요. 두 계정만 `/admin.html`에 로그인해 사진 목록과 원본 다운로드를 이용할 수 있습니다. Supabase 프로젝트 소유자 역시 운영상 저장소 접근 권한이 있으므로 프로젝트 계정도 신랑·신부가 관리하세요.
3. Cloudflare Turnstile에서 배포 도메인을 허용하는 위젯을 생성합니다. 개발 시 localhost도 별도로 허용합니다. 테스트용 키를 실제 배포에 쓰지 마세요.
4. `.env.example`을 `.env`로 복사해 공개 설정만 채웁니다. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`(공개 anon/publishable 키), `VITE_TURNSTILE_SITE_KEY`. **service_role/secret 키는 절대 VITE_ 변수에 넣지 않습니다.**
5. Supabase CLI에서 연결하고 함수를 배포합니다:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ALLOWED_ORIGIN=https://YOUR_SITE.pages.dev
supabase secrets set TURNSTILE_SECRET_KEY=YOUR_PRIVATE_TURNSTILE_SECRET
supabase functions deploy guest-upload --no-verify-jwt
```

서버의 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Supabase Edge Function 기본 환경을 사용합니다. 비밀값은 대시보드 Edge Functions Secrets에서 입력해도 됩니다. `ALLOWED_ORIGIN`은 끝 슬래시 없이 정확한 운영 origin 하나를 설정합니다. 미설정·토큰 검증 실패 시 업로드는 거절됩니다. 미리보기 origin을 자동 허용하지 않습니다.

업로드: 최대 5장/요청, 각 10MB, JPG·PNG·WEBP. HEIC는 기기에서 JPEG로 내보낸 후 전달합니다. 서버에서 총 요청 크기·파일 시그니처·MIME을 검증하고 매번 Turnstile 토큰/hostname/action을 확인합니다. 파일 이름은 UUID로 대체하며 파일 바이트는 변환하지 않습니다. 하루 전체 200장 제한은 원자적 DB 함수로 적용됩니다. 실패 시 예산은 보수적으로 소비됩니다. 한 배치 중 저장 오류 시 이미 저장한 항목 삭제를 시도합니다. 타임아웃 시 일부가 남을 수 있으므로 재전송 전 관리자가 확인하세요.

관리자는 인증된 Storage download로 원본을 받습니다. 하객에게 다운로드 URL이나 저장 경로를 반환하지 않습니다. public bucket, public URL, 게스트 SELECT 정책은 사용하지 않습니다. UI를 숨기는 것에 의존하지 않고 서버 및 RLS에서 권한을 제한합니다. service_role은 서버에서만 사용됩니다.

## 무료 호스팅 배포 안내

프런트엔드는 Cloudflare Pages의 무료 요금제로 시작할 수 있습니다. Supabase 무료 프로젝트의 저장 용량·트래픽·함수 제한 내에서만 무료이며 많은 사진을 받으면 용량이 먼저 소진될 수 있습니다. 무제한 무료를 보장하지 않습니다. 최신 한도는 각 서비스 가격 페이지를 확인하세요.

1. 비밀정보를 제외한 프로젝트를 비공개 Git 저장소에 올립니다. `.env`, node_modules, 하객 사진은 올리지 않습니다. 공개 웨딩사진은 사이트 방문자가 내려받을 수 있다는 점을 고려해 선정합니다.
2. Cloudflare Pages > Git 연결 > React/Vite 선택. 빌드 명령 `npm run build`, 결과 폴더 `dist`, Node 22.12 이상. 또는 로컬 빌드한 `dist`를 Pages Direct Upload로 올립니다.
3. Git 빌드 방식은 위 3개의 VITE_ 공개 변수를 Pages 빌드 환경에 입력하고 재빌드합니다. 직접 업로드는 로컬 `.env`를 채운 상태에서 빌드한 `dist`를 올립니다.
4. 발급된 HTTPS 도메인을 Turnstile 허용 목록과 서버 `ALLOWED_ORIGIN` 양쪽에 등록합니다. 도메인 변경 시 둘 다 갱신합니다.
5. `/`와 `/admin.html`이 열리는지 확인하고 아래 검증을 모두 마친 후 하객에게 링크를 공유합니다.

공식 안내: [Vite 정적 배포](https://vite.dev/guide/static-deploy.html), [Cloudflare Pages Vite](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/), [Supabase 요금](https://supabase.com/pricing), [Pages 한도](https://developers.cloudflare.com/pages/platform/limits/), [Storage private/RLS](https://supabase.com/docs/guides/storage/buckets/fundamentals), [Turnstile 서버 검증](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## 운영 전 실제 권한 검증

- 휴대폰에서 음악 재생/정지, 사진 확대·닫기, 계좌 복사, 지도, 스크롤 및 동작 줄이기 설정 확인.
- 하객 브라우저에서 사진 전달 후 관리자가 원본 다운로드하여 파일 해시가 같은지 확인.
- 로그아웃 및 별도 일반 계정에서 버킷 목록/객체 읽기/직접 업로드 요청이 거절되는지 확인. 알려진 경로의 public URL도 거절되어야 합니다.
- 신랑·신부 두 계정만 목록·다운로드 성공. 제3의 계정은 관리자 페이지 및 Storage 직접 API 모두 실패.
- CAPTCHA 누락·재사용·다른 hostname/action·잘못된 파일·초과 크기 요청 거절 확인. 서버 로그에 비밀키나 원본 사진을 기록하지 않기.
- 무료 용량 경보를 확인하고 행사 후 90일 이내 원본을 내려받아 안전하게 보관한 뒤 Storage에서 삭제합니다. 보관 문구를 바꾸면 실제 운영도 맞추세요. 자동 삭제 작업은 포함되어 있지 않습니다.

로컬 단위 테스트는 파일 판별만 검증합니다. 실제 Supabase 계정/도메인이 없으므로 업로드와 권한 정책의 배포 환경 검증은 설정 후 수행해야 합니다.
