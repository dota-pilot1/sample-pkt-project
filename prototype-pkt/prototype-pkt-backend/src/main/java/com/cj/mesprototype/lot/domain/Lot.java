package com.cj.mesprototype.lot.domain;

import com.cj.mesprototype.equipment.domain.Equipment;
import com.cj.mesprototype.workorder.domain.WorkOrder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "lots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Lot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lot_code", nullable = false, unique = true, length = 100)
    private String lotCode;

    @Column(name = "product_code", nullable = false, length = 100)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    /** 기존 코드·이름 컬럼은 샘플 데이터 마이그레이션 호환을 위해 유지한다. */
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    /** LOT는 하나의 작업지시를 분할해 만든 실행 단위다. 기존 샘플은 null을 허용한다. */
    @ManyToOne
    @JoinColumn(name = "work_order_id")
    private WorkOrder workOrder;

    @ManyToOne
    @JoinColumn(name = "current_process_id")
    private ProcessDefinition currentProcess;

    @ManyToOne
    @JoinColumn(name = "current_equipment_id")
    private Equipment currentEquipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LotStatus status;

    @Column(nullable = false, length = 100)
    private String process;

    @Column(name = "package_type", length = 50)
    private String packageType;

    @Column(length = 100)
    private String tester;

    private Integer quantity;

    @Column(name = "yield_rate")
    private Double yieldRate;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Lot(String lotCode, String productCode, String productName,
                LotStatus status, String process) {
        this.lotCode = lotCode;
        this.productCode = productCode;
        this.productName = productName;
        this.status = status;
        this.process = process;
    }

    public static Lot create(String lotCode, String productCode, String productName,
                              LotStatus status, String process, String packageType,
                              String tester, int quantity, Double yieldRate, Instant startedAt) {
        Lot lot = new Lot(lotCode, productCode, productName, status, process);
        lot.packageType = packageType;
        lot.tester = tester;
        lot.quantity = quantity;
        lot.yieldRate = yieldRate;
        lot.startedAt = startedAt;
        return lot;
    }

    /** 기존 범용 샘플 LOT를 PKT 목록에 표시할 수 있는 데이터로 보완한다. */
    public void enrichForPkt(String process, String packageType, String tester, int quantity,
                             Double yieldRate, Instant startedAt) {
        this.process = process;
        this.packageType = packageType;
        this.tester = tester;
        this.quantity = quantity;
        this.yieldRate = yieldRate;
        this.startedAt = startedAt;
    }

    /** 공정 진행 시 목록 조회용 현재 상태 스냅샷을 이력과 같은 트랜잭션에서 갱신한다. */
    public void moveTo(Product product, ProcessDefinition process, Equipment equipment) {
        this.product = product;
        this.currentProcess = process;
        this.currentEquipment = equipment;
    }

    public void assignWorkOrder(WorkOrder workOrder) {
        this.workOrder = workOrder;
    }

    /** 생산을 시작하기 전에는 마스터 선택값과 계획 수량을 바로잡을 수 있다. */
    public void updateWaitingLot(WorkOrder workOrder, Product product, ProcessDefinition process, String tester, int quantity) {
        this.productCode = product.getProductCode();
        this.productName = product.getProductName();
        this.process = process.getProcessName();
        this.product = product;
        this.workOrder = workOrder;
        this.currentProcess = process;
        this.tester = tester;
        this.quantity = quantity;
    }

    @PrePersist
    void onCreate() {
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
