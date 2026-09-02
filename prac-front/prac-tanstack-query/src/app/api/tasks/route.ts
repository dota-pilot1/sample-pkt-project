import { NextResponse } from "next/server";
import {
  createTask,
  getTaskPage,
} from "@/entities/task/api/task-repository";
import {
  taskPriorities,
  type CreateTaskInput,
} from "@/entities/task/model/task";

function isCreateTaskInput(value: unknown): value is CreateTaskInput {
  if (!value || typeof value !== "object") return false;

  const input = value as Record<string, unknown>;
  return (
    typeof input.title === "string" &&
    input.title.trim().length > 0 &&
    typeof input.owner === "string" &&
    input.owner.trim().length > 0 &&
    typeof input.dueDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.dueDate) &&
    typeof input.description === "string" &&
    input.description.trim().length > 0 &&
    taskPriorities.includes(input.priority as CreateTaskInput["priority"])
  );
}

export async function GET(request: Request) {
  // 학습 화면에서 최초 조회의 isPending 상태를 관찰할 수 있도록 의도적으로 응답을 지연한다.
  await new Promise((resolve) => setTimeout(resolve, 700));
  const searchParams = new URL(request.url).searchParams;
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawPageSize = Number(searchParams.get("size") ?? "3");
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawPageSize) ? rawPageSize : 3;

  return NextResponse.json({
    ...getTaskPage(page, pageSize),
    fetchedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);

  if (!isCreateTaskInput(body)) {
    return NextResponse.json(
      { message: "제목, 담당 부서, 우선순위, 마감일, 설명을 확인해 주세요." },
      { status: 400 },
    );
  }

  // mutation의 pending 상태와 성공 후 재조회를 관찰하기 위한 학습용 지연이다.
  await new Promise((resolve) => setTimeout(resolve, 500));
  const task = createTask({
    ...body,
    title: body.title.trim(),
    owner: body.owner.trim(),
    description: body.description.trim(),
  });

  return NextResponse.json(
    { task, message: `#${task.id} 작업을 등록했습니다.` },
    { status: 201 },
  );
}
