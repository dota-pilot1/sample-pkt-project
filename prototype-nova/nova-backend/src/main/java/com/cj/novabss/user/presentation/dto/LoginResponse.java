package com.cj.novabss.user.presentation.dto;

import com.cj.novabss.user.domain.User;
import java.util.List;

/** 로그인 성공 시 화면이 사용자 상태를 초기화하는 데 필요한 최소 정보만 반환한다. */
public record LoginResponse(Long id, String loginId, String displayName, List<String> roleCodes) {
    public static LoginResponse from(User user, List<String> roleCodes) {
        return new LoginResponse(user.getId(), user.getLoginId(), user.getDisplayName(), roleCodes);
    }
}
