package com.cj.novabss.plan.application;

import org.springframework.http.HttpStatus;

/** 목록 조회 query가 API 계약을 벗어났을 때 반환하는 예외다. */
public class RatePlanQueryException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public RatePlanQueryException(String code, String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }
}
