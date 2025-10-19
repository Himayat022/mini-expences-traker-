'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import '../global.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

/* =========================
   🎨 Inline Styles (declare BEFORE usage)
   ========================= */
const styles = {
  wrapper: {
    padding: '40px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    color: '#0f172a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '85%',
    marginBottom: '18px',
  },
  title: { fontSize: '1.8rem', fontWeight: 700 },
  logoutBtn: {
    background: 'linear-gradient(90deg,#ef4444,#f97316)',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  cards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    marginBottom: 18,
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    width: '210px',
    boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  dailyCard: {
    background: '#fff',
    padding: '22px',
    borderRadius: '14px',
    width: '85%',
    margin: '14px auto',
  },
  sectionTitle: { fontSize: '1.15rem', marginBottom: 12, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#f8fafc' },
  th: { backgroundColor: '#0070f3', color: '#fff', padding: '10px 12px', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #e6eefc', textAlign: 'center' as const },
  deleteBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  smallDeleteBtn: {
    background: '#fff',
    border: '1px solid #f87171',
    color: '#ef4444',
    padding: '6px 8px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
  },
  primaryBtn: {
    background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    width: '100%',
    boxSizing: 'border-box' as const,
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
    zIndex: 60,
  },
  modal: {
    background: 'white',
    padding: 20,
    borderRadius: 10,
    width: '92%',
    maxWidth: 760,
    boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  },
  form: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  peopleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    background: '#fbfdff',
    marginBottom: 8,
  },
  analyticsControls: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
  footer: {
    marginTop: 28,
    width: '100%',
    textAlign: 'center' as const,
    padding: '18px 0',
    color: '#0f172a',
  },
  footerBox: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '85%',
    margin: '0 auto',
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
  },
  footerContact: { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const },
};

/* =========================
   ✅ Main Component
   ========================= */
export default function Dashboard() {
  const router = useRouter();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPeopleList, setShowPeopleList] = useState(false);

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
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [filter, setFilter] = useState<'daily' | 'monthly'>('monthly');
  const [analyticsMode, setAnalyticsMode] = useState<'buyer' | 'item' | 'meals'>('item');

  // mealRecords: array of { id, person_id, meal_type, date (YYYY-MM-DD) }
  const [mealRecords, setMealRecords] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('me_token');
    if (!token) router.push('/');
    fetchDailyExpenses();
    fetchPeople();
    fetchMealsForRange('monthly'); // pre-load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Auto calculate total price
  useEffect(() => {
    const total =
      Number(expense.quantity || 0) * Number(expense.price_per_unit || 0);
    setExpense((prev) => ({ ...prev, total_price: total }));
  }, [expense.quantity, expense.price_per_unit]);

  async function handleLogout() {
    localStorage.removeItem('me_token');
    router.push('/');
  }

  /* ---------------- Expenses ---------------- */
  async function fetchDailyExpenses() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) setDailyExpenses(data);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...expense,
      price_per_unit: Number(expense.price_per_unit || 0),
      total_price: Number(expense.total_price || 0),
    };
    const { error } = await supabase.from('expenses').insert([payload]);
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

  async function handleDeleteExpense(id: number | string) {
    if (!confirm('Delete this expense permanently?')) return;
    const previous = dailyExpenses;
    setDailyExpenses((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      alert('❌ Failed to delete: ' + error.message);
      setDailyExpenses(previous);
    } else {
      fetchDailyExpenses();
      if (showAnalytics) loadAnalytics(filter, analyticsMode);
    }
  }

  /* ---------------- People & Meals ---------------- */
  async function fetchPeople() {
    const { data, error } = await supabase.from('people').select('*').order('name', { ascending: true });
    if (!error && data) setPeopleList(data);
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('people').insert([person]);
    if (error) alert('❌ ' + error.message);
    else {
      alert('✅ Person added!');
      setPerson({ name: '', joining_date: '', address: '', phone: '' });
      fetchPeople();
    }
  }

  async function handleDeletePerson(id: number | string) {
    if (!confirm('Delete this person permanently?')) return;
    const previous = peopleList;
    setPeopleList((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) {
      alert('❌ ' + error.message);
      setPeopleList(previous);
    } else {
      fetchPeople();
      // remove related meal records if needed (optional)
    }
  }

  // Meals table operations: 'meals' table with columns { id, person_id, meal_type, date }
  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  async function fetchMealsForRange(range: 'daily' | 'monthly' = 'monthly') {
    let startDate = new Date();
    if (range === 'daily') startDate.setDate(startDate.getDate() - 1);
    else startDate.setMonth(startDate.getMonth() - 1);

    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0]);

    if (!error && data) setMealRecords(data);
  }

  // toggle today's meal attendance for a person (insert or delete)
  async function toggleMealForToday(personId: number | string, mealType: 'breakfast' | 'lunch' | 'dinner') {
    const date = todayISO();
    const existing = mealRecords.find((m) => m.person_id === personId && m.meal_type === mealType && m.date === date);
    if (existing) {
      // delete it
      const previous = mealRecords;
      setMealRecords((prev) => prev.filter((r) => r.id !== existing.id));
      const { error } = await supabase.from('meals').delete().eq('id', existing.id);
      if (error) {
        alert('❌ ' + error.message);
        setMealRecords(previous);
      } else {
        // success
        if (showAnalytics) loadAnalytics(filter, analyticsMode);
      }
    } else {
      // insert new record
      const { data, error } = await supabase.from('meals').insert([{ person_id: personId, meal_type: mealType, date }]).select().single();
      if (error) {
        alert('❌ ' + error.message);
      } else {
        setMealRecords((prev) => [data, ...prev]);
        if (showAnalytics) loadAnalytics(filter, analyticsMode);
      }
    }
  }

  function isMealChecked(personId: number | string, mealType: 'breakfast' | 'lunch' | 'dinner') {
    const date = todayISO();
    return mealRecords.some((m) => m.person_id === personId && m.meal_type === mealType && m.date === date);
  }

  /* ---------------- Analytics ----------------
     modes:
       - 'buyer' => group expenses by buyer (existing)
       - 'item'  => group expenses by item (existing monthly totals)
       - 'meals' => group meal_records by person + meal_type (counts)
  */
  async function loadAnalytics(filterType: 'daily' | 'monthly' = filter, mode: 'buyer' | 'item' | 'meals' = analyticsMode) {
    setFilter(filterType);
    setAnalyticsMode(mode);

    if (mode === 'meals') {
      // fetch meals in date range then aggregate per person+meal_type
      let startDate = new Date();
      if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
      else startDate.setMonth(startDate.getMonth() - 1);

      const { data: mealsData, error: mealsErr } = await supabase
        .from('meals')
        .select('person_id,meal_type,date')
        .gte('date', startDate.toISOString().split('T')[0]);

      if (mealsErr) {
        alert('❌ ' + mealsErr.message);
        return;
      }

      // need person names: fetch people
      const { data: peopleData } = await supabase.from('people').select('id,name');

      const peopleMap: Record<string, string> = {};
      (peopleData || []).forEach((p: any) => (peopleMap[p.id] = p.name || 'Unknown'));

      // aggregate
      const counts: Record<string, number> = {};
      (mealsData || []).forEach((m: any) => {
        const name = peopleMap[m.person_id] || 'Unknown';
        const key = `${name} • ${capitalize(m.meal_type)}`; // e.g. "Himayat • Breakfast"
        counts[key] = (counts[key] || 0) + 1;
      });

      const formatted = Object.entries(counts).map(([key, total]) => ({ key, total }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    } else {
      // expenses-based analytics (buyer or item)
      let startDate = new Date();
      if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
      else startDate.setMonth(startDate.getMonth() - 1);

      const selectCol = mode === 'item' ? 'item_name, total_price, date' : 'buyer_name, total_price, date';
      const { data, error } = await supabase
        .from('expenses')
        .select(selectCol)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      const totals: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        const key = mode === 'item' ? d.item_name || 'Unknown' : d.buyer_name || 'Unknown';
        totals[key] = (totals[key] || 0) + Number(d.total_price || 0);
      });

      const formatted = Object.entries(totals).map(([key, total]) => ({ key, total }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    }
  }

  function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  const cards = [
    { title: '💸 Add Expense', onClick: () => setShowExpenseModal(true) },
    { title: `👥 Add People`, onClick: () => setShowPeopleModal(true) },
    { title: '📋 People List', onClick: () => setShowPeopleList(true) },
    { title: '📈 Analytics', onClick: () => loadAnalytics('monthly', 'item') },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to Mini Expense Tracker</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Cards */}
      <div style={styles.cards}>
        {cards.map((card, i) => (
          <div key={i} style={styles.card} onClick={card.onClick}>
            <h3 style={{ margin: 0 }}>{card.title}</h3>
          </div>
        ))}
      </div>

      {/* Daily Table */}
      <div style={styles.dailyCard}>
        <h2 style={styles.sectionTitle}>📅 All Expenses</h2>

        {dailyExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: 10 }}>No expenses found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Price/Unit</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Buyer</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {dailyExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={styles.td}>{exp.item_name}</td>
                  <td style={styles.td}>{exp.quantity}</td>
                  <td style={styles.td}>{exp.price_per_unit}</td>
                  <td style={styles.td}>{exp.total_price}</td>
                  <td style={styles.td}>{exp.buyer_name}</td>
                  <td style={styles.td}>{exp.date}</td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDeleteExpense(exp.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal title="Add Expense" onClose={() => setShowExpenseModal(false)}>
          <form onSubmit={handleAddExpense} style={styles.form}>
            <input placeholder="Item Name" value={expense.item_name} onChange={(e) => setExpense({ ...expense, item_name: e.target.value })} style={styles.input} required />
            <input type="number" placeholder="Quantity" value={expense.quantity} onChange={(e) => setExpense({ ...expense, quantity: Number(e.target.value) })} style={styles.input} min={1} required />
            <input type="number" placeholder="Price per Unit" value={expense.price_per_unit as any} onChange={(e) => setExpense({ ...expense, price_per_unit: e.target.value })} style={styles.input} step="0.01" min={0} required />
            <input type="text" placeholder="Total Price (auto)" value={String(expense.total_price ?? '')} readOnly style={{ ...styles.input, background: '#f1f5f9' }} />
            <input placeholder="Buyer Name" value={expense.buyer_name} onChange={(e) => setExpense({ ...expense, buyer_name: e.target.value })} style={styles.input} required />
            <input type="date" value={expense.date} onChange={(e) => setExpense({ ...expense, date: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.primaryBtn}>Save Expense</button>
          </form>
        </Modal>
      )}

      {/* People Modal (Add only) */}
      {showPeopleModal && (
        <Modal title="Add Person" onClose={() => setShowPeopleModal(false)}>
          <form onSubmit={handleAddPerson} style={styles.form}>
            <input placeholder="Name" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} style={styles.input} required />
            <input type="date" value={person.joining_date} onChange={(e) => setPerson({ ...person, joining_date: e.target.value })} style={styles.input} required />
            <input placeholder="Address" value={person.address} onChange={(e) => setPerson({ ...person, address: e.target.value })} style={styles.input} required />
            <input placeholder="Phone" value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.primaryBtn}>Save Person</button>
          </form>
        </Modal>
      )}

      {/* People List Modal (view/delete + meal checklist) */}
      {showPeopleList && (
        <Modal title={`People (${peopleList.length})`} onClose={() => setShowPeopleList(false)}>
          <div style={{ marginBottom: 12 }}>
            {peopleList.length === 0 ? (
              <p>No people added yet.</p>
            ) : (
              peopleList.map((p) => (
                <div key={p.id} style={styles.peopleRow}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#475569' }}>
                      {p.phone ? p.phone + ' • ' : ''} {p.joining_date}
                      <div style={{ fontSize: 12, color: '#64748b' }}>{p.address}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Meal checklist for today */}
                    <label style={{ fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={isMealChecked(p.id, 'breakfast')}
                        onChange={() => toggleMealForToday(p.id, 'breakfast')}
                      />{' '}
                      B
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={isMealChecked(p.id, 'lunch')}
                        onChange={() => toggleMealForToday(p.id, 'lunch')}
                      />{' '}
                      L
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={isMealChecked(p.id, 'dinner')}
                        onChange={() => toggleMealForToday(p.id, 'dinner')}
                      />{' '}
                      D
                    </label>

                    <button style={styles.smallDeleteBtn} onClick={() => handleDeletePerson(p.id)}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eef2ff' }} />

          <h3 style={{ marginBottom: 8 }}>Add Person</h3>
          <form onSubmit={(e) => { handleAddPerson(e); }} style={styles.form}>
            <input placeholder="Name" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} style={styles.input} required />
            <input type="date" value={person.joining_date} onChange={(e) => setPerson({ ...person, joining_date: e.target.value })} style={styles.input} required />
            <input placeholder="Address" value={person.address} onChange={(e) => setPerson({ ...person, address: e.target.value })} style={styles.input} required />
            <input placeholder="Phone" value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.primaryBtn}>Save Person</button>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <Modal title="Analytics" onClose={() => setShowAnalytics(false)}>
          <div style={styles.analyticsControls}>
            <label style={{ fontWeight: 600 }}>Filter:</label>
            <select value={filter} onChange={(e) => loadAnalytics(e.target.value as 'daily' | 'monthly', analyticsMode)} style={{ ...styles.input, width: 160 }}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            <label style={{ fontWeight: 600 }}>Group by:</label>
            <select value={analyticsMode} onChange={(e) => loadAnalytics(filter, e.target.value as 'buyer' | 'item' | 'meals')} style={{ ...styles.input, width: 180 }}>
              <option value="buyer">Buyer (expenses)</option>
              <option value="item">Item (expenses)</option>
              <option value="meals">Meals (counts per person)</option>
            </select>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{analyticsMode === 'meals' ? 'Person • Meal' : 'Key'}</th>
                <th style={styles.th}>{analyticsMode === 'meals' ? 'Count' : 'Total Expense (PKR)'}</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map(({ key, total }) => (
                <tr key={key}>
                  <td style={styles.td}>{key}</td>
                  <td style={styles.td}>{analyticsMode === 'meals' ? Number(total) : Number(total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ width: '100%', height: 300, marginTop: 18 }}>
            <ResponsiveContainer>
              <BarChart data={analytics.map((a) => ({ name: a.key, total: a.total }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.footerBox}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Mini Expense Tracker — Contact & Credits</div>

          <div style={styles.footerContact}>
            <div>
              <div style={{ fontWeight: 600 }}>Himayat Ali (Software Developer)</div>
              <div>📞 0347-2424022</div>
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>Ahmad Shahi (Software Engineer)</div>
              <div>📞 0310-5855299</div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>For website work & inquiries:</div>
              <div>himayatali@example.com</div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#475569' }}>
            © {new Date().getFullYear()} Mini Expense Tracker — made by Himayat Ali and Ahmad Shahi. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   🧩 Modal Component
   ========================= */
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
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <div>{children}</div>
        <div style={{ textAlign: 'right', marginTop: 12 }}>
<button onClick={onClose} style={{ marginTop: 12, background: '#e2e8f0', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}
