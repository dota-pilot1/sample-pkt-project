package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.Permission;
import com.cj.novabss.role.infrastructure.PermissionRepository;
import com.cj.novabss.role.infrastructure.RolePermissionRepository;
import com.cj.novabss.role.presentation.dto.CreatePermissionRequest;
import com.cj.novabss.role.presentation.dto.UpdatePermissionRequest;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 권한 자체의 생명주기만 관리한다. 역할 연결과 접근 판정은 다음 RBAC 단계의 책임이다. */
@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public PermissionService(
        PermissionRepository permissionRepository,
        RolePermissionRepository rolePermissionRepository
    ) {
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @Transactional(readOnly = true)
    public List<Permission> findAll() {
        return permissionRepository.findAllByOrderByPermissionCodeAsc();
    }

    @Transactional(readOnly = true)
    public Permission getPermissionById(Long id) {
        // 목록·수정·활성 상태 변경이 동일한 404 권한 오류 계약을 공유하도록 이 경계에서 해석한다.
        return permissionRepository.findById(id)
            .orElseThrow(() -> notFound(id));
    }

    @Transactional
    public Permission create(CreatePermissionRequest request) {
        String permissionCode = request.permissionCode().trim().toUpperCase();
        if (permissionRepository.existsByPermissionCode(permissionCode)) {
            throw new PermissionCommandException(HttpStatus.CONFLICT, "DUPLICATE_PERMISSION_CODE", "이미 존재하는 권한 코드입니다.");
        }
        return permissionRepository.save(Permission.create(permissionCode, request.name(), request.description(), OffsetDateTime.now()));
    }

    @Transactional
    public Permission update(Long id, UpdatePermissionRequest request) {
        Permission permission = getPermissionById(id);
        permission.changeDetails(request.name(), request.description());
        return permission;
    }

    @Transactional
    public Permission changeEnabled(Long id, boolean enabled) {
        Permission permission = getPermissionById(id);
        permission.changeEnabled(enabled);
        return permission;
    }

    @Transactional
    public void deletePermission(Long id) {
        Permission permission = getPermissionById(id);
        // 역할에 연결된 권한을 지우면 기존 역할의 접근 정책이 바뀌므로 삭제를 거절한다.
        if (rolePermissionRepository.existsByPermissionId(id)) {
            throw new PermissionCommandException(
                HttpStatus.CONFLICT,
                "PERMISSION_IN_USE",
                "역할에 연결된 권한은 삭제할 수 없습니다."
            );
        }
        permissionRepository.delete(permission);
    }

    private PermissionCommandException notFound(Long id) {
        return new PermissionCommandException(HttpStatus.NOT_FOUND, "PERMISSION_NOT_FOUND", "권한을 찾을 수 없습니다: " + id);
    }
}
