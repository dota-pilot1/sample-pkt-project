package com.cj.novabss.role.application;

import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.infrastructure.RoleRepository;
import com.cj.novabss.role.presentation.dto.CreateRoleRequest;
import com.cj.novabss.role.presentation.dto.UpdateRoleEnabledRequest;
import com.cj.novabss.role.presentation.dto.UpdateRoleRequest;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 역할의 생성·조회·수정·비활성화를 담당한다. 역할 삭제는 운영 안전을 위해 허용하지 않는다. */
@Service
public class RoleService {
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional
    public Role create(CreateRoleRequest request) {
        // 관리자 역할 생성 요청에서 DTO 검증을 통과한 코드를 중복 없이 저장한다.
        String roleCode = request.roleCode();
        if (roleRepository.existsByRoleCode(roleCode)) {
            throw new RoleCommandException(HttpStatus.CONFLICT, "DUPLICATE_ROLE_CODE", "이미 존재하는 역할 코드입니다.");
        }
        return roleRepository.save(Role.create(roleCode, request.name().trim(), OffsetDateTime.now()));
    }

    @Transactional(readOnly = true)
    public Role getById(Long roleId) {
        // 상세 조회와 삭제 전 존재 확인이 공통으로 사용하는 역할 조회 경계다.
        return roleRepository.findById(roleId)
            .orElseThrow(() -> new RoleQueryException(HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND", "역할을 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<Role> getRoles() {
        // 목록·역할 선택·권한 연결 화면에서 같은 순서로 보이도록 역할 코드를 기준으로 정렬한다.
        return roleRepository.findAllByOrderByRoleCodeAsc();
    }

    @Transactional
    public Role update(Long roleId, UpdateRoleRequest request) {
        Role role = getById(roleId);
        role.changeName(request.name());
        return role;
    }

    @Transactional
    public Role changeEnabled(Long roleId, UpdateRoleEnabledRequest request) {
        Role role = getById(roleId);
        role.changeEnabled(request.enabled());
        return role;
    }

    /** 역할 제거는 대체 역할 이전·감사 이력이 갖춰진 별도 폐기 유스케이스로만 지원한다. */
    public void rejectDeletion() {
        throw new RoleCommandException(
            HttpStatus.METHOD_NOT_ALLOWED,
            "ROLE_DELETION_DISABLED",
            "역할 삭제는 지원하지 않습니다. 역할을 비활성화하거나 대체 역할 이전을 사용해 주세요."
        );
    }
}
