import { notFound } from "next/navigation";
import TaskDetailPractice from "@/widgets/task-detail-practice/ui/TaskDetailPractice";

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ fromPage?: string; fromSize?: string }>;
};

export default async function TaskDetailPage({
  params,
  searchParams,
}: TaskDetailPageProps) {
  const { taskId: rawTaskId } = await params;
  const { fromPage: rawFromPage, fromSize: rawFromSize } = await searchParams;
  const taskId = Number(rawTaskId);
  const parsedFromPage = Number(rawFromPage ?? "1");
  const parsedFromSize = Number(rawFromSize ?? "3");
  const fromPage = Number.isInteger(parsedFromPage) && parsedFromPage > 0 ? parsedFromPage : 1;
  const fromSize = [3, 5, 10].includes(parsedFromSize) ? parsedFromSize : 3;

  if (!Number.isInteger(taskId) || taskId < 1) notFound();

  return (
    <main className="shell">
      <header className="hero compact-hero">
        <p className="eyebrow">FRONTEND PRACTICE · LEVEL 2</p>
        <h1>작업 상세</h1>
        <p>목록 캐시와 구분되는 taskId 기반 상세 캐시를 확인합니다.</p>
      </header>
      <TaskDetailPractice
        taskId={taskId}
        fromPage={fromPage}
        fromSize={fromSize}
      />
    </main>
  );
}
