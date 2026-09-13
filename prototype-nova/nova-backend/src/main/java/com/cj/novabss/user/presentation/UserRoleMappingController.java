package com.cj.novabss.user.presentation;

import com.cj.novabss.role.application.RbacMappingService;
import com.cj.novabss.role.presentation.dto.AssignSelectedRolesToUserRequest;
import com.cj.novabss.role.presentation.dto.RoleResponse;
import com.cj.novabss.role.presentation.dto.UserRoleMappingResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 사용자 역할의 조회·전체 교체 API를 제공한다. 사용자 계정 생명주기는 별도 사용자 관리 기능의 책임이다. */
@RestController
@RequestMapping("/api/users")
public class UserRoleMappingController {
    private final RbacMappingService rbacMappingService;

    public UserRoleMappingController(RbacMappingService rbacMappingService) {
        this.rbacMappingService = rbacMappingService;
    }

    /**
     * 사용자 상세 화면이나 로그인 전 관리 화면에서 사용자의 현재 역할을 조회한다.
     *
     * @param userId 조회할 사용자 ID
     * @return 사용자 ID와 역할 코드순으로 정렬된 역할 목록
     */
    @GetMapping("/{userId}/roles")
    public UserRoleMappingResponse getAssignedRolesForUser(@PathVariable Long userId) {
        return UserRoleMappingResponse.from(
            userId,
            rbacMappingService.getAssignedRolesForUser(userId).stream().map(RoleResponse::from).toList()
        );
    }

    /**
     * 관리자가 선택한 역할 목록으로 사용자의 역할 연결을 저장한다.
     * 요청에 없는 기존 역할은 제거되고, 비활성 또는 없는 역할은 저장하지 않고 오류로 반환한다.
     *
     * @param userId 역할을 설정할 사용자 ID
     * @param request 사용자에게 남길 역할 ID 목록
     * @return 저장 후 사용자에 연결된 역할 목록
     */
    @PatchMapping("/{userId}/roles")
    public UserRoleMappingResponse assignSelectedRolesToUser(
        @PathVariable Long userId,
        @RequestBody AssignSelectedRolesToUserRequest request
    ) {
        return UserRoleMappingResponse.from(
            userId,
            rbacMappingService.assignSelectedRolesToUser(userId, request.roleIds()).stream().map(RoleResponse::from).toList()
        );
    }
}
