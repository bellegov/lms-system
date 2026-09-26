package com.education.lms_backend.controller;

import com.education.lms_backend.model.Certificate;
import com.education.lms_backend.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CertificateController {

    private final CertificateRepository certificateRepo;

    @GetMapping("/user/{userId}")
    public List<Certificate> getUserCertificates(@PathVariable Long userId) {
        return certificateRepo.findByUserId(userId);
    }

    @GetMapping("/verify/{uuid}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String uuid) {
        return certificateRepo.findByUuid(uuid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
