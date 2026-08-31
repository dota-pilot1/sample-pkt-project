package com.cj.mesprototype.lot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 제품별 공정 경로. 공정 순서는 process가 아닌 이 관계에 속한다. */
@Entity
@Table(name = "product_process_routes", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "process_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductProcessRoute {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name = "product_id", nullable = false) private Product product;
    @ManyToOne @JoinColumn(name = "process_id", nullable = false) private ProcessDefinition process;
    @Column(name = "sequence_no", nullable = false) private int sequenceNo;
    @Column(nullable = false) private boolean required = true;
    private ProductProcessRoute(Product product, ProcessDefinition process, int sequenceNo) { this.product = product; this.process = process; this.sequenceNo = sequenceNo; }
    public static ProductProcessRoute of(Product product, ProcessDefinition process, int sequenceNo) { return new ProductProcessRoute(product, process, sequenceNo); }
}
