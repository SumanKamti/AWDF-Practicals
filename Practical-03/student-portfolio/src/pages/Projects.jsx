import React, { useEffect, useState } from 'react';

const GITHUB_USERNAME = 'SumanKamti';

export default function RepoFinder() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchRepos = async () => {
    setLoading(true);
    setError('');
    setRepos([]);

    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=6&sort=updated`, 
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('GitHub profile not found');
        }
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(Array.isArray(data) ? data.filter((repo) => !repo.private) : []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '50px auto',
        padding: '32px',
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
        borderRadius: '28px',
        border: '1px solid #dbeafe',
        boxShadow: '0 20px 60px rgba(37, 99, 235, 0.12)',
      }}
    >
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 10px', color: '#2563eb', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Portfolio Highlights
        </p>
        <h2 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '34px', fontWeight: '800' }}>
          My GitHub Projects
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '15px', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' }}>
          A selection of my recent work, showcasing practical development, UI design, and problem-solving across full-stack projects.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '15px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Loading repositories...</span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {error && !loading && (
        <div style={{ maxWidth: '720px', margin: '0 auto 24px', padding: '22px 20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '18px', color: '#991b1b', textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: '700' }}>❌ Failed to load repositories.</p>
          <p style={{ margin: '0 0 18px', fontSize: '15px', color: '#7f1d1d' }}>Please try again.</p>
          <button
            type="button"
            onClick={fetchRepos}
            style={{
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !error && repos.length === 0 && <p style={{ textAlign: 'center', color: '#64748b' }}>No public repositories found.</p>}

      {!loading && !error && repos.length > 0 && (
        <div style={{ maxWidth: '720px', margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label htmlFor="repo-search" style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>
            Search Repository
          </label>
          <input
            id="repo-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Repository"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#0f172a',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
        {repos.map((repo) => (
          <div
            key={repo.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '22px',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.07)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                {repo.name}
              </h3>
              {repo.language && (
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '5px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
                  {repo.language}
                </span>
              )}
            </div>

            <p style={{ margin: '0 0 14px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
              {repo.description || 'No description available'}
            </p>

            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#64748b', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '999px' }}>⭐ {repo.stargazers_count}</span>
              <span style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '999px' }}>🍴 {repo.forks_count}</span>
              <span style={{ background: '#f8fafc', padding: '5px 8px', borderRadius: '999px' }}>📅 {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                color: '#fff',
                padding: '9px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
              }}
            >
              View Repository →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
