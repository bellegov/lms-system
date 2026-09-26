package com.education.lms_backend.controller;

import com.education.lms_backend.dto.TestSubmissionDto;
import com.education.lms_backend.model.Course;
import com.education.lms_backend.model.Enrollment;
import com.education.lms_backend.model.Lesson;
import com.education.lms_backend.model.TestQuestion;
import com.education.lms_backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourseService courseService;


    // КАТАЛОГ

    @GetMapping
    public List<Course> getCatalog(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return courseService.getAllCourses().stream()
                    .filter(c -> c.getCategory().equalsIgnoreCase(category))
                    .toList();
        }
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable Long id) {
        return courseService.getCourseDetails(id);
    }


    // ДЛЯ СТУДЕНТА

    @PostMapping("/{courseId}/enroll/{userId}")
    public ResponseEntity<?> enroll(@PathVariable Long courseId, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(courseService.enrollStudent(userId, courseId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my/{userId}")
    public List<Enrollment> getMyCourses(@PathVariable Long userId) {
        return courseService.getStudentEnrollments(userId);
    }

    @GetMapping("/lessons/{lessonId}")
    public Lesson getLesson(@PathVariable Long lessonId) {
        return courseService.getLessonDetails(lessonId);
    }

    @PostMapping("/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(@PathVariable Long courseId, @PathVariable Long lessonId, @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(courseService.completeLesson(userId, courseId, lessonId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/test/submit")
    public ResponseEntity<?> submitTest(@RequestBody TestSubmissionDto dto) {
        try {
            Enrollment updatedEnrollment = courseService.submitTest(dto.getUserId(), dto.getCourseId(), dto.getLessonId(), dto.getAnswers());
            return ResponseEntity.ok(updatedEnrollment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    // ДЛЯ АДМИНА


    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createCourse(course);
    }

    @PostMapping("/{courseId}/lessons")
    public Lesson addLesson(@PathVariable Long courseId, @RequestBody Lesson lesson) {
        return courseService.addLessonToCourse(courseId, lesson);
    }

    @PostMapping("/lessons/{lessonId}/questions")
    public TestQuestion addQuestion(@PathVariable Long lessonId, @RequestBody TestQuestion question) {
        return courseService.addTestToLesson(lessonId, question);
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        courseService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/lessons/{lessonId}/questions")
    public ResponseEntity<?> deleteAllQuestions(@PathVariable Long lessonId) {
        courseService.deleteAllQuestionsFromLesson(lessonId);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }


    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return courseService.updateCourse(id, course);
    }


    @DeleteMapping("/lessons/{id}")
    public ResponseEntity<?> deleteLesson(@PathVariable Long id) {
        courseService.deleteLesson(id);
        return ResponseEntity.ok().build();
    }


    @PutMapping("/lessons/{id}")
    public Lesson updateLesson(@PathVariable Long id, @RequestBody Lesson lesson) {
        return courseService.updateLesson(id, lesson);
    }
}