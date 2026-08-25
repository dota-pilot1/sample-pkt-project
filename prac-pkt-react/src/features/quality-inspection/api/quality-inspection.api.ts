import { apiFetch } from "../../../shared/api/http";
import type { QualityInspection, RecordInspectionResult, SaveInspectionParams } from "../model/quality-inspection.types";

type ApiError = { message?: string };
type PresignResponse = { presignedUrl: string; publicUrl: string; objectKey: string };

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const error = await response.json() as ApiError;
    return error.message || fallback;
  } catch {
    return fallback;
  }
}

/** 검사 대상 LOT와 이미 저장된 사진 URL 목록을 조회한다. */
export async function fetchQualityInspections(): Promise<QualityInspection[]> {
  const response = await apiFetch("/quality-inspections");
  if (!response.ok) throw new Error(await errorMessage(response, "품질 검사 목록을 불러오지 못했습니다."));
  return await response.json() as QualityInspection[];
}

/** Presigned URL을 발급받은 뒤 브라우저에서 S3로 검사 사진을 직접 업로드한다. */
async function uploadInspectionPhoto(file: File): Promise<string> {
  const presignResponse = await apiFetch("/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size, folder: "quality-inspections" }),
  });
  if (!presignResponse.ok) {
    throw new Error(await errorMessage(presignResponse, "검사 사진 업로드를 준비하지 못했습니다."));
  }

  const presign = await presignResponse.json() as PresignResponse;
  const uploadResponse = await fetch(presign.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) throw new Error("검사 사진을 업로드하지 못했습니다.");
  return presign.publicUrl;
}

/** 새 사진을 병렬 업로드하고 기존 사진과 합쳐 최대 3장의 결과를 저장한다. */
export async function saveInspectionResult(params: SaveInspectionParams): Promise<QualityInspection> {
  const uploadedPhotoUrls = await Promise.all((params.photos ?? []).map(uploadInspectionPhoto));
  const body: RecordInspectionResult = {
    dimension: params.dimension,
    appearanceIssue: params.appearanceIssue,
    result: params.result,
    defectReason: params.defectReason,
    photoUrls: [...params.photoUrls, ...uploadedPhotoUrls].slice(0, 3),
  };
  const response = await apiFetch(`/quality-inspections/${params.id}/result`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await errorMessage(response, "검사 결과를 저장하지 못했습니다."));
  return await response.json() as QualityInspection;
}
