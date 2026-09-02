/** 서버 응답 시각을 학습 화면에서 읽기 쉬운 한국어 시각으로 표시한다. */
export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}
