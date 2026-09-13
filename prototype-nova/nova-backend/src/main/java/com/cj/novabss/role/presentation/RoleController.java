package com.cj.novabss.role.presentation;

import com.cj.novabss.role.application.RoleService;
import com.cj.novabss.role.presentation.dto.CreateRoleRequest;
import com.cj.novabss.role.presentation.dto.RoleResponse;
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

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
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

    @DeleteMapping("/{roleId}")
    public ResponseEntity<Void> delete(@PathVariable Long roleId) {
        roleService.rejectDeletion();
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).build();
    }
}
