import React from 'react';

const certificates = [
  {
    title: 'Web Development Certificate',
    description: 'Certificate for web development coursework and practical work.',
    url: 'https://raw.githubusercontent.com/SumanKamti/Certificates/main/certificate.pdf',
  },
  {
    title: 'AI / ML Certificate',
    description: 'Certificate for AI and machine learning learning track.',
    url: 'https://raw.githubusercontent.com/SumanKamti/Certificates/main/certificate.pdf',
  },
  {
    title: 'Programming Certificate',
    description: 'Certificate for programming skills and project completion.',
    url: 'https://raw.githubusercontent.com/SumanKamti/Certificates/main/certificate.pdf',
  },
];

export default function Certificates() {
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p style={{ margin: '0 0 8px', color: '#2563eb', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Achievements
        </p>
        <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '32px', fontWeight: '800' }}>
          My Certificates
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.7', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
          Browse through my certificates below. Each card is labeled clearly so you can easily identify the achievement.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {certificates.map((item, index) => (
          <div key={index} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>{item.title}</h3>
            <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>{item.description}</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
              }}
            >
              Open Certificate
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
