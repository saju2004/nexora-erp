package com.erp.nexora.repository;

import com.erp.nexora.entity.CompanySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanySettingRepository extends JpaRepository<CompanySetting, Long> {
    Optional<CompanySetting> findByKey(String key);
    List<CompanySetting> findByCategory(String category);
}
