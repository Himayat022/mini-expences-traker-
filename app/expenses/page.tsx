'use client';
import { useState, useEffect } from 'react';

export default function ExpensesPage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [buyer, setBuyer] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('expenses');
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  const addExpense = () => {
    if (!item || !price || !date || !buyer) {
      alert('⚠️ Please fill all fields before adding an expense.');
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

  const deleteExpense = (index: number) => {
    const updated = expenses.filter((_, i) => i !== index);
    setExpenses(updated);
    localStorage.setItem('expenses', JSON.stringify(updated));
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={heading}>💸 Add New Expense</h2>

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
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 10 }}>
                  No expenses yet 😅
                </td>
              </tr>
            ) : (
              expenses.map((exp, i) => (
                <tr key={i}>
                  <td>{exp.item}</td>
                  <td>{exp.price}</td>
                  <td>{exp.date}</td>
                  <td>{exp.buyer}</td>
                  <td>
                    <button onClick={() => deleteExpense(i)} style={delBtn}>
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 36,
  backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
  minHeight: '100vh',
};

const card: React.CSSProperties = {
  width: 800,
  maxWidth: '95%',
  background: 'white',
  padding: 20,
  borderRadius: 10,
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
};

const heading: React.CSSProperties = {
  color: '#2563eb',
  marginBottom: 15,
};

const form: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
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

const table: React.CSSProperties = {
  width: '100%',
  marginTop: 15,
  borderCollapse: 'collapse',
};

const delBtn: React.CSSProperties = {
  background: 'red',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  padding: '4px 8px',
};