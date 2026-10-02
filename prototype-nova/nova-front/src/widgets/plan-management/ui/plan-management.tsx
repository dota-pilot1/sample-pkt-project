"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/features/profile/api";
import { useAuthStore } from "@/features/auth/login/model/auth-store";
import { hasPermission } from "@/features/profile/model/has-permission";
import { RatePlanList } from "@/features/plan/ui/rate-plan-list";
import { CreateRatePlanForm } from "@/features/plan/ui/create-rate-plan-form";

/** 프로필 권한과 요금제 기능을 조합하는 화면 경계다. */
export function PlanManagement() {
  const userId = useAuthStore((state) => state.user?.id);
  const profile = useQuery({
    queryKey: ["profile", "me", userId],
    queryFn: profileApi.get,
    enabled: userId !== undefined,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");
  const canCreate = profile.isSuccess && hasPermission(profile.data, "RATE_PLAN_CREATE");

  async function openForm() {
    setChecking(true);
    setNotice("");
    const current = await profile.refetch();
    setChecking(false);
    if (current.isSuccess && hasPermission(current.data, "RATE_PLAN_CREATE")) {
      setFormOpen(true);
    } else {
      setNotice("생성 권한을 확인하지 못했습니다. 권한과 연결 상태를 확인해 주세요.");
    }
  }

  async function refreshPermission() {
    setNotice("요금제 생성 권한이 변경되었거나 접근이 거절되었습니다.");
    await profile.refetch();
  }

  return (
    <RatePlanList
      title={formOpen && canCreate ? "새 요금제 등록" : "요금제 목록"}
      subtitle={formOpen && canCreate ? "기본 정보와 요금 조건을 입력해 요금제 초안을 만드세요." : undefined}
      actions={
          canCreate && !formOpen && (
            <Button onClick={openForm} loading={checking} disabled={formOpen}>
              {!checking && <Plus aria-hidden="true" size={16} />}
              {checking ? "권한 확인 중…" : "요금제 등록"}
            </Button>
          )
      }
      feedback={
        <>
          {notice && <p className="plan-notice" role="status">{notice}</p>}
          {profile.isError && <div className="plan-notice" role="alert">권한 정보를 조회하지 못했습니다. <Button variant="outline" size="sm" onClick={() => profile.refetch()}>다시 확인</Button></div>}
        </>
      }
    >
      {formOpen && canCreate && (
        <CreateRatePlanForm
          onClose={() => setFormOpen(false)}
          onCreated={(name) => {
            setFormOpen(false);
            setNotice(`${name} 요금제를 작성 중 상태로 등록했습니다.`);
          }}
          onForbidden={refreshPermission}
        />
      )}
    </RatePlanList>
  );
}
