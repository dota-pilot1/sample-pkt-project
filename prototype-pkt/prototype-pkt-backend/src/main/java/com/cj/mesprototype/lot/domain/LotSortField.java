package com.cj.mesprototype.lot.domain;

import com.cj.mesprototype.common.exception.BusinessException;
import com.cj.mesprototype.common.exception.ErrorCode;

import java.util.Arrays;

/**
 * 클라이언트가 요청할 수 있는 LOT 정렬 컬럼 화이트리스트.
 * 엔티티 필드명을 그대로 노출하지 않고 허용된 값만 통과시켜 임의 컬럼 정렬을 막는다.
 */
public enum LotSortField {
    LOT_CODE("lotCode"),
    PRODUCT_NAME("productName"),
    STATUS("status"),
    PROCESS("process"),
    UPDATED_AT("updatedAt");

    private final String property;

    LotSortField(String property) {
        this.property = property;
    }

    public String property() {
        return property;
    }

    public static LotSortField from(String value) {
        return Arrays.stream(values())
                .filter(field -> field.property.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.LOT_INVALID_SORT));
    }
}
