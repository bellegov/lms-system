package com.education.lms_backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class TestSubmissionDto {
    private Long userId;
    private Long courseId;
    private Long lessonId;
    private Map<Long, List<String>> answers;
}