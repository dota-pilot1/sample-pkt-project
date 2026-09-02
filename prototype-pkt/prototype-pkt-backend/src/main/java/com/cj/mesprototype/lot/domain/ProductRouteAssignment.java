package com.cj.mesprototype.lot.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_route_assignments", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "process_route_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductRouteAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private Product product;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "process_route_id", nullable = false) private ProcessRoute route;
    @Column(name = "default_route", nullable = false) private boolean defaultRoute;
    private ProductRouteAssignment(Product product, ProcessRoute route, boolean defaultRoute) { this.product = product; this.route = route; this.defaultRoute = defaultRoute; }
    public static ProductRouteAssignment of(Product product, ProcessRoute route, boolean defaultRoute) { return new ProductRouteAssignment(product, route, defaultRoute); }
}
