package com.cj.mesprototype.lot.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "process_route_steps", uniqueConstraints = @UniqueConstraint(columnNames = {"process_route_id", "sequence_no"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessRouteStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "process_route_id", nullable = false) private ProcessRoute route;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "process_id", nullable = false) private ProcessDefinition process;
    @Column(name = "sequence_no", nullable = false) private Integer sequenceNo;
    private ProcessRouteStep(ProcessRoute route, ProcessDefinition process, int sequenceNo) { this.route = route; this.process = process; this.sequenceNo = sequenceNo; }
    public static ProcessRouteStep of(ProcessRoute route, ProcessDefinition process, int sequenceNo) { return new ProcessRouteStep(route, process, sequenceNo); }
}
