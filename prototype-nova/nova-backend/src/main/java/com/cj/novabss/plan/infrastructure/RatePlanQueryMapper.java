package com.cj.novabss.plan.infrastructure;

import com.cj.novabss.plan.application.RatePlanSortDirection;
import com.cj.novabss.plan.application.RatePlanSortField;
import com.cj.novabss.plan.domain.RatePlanSalesStatus;
import com.cj.novabss.plan.presentation.dto.RatePlanSearchCondition;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/** 요금제 관리자 목록에 필요한 읽기 전용 SQL Mapper다. */
@Mapper
public interface RatePlanQueryMapper {
    List<RatePlanListRow> findRatePlans(
        @Param("condition") RatePlanSearchCondition condition,
        @Param("status") RatePlanSalesStatus status,
        @Param("sortField") RatePlanSortField sortField,
        @Param("sortDirection") RatePlanSortDirection sortDirection
    );

    long countRatePlans(
        @Param("condition") RatePlanSearchCondition condition,
        @Param("status") RatePlanSalesStatus status
    );
}
