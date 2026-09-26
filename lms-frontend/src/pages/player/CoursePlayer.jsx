import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle } from 'lucide-react';
import api from '../../api/axiosConfig';
import LessonView from './LessonView';
import TestView from './TestView';

export default function CoursePlayer({ user }) {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [viewMode, setViewMode] = useState('lesson'); 
    const navigate = useNavigate();

    useEffect(() => { loadCourse(); }, [courseId]);

    const loadCourse = async () => {
        try {
            const cRes = await api.get(`/courses/${courseId}`);
            setCourse(cRes.data);
            
            const myRes = await api.get(`/courses/my/${user.id}`);
            const myEnroll = myRes.data.find(e => e.course.id === parseInt(courseId));
            
            if (!myEnroll) {
                alert('Вы не записаны на этот курс');
                navigate('/catalog');
                return;
            }
            setEnrollment(myEnroll);

            if (cRes.data.lessons.length > 0) {
                handleSelectLesson(cRes.data.lessons[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectLesson = async (lessonId) => {
        try {
            const res = await api.get(`/courses/lessons/${lessonId}`);
            setActiveLesson(res.data);
            setViewMode('lesson'); 
        } catch (e) {
            alert('Ошибка загрузки урока');
        }
    };

    const isLessonCompleted = (lessonId) => {
        return enrollment?.completedLessonIds?.includes(lessonId);
    };

    const refreshProgress = async () => {
        const myRes = await api.get(`/courses/my/${user.id}`);
        const myEnroll = myRes.data.find(e => e.course.id === parseInt(courseId));
        setEnrollment(myEnroll);
        setViewMode('lesson'); 
    };

    if (!course || !activeLesson) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <div className="player-layout">
                <div className="sidebar">
                    <h3 style={{marginBottom:'1rem'}}>{course.title}</h3>
                    {course.lessons.map((lesson, idx) => (
                        <div 
                            key={lesson.id} 
                            className={`lesson-item ${activeLesson.id === lesson.id ? 'active' : ''}`}
                            onClick={() => handleSelectLesson(lesson.id)}
                        >
                            <div className="lesson-icon">
                                {isLessonCompleted(lesson.id) 
                                    ? <CheckCircle size={20} color="#10b981" /> 
                                    : <Circle size={20} color="#cbd5e1" />}
                            </div>
                            <div>
                                <div style={{fontSize:'0.8rem', color:'#64748b'}}>Урок {idx + 1}</div>
                                {lesson.title}
                            </div>
                        </div>
                    ))}
                    
                    <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0'}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                            <small>Прогресс</small>
                            <small>{enrollment.progressPercent}%</small>
                        </div>
                        <div className="progress-bg">
                            <div className="progress-fill" style={{width: `${enrollment.progressPercent}%`}}></div>
                        </div>
                    </div>
                </div>

                <div>
                    {}
                    {viewMode === 'test' ? (
                        <TestView 
                            lesson={activeLesson} 
                            userId={user.id} 
                            courseId={courseId} 
                            onSuccess={refreshProgress}
                            onCancel={() => setViewMode('lesson')}
                        />
                    ) : (
                        <LessonView 
                            lesson={activeLesson} 
                            userId={user.id} 
                            courseId={courseId}
                            isCompleted={isLessonCompleted(activeLesson.id)}
                            onComplete={refreshProgress}
                            onStartTest={() => setViewMode('test')} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}