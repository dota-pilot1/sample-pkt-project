package com.cj.novabss.common.presentation;

import java.util.Map;

/** 클라이언트가 검증·업무 오류를 같은 형태로 처리하기 위한 오류 응답이다. */
public record ApiErrorResponse(String code, String message, Map<String, String> fieldErrors) {
}
