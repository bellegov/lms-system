package com.education.lms_backend.repository;

import com.education.lms_backend.model.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {}
