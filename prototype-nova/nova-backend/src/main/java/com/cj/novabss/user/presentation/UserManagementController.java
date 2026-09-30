package com.cj.novabss.user.presentation;

import com.cj.novabss.user.application.UserManagementService;
import com.cj.novabss.user.application.ProfileQueryService;
import com.cj.novabss.user.presentation.dto.UpdateUserActiveRequest;
import com.cj.novabss.user.presentation.dto.UserManagementSearchCondition;
import com.cj.novabss.user.presentation.dto.UserPageResponse;
import com.cj.novabss.user.presentation.dto.UserSummaryResponse;
import com.cj.novabss.user.presentation.dto.ProfileResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 계정 생명주기 관리 API다. 역할 연결은 UserRoleMappingController가 담당한다. */
@RestController
@RequestMapping("/api/users")
public class UserManagementController {
    private final UserManagementService userManagementService;
    private final ProfileQueryService profileQueryService;

    public UserManagementController(UserManagementService userManagementService, ProfileQueryService profileQueryService) {
        this.userManagementService = userManagementService;
        this.profileQueryService = profileQueryService;
    }

    @GetMapping
    public UserPageResponse getUsers(@Valid @ModelAttribute UserManagementSearchCondition condition) {
        // URL의 검색·필터·페이지 값을 검사한 뒤 목록 조회를 서비스에 맡긴다.
        return userManagementService.findUsers(condition);
    }

    @GetMapping("/{userId}")
    public UserSummaryResponse getUser(@PathVariable Long userId) {
        // 관리 화면에서 한 명의 현재 계정 상태를 다시 확인할 때 사용한다.
        return userManagementService.getUser(userId);
    }

    @GetMapping("/{userId}/access-summary")
    public ProfileResponse getAccessSummary(@PathVariable Long userId) {
        // 관리자 상세 Drawer가 사용자·활성 역할·실효 권한을 한 번에 표시할 수 있는 조회 계약이다.
        return profileQueryService.getProfile(userId);
    }

    @PatchMapping("/{userId}/active")
    public UserSummaryResponse changeActive(
        @PathVariable Long userId,
        @Valid @RequestBody UpdateUserActiveRequest request
    ) {
        // 요청에 active=true/false가 없으면 @Valid가 400 오류를 반환한다.
        return userManagementService.changeActive(userId, request.active());
    }
}
