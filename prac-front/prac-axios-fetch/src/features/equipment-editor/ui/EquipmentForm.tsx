"use client";

import { useEffect, useState } from "react";
import type {
  Equipment,
  EquipmentStatus,
} from "@/entities/equipment/model/equipment";
import { equipmentStatuses } from "@/entities/equipment/model/equipment";
import {
  useCreateEquipmentMutation,
  useUpdateEquipmentMutation,
} from "@/entities/equipment/model/useEquipmentQuery";
import SelectField from "@/shared/ui/select-field/SelectField";

interface EquipmentFormProps {
  equipment: Equipment | null;
  onClose: () => void;
}

const emptyForm = {
  name: "",
  line: "",
  status: "대기" as EquipmentStatus,
  temperature: 20,
};

export default function EquipmentForm({ equipment, onClose }: EquipmentFormProps) {
  const createMutation = useCreateEquipmentMutation();
  const updateMutation = useUpdateEquipmentMutation();
  const mutation = equipment ? updateMutation : createMutation;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(
      equipment
        ? {
            name: equipment.name,
            line: equipment.line,
            status: equipment.status,
            temperature: equipment.temperature,
          }
        : emptyForm,
    );
  }, [equipment]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { ...form, temperature: Number(form.temperature) };

    if (equipment) {
      updateMutation.mutate(
        { ...input, id: equipment.id, expectedVersion: equipment.version },
        { onSuccess: onClose },
      );
      return;
    }
    createMutation.mutate(input, { onSuccess: onClose });
  }

  return (
    <section className="editor-panel">
      <div className="panel-heading">
        <div>
          <p className="lesson-label">{equipment ? "PATCH" : "POST"}</p>
          <h2>{equipment ? "설비 수정" : "새 설비 등록"}</h2>
        </div>
        {equipment ? <span className="version-chip">version {equipment.version}</span> : null}
      </div>

      <form className="equipment-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>설비명</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            minLength={2}
            required
          />
        </label>
        <label className="form-field">
          <span>라인</span>
          <input
            value={form.line}
            onChange={(event) => setForm({ ...form, line: event.target.value })}
            minLength={2}
            required
          />
        </label>
        <div className="form-row">
          <SelectField
            id="equipment-status"
            label="상태"
            value={form.status}
            options={equipmentStatuses.map((status) => ({ value: status }))}
            onChange={(value) => setForm({ ...form, status: value as EquipmentStatus })}
          />
          <label className="form-field">
            <span>온도(℃)</span>
            <input
              type="number"
              min={-20}
              max={150}
              value={form.temperature}
              onChange={(event) => setForm({ ...form, temperature: Number(event.target.value) })}
              required
            />
          </label>
        </div>

        {mutation.isError ? (
          <p className="form-notice error" role="alert">{mutation.error.message}</p>
        ) : null}

        <div className="form-actions">
          <button type="button" className="ghost-button" onClick={onClose}>취소</button>
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "저장 중…" : equipment ? "수정 저장" : "설비 등록"}
          </button>
        </div>
      </form>
    </section>
  );
}
