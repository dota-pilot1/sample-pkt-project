package com.cj.novabss.plan.application;

import org.springframework.http.HttpStatus;

/** 요금제 생성 중 클라이언트에 일관되게 반환할 업무 오류다. */
public class RatePlanCommandException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public RatePlanCommandException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
