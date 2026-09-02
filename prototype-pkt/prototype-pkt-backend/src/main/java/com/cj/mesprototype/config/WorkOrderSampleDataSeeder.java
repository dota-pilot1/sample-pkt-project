package com.cj.mesprototype.config;

import com.cj.mesprototype.workorder.domain.WorkOrder;
import com.cj.mesprototype.workorder.domain.WorkOrderProcess;
import com.cj.mesprototype.workorder.domain.WorkOrderStatus;
import com.cj.mesprototype.workorder.infrastructure.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Component
@Order(7)
@RequiredArgsConstructor
public class WorkOrderSampleDataSeeder implements ApplicationRunner {

    private final WorkOrderRepository workOrderRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        LocalDate today = LocalDate.now();

        if (!workOrderRepository.existsByCode("WO-001")) {
            // 오늘을 가로지르도록 배치: 좌판 가공은 종료일이 지났는데 60%라 '지연'으로 표시됨.
            WorkOrder wo1 = WorkOrder.create(
                    "WO-001", "PP-001", "ITM-001", "태스크 체어", 200,
                    today.minusDays(3), today.plusDays(1),
                    "의자 조립 1라인", "김민준", WorkOrderStatus.IN_PROGRESS);
            wo1.addProcess(WorkOrderProcess.create(1, "PROC-001", "자재 출고", "자재 창고", "김민준",
                    today.minusDays(3), today.minusDays(3), 100, WorkOrderStatus.COMPLETED));
            wo1.addProcess(WorkOrderProcess.create(2, "PROC-002", "좌판 가공", "목공 1라인", "김민준",
                    today.minusDays(2), today.minusDays(1), 60, WorkOrderStatus.IN_PROGRESS));
            wo1.addProcess(WorkOrderProcess.create(3, "PROC-003", "프레임 조립", "의자 조립 1라인", "최하윤",
                    today, today, 0, WorkOrderStatus.READY));
            wo1.addProcess(WorkOrderProcess.create(4, "PROC-009", "검사/포장", "검사 포장실", "정검사",
                    today.plusDays(1), today.plusDays(1), 0, WorkOrderStatus.READY));
            workOrderRepository.save(wo1);
        }

        if (!workOrderRepository.existsByCode("WO-002")) {
            WorkOrder wo2 = WorkOrder.create(
                    "WO-002", "PP-002", "ITM-002", "회의 테이블", 80,
                    today.plusDays(3), today.plusDays(9),
                    "테이블 조립 1라인", "박서연", WorkOrderStatus.IN_PROGRESS);
            wo2.addProcess(WorkOrderProcess.create(1, "PROC-004", "자재 출고", "자재 창고", "박서연",
                    today.plusDays(3), today.plusDays(3), 100, WorkOrderStatus.COMPLETED));
            wo2.addProcess(WorkOrderProcess.create(2, "PROC-005", "상판 재단", "목공 2라인", "박서연",
                    today.plusDays(4), today.plusDays(6), 45, WorkOrderStatus.IN_PROGRESS));
            wo2.addProcess(WorkOrderProcess.create(3, "PROC-006", "엣지 밴딩", "엣지 밴딩기", "최하윤",
                    today.plusDays(7), today.plusDays(8), 0, WorkOrderStatus.READY));
            wo2.addProcess(WorkOrderProcess.create(4, "PROC-010", "프레임 조립", "테이블 조립 1라인", "박서연",
                    today.plusDays(9), today.plusDays(9), 0, WorkOrderStatus.READY));
            workOrderRepository.save(wo2);
        }

        if (!workOrderRepository.existsByCode("WO-003")) {
            WorkOrder wo3 = WorkOrder.create(
                    "WO-003", "PP-003", "ITM-001", "태스크 체어", 120,
                    today.plusDays(10), today.plusDays(14),
                    "의자 조립 1라인", "이도윤", WorkOrderStatus.HOLD);
            wo3.addProcess(WorkOrderProcess.create(1, "PROC-007", "가스 리프트 입고 대기", "자재 창고", "이도윤",
                    today.plusDays(10), today.plusDays(10), 0, WorkOrderStatus.HOLD));
            wo3.addProcess(WorkOrderProcess.create(2, "PROC-008", "의자 조립", "의자 조립 1라인", "이도윤",
                    today.plusDays(11), today.plusDays(13), 0, WorkOrderStatus.READY));
            wo3.addProcess(WorkOrderProcess.create(3, "PROC-011", "검사/포장", "검사 포장실", "정검사",
                    today.plusDays(14), today.plusDays(14), 0, WorkOrderStatus.READY));
            workOrderRepository.save(wo3);
        }

        // P&T 화면은 일반 조립 작업지시가 아니라 제품 코드가 P&T 제품 마스터와 일치하는 지시를 사용한다.
        seedPackageTestOrder("WO-PT-001", "PT-PLAN-2601", "PKT-A", 2_048,
                today.minusDays(1), today.plusDays(1), "P&T Line-01", "김테스터", WorkOrderStatus.IN_PROGRESS);
        seedPackageTestOrder("WO-PT-002", "PT-PLAN-2602", "PKT-B", 1_024,
                today, today.plusDays(2), "P&T Line-01", "이검사", WorkOrderStatus.READY);
        seedPackageTestOrder("WO-PT-003", "PT-PLAN-2603", "PKT-C", 2_048,
                today.plusDays(1), today.plusDays(4), "P&T Line-02", "박테스트", WorkOrderStatus.READY);
        seedPackageTestOrder("WO-PT-004", "PT-PLAN-2604", "PKT-D", 2_048,
                today.minusDays(4), today.minusDays(1), "P&T Line-02", "최품질", WorkOrderStatus.COMPLETED);

        log.info("Seeded sample work orders: {}", workOrderRepository.count());
    }

    private void seedPackageTestOrder(String code, String planCode, String productCode, int quantity,
                                      LocalDate startDate, LocalDate dueDate, String line, String assignee,
                                      WorkOrderStatus status) {
        if (workOrderRepository.existsByCode(code)) return;
        WorkOrder order = WorkOrder.create(code, planCode, productCode, productCode, quantity,
                startDate, dueDate, line, assignee, status);
        order.addProcess(WorkOrderProcess.create(1, "PT_RECEIVE", "P&T LOT 입고", line, assignee,
                startDate, startDate, status == WorkOrderStatus.IN_PROGRESS ? 100 : 0,
                status == WorkOrderStatus.IN_PROGRESS ? WorkOrderStatus.COMPLETED : WorkOrderStatus.READY));
        order.addProcess(WorkOrderProcess.create(2, "PT_TEST", "테스트 실행", line, assignee,
                startDate, dueDate, status == WorkOrderStatus.IN_PROGRESS ? 45 : 0,
                status == WorkOrderStatus.IN_PROGRESS ? WorkOrderStatus.IN_PROGRESS : WorkOrderStatus.READY));
        order.addProcess(WorkOrderProcess.create(3, "PT_RELEASE", "결과 승인", line, assignee,
                dueDate, dueDate, 0, WorkOrderStatus.READY));
        workOrderRepository.save(order);
    }
}
