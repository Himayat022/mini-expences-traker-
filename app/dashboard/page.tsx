'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
  Legend,
} from 'recharts';

// libs (some imported dynamically for print/server friendliness)
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// IMPORTANT: jspdf & autotable are dynamic-imported inside functions to avoid SSR issues

/* =========================
   🎨 Inline Styles (declare BEFORE usage)
   - Supports dark mode toggling by checking `dark` boolean for dynamic values
   ========================= */
const baseStyles = {
  wrapper: (dark: boolean) => ({
    padding: '24px',
    minHeight: '100vh',
    background: dark ? '#0b1220' : 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily:
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    color: dark ? '#e6eefc' : '#0f172a',
  }),
  header: (dark: boolean) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    maxWidth: 1200,
    marginBottom: '18px',
    gap: 12,
  }),
  title: { fontSize: '1.6rem', fontWeight: 700 },
  topControls: { display: 'flex', gap: 8, alignItems: 'center' },
  logoutBtn: (dark: boolean) => ({
    background: 'linear-gradient(90deg,#ef4444,#f97316)',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }),
  cardRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, marginBottom: 16, width: '95%', maxWidth: 1200 },
  card: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    borderRadius: '12px',
    padding: '14px',
    width: '220px',
    boxShadow: dark ? '0 6px 14px rgba(0,0,0,0.4)' : '0 6px 14px rgba(0,0,0,0.06)',
    textAlign: 'left' as const,
    color: dark ? '#e6eefc' : '#0f172a',
  }),
  dailyCard: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    padding: '18px',
    borderRadius: '14px',
    width: '95%',
    maxWidth: 1200,
    margin: '8px auto',
    boxShadow: dark ? '0 6px 18px rgba(0,0,0,0.6)' : '0 6px 18px rgba(0,0,0,0.06)',
  }),
  sectionTitle: { fontSize: '1.15rem', marginBottom: 12, fontWeight: 600 },
  table: (dark: boolean) => ({
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: dark ? '#071325' : '#f8fafc',
    color: dark ? '#e6eefc' : '#0f172a',
  }),
  th: (dark: boolean) => ({
    backgroundColor: dark ? '#0b2540' : '#0070f3',
    color: '#fff',
    padding: '10px 12px',
    fontWeight: 600,
    textAlign: 'center' as const,
  }),
  td: (dark: boolean) => ({
    padding: '8px 10px',
    borderBottom: dark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e6eefc',
    textAlign: 'center' as const,
    color: dark ? '#e6eefc' : '#0f172a',
  }),
  deleteBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  smallDeleteBtn: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    border: '1px solid #f87171',
    color: '#ef4444',
    padding: '6px 8px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
  }),
  primaryBtn: {
    background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
  },
  input: (dark: boolean) => ({
    padding: '8px 10px',
    borderRadius: 8,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    width: '100%',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
    boxSizing: 'border-box' as const,
  }),
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: (dark: boolean) => ({
    background: dark ? '#04121a' : 'white',
    padding: 18,
    borderRadius: 10,
    width: '94%',
    maxWidth: 860,
    boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
    color: dark ? '#e6eefc' : undefined,
  }),
  form: { display: 'flex', flexDirection: 'column' as const, gap: 8, marginTop: 8 },
  peopleRow: (dark: boolean) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    background: dark ? 'rgba(255,255,255,0.02)' : '#fbfdff',
    marginBottom: 8,
  }),
  analyticsControls: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' as const },
  footer: { marginTop: 18, width: '95%', maxWidth: 1200, textAlign: 'center' as const, padding: '18px 0' },
  footerBox: (dark: boolean) => ({
    background: dark ? '#04121a' : '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    boxShadow: dark ? '0 6px 18px rgba(0,0,0,0.6)' : '0 6px 18px rgba(0,0,0,0.06)',
    color: dark ? '#e6eefc' : undefined,
  }),
};

/* =========================
   ✅ Main Component
   ========================= */
export default function Dashboard() {
  const router = useRouter();

  // UI state
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('me_dark') === '1';
    } catch {
      return false;
    }
  });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [showPeopleModal, setShowPeopleModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPeopleList, setShowPeopleList] = useState(false);

  // Form state
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

  // Data
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [filter, setFilter] = useState<'daily' | 'monthly'>('monthly');
  const [analyticsMode, setAnalyticsMode] = useState<'buyer' | 'item' | 'meals'>('meals');
  const [mealRecords, setMealRecords] = useState<any[]>([]);

  // Search/filter UI
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // Summary cards (computed)
  const summary = useMemo(() => {
    const totalExpenses = dailyExpenses.reduce((s, e) => s + Number(e.total_price || 0), 0);
    const totalMeals = mealRecords.length;
    const avgMealsPerDay = (() => {
      // compute days in current filter range
      let days = 1;
      if (filter === 'monthly') days = 30;
      else days = 1;
      return (totalMeals / Math.max(days, 1)).toFixed(2);
    })();
    return { totalExpenses, totalMeals, avgMealsPerDay };
  }, [dailyExpenses, mealRecords, filter]);

  useEffect(() => {
    const token = localStorage.getItem('me_token');
    if (!token) {
      // if you use Supabase auth, you might replace with supabase.auth.getSession()
      router.push('/');
      return;
    }
    // fetch initial sets
    fetchDailyExpenses();
    fetchPeople();
    fetchMealsForRange('monthly');
    // persist dark mode
    localStorage.setItem('me_dark', dark ? '1' : '0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, dark]);

  // Auto calculate total price
  useEffect(() => {
    const total = Number(expense.quantity || 0) * Number(expense.price_per_unit || 0);
    setExpense((prev) => ({ ...prev, total_price: total }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expense.quantity, expense.price_per_unit]);

  async function handleLogout() {
    try {
      localStorage.removeItem('me_token');
      // if using supabase auth:
      // await supabase.auth.signOut();
    } finally {
      router.push('/');
    }
  }

  /* ---------------- Expenses ---------------- */
  async function fetchDailyExpenses() {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (!error && data) setDailyExpenses(data);
    else if (error) console.error('fetchDailyExpenses error', error);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...expense,
      price_per_unit: Number(expense.price_per_unit || 0),
      total_price: Number(expense.total_price || 0),
    };

    if (editingExpense) {
      // Update existing
      const { error } = await supabase.from('expenses').update(payload).eq('id', editingExpense.id);
      if (error) alert('❌ ' + error.message);
      else {
        alert('✅ Expense updated successfully!');
        setEditingExpense(null);
        setShowExpenseModal(false);
        fetchDailyExpenses();
      }
      return;
    }

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

  async function handleEditExpense(exp: any) {
    setEditingExpense(exp);
    setExpense({
      item_name: exp.item_name || '',
      quantity: exp.quantity || 1,
      price_per_unit: String(exp.price_per_unit ?? ''),
      total_price: Number(exp.total_price ?? 0),
      buyer_name: exp.buyer_name || '',
      date: exp.date || '',
    });
    setShowExpenseModal(true);
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
    else if (error) console.error('fetchPeople error', error);
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...person };

    if (editingPerson) {
      const { error } = await supabase.from('people').update(payload).eq('id', editingPerson.id);
      if (error) alert('❌ ' + error.message);
      else {
        alert('✅ Person updated!');
        setEditingPerson(null);
        setShowPeopleModal(false);
        fetchPeople();
      }
      return;
    }

    const { error } = await supabase.from('people').insert([payload]);
    if (error) alert('❌ ' + error.message);
    else {
      alert('✅ Person added!');
      setPerson({ name: '', joining_date: '', address: '', phone: '' });
      fetchPeople();
    }
  }

  async function handleEditPerson(p: any) {
    setEditingPerson(p);
    setPerson({ name: p.name || '', joining_date: p.joining_date || '', address: p.address || '', phone: p.phone || '' });
    setShowPeopleModal(true);
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
      // optionally remove related meal records
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

    const { data, error } = await supabase.from('meals').select('*').gte('date', startDate.toISOString().split('T')[0]);
    if (!error && data) setMealRecords(data);
    else if (error) console.error('fetchMealsForRange error', error);
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
        if (showAnalytics) loadAnalytics(filter, analyticsMode);
        fetchMealsForRange(filter);
      }
    } else {
      // insert new record
      const { data, error } = await supabase.from('meals').insert([{ person_id: personId, meal_type: mealType, date }]).select().single();
      if (error) {
        alert('❌ ' + error.message);
      } else {
        setMealRecords((prev) => [data, ...prev]);
        if (showAnalytics) loadAnalytics(filter, analyticsMode);
        fetchMealsForRange(filter);
      }
    }
  }

  function isMealChecked(personId: number | string, mealType: 'breakfast' | 'lunch' | 'dinner') {
    const date = todayISO();
    return mealRecords.some((m) => m.person_id === personId && m.meal_type === mealType && m.date === date);
  }

  /* ---------------- Analytics ----------------
     modes:
       - 'buyer' => group expenses by buyer
       - 'item'  => group expenses by item
       - 'meals' => group meal_records by person (breakfast/lunch/dinner totals + total)
  */
  async function loadAnalytics(filterType: 'daily' | 'monthly' = filter, mode: 'buyer' | 'item' | 'meals' = analyticsMode) {
    setFilter(filterType);
    setAnalyticsMode(mode);

    if (mode === 'meals') {
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

      const { data: peopleData } = await supabase.from('people').select('id,name');
      const peopleMap: Record<string, string> = {};
      (peopleData || []).forEach((p: any) => (peopleMap[p.id] = p.name || 'Unknown'));

      // aggregate per person
      const totals: Record<string, { breakfast: number; lunch: number; dinner: number; total: number }> = {};
      (mealsData || []).forEach((m: any) => {
        const name = peopleMap[m.person_id] || 'Unknown';
        if (!totals[name]) totals[name] = { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
totals[name][m.meal_type as keyof (typeof totals)[string]] += 1;
        totals[name].total += 1;
      });

      const formatted = Object.entries(totals).map(([name, val]) => ({ name, ...val }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    } else {
      let startDate = new Date();
      if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
      else startDate.setMonth(startDate.getMonth() - 1);

      const selectCol = mode === 'item' ? 'item_name, total_price, date' : 'buyer_name, total_price, date';
      const { data, error } = await supabase.from('expenses').select(selectCol).gte('date', startDate.toISOString().split('T')[0]);

      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      const totals: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        const key = mode === 'item' ? d.item_name || 'Unknown' : d.buyer_name || 'Unknown';
        totals[key] = (totals[key] || 0) + Number(d.total_price || 0);
      });

      const formatted = Object.entries(totals).map(([key, total]) => ({ name: key, total }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    }
  }

  function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------------- Search & Filtering for expenses ---------------- */
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dailyExpenses.filter((e) => {
      // filter by search and date range
      const matchesQuery =
        !q ||
        (e.item_name || '').toLowerCase().includes(q) ||
        (e.buyer_name || '').toLowerCase().includes(q) ||
        String(e.quantity || '').includes(q);
      const inFrom = !dateFrom || (e.date && e.date >= dateFrom);
      const inTo = !dateTo || (e.date && e.date <= dateTo);
      return matchesQuery && inFrom && inTo;
    });
  }, [dailyExpenses, searchQuery, dateFrom, dateTo]);

  /* ---------------- Export Utilities ---------------- */

  // Generic CSV exporter
  function downloadCSV(rows: string[][], filename = 'report.csv') {
    const csv = rows.map((r) => r.map((c) => (typeof c === 'string' && c.includes(',') ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  // Expenses export
  function exportExpensesCSV() {
    const headers = ['Item', 'Quantity', 'Price/Unit', 'Total', 'Buyer', 'Date'];
    const rows = [headers];
    filteredExpenses.forEach((e) => {
      rows.push([e.item_name, String(e.quantity), String(e.price_per_unit), String(e.total_price), e.buyer_name, e.date]);
    });
    downloadCSV(rows, `expenses_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  function exportExpensesXLSX() {
    const wsData = [
      ['Item', 'Quantity', 'Price/Unit', 'Total', 'Buyer', 'Date'],
      ...filteredExpenses.map((e) => [e.item_name, e.quantity, e.price_per_unit, e.total_price, e.buyer_name, e.date]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `expenses_${filter}_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  async function exportExpensesPDF() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text('Expenses Report', 14, 12);
    const body = filteredExpenses.map((e) => [e.item_name, e.quantity, e.price_per_unit, e.total_price, e.buyer_name, e.date]);
    (doc as any).autoTable({
      head: [['Item', 'Qty', 'Price/Unit', 'Total', 'Buyer', 'Date']],
      body,
      startY: 18,
      styles: { fontSize: 9 },
    });
    doc.save(`expenses_${filter}_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // Analytics export (meals or expenses)
  function exportAnalyticsCSV() {
    if (analyticsMode === 'meals') {
      const headers = ['Name', 'Breakfast', 'Lunch', 'Dinner', 'Total'];
      const rows = [headers, ...analytics.map((r: any) => [r.name, String(r.breakfast || 0), String(r.lunch || 0), String(r.dinner || 0), String(r.total || 0)])];
      downloadCSV(rows, `analytics_meals_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
    } else {
      const headers = ['Key', 'Total (PKR)'];
      const rows = [headers, ...analytics.map((r: any) => [r.name, String(r.total || 0)])];
      downloadCSV(rows, `analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
    }
  }

  function exportAnalyticsXLSX() {
    if (analyticsMode === 'meals') {
      const wsData = [['Name','Breakfast','Lunch','Dinner','Total'], ...analytics.map((r:any) => [r.name, r.breakfast || 0, r.lunch || 0, r.dinner || 0, r.total || 0])];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'MealsAnalytics');
      const wbout = XLSX.write(wb,{bookType:'xlsx', type:'array'});
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `analytics_meals_${filter}_${new Date().toISOString().slice(0,10)}.xlsx`);
    } else {
      const wsData = [['Key','Total'], ...analytics.map((r:any)=>[r.name, r.total || 0])];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
      const wbout = XLSX.write(wb,{bookType:'xlsx', type:'array'});
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0,10)}.xlsx`);
    }
  }

  async function exportAnalyticsPDF() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`Analytics - ${analyticsMode} (${filter})`, 14, 12);
    if (analyticsMode === 'meals') {
      const body = analytics.map((r:any) => [r.name, r.breakfast||0, r.lunch||0, r.dinner||0, r.total||0]);
      (doc as any).autoTable({ head: [['Name','Breakfast','Lunch','Dinner','Total']], body, startY: 18, styles: { fontSize: 9 } });
    } else {
      const body = analytics.map((r:any) => [r.name, r.total||0]);
      (doc as any).autoTable({ head: [['Key','Total']], body, startY: 18, styles: { fontSize: 9 } });
    }
    doc.save(`analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  /* ---------------- Print View helper ---------------- */
  function handlePrint() {
    window.print();
  }

  /* ---------------- Chart data for multi-bar (breakfast/lunch/dinner) ---------------- */
  const chartData = useMemo(() => {
    if (analyticsMode !== 'meals') return analytics.map((a:any) => ({ name: a.name, total: a.total || 0 }));
    // format for multi-bar: [{name, breakfast, lunch, dinner}, ...]
    return analytics.map((a:any) => ({ name: a.name, breakfast: a.breakfast || 0, lunch: a.lunch || 0, dinner: a.dinner || 0 }));
  }, [analytics, analyticsMode]);

  /* ---------------- UI Cards actions  ---------------- */
  const cards = [
    { title: '💸 Add Expense', onClick: () => { setEditingExpense(null); setExpense({ item_name:'', quantity:1, price_per_unit:'', total_price:0, buyer_name:'', date: todayISO() }); setShowExpenseModal(true); } },
    { title: '👥 Add Person', onClick: () => { setEditingPerson(null); setPerson({ name:'', joining_date: todayISO(), address:'', phone:'' }); setShowPeopleModal(true); } },
    { title: '📋 People List', onClick: () => setShowPeopleList(true) },
    { title: '📈 Analytics', onClick: () => loadAnalytics('monthly', 'meals') },
  ];

  /* =========================
     JSX Render
     ========================= */
  return (
    <div style={baseStyles.wrapper(dark)}>
      <div style={baseStyles.header(dark)}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={baseStyles.title}>Mini Expense & Meal Tracker</h1>
          <div style={{ fontSize: 12 }}>{new Date().toLocaleString()}</div>
        </div>

        <div style={baseStyles.topControls}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={dark} onChange={() => { setDark((v)=>!v); localStorage.setItem('me_dark', (!dark ? '1' : '0')); }} />
              Dark
            </label>
            <button style={baseStyles.primaryBtn} onClick={() => { setShowAnalytics(true); loadAnalytics(filter, analyticsMode); }}>Open Analytics</button>
            <button style={baseStyles.primaryBtn} onClick={handlePrint}>Print</button>
            <button style={baseStyles.logoutBtn(dark)} onClick={handleLogout}>🚪 Logout</button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={baseStyles.cardRow}>
        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>Total Expenses</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>PKR {summary.totalExpenses.toFixed(2)}</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Period: {filter}</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>Total Meals Recorded</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{summary.totalMeals}</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Avg / day: {summary.avgMealsPerDay}</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>People</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{peopleList.length}</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Manage members</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button style={baseStyles.primaryBtn} onClick={() => { setEditingExpense(null); setExpense({ item_name:'', quantity:1, price_per_unit:'', total_price:0, buyer_name:'', date: todayISO() }); setShowExpenseModal(true); }}>+ Expense</button>
            <button style={baseStyles.primaryBtn} onClick={() => { setEditingPerson(null); setPerson({ name:'', joining_date: todayISO(), address:'', phone:'' }); setShowPeopleModal(true); }}>+ Person</button>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div style={{ ...baseStyles.cardRow, marginBottom: 6 }}>
        {cards.map((c, idx) => (
          <div key={idx} style={{ ...baseStyles.card(dark), cursor: 'pointer' }} onClick={c.onClick}>
            <div style={{ fontWeight: 700 }}>{c.title}</div>
          </div>
        ))}
      </div>

      {/* Expense Search / Filter */}
      <div style={{ ...baseStyles.dailyCard(dark) }}>
        <h2 style={baseStyles.sectionTitle}>📅 All Expenses</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input placeholder="Search item / buyer / qty" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} style={baseStyles.input(dark)} />
          <input type="date" value={dateFrom || ''} onChange={(e)=>setDateFrom(e.target.value || null)} style={baseStyles.input(dark)} />
          <input type="date" value={dateTo || ''} onChange={(e)=>setDateTo(e.target.value || null)} style={baseStyles.input(dark)} />
          <button style={baseStyles.primaryBtn} onClick={()=>{ setSearchQuery(''); setDateFrom(null); setDateTo(null); }}>Reset</button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesCSV}>CSV</button>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesXLSX}>XLSX</button>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesPDF}>PDF</button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: 10 }}>No expenses found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={baseStyles.table(dark)}>
              <thead>
                <tr>
                  <th style={baseStyles.th(dark)}>Item</th>
                  <th style={baseStyles.th(dark)}>Quantity</th>
                  <th style={baseStyles.th(dark)}>Price/Unit</th>
                  <th style={baseStyles.th(dark)}>Total</th>
                  <th style={baseStyles.th(dark)}>Buyer</th>
                  <th style={baseStyles.th(dark)}>Date</th>
                  <th style={baseStyles.th(dark)}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={baseStyles.td(dark)}>{exp.item_name}</td>
                    <td style={baseStyles.td(dark)}>{exp.quantity}</td>
                    <td style={baseStyles.td(dark)}>{exp.price_per_unit}</td>
                    <td style={baseStyles.td(dark)}>{exp.total_price}</td>
                    <td style={baseStyles.td(dark)}>{exp.buyer_name}</td>
                    <td style={baseStyles.td(dark)}>{exp.date}</td>
                    <td style={baseStyles.td(dark)}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button style={{ ...baseStyles.smallDeleteBtn(dark), background: dark ? '#08304a' : '#fff' }} onClick={() => handleEditExpense(exp)}>✏️</button>
                        <button style={baseStyles.deleteBtn} onClick={() => handleDeleteExpense(exp.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* People List Modal */}
      {showPeopleList && (
        <Modal title={`People (${peopleList.length})`} onClose={() => setShowPeopleList(false)} dark={dark}>
          <div>
            {peopleList.length === 0 ? <p>No people added yet.</p> : (
              <div>
                {peopleList.map((p) => (
                  <div key={p.id} style={baseStyles.peopleRow(dark)}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#475569' }}>
                        {p.phone ? p.phone + ' • ' : ''} {p.joining_date}
                        <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>{p.address}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label style={{ fontSize: 12 }}>
                        <input type="checkbox" checked={isMealChecked(p.id, 'breakfast')} onChange={()=>toggleMealForToday(p.id, 'breakfast')} /> B
                      </label>
                      <label style={{ fontSize: 12 }}>
                        <input type="checkbox" checked={isMealChecked(p.id, 'lunch')} onChange={()=>toggleMealForToday(p.id, 'lunch')} /> L
                      </label>
                      <label style={{ fontSize: 12 }}>
                        <input type="checkbox" checked={isMealChecked(p.id, 'dinner')} onChange={()=>toggleMealForToday(p.id, 'dinner')} /> D
                      </label>

                      <button style={baseStyles.primaryBtn} onClick={()=>handleEditPerson(p)}>Edit</button>
                      <button style={baseStyles.smallDeleteBtn(dark)} onClick={()=>handleDeletePerson(p.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eef2ff' }} />

          <h3 style={{ marginBottom: 8 }}>Add Person</h3>
          <form onSubmit={(e)=>{ handleAddPerson(e); }} style={baseStyles.form as React.CSSProperties}>
            <input placeholder="Name" value={person.name} onChange={(e)=>setPerson({...person,name:e.target.value})} style={baseStyles.input(dark)} required />
            <input type="date" value={person.joining_date} onChange={(e)=>setPerson({...person,joining_date:e.target.value})} style={baseStyles.input(dark)} required />
            <input placeholder="Address" value={person.address} onChange={(e)=>setPerson({...person,address:e.target.value})} style={baseStyles.input(dark)} required />
            <input placeholder="Phone" value={person.phone} onChange={(e)=>setPerson({...person,phone:e.target.value})} style={baseStyles.input(dark)} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>Save Person</button>
              <button type="button" style={baseStyles.smallDeleteBtn(dark)} onClick={()=>{ setPerson({ name:'', joining_date: todayISO(), address:'', phone:'' }); setEditingPerson(null); }}>Clear</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal title={editingExpense ? 'Edit Expense' : 'Add Expense'} onClose={() => { setShowExpenseModal(false); setEditingExpense(null); }} dark={dark}>
          <form onSubmit={handleAddExpense} style={baseStyles.form as React.CSSProperties}>
            <input placeholder="Item Name" value={expense.item_name} onChange={(e)=>setExpense({...expense, item_name: e.target.value})} style={baseStyles.input(dark)} required />
            <input type="number" placeholder="Quantity" value={expense.quantity} onChange={(e)=>setExpense({...expense, quantity: Number(e.target.value)})} style={baseStyles.input(dark)} min={1} required />
            <input type="number" placeholder="Price per Unit" value={expense.price_per_unit as any} onChange={(e)=>setExpense({...expense, price_per_unit: e.target.value})} style={baseStyles.input(dark)} step="0.01" min={0} required />
            <input type="text" placeholder="Total Price (auto)" value={String(expense.total_price ?? '')} readOnly style={{ ...baseStyles.input(dark), background: dark ? '#062033' : '#f1f5f9' }} />
            <input placeholder="Buyer Name" value={expense.buyer_name} onChange={(e)=>setExpense({...expense, buyer_name: e.target.value})} style={baseStyles.input(dark)} required />
            <input type="date" value={expense.date} onChange={(e)=>setExpense({...expense, date: e.target.value})} style={baseStyles.input(dark)} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>{editingExpense ? 'Update' : 'Save Expense'}</button>
              <button type="button" style={baseStyles.smallDeleteBtn(dark)} onClick={()=>{ setExpense({item_name:'',quantity:1,price_per_unit:'',total_price:0,buyer_name:'',date:''}); setEditingExpense(null); }}>Clear</button>
            </div>
          </form>
        </Modal>
      )}

      {/* People Modal (separate) */}
      {showPeopleModal && (
        <Modal title={editingPerson ? 'Edit Person' : 'Add Person'} onClose={() => { setShowPeopleModal(false); setEditingPerson(null); }} dark={dark}>
          <form onSubmit={(e)=>handleAddPerson(e)} style={baseStyles.form as React.CSSProperties}>
            <input placeholder="Name" value={person.name} onChange={(e)=>setPerson({...person,name:e.target.value})} style={baseStyles.input(dark)} required />
            <input type="date" value={person.joining_date} onChange={(e)=>setPerson({...person,joining_date:e.target.value})} style={baseStyles.input(dark)} required />
            <input placeholder="Address" value={person.address} onChange={(e)=>setPerson({...person,address:e.target.value})} style={baseStyles.input(dark)} required />
            <input placeholder="Phone" value={person.phone} onChange={(e)=>setPerson({...person,phone:e.target.value})} style={baseStyles.input(dark)} required />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>{editingPerson ? 'Update Person' : 'Save Person'}</button>
              <button type="button" style={baseStyles.smallDeleteBtn(dark)} onClick={()=>{ setPerson({name:'',joining_date: todayISO(),address:'',phone:''}); setEditingPerson(null); }}>Clear</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <Modal title="Analytics" onClose={() => setShowAnalytics(false)} dark={dark}>
          <div style={baseStyles.analyticsControls}>
            <label style={{ fontWeight: 600 }}>Filter:</label>
            <select value={filter} onChange={(e)=>loadAnalytics(e.target.value as 'daily'|'monthly', analyticsMode)} style={{ ...baseStyles.input(dark), width: 160 }}>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            <label style={{ fontWeight: 600 }}>Group by:</label>
            <select value={analyticsMode} onChange={(e)=>loadAnalytics(filter, e.target.value as 'buyer'|'item'|'meals')} style={{ ...baseStyles.input(dark), width: 180 }}>
              <option value="buyer">Buyer (expenses)</option>
              <option value="item">Item (expenses)</option>
              <option value="meals">Meals (per person)</option>
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsCSV}>CSV</button>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsXLSX}>XLSX</button>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsPDF}>PDF</button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={baseStyles.table(dark)}>
              <thead>
                <tr>
                  {analyticsMode === 'meals' ? (
                    <>
                      <th style={baseStyles.th(dark)}>Person</th>
                      <th style={baseStyles.th(dark)}>Breakfast</th>
                      <th style={baseStyles.th(dark)}>Lunch</th>
                      <th style={baseStyles.th(dark)}>Dinner</th>
                      <th style={baseStyles.th(dark)}>Total</th>
                    </>
                  ) : (
                    <>
                      <th style={baseStyles.th(dark)}>Key</th>
                      <th style={baseStyles.th(dark)}>Total Expense (PKR)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr><td style={baseStyles.td(dark)} colSpan={analyticsMode === 'meals' ? 5 : 2}>No data</td></tr>
                ) : analyticsMode === 'meals' ? (
                  analytics.map((row:any) => (
                    <tr key={row.name}>
                      <td style={baseStyles.td(dark)}>{row.name}</td>
                      <td style={baseStyles.td(dark)}>{row.breakfast || 0}</td>
                      <td style={baseStyles.td(dark)}>{row.lunch || 0}</td>
                      <td style={baseStyles.td(dark)}>{row.dinner || 0}</td>
                      <td style={baseStyles.td(dark)}>{row.total || 0}</td>
                    </tr>
                  ))
                ) : (
                  analytics.map((row:any) => (
                    <tr key={row.name}>
                      <td style={baseStyles.td(dark)}>{row.name}</td>
                      <td style={baseStyles.td(dark)}>{Number(row.total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div style={{ width: '100%', height: 360, marginTop: 16 }}>
            <ResponsiveContainer>
              {analyticsMode === 'meals' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="breakfast" name="Breakfast" stackId="a" />
                  <Bar dataKey="lunch" name="Lunch" stackId="a" />
                  <Bar dataKey="dinner" name="Dinner" stackId="a" />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <div style={baseStyles.footer}>
        <div style={baseStyles.footerBox(dark)}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Mini Expense Tracker — Contact & Credits</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
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

          <div style={{ marginTop: 12, fontSize: 12, color: dark ? '#9fb4d9' : '#475569' }}>
            © {new Date().getFullYear()} Mini Expense Tracker — made by Himayat Ali and Ahmad Shahi. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   🧩 Modal Component (local)
   - Accepts `dark` prop to adapt colors
   ========================= */
function Modal({ title, children, onClose, dark = false }: { title: string; children: React.ReactNode; onClose: () => void; dark?: boolean; }) {
  return (
    <div style={baseStyles.modalOverlay}>
      <div style={baseStyles.modal(dark)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', padding: '8px 10px', borderRadius: 6, cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

/* =========================
   Utility
   ========================= */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}
