# Button 사용법 — 조합과 업무 흐름

## 목적

`Button` 제조법에서 만든 공통 버튼을 실제 화면에 조합하는 방법을 정리한다. 이 문서는 버튼을 새로 만드는 방법보다, 이미 제공되는 `variant`, `size`, `tone`, `disabled`를 업무 의미에 맞게 선택하고 클릭 흐름과 연결하는 데 초점을 둔다.

기준 구현 파일:

```text
pkt-study-tauri/src/shared/ui/button.tsx
```

## 사용 시나리오

| 화면 상황 | 권장 조합 | 역할 |
| --- | --- | --- |
| 기본 저장·등록 | `variant="primary"` + `size="default"` | 현재 화면의 주 작업 실행 |
| 취소·뒤로 가기 | `variant="secondary"` 또는 `variant="ghost"` | 주 작업을 방해하지 않는 보조 동작 |
| 목록 행의 수정·상세 | `variant="ghost"` + `size="sm"` | 좁은 영역에서의 보조 동작 |
| 헤더의 새로고침·닫기 | `size="icon"` + `tone="default"` | 아이콘만 사용하는 보조 동작 |
| 삭제·취소할 수 없는 위험 작업 | `size="icon"` + `tone="danger"` 또는 별도 확인 UI | 파괴적 동작임을 시각적으로 구분 |
| 저장 중·API 요청 중 | `disabled={isPending}` | 중복 요청 방지 |

## 설계 규칙

1. 버튼의 모양보다 동작의 중요도를 먼저 정한다. 화면의 대표 작업은 `primary` 하나로 제한한다.
2. `Button`은 기본적으로 `type="button"`이므로, `<form>` 제출 버튼으로 사용할 때만 `type="submit"`을 명시한다.
3. 비동기 작업은 `disabled`로 잠그고, 버튼 문구나 별도 진행 표시로 현재 상태를 알려 준다.
4. 아이콘만 있는 버튼은 `aria-label`과 `title`을 함께 제공한다. 텍스트가 없으면 사용자가 동작을 추측해야 하기 때문이다.
5. 삭제·승인·실행처럼 되돌리기 어려운 작업은 버튼 색상만으로 끝내지 말고 확인 단계를 둔다.
6. 권한이 없는 사용자는 버튼을 `disabled`로만 처리하기보다, 정책에 따라 아예 숨기거나 비활성 사유를 안내한다.

## Props와 상태

`Button`은 `ButtonHTMLAttributes<HTMLButtonElement>`를 그대로 전달하므로 `onClick`, `aria-*`, `name`, `value` 같은 표준 버튼 속성을 사용할 수 있다.

| Prop | 값 | 사용 기준 |
| --- | --- | --- |
| `variant` | `primary`, `secondary`, `ghost` | 버튼의 강조 수준 |
| `size` | `default`, `sm`, `auth`, `icon`, `sm-icon` | 화면 밀도와 버튼 형태 |
| `tone` | `default`, `brand`, `danger` | 아이콘 버튼의 의미 색상 |
| `type` | `button`, `submit`, `reset` | 폼 동작 지정. 기본값은 `button` |
| `disabled` | `boolean` | 권한 없음, 입력 미완료, 요청 진행 중 |
| `className` | `string` | 화면별 최소한의 폭·정렬 보정 |

현재 구현의 `loading` 전용 Prop은 없으므로, 요청 상태는 화면 컴포넌트가 관리한다. 필요하면 공통 `loading` API를 별도 설계하되, 기존 호출부의 의미를 바꾸지 않는 범위에서 확장한다.

## 기본 호출

```tsx
import { Button } from "@/shared/ui/button";

export function ProductActions({
  isSaving,
  onSave,
  onCancel,
}: {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="secondary"
        onClick={onCancel}
        disabled={isSaving}
      >
        취소
      </Button>
      <Button
        variant="primary"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "저장 중…" : "저장"}
      </Button>
    </div>
  );
}
```

`onSave`에는 화면의 저장 핸들러를 연결하고, API 호출과 성공·실패 알림은 부모 또는 feature 레이어에서 담당한다. 공통 버튼이 서버 지식이나 업무 규칙을 갖지 않도록 역할을 분리한다.

## 폼 제출에 사용

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  {/* 입력 필드 */}
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "등록 중…" : "제품 등록"}
  </Button>
</form>
```

`type`을 생략하면 `button`으로 렌더링되므로, 폼 제출을 의도했는데 `type="submit"`을 빠뜨리는 실수를 예방할 수 있다.

## 아이콘 버튼에 사용

```tsx
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

<div className="flex gap-1">
  <Button
    variant="ghost"
    size="icon"
    tone="default"
    aria-label="목록 새로고침"
    title="목록 새로고침"
    onClick={refresh}
  >
    <RefreshCw className="size-4" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    tone="danger"
    aria-label="제품 삭제"
    title="제품 삭제"
    onClick={() => setDeleteTarget(product)}
  >
    <Trash2 className="size-4" />
  </Button>
</div>
```

아이콘은 기존 프로젝트에 포함된 `lucide-react`를 사용한다. 외부 CDN에서 아이콘을 내려받거나 런타임 원격 import를 추가하지 않는다.

## PKT MES 적용 방법

### 제품 등록

- 필수 입력값이 모두 유효할 때만 `primary` 등록 버튼을 활성화한다.
- 저장 요청 중에는 `disabled`를 적용하고 `등록 중…`으로 문구를 바꾼다.
- 성공하면 목록을 갱신하고, 실패하면 서버 오류를 알림으로 보여 준다.

### LOT 실행 시작

- 실행 전 검증이 끝난 뒤 `primary` 버튼을 노출한다.
- 이미 실행 중인 LOT에는 같은 버튼을 다시 누르지 못하도록 잠근다.
- 실행 중지처럼 영향이 큰 동작은 `danger` 버튼과 확인 단계를 사용한다.

### 검사 결과 승인

- 승인 권한이 있는 사용자에게만 승인 버튼을 보여 준다.
- 권한은 프론트의 버튼 숨김만으로 판단하지 않고 서버에서도 검증한다.
- 승인 완료 후에는 버튼을 비활성화하고 승인자·승인 시각을 함께 표시한다.

### 권한에 따른 노출

```tsx
{canApprove ? (
  <Button
    onClick={approveInspection}
    disabled={isApproving || inspection.status !== "PENDING"}
  >
    {isApproving ? "승인 중…" : "검사 결과 승인"}
  </Button>
) : null}
```

조회 권한만 있는 사용자는 승인 버튼을 보지 않도록 숨기고, 사용자가 버튼 주소나 요청을 직접 호출해도 서버 권한 검사가 최종 방어선이 되도록 한다.

## 폐쇄망 기준

- 사용하는 React API: `forwardRef`, 표준 `button` 이벤트·속성.
- 사용하는 CSS: 프로젝트 내부 Tailwind 유틸리티와 `styles.css`의 `ui-icon-button` 계열 클래스.
- 외부 패키지: `class-variance-authority`, 내부 `cn` 유틸리티, 필요 시 이미 설치된 `lucide-react`.
- 외부 CDN, 원격 폰트, 온라인 아이콘 서비스는 사용하지 않는다.
- 새 버튼 스타일이 필요하면 기존 디자인 토큰과 `buttonVariants`에 먼저 추가하고, 화면마다 긴 스타일 문자열을 복제하지 않는다.

## 테스트 체크리스트

- [ ] 기본 버튼의 `type`이 `button`으로 렌더링되는가?
- [ ] 폼 제출 버튼에 `type="submit"`을 지정했는가?
- [ ] 클릭 시 한 번만 핸들러가 실행되는가?
- [ ] API 요청 중 중복 클릭이 막히는가?
- [ ] 성공·실패·권한 없음 상태가 구분되는가?
- [ ] 아이콘 전용 버튼에 `aria-label`과 `title`이 있는가?
- [ ] 키보드 포커스와 `disabled` 상태가 보이는가?
- [ ] 모바일·좁은 테이블에서도 버튼 문구가 잘리지 않는가?
- [ ] 삭제·승인·LOT 실행에 확인 단계가 있는가?
- [ ] 서버에서도 권한과 상태 전이를 다시 검증하는가?

## 확장 또는 주의사항

현재 컴포넌트는 공통 `loading` Prop을 제공하지 않는다. 화면마다 요청 상태를 관리하는 현재 구조가 충분하면 문구와 `disabled`만 사용한다. 여러 화면에서 동일한 스피너·접근성 처리가 반복될 때만 `loading`과 `loadingLabel`을 추가하는 방향으로 제조법을 확장한다.

제조법 문서와 이 사용법 문서는 같은 `Button` 구현을 기준으로 유지한다. Props나 스타일 토큰을 변경하면 두 문서의 호출 예시와 테스트 체크리스트도 함께 갱신한다.
