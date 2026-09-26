import React from 'react';

const CertificateTemplate = React.forwardRef(({ studentName, courseName, issueDate }, ref) => {
    return (
        
        <div ref={ref} style={{
            width: '800px',
            height: '565px',
            border: '10px solid #2563eb',
            padding: '40px',
            fontFamily: 'Georgia, serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#fff'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#0f172a', fontSize: '3.5rem', margin: '0' }}>СЕРТИФИКАТ</h1>
                <p style={{ color: '#64748b', fontSize: '1.2rem', margin: '10px 0' }}>об успешном окончании курса</p>
            </div>

            <div style={{ textAlign: 'center', margin: '30px 0' }}>
                <p style={{ fontSize: '1.2rem', margin: '0' }}>Настоящий сертификат подтверждает, что</p>
                <h2 style={{ color: '#2563eb', fontSize: '2.5rem', margin: '20px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                    {studentName}
                </h2>
                <p style={{ fontSize: '1.2rem', margin: '0' }}>успешно завершил(а) обучение по программе</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 'normal', margin: '15px 0' }}>
                    «{courseName}»
                </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.9rem', color: '#64748b' }}>
                <div>
                    <p style={{ margin: '0' }}>Дата выдачи: {issueDate}</p>
                    <p style={{ margin: '5px 0 0' }}>EduPlatform</p>
                </div>
                <div>
                    <p style={{ margin: '0', textAlign: 'center' }}>____________________</p>
                    <p style={{ margin: '5px 0 0', textAlign: 'center' }}>(Подпись руководителя)</p>
                </div>
            </div>
        </div>
    );
});

export default CertificateTemplate;