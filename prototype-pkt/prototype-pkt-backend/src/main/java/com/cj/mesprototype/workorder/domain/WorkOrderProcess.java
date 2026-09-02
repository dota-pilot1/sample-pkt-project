package com.cj.mesprototype.workorder.domain;

import com.cj.mesprototype.lot.domain.ProcessDefinition;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "work_order_processes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_definition_id")
    private ProcessDefinition processDefinition;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequence;

    @Column(name = "process_code", length = 100)
    private String processCode;

    @Column(name = "process_name", nullable = false, length = 200)
    private String processName;

    @Column(length = 200)
    private String workstation;

    @Column(length = 100)
    private String assignee;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer progress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkOrderStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public static WorkOrderProcess create(
            Integer sequence,
            String processCode,
            String processName,
            String workstation,
            String assignee,
            LocalDate startDate,
            LocalDate dueDate,
            Integer progress,
            WorkOrderStatus status
    ) {
        WorkOrderProcess process = new WorkOrderProcess();
        process.sequence = sequence;
        process.processCode = processCode;
        process.processName = processName;
        process.workstation = workstation;
        process.assignee = assignee;
        process.startDate = startDate;
        process.dueDate = dueDate;
        process.progress = progress == null ? 0 : progress;
        process.status = status == null ? WorkOrderStatus.READY : status;
        return process;
    }

    /** 경로의 공정을 작업지시 시점 스냅샷으로 복사한다. */
    public static WorkOrderProcess fromRouteStep(Integer sequence, ProcessDefinition definition, String workstation, String assignee, LocalDate startDate, LocalDate dueDate) {
        WorkOrderProcess process = create(sequence, definition.getProcessCode(), definition.getProcessName(), workstation, assignee, startDate, dueDate, 0, WorkOrderStatus.READY);
        process.processDefinition = definition;
        return process;
    }

    public void update(
            Integer sequence,
            String processCode,
            String processName,
            String workstation,
            String assignee,
            LocalDate startDate,
            LocalDate dueDate,
            Integer progress,
            WorkOrderStatus status
    ) {
        if (sequence != null) {
            this.sequence = sequence;
        }
        this.processCode = processCode;
        this.processName = processName;
        this.workstation = workstation;
        this.assignee = assignee;
        this.startDate = startDate;
        this.dueDate = dueDate;
        if (progress != null) {
            this.progress = progress;
        }
        if (status != null) {
            this.status = status;
        }
    }

    void assignWorkOrder(WorkOrder workOrder) {
        this.workOrder = workOrder;
    }
}
