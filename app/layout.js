export const metadata = {
  title: "HS Code 단가 진단",
  description: "관세청 수출실적 기반 HS 코드 단가·물량 3년 추세 진단",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
