package com.cj.mesprototype.lot.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "process_routes", uniqueConstraints = @UniqueConstraint(columnNames = {"route_code", "version"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessRoute {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "route_code", nullable = false, length = 100) private String routeCode;
    @Column(name = "route_name", nullable = false, length = 200) private String routeName;
    @Column(nullable = false) private Integer version;
    @Column(nullable = false) private boolean active = true;

    private ProcessRoute(String code, String name, int version) { this.routeCode = code; this.routeName = name; this.version = version; }
    public static ProcessRoute of(String code, String name, int version) { return new ProcessRoute(code, name, version); }
}
