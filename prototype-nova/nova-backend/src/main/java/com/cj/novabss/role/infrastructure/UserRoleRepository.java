package com.cj.novabss.role.infrastructure;

import com.cj.novabss.role.domain.UserRole;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    List<UserRole> findAllByUserId(Long userId);
    List<UserRole> findAllByRoleId(Long roleId);
    boolean existsByRoleId(Long roleId);
    boolean existsByUserIdAndRoleId(Long userId, Long roleId);
    /** 사용자에게 연결된 역할을 모두 삭제한다. */
    void deleteAllByUserId(Long userId);

    /** 사용자-역할 연결 행 목록을 저장한다. */
    default List<UserRole> saveUserRoleMappings(List<UserRole> mappings) {
        return saveAll(mappings);
    }
}
