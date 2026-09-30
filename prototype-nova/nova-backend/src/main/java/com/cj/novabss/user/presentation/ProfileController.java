package com.cj.novabss.user.presentation;

import com.cj.novabss.user.application.ProfileQueryService;
import com.cj.novabss.user.presentation.dto.ProfileResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 인증된 JWT 주체만 자기 자신의 프로필을 조회한다. */
@RestController
@RequestMapping("/api/users")
public class ProfileController {
    private final ProfileQueryService profileQueryService;

    public ProfileController(ProfileQueryService profileQueryService) {
        this.profileQueryService = profileQueryService;
    }

    @GetMapping("/me/profile")
    public ProfileResponse getProfile(Authentication authentication) {
        return profileQueryService.getProfile(Long.parseLong(authentication.getName()));
    }
}
