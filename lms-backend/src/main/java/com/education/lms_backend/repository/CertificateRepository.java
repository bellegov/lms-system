package com.education.lms_backend.repository;

import com.education.lms_backend.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    Optional<Certificate> findByUuid(String uuid);


    List<Certificate> findByUserId(Long userId);
}
