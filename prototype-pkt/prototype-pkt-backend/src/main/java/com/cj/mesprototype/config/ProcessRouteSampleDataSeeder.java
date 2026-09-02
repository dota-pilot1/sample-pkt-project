package com.cj.mesprototype.config;

import com.cj.mesprototype.lot.domain.ProcessDefinition;
import com.cj.mesprototype.lot.domain.ProcessRoute;
import com.cj.mesprototype.lot.domain.ProcessRouteStep;
import com.cj.mesprototype.lot.domain.ProductRouteAssignment;
import com.cj.mesprototype.lot.infrastructure.ProcessDefinitionRepository;
import com.cj.mesprototype.lot.infrastructure.ProcessRouteRepository;
import com.cj.mesprototype.lot.infrastructure.ProcessRouteStepRepository;
import com.cj.mesprototype.lot.infrastructure.ProductRepository;
import com.cj.mesprototype.lot.infrastructure.ProductRouteAssignmentRepository;
import com.cj.mesprototype.workorder.domain.WorkOrder;
import com.cj.mesprototype.workorder.domain.WorkOrderProcess;
import com.cj.mesprototype.workorder.infrastructure.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/** P&T 제품별 표준 실행 경로와 기존 P&T 작업지시의 경로 스냅샷을 만든다. */
@Component
@Order(9)
@RequiredArgsConstructor
public class ProcessRouteSampleDataSeeder implements ApplicationRunner {
    private final ProcessDefinitionRepository processRepository;
    private final ProcessRouteRepository routeRepository;
    private final ProcessRouteStepRepository stepRepository;
    private final ProductRepository productRepository;
    private final ProductRouteAssignmentRepository assignmentRepository;
    private final WorkOrderRepository workOrderRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Map<String, ProcessRoute> routes = Map.of(
                "PT_FINAL_TEST", ensureRoute("PT_FINAL_TEST", "최종 테스트 출하 경로", List.of(
                        new Step("PT_RECEIVE", "P&T LOT 입고"),
                        new Step("PT_FINAL_TEST", "Final Test"),
                        new Step("PT_QUALITY_REVIEW", "품질 결과 검토"),
                        new Step("PT_RELEASE", "결과 승인"))),
                "PT_RELIABILITY", ensureRoute("PT_RELIABILITY", "신뢰성 검증 경로", List.of(
                        new Step("PT_RECEIVE", "P&T LOT 입고"),
                        new Step("PT_BURN_IN", "Burn-in"),
                        new Step("PT_RELIABILITY_TEST", "신뢰성 검사"),
                        new Step("PT_RELEASE", "결과 승인"))),
                "PT_SPEED_BIN", ensureRoute("PT_SPEED_BIN", "Speed Bin 선별 경로", List.of(
                        new Step("PT_RECEIVE", "P&T LOT 입고"),
                        new Step("PT_SPEED_TEST", "Speed Bin Test"),
                        new Step("PT_BINNING", "Bin 분류"),
                        new Step("PT_RELEASE", "결과 승인"))),
                "PT_STANDARD", ensureRoute("PT_STANDARD", "P&T 표준 검증 경로", List.of(
                        new Step("PT_RECEIVE", "P&T LOT 입고"),
                        new Step("PT_TEST", "테스트 실행"),
                        new Step("PT_RELEASE", "결과 승인")))
        );

        Map<String, String> productRoutes = Map.of(
                "PKT-A", "PT_FINAL_TEST",
                "PKT-B", "PT_RELIABILITY",
                "PKT-C", "PT_SPEED_BIN",
                "PKT-D", "PT_STANDARD"
        );
        productRoutes.forEach((productCode, routeCode) -> assignDefaultRoute(productCode, routes.get(routeCode)));
        productRoutes.forEach((productCode, routeCode) -> applyRouteToSampleWorkOrder(productCode, routes.get(routeCode)));
    }

    private ProcessRoute ensureRoute(String code, String name, List<Step> steps) {
        ProcessRoute route = routeRepository.findByRouteCodeAndVersion(code, 1)
                .orElseGet(() -> routeRepository.save(ProcessRoute.of(code, name, 1)));
        List<ProcessRouteStep> existingSteps = stepRepository.findAllByRouteIdOrderBySequenceNoAsc(route.getId());
        for (int index = 0; index < steps.size(); index++) {
            int sequenceNo = index + 1;
            Step step = steps.get(index);
            ProcessDefinition process = processRepository.findByProcessCode(step.code())
                    .orElseGet(() -> processRepository.save(ProcessDefinition.of(step.code(), step.name())));
            if (existingSteps.stream().noneMatch(existing -> existing.getSequenceNo() == sequenceNo)) {
                stepRepository.save(ProcessRouteStep.of(route, process, sequenceNo));
            }
        }
        return route;
    }

    private void assignDefaultRoute(String productCode, ProcessRoute route) {
        productRepository.findByProductCode(productCode).ifPresent(product -> {
            assignmentRepository.findByProductIdAndDefaultRouteTrue(product.getId())
                    .filter(existing -> !existing.getRoute().getId().equals(route.getId()))
                    .ifPresent(assignmentRepository::delete);
            if (assignmentRepository.findByProductIdAndDefaultRouteTrue(product.getId()).isEmpty()) {
                assignmentRepository.save(ProductRouteAssignment.of(product, route, true));
            }
        });
    }

    /** 이미 만들어진 PKT 샘플도 새 경로와 같은 단계 스냅샷으로 정렬한다. */
    private void applyRouteToSampleWorkOrder(String productCode, ProcessRoute route) {
        String suffix = switch (productCode) {
            case "PKT-A" -> "1";
            case "PKT-B" -> "2";
            case "PKT-C" -> "3";
            case "PKT-D" -> "4";
            default -> throw new IllegalArgumentException("지원하지 않는 P&T 제품입니다.");
        };
        workOrderRepository.findByCode("WO-PT-00" + suffix).ifPresent(order -> replaceRouteSnapshot(order, route));
    }

    private void replaceRouteSnapshot(WorkOrder order, ProcessRoute route) {
        if (order.getProcessRoute() != null && route.getId().equals(order.getProcessRoute().getId())) return;
        new java.util.ArrayList<>(order.getProcesses()).forEach(order::removeProcess);
        order.applyProcessRoute(route);
        stepRepository.findAllByRouteIdOrderBySequenceNoAsc(route.getId()).forEach(step ->
                order.addProcess(WorkOrderProcess.fromRouteStep(
                        step.getSequenceNo(), step.getProcess(), order.getWorkstation(), order.getAssignee(),
                        order.getStartDate(), order.getDueDate())));
    }

    private record Step(String code, String name) { }
}
