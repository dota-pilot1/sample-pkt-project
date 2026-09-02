package com.cj.mesprototype.lotquality.domain;

/** LOT 집계 데이터와 현재 품질 기준을 즉시 비교한 화면용 상태다. */
public enum LotQualityStatus {
    WAITING,
    CRITERIA_MISSING,
    DATA_MISSING,
    PASS,
    FAIL
}
