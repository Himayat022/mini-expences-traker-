'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const router = useRouter();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [expense, setExpense] = useState({
    item_name: '',
    quantity: 1,
    price_per_unit: '',
    total_price: 0,
    buyer_name: '',
    date: '',
  });

  const [person, setPerson] = useState({
    name: '',
    joining_date: '',
    address: '',
    phone: '',
  });

  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [filter, setFilter] = useState<'daily' | 'monthly'>('monthly');

  useEffect(() => {
    const token = localStorage.getItem('me_token');
    if (!token) router.push('/');
  }, [router]);

  // Auto calculate total
  useEffect(() => {
    const total =
      Number(expense.quantity || 0) * Number(expense.price_per_unit || 0);
    setExpense((prev) => ({ ...prev, total_price: total }));
  }, [expense.quantity, expense.price_per_unit]);

  async function handleLogout() {
    localStorage.removeItem('me_token');
    router.push('/');
  }

  // ➕ Add Expense
  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert([expense]);
    if (error) alert('❌ ' + error.message);
    else {
      alert('✅ Expense added successfully!');
      setExpense({
        item_name: '',
        quantity: 1,
        price_per_unit: '',
        total_price: 0,
        buyer_name: '',
        date: '',
      });
      setShowExpenseModal(false);
      fetchDailyExpenses();
    }
  }

  // ➕ Add Person
  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('people').insert([person]);
    if (error) alert('❌ ' + error.message);
    else {
      alert('✅ Person added successfully!');
      setPerson({
        name: '',
        joining_date: '',
        address: '',
        phone: '',
      });
      setShowPeopleModal(false);
    }
  }

  // 🗓 Fetch Daily Expenses
  async function fetchDailyExpenses() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('date', today);

    if (!error && data) setDailyExpenses(data);
  }

  // 📊 Fetch Analytics
  async function loadAnalytics(filterType: 'daily' | 'monthly' = filter) {
    setFilter(filterType);

    let startDate = new Date();
    if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
    else startDate.setMonth(startDate.getMonth() - 1);

    const { data, error } = await supabase
      .from('expenses')
      .select('buyer_name, total_price, date')
      .gte('date', startDate.toISOString().split('T')[0]);

    if (error) {
      alert(error.message);
      return;
    }

    const totals: Record<string, number> = {};
    data.forEach((d) => {
      totals[d.buyer_name] =
        (totals[d.buyer_name] || 0) + Number(d.total_price);
    });

    const formatted = Object.entries(totals).map(([buyer, total]) => ({
      buyer,
      total,
    }));

    setAnalytics(formatted);
    setShowAnalytics(true);
  }

  const cards = [
    { title: '💸 Add Expense', onClick: () => setShowExpenseModal(true) },
    { title: '👥 Add People', onClick: () => setShowPeopleModal(true) },
    { title: '📈 Analytics', onClick: () => loadAnalytics('monthly') },
  ];

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>Welcome to Mini Expense Tracker</h1>

      <div style={styles.cards}>
        {cards.map((card, i) => (
          <div key={i} style={styles.card} onClick={card.onClick}>
            <h3>{card.title}</h3>
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>
        🚪 Logout
      </button>

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>
          <form onSubmit={handleAddExpense} style={styles.form}>
            <input
              placeholder="Item Name"
              value={expense.item_name}
              onChange={(e) =>
                setExpense({ ...expense, item_name: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={expense.quantity}
              onChange={(e) =>
                setExpense({ ...expense, quantity: Number(e.target.value) })
              }
              style={styles.input}
              required
            />
            <input
              type="number"
              placeholder="Price per Unit"
              value={expense.price_per_unit}
              onChange={(e) =>
                setExpense({ ...expense, price_per_unit: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              type="text"
              placeholder="Total Price (auto)"
              value={expense.total_price}
              readOnly
              style={{ ...styles.input, background: '#f1f5f9' }}
            />
            <input
              placeholder="Buyer Name"
              value={expense.buyer_name}
              onChange={(e) =>
                setExpense({ ...expense, buyer_name: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              type="date"
              value={expense.date}
              onChange={(e) =>
                setExpense({ ...expense, date: e.target.value })
              }
              style={styles.input}
              required
            />
            <button type="submit" style={styles.primaryBtn}>
              Save Expense
            </button>
          </form>

          {/* Daily Expense Summary */}
          <div style={{ marginTop: 25 }}>
            <h3 style={{ textAlign: 'center', marginBottom: 10 }}>
              📅 Today’s Expenses
            </h3>
            {dailyExpenses.length === 0 ? (
              <p style={{ textAlign: 'center' }}>No expenses today.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Buyer</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>{exp.item_name}</td>
                      <td>{exp.buyer_name}</td>
                      <td>{exp.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}

      {/* People Modal */}
      {showPeopleModal && (
        <Modal title="Add Person" onClose={() => setShowPeopleModal(false)}>
          <form onSubmit={handleAddPerson} style={styles.form}>
            <input
              placeholder="Name"
              value={person.name}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              style={styles.input}
              required
            />
            <input
              type="date"
              value={person.joining_date}
              onChange={(e) =>
                setPerson({ ...person, joining_date: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              placeholder="Address"
              value={person.address}
              onChange={(e) =>
                setPerson({ ...person, address: e.target.value })
              }
              style={styles.input}
              required
            />
            <input
              placeholder="Phone"
              value={person.phone}
              onChange={(e) => setPerson({ ...person, phone: e.target.value })}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.primaryBtn}>
              Save Person
            </button>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <Modal title="Analytics" onClose={() => setShowAnalytics(false)}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600, marginRight: 10 }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) =>
                loadAnalytics(e.target.value as 'daily' | 'monthly')
              }
              style={styles.input}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th >Buyer</th>
                <th>Total Expense (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(({ buyer, total }) => (
                <tr key={buyer}>
                  <td>{buyer}</td>
                  <td>{Number(total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ width: '100%', height: 300, marginTop: 20 }}>
            <ResponsiveContainer>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="buyer" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h2>{title}</h2>
        {children}
        <button onClick={onClose} style={styles.closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}

// 🎨 Styling
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 40,
  },
  cards: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    borderRadius: 14,
    padding: 30,
    width: 220,
    textAlign: 'center' as const,
    boxShadow: '0 6px 25px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  logoutBtn: {
    marginTop: 40,
    background: 'linear-gradient(90deg,#ef4444,#f97316)',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: 10,
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  modal: {
    background: 'white',
    padding: 30,
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
  },
  primaryBtn: {
    background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  closeBtn: {
    marginTop: 12,
    background: '#e2e8f0',
    border: 'none',
    padding: '8px 10px',
    borderRadius: 6,
    cursor: 'pointer',
  },
};
