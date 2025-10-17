'use client';
import { useState, useEffect } from 'react';

export default function ExpensePage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [buyer, setBuyer] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);

  // ✅ Load saved expenses on page load
  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  // ✅ Save new expense
  const addExpense = () => {
    if (!item || !price || !date || !buyer) {
      alert('Please fill all fields');
      return;
    }

    const newExpense = { item, price: parseFloat(price), date, buyer };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    localStorage.setItem('expenses', JSON.stringify(updated));

    setItem('');
    setPrice('');
    setDate('');
    setBuyer('');
  };

  // ✅ Delete expense
  const deleteExpense = (index: number) => {
    const updated = expenses.filter((_, i) => i !== index);
    setExpenses(updated);
    localStorage.setItem('expenses', JSON.stringify(updated));
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={heading}>💰 Add Expense</h2>

        <div style={form}>
          <input
            type="text"
            placeholder="Item name"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            style={input}
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={input}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={input}
          />
          <input
            type="text"
            placeholder="Buyer name"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            style={input}
          />
          <button onClick={addExpense} style={btn}>+ Add Expense</button>
        </div>

        <h3 style={{ marginTop: 30, color: '#111827' }}>📋 Expense List</h3>

        <table style={table}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price (PKR)</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp, i) => (
              <tr key={i}>
                <td>{exp.item}</td>
                <td>{exp.price}</td>
                <td>{exp.date}</td>
                <td>{exp.buyer}</td>
                <td>
                  <button onClick={() => deleteExpense(i)} style={delBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 12, color: '#6b7280' }}>
            No expenses added yet.
          </p>
        )}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: 50,
  backgroundImage: 'url("/bg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const card: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 10,
  padding: 24,
  width: '90%',
  maxWidth: 800,
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(8px)',
};

const heading: React.CSSProperties = {
  textAlign: 'center',
  color: '#1d4ed8',
  marginBottom: 20,
};

const form: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 12,
};

const input: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  outline: 'none',
};

const btn: React.CSSProperties = {
  gridColumn: 'span 2',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '10px 12px',
  cursor: 'pointer',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 20,
};

const delBtn: React.CSSProperties = {
  background: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
};

Object.assign(table, {
  th: { background: '#f3f4f6', padding: 8, borderBottom: '1px solid #ddd' },
  td: { textAlign: 'center', padding: 8, borderBottom: '1px solid #eee' },
});
