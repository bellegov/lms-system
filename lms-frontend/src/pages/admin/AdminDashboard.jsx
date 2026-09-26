import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ArrowLeft, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import Modal from '../../components/Modal'; // Убедись, что этот файл существует в src/components

export default function AdminDashboard() {
    const [view, setView] = useState('list'); 
    const [courses, setCourses] = useState([]);
    const [activeCourse, setActiveCourse] = useState(null);
    const [expandedLessons, setExpandedLessons] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '', difficulty: 'Базовый' });
    const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '' });
    const [activeLessonId, setActiveLessonId] = useState(null);
    const [questionForm, setQuestionForm] = useState({ questionText: '' });
const [questionOptions, setQuestionOptions] = useState([
    { text: '', correct: false },
    { text: '', correct: false }
]);

    useEffect(() => { loadCourses(); }, []);

    const loadCourses = async () => {
        const res = await api.get('/courses');
        setCourses(res.data);
    };

    const refreshActiveCourse = async () => {
        if (!activeCourse) return;
        const res = await api.get(`/courses/${activeCourse.id}`);
        setActiveCourse(res.data);
    };

    const toggleQuestions = (lessonId) => {
        setExpandedLessons(prev => ({...prev, [lessonId]: !prev[lessonId]}));
    };

    const openEditModal = (item, type) => {
        setEditingItem({ type, data: { ...item } });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingItem) return;
        const { type, data } = editingItem;
        
        try {
            if (type === 'course') {
                await api.put(`/courses/${data.id}`, data);
                loadCourses();
            } else if (type === 'lesson') {
                await api.put(`/courses/lessons/${data.id}`, data);
                refreshActiveCourse();
            }
            alert('Изменения сохранены!');
            setIsEditModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            alert('Ошибка при сохранении');
        }
    };

    const handleDeleteQuestion = async (qId) => {
        if (!window.confirm('Удалить этот вопрос?')) return;
        await api.delete(`/courses/questions/${qId}`);
        refreshActiveCourse();
    };

    const handleDeleteAllQuestions = async (lessonId) => {
        if (!window.confirm('Удалить ВСЕ вопросы из этого урока?')) return;
        await api.delete(`/courses/lessons/${lessonId}/questions`);
        refreshActiveCourse();
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('Удалить курс и все его уроки?')) return;
        await api.delete(`/courses/${id}`);
        loadCourses();
    };

    const handleDeleteLesson = async (id) => {
        if (!window.confirm('Удалить урок?')) return;
        await api.delete(`/courses/lessons/${id}`);
        refreshActiveCourse();
    };


    const handleCreateCourse = async (e) => {
        e.preventDefault();
        await api.post('/courses', courseForm);
        alert('Курс создан!');
        setCourseForm({ title: '', description: '', category: '', difficulty: 'Базовый' });
        setView('list'); 
        loadCourses();
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        await api.post(`/courses/${activeCourse.id}/lessons`, lessonForm);
        setLessonForm({ title: '', content: '', videoUrl: '' });
        refreshActiveCourse();
    };

   const handleAddQuestion = async () => {
        // 1. Извлекаем только те опции, где реально введен текст (защита от undefined)
        const validOptions = questionOptions.filter(o => o.text && o.text.trim() !== '');
        
        // 2. Извлекаем текст ТОЛЬКО ПРАВИЛЬНЫХ опций
        const correctAnswers = validOptions
            .filter(o => o.correct === true)
            .map(o => o.text.trim());

        // 3. Извлекаем текст ВСЕХ валидных опций
        const allOptionTexts = validOptions.map(o => o.text.trim());

        // ПРОВЕРКА
        if (!questionForm.questionText || questionForm.questionText.trim() === '') {
            alert('Введите текст вопроса!');
            return;
        }
        if (allOptionTexts.length < 2) {
            alert('Нужно как минимум 2 варианта ответа!');
            return;
        }
        if (correctAnswers.length === 0) {
            alert('Отметьте галочкой хотя бы один правильный ответ!');
            return;
        }

        // ФОРМИРУЕМ JSON ДЛЯ БЭКЕНДА
        const payload = {
            questionText: questionForm.questionText.trim(),
            options: allOptionTexts,
            correctAnswers: correctAnswers // ВОТ ОНИ, ПРАВИЛЬНЫЕ ОТВЕТЫ
        };

        // ВЫВОДИМ В КОНСОЛЬ, ЧТОБЫ ТЫ МОГ ПРОВЕРИТЬ (F12 -> Console)
        console.log("ОТПРАВЛЯЮ НА БЭКЕНД:", payload);

        try {
            await api.post(`/courses/lessons/${activeLessonId}/questions`, payload);
            alert('Вопрос успешно добавлен!');
            
            // Очищаем форму после успеха
            setQuestionForm({ questionText: '' });
            setQuestionOptions([{ text: '', correct: false }, { text: '', correct: false }]);
            setActiveLessonId(null);
            refreshActiveCourse(); 
        } catch (err) {
            console.error(err);
            alert('Ошибка при сохранении вопроса на сервере!');
        }
    };

    return (
        <div className="container">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem'}}>
                <h1>🎓 Панель Админа</h1>
                {view === 'list' && (
                    <button onClick={() => setView('create-course')} style={{width:'auto', display:'flex', gap:'10px'}}>
                        <Plus size={20}/> Новый курс
                    </button>
                )}
            </div>

            {view === 'list' && (
                <div className="grid">
                    {courses.map(c => (
                        <div key={c.id} className="card">
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <span className="badge">{c.category}</span>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <Edit2 size={16} color="#2563eb" style={{cursor:'pointer'}} onClick={() => openEditModal(c, 'course')}/>
                                    <Trash2 size={16} color="#ef4444" style={{cursor:'pointer'}} onClick={() => handleDeleteCourse(c.id)}/>
                                </div>
                            </div>
                            <h3 className="card-title">{c.title}</h3>
                            <p className="card-desc">{c.description}</p>
                            <button className="secondary" onClick={() => { setActiveCourse(c); setView('manage'); }}>Управление уроками</button>
                        </div>
                    ))}
                </div>
            )}

            {view === 'create-course' && (
                <div className="card" style={{maxWidth: '600px', margin: '0 auto'}}>
                    <button className="secondary" onClick={() => setView('list')} style={{marginBottom:'1rem', width:'auto'}}><ArrowLeft size={16}/> Назад</button>
                    <h2>Новый курс</h2>
                    <form onSubmit={handleCreateCourse}>
                        <label>Название</label>
                        <input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required />
                        <label>Категория</label>
                        <input value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} required />
                        <label>Описание</label>
                        <textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} required />
                        <button type="submit">Создать курс</button>
                    </form>
                </div>
            )}

            {view === 'manage' && activeCourse && (
                <div>
                    <button className="secondary" onClick={() => setView('list')} style={{marginBottom:'1rem', width:'auto'}}><ArrowLeft size={16}/> Назад к курсам</button>
                    <h2>Курс: {activeCourse.title}</h2>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                        <div className="card" style={{height:'fit-content'}}>
                            <h3>Добавить урок</h3>
                            <form onSubmit={handleAddLesson}>
                                <label>Название</label>
                                <input value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required />
                                <label>Ссылка на видео/фото</label>
                                <input value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} />
                                <label>Текст лекции</label>
                                <textarea rows="6" value={lessonForm.content} onChange={e => setLessonForm({...lessonForm, content: e.target.value})} required />
                                <button type="submit">Добавить</button>
                            </form>
                        </div>

                        <div className="card">
                            <h3>Список уроков ({activeCourse.lessons ? activeCourse.lessons.length : 0})</h3>
                            {activeCourse.lessons?.map((l, idx) => (
                                <div key={l.id} style={{borderBottom: '1px solid #e2e8f0', padding: '1rem 0'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <strong>{idx + 1}. {l.title}</strong>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <Edit2 size={16} color="#2563eb" style={{cursor:'pointer'}} onClick={() => openEditModal(l, 'lesson')}/>
                                            <Trash2 size={16} color="#ef4444" style={{cursor:'pointer'}} onClick={() => handleDeleteLesson(l.id)}/>
                                        </div>
                                    </div>
                                    
                                    <div style={{display:'flex', gap:'10px', marginTop:'5px', alignItems:'center'}}>
                                        <div style={{fontSize: '0.85rem', color: l.questions?.length > 0 ? '#10b981' : '#64748b'}}>
                                            📝 Вопросов в тесте: {l.questions ? l.questions.length : 0}
                                        </div>
                                        {l.questions?.length > 0 && (
                                            <button className="secondary" style={{padding:'2px 8px', fontSize:'0.7rem', width:'auto'}} onClick={() => toggleQuestions(l.id)}>
                                                {expandedLessons[l.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                            </button>
                                        )}
                                    </div>

                                    {expandedLessons[l.id] && l.questions && (
                                        <div style={{background:'#f1f5f9', padding:'10px', marginTop:'10px', borderRadius:'8px'}}>
                                            {l.questions.map((q, qIdx) => (
                                                <div key={q.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #cbd5e1', padding:'5px 0'}}>
                                                    <small>{qIdx+1}. {q.questionText}</small>
                                                    <XCircle size={14} color="#ef4444" style={{cursor:'pointer'}} onClick={() => handleDeleteQuestion(q.id)}/>
                                                </div>
                                            ))}
                                            <button className="secondary" style={{marginTop:'5px', fontSize:'0.8rem', color:'#ef4444', width:'100%'}} onClick={() => handleDeleteAllQuestions(l.id)}>
                                                Очистить тест
                                            </button>
                                        </div>
                                    )}

                                    <button className="secondary" style={{marginTop:'10px', fontSize:'0.8rem', padding:'5px 10px'}} onClick={() => {
    const newId = activeLessonId === l.id ? null : l.id;
    setActiveLessonId(newId);
    if (newId !== null) {
        setQuestionForm({ questionText: '' });
        setQuestionOptions([{ text: '', correct: false }, { text: '', correct: false }]);
    }
}}>
                                        <Plus size={14}/> Добавить вопрос
                                    </button>

                                    {activeLessonId === l.id && (
    <div style={{background:'#f8fafc', padding:'12px', marginTop:'10px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
        <p style={{fontSize:12, color:'#64748b', marginBottom:8}}>
            Текст вопроса
        </p>
        <input
            value={questionForm.questionText}
            onChange={e => setQuestionForm({ questionText: e.target.value })}
            placeholder="Например: Какой тип данных у переменной x = 3.14?"
            style={{marginBottom:10}}
        />

        <p style={{fontSize:12, color:'#64748b', marginBottom:6}}>
            Варианты ответов — <span style={{color:'#185FA5'}}>поставьте галочку у правильных</span>
        </p>
        <p style={{fontSize:11, color:'#94a3b8', marginBottom:8}}>
            Правильных может быть несколько. Текст вводите точно так, как студент будет видеть.
        </p>

         {/* --- КОНТЕЙНЕР ДЛЯ ВСЕХ ВАРИАНТОВ (Добавили overflow-y на всякий случай) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
            {questionOptions.map((o, i) => (
                <div key={i} style={{
                    display:'flex', 
                    alignItems:'center', 
                    gap:'8px', 
                    // ГЛАВНЫЙ ФИКС: запрещаем этому блоку сжиматься!
                    flexShrink: 0 
                }}>
                    <label style={{
                        display:'flex', alignItems:'center', gap:'5px', cursor:'pointer', 
                        fontSize:'12px', whiteSpace:'nowrap', color: o.correct ? '#185FA5' : '#64748b',
                        width: '80px' // Фиксируем ширину лейбла
                    }}>
                        <input
                            type="checkbox"
                            checked={o.correct}
                            onChange={e => {
                                const next = [...questionOptions];
                                next[i] = { ...next[i], correct: e.target.checked };
                                setQuestionOptions(next);
                            }}
                            style={{ margin: 0, width: '16px', height: '16px' }} // Убираем дефолтные отступы чекбокса
                        />
                        {o.correct ? 'Верный' : 'Неверный'}
                    </label>

                    <input
                        value={o.text}
                        onChange={e => {
                            const next = [...questionOptions];
                            next[i] = { ...next[i], text: e.target.value };
                            setQuestionOptions(next);
                        }}
                        placeholder={`Вариант ${i + 1}`}
                        style={{
                            flex: 1, 
                            borderColor: o.correct ? '#185FA5' : undefined, 
                            margin: 0,
                            // ГЛАВНЫЙ ФИКС: задаем минимальную высоту, чтобы он не сплющивался
                            minHeight: '36px',
                            padding: '8px 12px'
                        }}
                    />

                    {questionOptions.length > 2 && (
                        <button
                            type="button" // Обязательно, чтобы форма не отправлялась
                            style={{
                                border:'1px solid #e2e8f0', borderRadius: '6px', background:'transparent', 
                                cursor:'pointer', padding:'4px 8px', color:'#ef4444', 
                                minHeight: '36px', // Такая же высота, как у инпута
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onClick={() => setQuestionOptions(questionOptions.filter((_, idx) => idx !== i))}
                        >×</button>
                    )}
                </div>
            ))}
        </div>

        {questionOptions.length < 6 && (
            <button
                type="button" // Обязательно type="button"!
                className="secondary"
                style={{width:'100%', marginBottom:'10px', fontSize:'12px', padding:'8px'}}
                onClick={() => setQuestionOptions([...questionOptions, { text: '', correct: false }])}
            >
                + Добавить вариант
            </button>
        )}

        <button onClick={handleAddQuestion} className="success" style={{fontSize:'0.9rem', width:'100%', padding:'10px'}}>
            Сохранить вопрос
        </button>
    </div>
)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Редактирование`}>
                {editingItem && (
                    <form onSubmit={handleUpdate}>
                        {editingItem.type === 'course' && (
                            <>
                                <label>Название курса</label>
                                <input value={editingItem.data.title} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, title: e.target.value}})} />
                                <label>Описание</label>
                                <textarea rows="4" value={editingItem.data.description} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, description: e.target.value}})} />
                            </>
                        )}
                        {editingItem.type === 'lesson' && (
                            <>
                                <label>Название урока</label>
                                <input value={editingItem.data.title} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, title: e.target.value}})} />
                                <label>Ссылка на видео/фото</label>
                                <input value={editingItem.data.videoUrl} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, videoUrl: e.target.value}})} />
                                <label>Текст лекции</label>
                                <textarea rows="8" value={editingItem.data.content} onChange={e => setEditingItem({...editingItem, data: {...editingItem.data, content: e.target.value}})} />
                            </>
                        )}
                        <button type="submit" style={{marginTop:'1rem'}}>Сохранить изменения</button>
                    </form>
                )}
            </Modal>
        </div>
    );
}