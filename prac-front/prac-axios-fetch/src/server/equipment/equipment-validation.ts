import {
  equipmentStatuses,
  type CreateEquipmentInput,
  type UpdateEquipmentInput,
} from "@/entities/equipment/model/equipment";

function isBaseInput(value: unknown): value is CreateEquipmentInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    typeof input.name === "string" &&
    input.name.trim().length >= 2 &&
    typeof input.line === "string" &&
    input.line.trim().length >= 2 &&
    equipmentStatuses.includes(input.status as CreateEquipmentInput["status"]) &&
    typeof input.temperature === "number" &&
    Number.isInteger(input.temperature) &&
    input.temperature >= -20 &&
    input.temperature <= 150
  );
}

export function isCreateEquipmentInput(value: unknown): value is CreateEquipmentInput {
  return isBaseInput(value);
}

export function isUpdateEquipmentInput(value: unknown): value is Omit<UpdateEquipmentInput, "id"> {
  if (!value || typeof value !== "object") return false;
  const input = value as Record<string, unknown>;
  return (
    isBaseInput(value) &&
    typeof input.expectedVersion === "number" &&
    Number.isInteger(input.expectedVersion) &&
    input.expectedVersion > 0
  );
}
