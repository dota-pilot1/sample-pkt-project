package com.cj.novabss.subscription.domain;

/** 프로토타입에서 고객 요금제 가입의 최소 상태만 표현한다. */
public enum SubscriptionStatus {
    REQUESTED,
    ACTIVE,
    CANCELLED
}
