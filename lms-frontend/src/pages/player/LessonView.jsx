import React from 'react';
import api from '../../api/axiosConfig';

export default function LessonView({ lesson, userId, courseId, isCompleted, onComplete, onStartTest }) {
    
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            if (url.includes('youtube') || url.includes('youtu.be')) {
                const videoId = url.split('v=')[1] || url.split('/').pop();
                return `https://www.youtube.com/embed/${videoId.split('?')[0]}`;
            }
        } catch (e) { return null; }
        return null;
    };

    const isImage = (url) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.includes('upload.wikimedia') || url.includes('images');
    };


    const hasTest = Array.isArray(lesson.questions) && lesson.questions.length > 0;

    const handleComplete = async () => {
        try {
            await api.post(`/courses/${courseId}/lessons/${lesson.id}/complete?userId=${userId}`);
            onComplete(); 
        } catch (e) {

            if (e.response && e.response.status === 400 && e.response.data.includes('тест')) {
                onStartTest();
            } else {
                alert(e.response?.data || 'Ошибка соединения');
            }
        }
    };

    return (
        <div className="content-area">
            <h1 style={{marginBottom: '1.5rem'}}>{lesson.title}</h1>
            
            {lesson.videoUrl && (
                <div style={{marginBottom: '2rem'}}>
                    {isImage(lesson.videoUrl) ? (
                        <div style={{textAlign: 'center'}}>
                            <img src={lesson.videoUrl} alt="Медиа" style={{maxWidth: '100%', borderRadius: '12px'}} />
                        </div>
                    ) : getEmbedUrl(lesson.videoUrl) ? (
                        <div className="video-wrapper">
                            <iframe src={getEmbedUrl(lesson.videoUrl)} title="Video" allowFullScreen></iframe>
                        </div>
                    ) : (
                        <a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={{color: '#2563eb'}}>🔗 Открыть материалы</a>
                    )}
                </div>
            )}

            <div className="text-content">
                {lesson.content ? lesson.content.split('\n').map((par, i) => (
                    <p key={i} style={{marginBottom: '1rem', lineHeight: '1.6'}}>{par}</p>
                )) : <p>...</p>}
            </div>

            <div style={{marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem'}}>
                {isCompleted ? (
                    <button className="secondary" disabled style={{background: '#f1f5f9', color: '#10b981', border: '1px solid #10b981'}}>
                        ✅ Урок успешно пройден
                    </button>
                ) : (
                    <>
                        {hasTest ? (
                            <div style={{background: '#eff6ff', padding: '1.5rem', borderRadius: '12px'}}>
                                <h4 style={{marginTop:0, color:'#1e40af'}}>📝 Практическое задание</h4>
                                <p style={{fontSize:'0.95rem', marginBottom:'1rem'}}>Вам предстоит ответить на {lesson.questions.length} вопросов.</p>
                                <button onClick={onStartTest}>Перейти к тесту →</button>
                            </div>
                        ) : (
                            <button onClick={handleComplete}>Завершить урок →</button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}