package com.cj.novabss.user.application;

import com.cj.novabss.user.domain.User;
import com.cj.novabss.user.infrastructure.UserManagementListRow;
import com.cj.novabss.user.infrastructure.UserManagementQueryMapper;
import com.cj.novabss.user.infrastructure.UserRepository;
import com.cj.novabss.role.domain.UserRole;
import com.cj.novabss.role.domain.Role;
import com.cj.novabss.role.infrastructure.UserRoleRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.cj.novabss.user.presentation.dto.UserManagementSearchCondition;
import com.cj.novabss.user.presentation.dto.UserPageResponse;
import com.cj.novabss.user.presentation.dto.UserSummaryResponse;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 운영자가 사용자 계정을 검색하고 로그인 가능 상태를 관리한다. */
@Service
public class UserManagementService {
    private final UserRepository userRepository;
    private final UserManagementQueryMapper userManagementQueryMapper;
    private final UserRoleRepository userRoleRepository;

    public UserManagementService(
        UserRepository userRepository,
        UserManagementQueryMapper userManagementQueryMapper,
        UserRoleRepository userRoleRepository
    ) {
        this.userRepository = userRepository;
        this.userManagementQueryMapper = userManagementQueryMapper;
        this.userRoleRepository = userRoleRepository;
    }

    @Transactional(readOnly = true)
    public UserPageResponse findUsers(UserManagementSearchCondition condition) {
        // 목록 조건과 페이지 범위를 MyBatis SQL 한 곳에서 처리한다.
        // condition.getOffset()은 화면의 1페이지 기준 값을 DB OFFSET 값으로 바꾼다.
        var users = userManagementQueryMapper.findUsers(condition);
        long total = userManagementQueryMapper.countUsers(condition);
        Map<Long, List<Role>> rolesByUserId = findRolesByUserId(users.stream().map(UserManagementListRow::id).toList());

        return new UserPageResponse(
            users.stream().map(row -> toSummaryResponse(row, rolesByUserId.getOrDefault(row.id(), List.of()))).toList(),
            condition.getPage(),
            condition.getSize(),
            total,
            (int) Math.ceil((double) total / condition.getSize())
        );
    }

    @Transactional
    public UserSummaryResponse changeActive(Long userId, boolean active) {
        User user = getUserEntity(userId);
        // User 안에서 상태와 수정 시각을 함께 바꾼다. 트랜잭션이 끝날 때 변경 내용이 DB에 저장된다.
        user.changeActive(active, OffsetDateTime.now());
        return UserSummaryResponse.from(user, findRolesByUserId(List.of(userId)).getOrDefault(userId, List.of()));
    }

    @Transactional(readOnly = true)
    public UserSummaryResponse getUser(Long userId) {
        User user = getUserEntity(userId);
        return UserSummaryResponse.from(user, findRolesByUserId(List.of(userId)).getOrDefault(userId, List.of()));
    }

    private UserSummaryResponse toSummaryResponse(UserManagementListRow row, List<Role> roles) {
        return new UserSummaryResponse(
            row.id(), row.email(), row.displayName(), row.active(), row.createdAt(), row.updatedAt(),
            roles.stream().map(com.cj.novabss.role.presentation.dto.RoleResponse::from).toList()
        );
    }

    private Map<Long, List<Role>> findRolesByUserId(List<Long> userIds) {
        if (userIds.isEmpty()) return Map.of();
        return userRoleRepository.findAllByUserIdIn(userIds).stream()
            .collect(Collectors.groupingBy(
                userRole -> userRole.getUser().getId(),
                Collectors.mapping(UserRole::getRole, Collectors.collectingAndThen(Collectors.toList(), roles ->
                    roles.stream().sorted(java.util.Comparator.comparing(Role::getRoleCode)).toList()
                ))
            ));
    }

    private User getUserEntity(Long userId) {
        // 이후 처리할 대상이 없으면 바로 404를 돌려서 null을 계속 확인하지 않게 한다.
        return userRepository.findById(userId).orElseThrow(() ->
            new UserManagementException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.")
        );
    }
}
