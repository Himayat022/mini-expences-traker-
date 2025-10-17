'use client';
import { useState, useEffect } from 'react';

export default function PeoplePage() {
  const [name, setName] = useState('');
  const [people, setPeople] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('people');
    if (saved) setPeople(JSON.parse(saved));
  }, []);

  const addPerson = () => {
    if (!name.trim()) {
      alert('⚠️ Please enter a name.');
      return;
    }
    if (people.includes(name.trim())) {
      alert('⚠️ This person already exists.');
      return;
    }

    const updated = [...people, name.trim()];
    setPeople(updated);
    localStorage.setItem('people', JSON.stringify(updated));
    setName('');
  };

  const removePerson = (index: number) => {
    const updated = people.filter((_, i) => i !== index);
    setPeople(updated);
    localStorage.setItem('people', JSON.stringify(updated));
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={heading}>👥 Manage People</h2>

        <div style={form}>
          <input
            type="text"
            placeholder="Enter person name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
          />
          <button onClick={addPerson} style={btn}>+ Add Person</button>
        </div>

        <h3 style={{ marginTop: 25 }}>Current People List</h3>

        {people.length === 0 ? (
          <p style={{ marginTop: 10, color: '#6b7280' }}>No people added yet 😅</p>
        ) : (
          <ul style={list}>
            {people.map((p, i) => (
              <li key={i} style={listItem}>
                <span>{p}</span>
                <button onClick={() => removePerson(i)} style={delBtn}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- STYLES ----------

const wrap: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 36,
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
};

const card: React.CSSProperties = {
  width: 600,
  maxWidth: '95%',
  background: 'white',
  padding: 20,
  borderRadius: 10,
  boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
};

const heading: React.CSSProperties = {
  color: '#2563eb',
  marginBottom: 15,
};

const form: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const input: React.CSSProperties = {
  flex: '1 1 200px',
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
};

const btn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 6,
  background: '#2563eb',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};

const list: React.CSSProperties = {
  listStyle: 'none',
  marginTop: 15,
  padding: 0,
};

const listItem: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#f9fafb',
  padding: '8px 12px',
  borderRadius: 6,
  marginBottom: 8,
};

const delBtn: React.CSSProperties = {
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  padding: '4px 8px',
};
