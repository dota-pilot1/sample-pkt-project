package com.cj.novabss.user.presentation.dto;

import com.cj.novabss.common.security.AccessToken;
import com.cj.novabss.user.domain.User;
import java.time.Instant;
import java.util.List;

/** 로그인 성공 시 프론트가 보호 API를 호출할 access token과 사용자 기본 정보를 반환한다. */
public record LoginResponse(Long id, String email, String displayName, List<String> roleCodes, String accessToken, Instant expiresAt) {
    public static LoginResponse from(User user, List<String> roleCodes, AccessToken accessToken) {
        return new LoginResponse(user.getId(), user.getEmail(), user.getDisplayName(), roleCodes, accessToken.value(), accessToken.expiresAt());
    }
}
