package com.cj.novabss.plan.domain;

/**
 * 요금제의 판매 생명주기 상태다.
 *
 * <p>{@code RatePlan}에서 {@code EnumType.STRING}으로 저장하므로 enum 이름은
 * DB와 API 계약에 노출되는 영속 값이다. 이름을 변경할 때는 마이그레이션과
 * 클라이언트 호환성을 함께 검토해야 한다.</p>
 */
public enum RatePlanSalesStatus {
    /** 아직 판매를 시작하지 않은 작성 중 상태. 신규 요금제의 기본 상태다. */
    DRAFT,

    /** 신규 고객이 선택할 수 있는 판매 중 상태다. */
    ACTIVE,

    /** 신규 고객에게는 노출하지 않는 판매 중지 상태다. */
    SUSPENDED,

    /** 영구적으로 판매를 종료했지만 이력·조회 목적으로 보존하는 상태다. */
    TERMINATED
}
