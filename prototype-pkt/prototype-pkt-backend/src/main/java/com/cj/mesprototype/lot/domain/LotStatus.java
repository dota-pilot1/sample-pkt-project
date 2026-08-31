package com.cj.mesprototype.lot.domain;

public enum LotStatus {
    WAIT,
    RUN,
    HOLD,
    DONE,
    FAIL,
    /** 기존 범용 MES 시드 호환용 상태. 시작 시 PKT 상태로 정규화한다. */
    WAITING,
    IN_PROGRESS,
    COMPLETED
}
