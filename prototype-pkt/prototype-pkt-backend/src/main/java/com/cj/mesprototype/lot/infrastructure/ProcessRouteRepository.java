package com.cj.mesprototype.lot.infrastructure;
import com.cj.mesprototype.lot.domain.ProcessRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ProcessRouteRepository extends JpaRepository<ProcessRoute, Long> { Optional<ProcessRoute> findByRouteCodeAndVersion(String routeCode, Integer version); }
