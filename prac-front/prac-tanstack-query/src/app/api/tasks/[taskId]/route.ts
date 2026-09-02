import { NextResponse } from "next/server";
import {
  deleteTask,
  getTaskById,
  updateTaskStatus,
} from "@/entities/task/api/task-repository";
import {
  taskStatuses,
  type TaskStatus,
} from "@/entities/task/model/task";

type RouteContext = { params: Promise<{ taskId: string }> };

async function parseTaskId(context: RouteContext) {
  const { taskId } = await context.params;
  const parsedTaskId = Number(taskId);
  return Number.isInteger(parsedTaskId) && parsedTaskId > 0
    ? parsedTaskId
    : null;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  const taskId = await parseTaskId(context);
  const task = taskId ? getTaskById(taskId) : null;

  if (!task) {
    return NextResponse.json(
      { message: "요청한 작업을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ task, fetchedAt: new Date().toISOString() });
}

export async function PATCH(request: Request, context: RouteContext) {
  const taskId = await parseTaskId(context);
  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
  } | null;

  if (
    !taskId ||
    typeof body?.status !== "string" ||
    !taskStatuses.includes(body.status as TaskStatus)
  ) {
    return NextResponse.json(
      { message: "작업 ID와 변경할 상태를 확인해 주세요." },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const task = updateTaskStatus(taskId, body.status as TaskStatus);

  if (!task) {
    return NextResponse.json(
      { message: "상태를 변경할 작업을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    task,
    message: `#${task.id} 상태를 ${task.status}(으)로 변경했습니다.`,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const taskId = await parseTaskId(context);

  if (!taskId) {
    return NextResponse.json(
      { message: "삭제할 작업 ID를 확인해 주세요." },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!deleteTask(taskId)) {
    return NextResponse.json(
      { message: "삭제할 작업을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    deletedTaskId: taskId,
    message: `#${taskId} 작업을 삭제했습니다.`,
  });
}
