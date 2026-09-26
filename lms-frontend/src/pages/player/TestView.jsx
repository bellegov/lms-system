import React, { useState } from 'react';
import api from '../../api/axiosConfig';

export default function TestView({ lesson, userId, courseId, onSuccess, onCancel }) {
    const [answers, setAnswers] = useState({});

    
    if (!lesson.questions || lesson.questions.length === 0) {
        return (
            <div className="content-area">
                <h2>Ошибка загрузки теста</h2>
                <p>Не удалось загрузить вопросы. Попробуйте обновить страницу.</p>
                <button className="secondary" onClick={onCancel}>Назад к уроку</button>
            </div>
        );
    }

    const toggleOption = (qId, option) => {
        const current = answers[qId] || [];
        if (current.includes(option)) {
            setAnswers({ ...answers, [qId]: current.filter(o => o !== option) });
        } else {
            setAnswers({ ...answers, [qId]: [...current, option] });
        }
    };

    const handleSubmit = async () => {
       const hasUnanswered = lesson.questions.some(
    q => !answers[q.id] || answers[q.id].length === 0
);
if (hasUnanswered) {
    alert('Пожалуйста, ответьте на все вопросы перед отправкой!');
    return;

        }

        const formattedAnswers = {};
        Object.keys(answers).forEach(key => {
            formattedAnswers[parseInt(key)] = answers[key];
        });

        try {
            await api.post('/courses/test/submit', {
                userId: parseInt(userId),
                courseId: parseInt(courseId),
                lessonId: lesson.id,
                answers: formattedAnswers 
            });
            alert('🎉 Тест сдан!');
            onSuccess();
        } catch (e) {
            alert(e.response?.data || 'Ошибка: возможно, ответы неверны.');
        }
    };

    return (
        <div className="content-area">
            <h1>📝 Тест к уроку: {lesson.title}</h1>
            <p style={{color: '#64748b', marginBottom: '2rem'}}>
                Выберите все правильные варианты ответов.
            </p>

            {lesson.questions.map((q, idx) => (
                <div key={q.id} style={{marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px'}}>
                    <h3 style={{marginBottom: '1rem', marginTop: 0}}>
                        {idx + 1}. {q.questionText}
                    </h3>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {q.options && q.options.map((option, oIdx) => {
                            const isSelected = answers[q.id]?.includes(option);
                            return (
                                <div 
                                    key={oIdx} 
                                    className={`quiz-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleOption(q.id, option)}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '1rem', 
                                        background: 'white', border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                                        borderRadius: '8px', cursor: 'pointer'
                                    }}
                                >
                                    <div className="checkbox" style={{
                                        width: 20, height: 20, border: `2px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`, 
                                        borderRadius: 4, marginRight: 15, background: isSelected ? '#2563eb' : 'white'
                                    }}></div>
                                    {option}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                <button onClick={handleSubmit} className="success" style={{flex: 2}}>
                    Отправить ответы на проверку
                </button>
                <button onClick={onCancel} className="secondary" style={{flex: 1}}>
                    Вернуться к лекции
                </button>
            </div>
        </div>
    );
}