type Topic = "schema" | "safe-parse" | "object";

const topics = {
  schema: { label: "기본 스키마", description: "string, number, email 같은 기본 스키마를 선언합니다.", code: `const emailSchema = z.email();\nconst ageSchema = z.number().int().min(14);` },
  "safe-parse": { label: "safeParse와 issues", description: "예외를 던지지 않고 성공·실패 결과를 값으로 분기합니다.", code: `const result = emailSchema.safeParse(input);\nif (!result.success) console.log(result.error.issues);` },
  object: { label: "객체 스키마와 타입", description: "객체 모양을 선언하고 TypeScript 타입을 추론합니다.", code: `const userSchema = z.object({\n  email: z.email(),\n  age: z.number(),\n});\ntype User = z.infer<typeof userSchema>;` },
} as const;

export default function Level1TopicPage({ topic }: { topic: Topic }) {
  const current = topics[topic];
  return <main className="shell"><header className="hero compact-hero"><p className="eyebrow">FRONTEND PRACTICE · LEVEL 1</p><h1>{current.label}</h1><p>{current.description}</p></header><section className="lesson-card"><p className="lesson-label">LEVEL 1 · LESSON</p><h2>{current.label}</h2><p>{current.description}</p><pre>{current.code}</pre><div className="lesson-note"><b>학습 목표</b><span>코드를 직접 실행하고 결과를 확인한 뒤 다음 학습으로 넘어갑니다.</span></div></section></main>;
}
