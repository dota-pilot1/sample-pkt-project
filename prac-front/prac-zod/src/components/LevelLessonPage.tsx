type Lesson = { title: string; description: string; code: string };

const lessonSets = {
  3: {
    title: "변환·API",
    description: "입력 데이터 변환과 외부 응답 검증으로 경계를 안전하게 만듭니다.",
    lessons: [
      { title: "coerce 입력 변환", description: "HTML input의 문자열 값을 숫자와 날짜로 변환합니다.", code: `const pageSchema = z.object({\n  page: z.coerce.number().int().positive(),\n});\nconst page = pageSchema.parse({ page: "2" });` },
      { title: "transform 결과 변환", description: "검증이 끝난 값을 화면이나 도메인 모델에 맞게 바꿉니다.", code: `const username = z.string()\n  .trim()\n  .min(2)\n  .transform((value) => value.toLowerCase());` },
      { title: "API 응답 검증", description: "서버 응답을 신뢰하기 전에 schema.parse로 계약을 확인합니다.", code: `const userResponse = z.object({\n  id: z.number(),\n  name: z.string(),\n});\nconst user = userResponse.parse(await response.json());` },
    ],
  },
} as const;

export default function LevelLessonPage({ level }: { level: 3 }) {
  const current = lessonSets[level];
  return <main className="shell"><header className="hero compact-hero"><p className="eyebrow">FRONTEND PRACTICE · LEVEL {level}</p><h1>{current.title}</h1><p>{current.description}</p></header><section className="lesson-grid">{current.lessons.map((lesson, index) => <article className="lesson-tile" key={lesson.title}><div className="tile-number">0{index + 1}</div><h2>{lesson.title}</h2><p>{lesson.description}</p><pre>{lesson.code}</pre><span>학습 예정</span></article>)}</section></main>;
}
