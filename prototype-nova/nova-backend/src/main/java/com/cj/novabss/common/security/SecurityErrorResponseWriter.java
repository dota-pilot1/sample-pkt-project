package com.cj.novabss.common.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

/** 인증·인가 실패도 API 공통 오류 응답 구조로 반환한다. */
@Component
public class SecurityErrorResponseWriter {
    public void writeUnauthorized(HttpServletResponse response) throws IOException {
        write(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요하거나 access token이 유효하지 않습니다.");
    }

    public void writeForbidden(HttpServletResponse response) throws IOException {
        write(response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN", "이 작업을 수행할 권한이 없습니다.");
    }

    private void write(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        // 보안 필터는 MVC의 ObjectMapper Bean 생성 여부와 무관하게 항상 JSON 오류를 반환해야 한다.
        response.getWriter().write("{\"code\":\"%s\",\"message\":\"%s\",\"fieldErrors\":{}}".formatted(code, message));
    }
}
