package com.cj.novabss.role.presentation;

import com.cj.novabss.role.application.RoleService;
import com.cj.novabss.role.application.RbacMappingService;
import com.cj.novabss.role.presentation.dto.CreateRoleRequest;
import com.cj.novabss.role.presentation.dto.PermissionResponse;
import com.cj.novabss.role.presentation.dto.RoleResponse;
import com.cj.novabss.role.presentation.dto.AssignSelectedPermissionsToRoleRequest;
import com.cj.novabss.role.presentation.dto.RolePermissionMappingResponse;
import com.cj.novabss.role.presentation.dto.UpdateRoleEnabledRequest;
import com.cj.novabss.role.presentation.dto.UpdateRoleRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "${app.cors.allowed-origin}")
public class RoleController {
    private final RoleService roleService;
    private final RbacMappingService rbacMappingService;

    public RoleController(RoleService roleService, RbacMappingService rbacMappingService) {
        this.roleService = roleService;
        this.rbacMappingService = rbacMappingService;
    }

    @PostMapping
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(RoleResponse.from(roleService.create(request)));
    }

    @GetMapping
    public List<RoleResponse> getRoles() {
        // JPA 엔티티를 API 계약으로 노출하지 않고, 생성·상세 조회와 같은 응답 DTO로 변환한다.
        return roleService.getRoles().stream()
            .map(RoleResponse::from)
            .toList();
    }

    @GetMapping("/{roleId}")
    public RoleResponse getRoleDetail(@PathVariable Long roleId) {
        return RoleResponse.from(roleService.getById(roleId));
    }

    @PatchMapping("/{roleId}")
    public RoleResponse update(@PathVariable Long roleId, @Valid @RequestBody UpdateRoleRequest request) {
        return RoleResponse.from(roleService.update(roleId, request));
    }

    @PatchMapping("/{roleId}/enabled")
    public RoleResponse changeEnabled(@PathVariable Long roleId, @Valid @RequestBody UpdateRoleEnabledRequest request) {
        return RoleResponse.from(roleService.changeEnabled(roleId, request));
    }

    /**
     * 역할 권한 설정 화면에서 선택한 역할에 현재 연결된 권한을 조회한다.
     *
     * @param roleId 조회할 역할 ID
     * @return 역할 ID와 권한 코드순으로 정렬된 권한 목록
     */
    @GetMapping("/{roleId}/permissions")
    public RolePermissionMappingResponse getAssignedPermissionsForRole(@PathVariable Long roleId) {
        return RolePermissionMappingResponse.from(
            roleId,
            rbacMappingService.getAssignedPermissionsForRole(roleId).stream().map(PermissionResponse::from).toList()
        );
    }

    /**
     * 관리자가 선택한 권한 목록으로 역할의 권한 연결을 저장한다.
     * 요청에 없는 기존 권한은 제거되고, 비활성 또는 없는 권한은 저장하지 않고 오류로 반환한다.
     *
     * @param roleId 권한을 설정할 역할 ID
     * @param request 역할에 남길 권한 ID 목록
     * @return 저장 후 역할에 연결된 권한 목록
     */
    @PatchMapping("/{roleId}/permissions")
    public RolePermissionMappingResponse assignSelectedPermissionsToRole(
        @PathVariable Long roleId,
        @RequestBody AssignSelectedPermissionsToRoleRequest request
    ) {
        return RolePermissionMappingResponse.from(
            roleId,
            rbacMappingService.assignSelectedPermissionsToRole(roleId, request.permissionIds()).stream().map(PermissionResponse::from).toList()
        );
    }

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> delete(@PathVariable Long roleId) {
        roleService.rejectDeletion();
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }
}
