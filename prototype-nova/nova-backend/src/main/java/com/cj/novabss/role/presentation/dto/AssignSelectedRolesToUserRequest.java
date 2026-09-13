package com.cj.novabss.role.presentation.dto;

import java.util.List;

/** 사용자에게 연결할 역할 ID 목록을 전달한다. 빈 목록은 사용자의 모든 역할 연결을 해제한다. */
public record AssignSelectedRolesToUserRequest(List<Long> roleIds) {
}
