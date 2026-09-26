package com.education.lms_backend.service;

import com.education.lms_backend.model.*;
import com.education.lms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepo;
    private final LessonRepository lessonRepo;
    private final EnrollmentRepository enrollRepo;
    private final UserRepository userRepo;
    private final TestQuestionRepository questionRepo;
    private final CertificateRepository certificateRepo;

    // АДМИНСКАЯ ЧАСТЬ

    public Course createCourse(Course course) {
        return courseRepo.save(course);
    }

    @Transactional
    public Lesson addLessonToCourse(Long courseId, Lesson lesson) {
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new RuntimeException("Курс не найден"));
        lesson.setCourse(course);
        return lessonRepo.save(lesson);
    }

    @Transactional
    public TestQuestion addTestToLesson(Long lessonId, TestQuestion testQuestion) {
        Lesson lesson = lessonRepo.findById(lessonId).orElseThrow(() -> new RuntimeException("Урок не найден"));
        testQuestion.setLesson(lesson);
        return questionRepo.save(testQuestion);
    }
    public void deleteQuestion(Long questionId) {
        questionRepo.deleteById(questionId);
    }

    @Transactional
    public void deleteAllQuestionsFromLesson(Long lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId).orElseThrow();
        questionRepo.deleteAll(lesson.getQuestions());
        lesson.getQuestions().clear();
        lessonRepo.save(lesson);
    }

    // КАТАЛОГ
    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    public Course getCourseDetails(Long id) {
        return courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Курс не найден"));
    }

    public Lesson getLessonDetails(Long lessonId) {
        return lessonRepo.findById(lessonId).orElseThrow(() -> new RuntimeException("Урок не найден"));
    }

    public List<Enrollment> getStudentEnrollments(Long userId) {
        return enrollRepo.findByUserId(userId);
    }


    public void deleteCourse(Long courseId) {
        courseRepo.deleteById(courseId);
    }

    public void deleteLesson(Long lessonId) {
        lessonRepo.deleteById(lessonId);
    }

    @Transactional
    public Course updateCourse(Long id, Course updated) {
        Course existing = courseRepo.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setCategory(updated.getCategory());
        existing.setDifficulty(updated.getDifficulty());
        return courseRepo.save(existing);
    }

    @Transactional
    public Lesson updateLesson(Long id, Lesson updated) {
        Lesson existing = lessonRepo.findById(id).orElseThrow();
        existing.setTitle(updated.getTitle());
        existing.setContent(updated.getContent());
        existing.setVideoUrl(updated.getVideoUrl());
        return lessonRepo.save(existing);
    }


    @Transactional
    public Enrollment enrollStudent(Long userId, Long courseId) {
        if (enrollRepo.findByUserIdAndCourseId(userId, courseId).isPresent()) {
            throw new RuntimeException("Вы уже записаны на этот курс!");
        }

        User user = userRepo.findById(userId).orElseThrow();
        Course course = courseRepo.findById(courseId).orElseThrow();

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setProgressPercent(0);
        enrollment.setCompleted(false);
        enrollment.setCertificateIssued(false);

        return enrollRepo.save(enrollment);
    }

    @Transactional
    public Enrollment completeLesson(Long userId, Long courseId, Long lessonId) {
        Lesson lesson = lessonRepo.findById(lessonId).orElseThrow();

        if (lesson.getQuestions() != null && !lesson.getQuestions().isEmpty()) {
            throw new RuntimeException("В этом уроке есть тест. Сначала пройдите его!");
        }

        return updateProgressAndCheckCertificate(userId, courseId, lessonId);
    }

    @Transactional
    public Enrollment submitTest(Long userId, Long courseId, Long lessonId, Map<Long, List<String>> studentAnswers) {
        Lesson lesson = lessonRepo.findById(lessonId).orElseThrow();

        System.out.println("--- НАЧАЛО ПРОВЕРКИ ТЕСТА ---");
        System.out.println("Полученные ответы от фронта: " + studentAnswers);

        // Проверяем каждый вопрос
        for (TestQuestion question : lesson.getQuestions()) {
            List<String> correct = question.getCorrectAnswers();
            List<String> studentAns = studentAnswers.get(question.getId());

            System.out.println("Вопрос: " + question.getQuestionText());
            System.out.println("Правильные ответы: " + correct);
            System.out.println("Ответ студента: " + studentAns);

            if (studentAns == null || studentAns.isEmpty()) {
                throw new RuntimeException("Вы не ответили на вопрос: " + question.getQuestionText());
            }

            List<String> cleanCorrect = correct.stream().map(s -> s.trim().toLowerCase()).toList();
            List<String> cleanStudent = studentAns.stream().map(s -> s.trim().toLowerCase()).toList();


            boolean isCorrect = cleanCorrect.size() == cleanStudent.size()
                    && cleanCorrect.containsAll(cleanStudent)
                    && cleanStudent.containsAll(cleanCorrect);

            if (!isCorrect) {
                System.out.println("ОШИБКА: Ответы не совпали!");
                throw new RuntimeException("Неверный ответ на вопрос: " + question.getQuestionText());
            }
        }

        System.out.println("--- ТЕСТ ПРОЙДЕН УСПЕШНО ---");
        return updateProgressAndCheckCertificate(userId, courseId, lessonId);
    }

    private Enrollment updateProgressAndCheckCertificate(Long userId, Long courseId, Long lessonId) {
        Enrollment enrollment = enrollRepo.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Вы не записаны на этот курс"));

        enrollment.getCompletedLessonIds().add(lessonId);

        int totalLessons = enrollment.getCourse().getLessons().size();
        if (totalLessons == 0) totalLessons = 1;

        int completed = enrollment.getCompletedLessonIds().size();
        int progress = (int) Math.round((double) completed / totalLessons * 100);

        enrollment.setProgressPercent(progress);

        if (progress >= 100 && !enrollment.isCertificateIssued()) {
            enrollment.setCompleted(true);
            enrollment.setCertificateIssued(true);

            Certificate cert = new Certificate();
            cert.setUuid(java.util.UUID.randomUUID().toString());
            cert.setIssueDate(java.time.LocalDateTime.now());
            cert.setUser(enrollment.getUser());
            cert.setCourse(enrollment.getCourse());

            certificateRepo.save(cert);
            System.out.println("Выдан сертификат: " + cert.getUuid());
        }

        return enrollRepo.save(enrollment);
    }
}