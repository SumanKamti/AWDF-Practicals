import React, { useState } from 'react';

export default function RepoFinder() {
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRepos = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setRepos([]);

    try {
      const response = await fetch(`https://api.github.com/users/${username.trim()}/repos?per_page=10&sort=updated`, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h2>GitHub Repo Finder</h2>
      
      <form onSubmit={fetchRepos} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter GitHub username (e.g., facebook)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', background: '#0070f3', color: '#fff', border: 'none' }}>
          Search
        </button>
      </form>

      {loading && <p>Loading repositories...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {repos.map((repo) => (
          <li key={repo.id} style={{ padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '4px' }}>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'none', color: '#0070f3' }}>
              {repo.name}
            </a>
            <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
              {repo.description || 'No description available'}
            </p>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
              ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count} | 🌐 {repo.language || 'Unknown'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
