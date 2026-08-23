const textNode = (text: string) => ({ detail: 0, format: 0, mode: "normal", style: "", text, type: "text", version: 1 });
const paragraph = (text: string) => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1 });
const heading = (text: string, tag: "h1" | "h2" = "h2") => ({ children: [textNode(text)], direction: "ltr", format: "", indent: 0, tag, type: "heading", version: 1 });
const emptyParagraph = () => ({ children: [], direction: null, format: "", indent: 0, type: "paragraph", version: 1 });
const quoteBlock = (children: unknown[]) => ({ children, direction: "ltr", format: "", indent: 0, type: "quote", version: 1 });
const bulletList = (items: string[]) => ({ children: items.map((item, index) => ({ children: [textNode(item)], direction: "ltr", format: "", indent: 0, type: "listitem", value: index + 1, version: 1 })), direction: "ltr", format: "", indent: 0, listType: "bullet", start: 1, tag: "ul", type: "list", version: 1 });
const codeBlock = (text: string, language = "typescript") => ({ children: [{ text, type: "code-highlight", version: 1 }], direction: "ltr", format: "", indent: 0, language, type: "code", version: 1 });

const createState = (children: unknown[]) => JSON.stringify({
  root: { children, direction: null, format: "", indent: 0, type: "root", version: 1 },
});
const sampleStep = (number: number, title: string, description: string, file: string, code: string, language: string) => [
  heading(`Step ${number}. ${title}`),
  quoteBlock([paragraph(description)]),
  heading("파일:"),
  codeBlock(file, "text"),
  heading("코드:"),
  codeBlock(code, language),
  emptyParagraph(),
  emptyParagraph(),
];

const todoPlan = (number: number, title: string, description: string) => [
  heading(`TODO ${number}. ${title}`),
  quoteBlock([paragraph(description)]),
  emptyParagraph(),
  emptyParagraph(),
];

/** 2차 주제 본문 문서: 전체 목표와 TODO 계획만 담는 샘플입니다. */
export const TODO_PLAN_SAMPLE_LEXICAL_STATE = createState([
  heading("LOT 조회 페이지네이션 서버 구현 전체 계획", "h1"),
  quoteBlock([paragraph("LOT 목록 조회 API를 Spring Boot 서버에서 페이지네이션 방식으로 구현하고, 실제 HTTP 조회와 오류 조건까지 검증합니다.")]),
  emptyParagraph(),
  emptyParagraph(),
  heading("TODO 계획"),
  quoteBlock([bulletList([
    "TODO 1. LOT 도메인 모델과 응답 계약 구현",
    "TODO 2. LOT 페이지네이션 조회 API 구현",
    "TODO 3. LOT 샘플 데이터와 서버 검증",
  ])]),
]);

/** TODO 하위 문서: 하나의 TODO 안에서 Step 1~N을 관리하는 샘플입니다. */
export const STEP1_SAMPLE_LEXICAL_STATE = createState([
  heading("TODO 2. LOT 페이지네이션 조회 API 구현", "h1"),
  quoteBlock([paragraph("Spring Data Page를 사용해 Repository부터 Service와 Controller까지 연결하고, 정렬·페이지 크기·오류 정책을 서버에서 일관되게 적용합니다.")]),
  emptyParagraph(),
  emptyParagraph(),
  ...sampleStep(1, "Repository 생성", "JpaRepository의 Page 조회 기능을 사용하고 LOT 코드 중복 확인 메서드를 제공한다.", "sk-pkt-mes-server/src/main/java/com/cj/mesprototype/lot/infrastructure/LotRepository.java", `public interface LotRepository extends JpaRepository<Lot, Long> {
    boolean existsByLotCode(String lotCode);
}`, "java"),
  ...sampleStep(2, "Service 페이지 조회 구현", "Pageable을 검증하고 Repository Page를 목록 DTO와 페이지 메타데이터로 변환한다.", "sk-pkt-mes-server/src/main/java/com/cj/mesprototype/lot/application/LotService.java", `Page<LotSummaryResponse> page = lotRepository.findAll(pageable)
        .map(LotSummaryResponse::from);
return LotPageResponse.from(page);`, "java"),
  ...sampleStep(3, "Controller 조회 경로 연결", "GET /api/lots에서 page와 size를 받고 updatedAt DESC·id ASC 정렬을 적용한다.", "sk-pkt-mes-server/src/main/java/com/cj/mesprototype/lot/presentation/LotController.java", `@GetMapping
public LotPageResponse getLots(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return lotService.getLots(PageRequest.of(page, size,
            Sort.by(Sort.Direction.DESC, "updatedAt")
                    .and(Sort.by(Sort.Direction.ASC, "id"))));
}`, "java"),
  ...sampleStep(4, "페이지 조건 검증", "page가 음수이거나 size가 1 미만·100 초과이면 LOT_001을 반환한다.", "sk-pkt-mes-server/src/main/java/com/cj/mesprototype/common/exception/ErrorCode.java", `LOT_INVALID_PAGINATION(
        HttpStatus.BAD_REQUEST,
        "LOT_001",
        "LOT 페이지 조회 조건이 올바르지 않습니다."
)`, "java"),
]);

/** 기존 호출부 호환용 기본 샘플입니다. */
export const DOCUMENT_API_SAMPLE_LEXICAL_STATE = TODO_PLAN_SAMPLE_LEXICAL_STATE;
