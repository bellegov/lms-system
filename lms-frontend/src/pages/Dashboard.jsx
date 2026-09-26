import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Clock } from 'lucide-react';
import api from '../api/axiosConfig';


import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from '../components/CertificateTemplate';

export default function Dashboard({ user }) {
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const navigate = useNavigate();

    
    const [certToGenerate, setCertToGenerate] = useState(null);
    const certificateRef = useRef(); 

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        const enrollRes = await api.get(`/courses/my/${user.id}`);
        setEnrollments(enrollRes.data);

        
        const certsRes = await api.get(`/certificates/user/${user.id}`);
        setCertificates(certsRes.data);
    };

    const handleDownloadPdf = async (certData) => {
        
        setCertToGenerate(certData);
        
        
        await new Promise(resolve => setTimeout(resolve, 100));

        
        const input = certificateRef.current;
        if (!input) return;

       
        html2canvas(input, { scale: 2 }) 
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                
                
                const pdf = new jsPDF('l', 'mm', 'a4'); 
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
               
                pdf.save(`certificate-${certData.course.title.replace(/ /g, '_')}.pdf`);
                
                
                setCertToGenerate(null);
            });
    };

    return (
        <div className="container">
            {}
            <div style={{ position: 'fixed', top: '-10000px', left: 0 }}>
                {certToGenerate && (
                    <CertificateTemplate
                        ref={certificateRef}
                        studentName={certToGenerate.user.fullName}
                        courseName={certToGenerate.course.title}
                        issueDate={new Date(certToGenerate.issueDate).toLocaleDateString()}
                    />
                )}
            </div>

            <h1 style={{marginBottom:'2rem'}}>Личный кабинет: {user.fullName}</h1>

            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'2rem'}}>
                
                {/* Блок Обучения */}
                <div>
                    <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <BookOpen size={24} color="#2563eb"/> Мое обучение
                    </h2>
                    {enrollments.length === 0 && <p>Вы пока не записаны ни на один курс.</p>}
                    
                    {enrollments.map(e => (
                        <div key={e.id} className="card" style={{marginBottom:'1rem', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
                            <div>
                                <h3 style={{margin:0}}>{e.course.title}</h3>
                                <p style={{margin:'5px 0 0', color:'#64748b'}}>Категория: {e.course.category}</p>
                            </div>
                            <div style={{width:'150px', textAlign:'right'}}>
                                <div style={{marginBottom:'5px', fontWeight:'bold', color: e.progressPercent === 100 ? '#10b981' : '#2563eb'}}>
                                    {e.progressPercent}%
                                </div>
                                <div className="progress-bg" style={{margin:0}}>
                                    <div className="progress-fill" style={{width: `${e.progressPercent}%`}}></div>
                                </div>
                                <button 
                                    className="secondary" 
                                    style={{marginTop:'10px', fontSize:'0.8rem', padding:'5px 10px'}}
                                    onClick={() => navigate(`/course/${e.course.id}`)}
                                >
                                    {e.progressPercent === 100 ? 'Повторить' : 'Продолжить'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Блок Сертификатов */}
                <div>
                    <h2 style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <Award size={24} color="#f59e0b"/> Мои сертификаты
                    </h2>
                    <div className="card" style={{background:'#fffbeb', borderColor:'#fcd34d'}}>
                        {certificates.length === 0 ? (
                            <p style={{color:'#92400e'}}>Пройдите курс на 100%, чтобы получить сертификат.</p>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert.id} style={{borderBottom:'1px solid #fde68a', paddingBottom:'10px', marginBottom:'10px'}}>
                                    <strong style={{color:'#92400e'}}>{cert.course.title}</strong>
                                    <br/>
                                    <small style={{color:'#b45309'}}>
                                        Выдан: {new Date(cert.issueDate).toLocaleDateString()}
                                    </small>
                                    <button 
                                        style={{marginTop:'5px', background:'#d97706', width:'100%'}}
                                        onClick={() => handleDownloadPdf(cert)}
                                    >
                                        Скачать PDF
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}