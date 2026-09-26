import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Catalog({ user }) {
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState({}); 
    const [categories, setCategories] = useState(['Все']);
    const [activeCategory, setActiveCategory] = useState('Все');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        const coursesRes = await api.get('/courses');
        setCourses(coursesRes.data);

       
        const cats = ['Все', ...new Set(coursesRes.data.map(c => c.category))];
        setCategories(cats);

        if (user && user.role === 'STUDENT') {
            const myRes = await api.get(`/courses/my/${user.id}`);
            const enrollMap = {};
            myRes.data.forEach(e => enrollMap[e.course.id] = e);
            setEnrollments(enrollMap);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await api.post(`/courses/${courseId}/enroll/${user.id}`);
            alert('Вы записаны! Переходим к обучению...');
            navigate(`/course/${courseId}`);
        } catch (err) {
            alert('Ошибка записи');
        }
    };

    
    const filteredCourses = activeCategory === 'Все' 
        ? courses 
        : courses.filter(c => c.category === activeCategory);

    return (
        <div className="container">
            <h1>Каталог знаний</h1>
            
            {/* Табы категорий */}
            <div className="tabs">
                {categories.map(cat => (
                    <div 
                        key={cat} 
                        className={`tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </div>
                ))}
            </div>

            <div className="grid">
                {filteredCourses.map(course => {
                    const enrollment = enrollments[course.id];
                    return (
                        <div key={course.id} className="card">
                            <span className="badge">{course.category} • {course.difficulty}</span>
                            <h3 className="card-title">{course.title}</h3>
                            <p className="card-desc">{course.description}</p>
                            
                            {enrollment ? (
                                <div>
                                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'5px'}}>
                                        <span>Прогресс</span>
                                        <strong>{enrollment.progressPercent}%</strong>
                                    </div>
                                    <div className="progress-bg">
                                        <div className="progress-fill" style={{width: `${enrollment.progressPercent}%`}}></div>
                                    </div>
                                    <button className="secondary" onClick={() => navigate(`/course/${course.id}`)}>
                                        Продолжить
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => handleEnroll(course.id)}>Начать обучение</button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}