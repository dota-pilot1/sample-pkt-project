/** fetch가 받은 HTTP 실패 상태와 서버 오류 코드를 UI까지 전달한다. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

