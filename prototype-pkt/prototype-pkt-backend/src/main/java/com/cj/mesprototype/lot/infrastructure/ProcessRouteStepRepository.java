package com.cj.mesprototype.lot.infrastructure;
import com.cj.mesprototype.lot.domain.ProcessRouteStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProcessRouteStepRepository extends JpaRepository<ProcessRouteStep, Long> { List<ProcessRouteStep> findAllByRouteIdOrderBySequenceNoAsc(Long routeId); }
