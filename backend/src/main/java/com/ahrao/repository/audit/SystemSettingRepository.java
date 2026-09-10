package com.ahrao.repository.audit;

import com.ahrao.entity.audit.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findBySettingKey(String settingKey);
    Optional<SystemSetting> findByInstitutionIdAndSettingKey(Long institutionId, String settingKey);
    List<SystemSetting> findByInstitutionId(Long institutionId);
}
