package com.cj.novabss.user.presentation;

import com.cj.novabss.user.application.ProfileQueryService;
import com.cj.novabss.user.presentation.dto.ProfileResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 토큰 도입 전 브라우저 세션이 보유한 사용자 ID를 기준으로 프로필을 조회한다. */
@RestController
@RequestMapping("/api/users")
public class ProfileController {
    private final ProfileQueryService profileQueryService;

    public ProfileController(ProfileQueryService profileQueryService) {
        this.profileQueryService = profileQueryService;
    }

    @GetMapping("/{userId}/profile")
    public ProfileResponse getProfile(@PathVariable Long userId) {
        // 토큰 도입 전 임시 경계다. 인증 도입 후에는 경로 값 대신 로그인 주체에서 사용자 ID를 얻는다.
        return profileQueryService.getProfile(userId);
    }
}
