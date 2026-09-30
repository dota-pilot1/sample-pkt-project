package com.cj.novabss.user.infrastructure;

import com.cj.novabss.user.presentation.dto.UserManagementSearchCondition;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/** 사용자 관리 목록의 검색·페이지 SQL을 담당하는 읽기 전용 Mapper다. */
@Mapper
public interface UserManagementQueryMapper {
    List<UserManagementListRow> findUsers(@Param("condition") UserManagementSearchCondition condition);

    long countUsers(@Param("condition") UserManagementSearchCondition condition);
}
