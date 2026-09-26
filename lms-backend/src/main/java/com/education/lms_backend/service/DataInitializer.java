package com.education.lms_backend.service;

import com.education.lms_backend.model.*;
import com.education.lms_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final CourseRepository courseRepo;
    private final LessonRepository lessonRepo;
    private final TestQuestionRepository questionRepo;

    @Override
    public void run(String... args) throws Exception {
        if (userRepo.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin");
            admin.setFullName("Главный Преподаватель");
            admin.setRole(Role.ADMIN);
            userRepo.save(admin);

            User student = new User();
            student.setUsername("student");
            student.setPassword("123");
            student.setFullName("Студент Тестовый");
            student.setRole(Role.STUDENT);
            userRepo.save(student);

            System.out.println("Созданы пользователи: admin/admin, student/123");
        }

        if (courseRepo.count() == 0) {
            System.out.println("Заполняю базу данных курсами...");
            createDigitalLiteracyCourse();
            createPythonCourse();
            createWebDesignCourse();
            createJavaCourse();
            System.out.println("База данных успешно заполнена!");
        }
    }

    // КУРС 1: Цифровая грамотность
    private void createDigitalLiteracyCourse() {
        Course c = new Course();
        c.setTitle("Цифровая грамотность 2024");
        c.setDescription("Базовый курс по безопасности в сети и облачным технологиям.");
        c.setCategory("Цифровая грамотность");
        c.setDifficulty("Базовый");
        c = courseRepo.save(c);

        createLesson(c, "Урок 1: Пароли и 2FA",
                "Хороший пароль содержит заглавные/строчные буквы, цифры и символы. Двухфакторная аутентификация (2FA) — это второй рубеж обороны.",
                "https://www.youtube.com/watch?v=yrRjMoyC3OI",
                List.of(
                        createQuestion("Какой пароль является наиболее надежным?",
                                List.of("12345678", "Minsk2024", "Tr@ub4d0ur&3"),
                                List.of("Tr@ub4d0ur&3"))
                ));

        createLesson(c, "Урок 2: Что такое фишинг?",
                "Фишинг — это кража данных через поддельные сайты. Никогда не переходите по подозрительным ссылкам из писем.",
                null,
                List.of(
                        createQuestion("Вам пришло СМС 'Ваша карта заблокирована, перейдите по ссылке...'. Ваши действия?",
                                List.of("Перейти по ссылке", "Удалить сообщение", "Позвонить в банк по номеру с карты"),
                                List.of("Удалить сообщение", "Позвонить в банк по номеру с карты"))
                ));
    }

    // КУРС 2: Основы Python
    private void createPythonCourse() {
        Course c = new Course();
        c.setTitle("Основы Python для начинающих");
        c.setDescription("Изучите самый популярный язык программирования с нуля.");
        c.setCategory("Программирование");
        c.setDifficulty("Начинающий");
        c = courseRepo.save(c);

        createLesson(c, "1. Переменные и типы данных",
                "Python имеет динамическую типизацию. Основные типы: int, float, str, bool.",
                "https://i.ytimg.com/vi/f7gxPsSvIYU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDxJ14oCFrz_Lnc5uF8SPLjTx3a8g",
                List.of(
                        createQuestion("Какой тип данных у переменной x = 3.14?",
                                List.of("int", "str", "float", "double"),
                                List.of("float"))
                ));

        createLesson(c, "2. Условные операторы if/else",
                "Отступы в Python критически важны! Они определяют блоки кода.",
                "https://www.youtube.com/watch?v=PqFKRqpHrjw",
                List.of(
                        createQuestion("Какой оператор проверяет НЕРАВЕНСТВО?",
                                List.of("==", "!=", "<>", "><"),
                                List.of("!="))
                ));
    }

    // КУРС 3: Веб-дизайн (UI/UX)
    private void createWebDesignCourse() {
        Course c = new Course();
        c.setTitle("Введение в веб-дизайн (Figma)");
        c.setDescription("Научитесь создавать красивые интерфейсы сайтов.");
        c.setCategory("ИКТ");
        c.setDifficulty("Продвинутый");
        c = courseRepo.save(c);

        createLesson(c, "Работа с цветом", "Цветовой круг Иттена. Как подбирать палитру для сайта.", "https://www.youtube.com/watch?v=AvgCkHrcj90", null);
        createLesson(c, "Типографика", "Шрифтовые пары. Чем отличается Serif от Sans Serif.", null,
                List.of(createQuestion("Какой шрифт лучше для длинного текста на экране?",
                        List.of("С засечками (Serif)", "Без засечек (Sans Serif)", "Рукописный"),
                        List.of("Без засечек (Sans Serif)")))
        );
    }

    // КУРС 4: Java для Энтерпрайза
    private void createJavaCourse() {
        Course c = new Course();
        c.setTitle("Java Enterprise: Основы");
        c.setDescription("Строгая типизация, ООП и подготовка к энтерпрайзу.");
        c.setCategory("Программирование");
        c.setDifficulty("Продвинутый");
        c = courseRepo.save(c);

        createLesson(c, "1. Синтаксис и структура",
                "Любая программа на Java начинается с класса и метода main. Тип переменной нужно объявлять.",
                "https://cdn.javarush.com/images/article/3897dc3c-adef-4c8d-a651-0b30111e6f96/800.jpeg", // Картинка
                List.of(
                        createQuestion("Какая команда выводит текст в консоль?",
                                List.of("print()", "System.out.println()", "echo"),
                                List.of("System.out.println()")),
                        createQuestion("Какой метод является точкой входа?",
                                List.of("start()", "main()", "run()"),
                                List.of("main()"))
                ));

        createLesson(c, "2. Основы ООП",
                "4 кита ООП: Инкапсуляция, Наследование, Полиморфизм, Абстракция.",
                "https://habrastorage.org/getpro/habr/upload_files/97c/afe/03b/97cafe03b7dcfafba75fa39a562d5ccc.jpg", // Картинка
                List.of(
                        createQuestion("С помощью какого слова создается объект?",
                                List.of("create", "new", "make"),
                                List.of("new")),
                        createQuestion("Как называется метод, который вызывается при создании объекта?",
                                List.of("Конструктор", "Билдер", "Инициализатор"),
                                List.of("Конструктор")),
                        createQuestion("Может ли класс наследоваться от двух классов сразу в Java?",
                                List.of("Да", "Нет", "Только если они абстрактные"),
                                List.of("Нет"))
                ));
    }

    private void createLesson(Course course, String title, String content, String videoUrl, List<TestQuestion> questions) {
        Lesson l = new Lesson();
        l.setTitle(title);
        l.setContent(content);
        l.setVideoUrl(videoUrl);
        l.setCourse(course);
        l = lessonRepo.save(l);

        if (questions != null) {
            for (TestQuestion q : questions) {
                q.setLesson(l);
                questionRepo.save(q);
            }
        }
    }

    private TestQuestion createQuestion(String text, List<String> options, List<String> correct) {
        TestQuestion q = new TestQuestion();
        q.setQuestionText(text);
        q.setOptions(options);
        q.setCorrectAnswers(correct);
        return q;
    }
}