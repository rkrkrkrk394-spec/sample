# HS Code 단가 진단 서비스 (1단계)

지금 만든 진단 화면을 웹앱으로 켜고, 인터넷에 배포하는 단계입니다.
아직은 데모 데이터(HS 1902 면류 7개 품목)로 동작합니다.
다음 단계에서 관세청 API를 연결해 모든 HS 코드를 지원하게 만듭니다.

---

## A. 내 컴퓨터에서 켜보기

1. 이 폴더(`hs-service`)를 VS Code로 엽니다.
   (VS Code 메뉴 → File → Open Folder → 이 폴더 선택)

2. VS Code 상단 메뉴에서 Terminal → New Terminal 을 엽니다.
   화면 아래쪽에 명령어를 칠 수 있는 창이 나옵니다.

3. 아래 명령을 한 줄씩 입력합니다. (한 줄 치고 Enter, 끝나면 다음 줄)

   ```
   npm install
   ```
   필요한 부품을 내려받습니다. 1~2분 걸립니다. (한 번만 하면 됩니다)

   ```
   npm run dev
   ```
   서버가 켜집니다. "Local: http://localhost:3000" 같은 줄이 보이면 성공입니다.

4. 브라우저 주소창에 `http://localhost:3000` 을 입력해 들어갑니다.
   진단 화면이 뜨면 끝! (끄려면 터미널에서 Ctrl + C)

---

## B. 인터넷에 배포하기 (Vercel · 무료)

가장 쉬운 방법은 GitHub에 코드를 올리고 Vercel에 연결하는 것입니다.

1. github.com 가입 → 새 저장소(Repository) 생성 → 이 폴더를 업로드.
   (코드를 모르면 GitHub Desktop 앱을 쓰면 드래그로 올릴 수 있습니다)

2. vercel.com 에 GitHub 계정으로 가입/로그인.

3. "Add New → Project" → 방금 만든 저장소 선택 → "Deploy" 클릭.
   1~2분 뒤 `https://(프로젝트이름).vercel.app` 공개 주소가 나옵니다.

이 주소를 다른 사람에게 보내면 누구나 접속해 써볼 수 있습니다.

---

## 다음 단계 (2단계)

- 관세청 API를 호출하는 함수 파일(`app/api/trade/route.js`)을 추가합니다.
- 인증키는 코드가 아니라 Vercel "환경변수(Environment Variables)"에 넣어
  화면에 노출되지 않게 합니다.
- 화면 코드(`app/page.js`)의 고정 데이터(DATA)를 그 함수 호출로 바꿉니다.

이 부분은 준비되면 이어서 함께 진행합니다.
