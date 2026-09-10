package com.ahrao.repository.academic;

import com.ahrao.entity.academic.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long>, JpaSpecificationExecutor<TimeSlot> {
    List<TimeSlot> findByInstitutionId(Long institutionId);
    List<TimeSlot> findByDayOfWeek(String dayOfWeek);
    List<TimeSlot> findByInstitutionIdAndDayOfWeek(Long institutionId, String dayOfWeek);
    Optional<TimeSlot> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
}
