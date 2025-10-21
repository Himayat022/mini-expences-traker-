'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './dashboard.module.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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
  select: (dark: boolean) => ({
    padding: '8px 10px',
    borderRadius: 8,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
    boxSizing: 'border-box' as const,
  }),
  checklistContainer: (dark: boolean) => ({
    maxHeight: '200px',
    overflowY: 'auto' as const,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    borderRadius: 8,
    padding: '8px',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
  }),
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 0',
  },
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
    date: '',
    contributedAmounts: {} as Record<string, number>,
    consumed_by: [] as string[],
    file: null as File | null,
    document_url: '',
  });

  const [person, setPerson] = useState({
    name: '',
    joining_date: '',
    address: '',
    phone: '',
    balance: 0,
    file: null as File | null,
    document_url: '',
  });

  // Data
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [filter, setFilter] = useState<'daily' | 'monthly'>('monthly');
  const [analyticsMode, setAnalyticsMode] = useState<'contributor' | 'item' | 'balances' | 'per_person'>('balances');
  const [expenseFilter, setExpenseFilter] = useState<'daily' | 'monthly' | 'all'>('all');

  // Search/filter UI
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);

  // Summary cards (computed)
  const summary = useMemo(() => {
    const totalExpenses = dailyExpenses.reduce((s, e) => s + Number(e.total_price || 0), 0);
    const totalPeople = peopleList.length;
    const totalBalance = peopleList.reduce((s, p) => s + Number(p.balance || 0), 0);
    return { totalExpenses, totalPeople, totalBalance };
  }, [dailyExpenses, peopleList]);

  useEffect(() => {
    const token = localStorage.getItem('me_token');
    if (!token) {
      router.push('/');
      return;
    }
    // Fetch initial sets
    fetchDailyExpenses();
    fetchPeople();
    // Persist dark mode
    localStorage.setItem('me_dark', dark ? '1' : '0');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, dark]);

  // Auto calculate total price
  useEffect(() => {
    const total = Number(expense.quantity || 0) * Number(expense.price_per_unit || 0);
    setExpense((prev) => ({ ...prev, total_price: total }));
  }, [expense.quantity, expense.price_per_unit]);

  async function handleLogout() {
    try {
      localStorage.removeItem('me_token');
    } finally {
      router.push('/');
    }
  }

  /* ---------------- Expenses ---------------- */
  async function fetchDailyExpenses(filter: 'daily' | 'monthly' | 'all' = expenseFilter) {
    let query = supabase.from('expenses').select('*').order('date', { ascending: false });
    if (filter === 'daily') {
      query = query.gte('date', new Date().toISOString().split('T')[0]);
    } else if (filter === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      query = query.gte('date', startOfMonth.toISOString().split('T')[0]);
    }
    const { data, error } = await query;
    if (!error && data) setDailyExpenses(data);
    else if (error) console.error('fetchDailyExpenses error', error);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const contributed_by = Object.entries(expense.contributedAmounts || {}).map(([name, amount]) => ({ name, amount })).filter(c => c.amount > 0);
    const totalCont = contributed_by.reduce((s, c) => s + c.amount, 0);
    if (totalCont !== expense.total_price) {
      alert('Sum of contributions must equal total price');
      return;
    }
    let document_url = expense.document_url;
    if (expense.file) {
      const fileName = `expense_${Date.now()}.${expense.file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('expenses_docs').upload(fileName, expense.file);
      if (uploadError) {
        alert('❌ Upload failed: ' + uploadError.message);
        return;
      }
      document_url = supabase.storage.from('expenses_docs').getPublicUrl(uploadData.path).data.publicUrl;
    }
    const payload = {
      item_name: expense.item_name,
      quantity: Number(expense.quantity),
      price_per_unit: Number(expense.price_per_unit),
      total_price: Number(expense.total_price),
      date: expense.date,
      contributed_by,
      consumed_by: expense.consumed_by,
      document_url,
    };

    const totalConsumers = expense.consumed_by.length;
    const perConsumerShare = totalConsumers > 0 ? expense.total_price / totalConsumers : 0;

    if (editingExpense) {
      const today = new Date().toISOString().split('T')[0];
      if (editingExpense.date !== today) {
        alert('❌ Editing is only allowed for today\'s expenses.');
        return;
      }
      // Revert previous balance changes
      const oldExpense = editingExpense;
      const oldPerConsumerShare = oldExpense.consumed_by.length > 0 ? oldExpense.total_price / oldExpense.consumed_by.length : 0;
      for (const contrib of oldExpense.contributed_by) {
        const person = peopleList.find((p) => p.name === contrib.name);
        if (person) {
          let updateAmount = Number(person.balance || 0) - contrib.amount;
          if (oldExpense.consumed_by.includes(contrib.name)) {
            updateAmount += oldPerConsumerShare;
          }
          await supabase.from('people').update({ balance: updateAmount }).eq('name', contrib.name);
        }
      }
      for (const personName of oldExpense.consumed_by) {
        if (!oldExpense.contributed_by.some((c: any) => c.name === personName)) {
          const person = peopleList.find((p) => p.name === personName);
          if (person) {
            await supabase.from('people').update({ balance: Number(person.balance || 0) + oldPerConsumerShare }).eq('name', personName);
          }
        }
      }

      // Apply new balance changes
      for (const contrib of contributed_by) {
        const person = peopleList.find((p) => p.name === contrib.name);
        if (person) {
          let updateAmount = Number(person.balance || 0) + contrib.amount;
          if (expense.consumed_by.includes(contrib.name)) {
            updateAmount -= perConsumerShare;
          }
          await supabase.from('people').update({ balance: updateAmount }).eq('name', contrib.name);
        }
      }
      for (const personName of expense.consumed_by) {
        if (!contributed_by.some(c => c.name === personName)) {
          const person = peopleList.find((p) => p.name === personName);
          if (person) {
            await supabase.from('people').update({ balance: Number(person.balance || 0) - perConsumerShare }).eq('name', personName);
          }
        }
      }

      const { error } = await supabase.from('expenses').update(payload).eq('id', editingExpense.id);
      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      alert('✅ Expense updated successfully!');
      setEditingExpense(null);
      setShowExpenseModal(false);
      fetchDailyExpenses();
      fetchPeople();
      return;
    }

    // Add new expense
    const { error } = await supabase.from('expenses').insert([payload]);
    if (error) {
      alert('❌ ' + error.message);
      return;
    }

    // Update balances for contributors and consumers
    for (const contrib of contributed_by) {
      const person = peopleList.find((p) => p.name === contrib.name);
      if (person) {
        let updateAmount = Number(person.balance || 0) + contrib.amount;
        if (expense.consumed_by.includes(contrib.name)) {
          updateAmount -= perConsumerShare;
        }
        await supabase.from('people').update({ balance: updateAmount }).eq('name', contrib.name);
      }
    }
    for (const personName of expense.consumed_by) {
      if (!contributed_by.some(c => c.name === personName)) {
        const person = peopleList.find((p) => p.name === personName);
        if (person) {
          await supabase.from('people').update({ balance: Number(person.balance || 0) - perConsumerShare }).eq('name', personName);
        }
      }
    }

    alert('✅ Expense added successfully!');
    setExpense({
      item_name: '',
      quantity: 1,
      price_per_unit: '',
      total_price: 0,
      date: '',
      contributedAmounts: {},
      consumed_by: [],
      file: null,
      document_url: '',
    });
    setShowExpenseModal(false);
    fetchDailyExpenses();
    fetchPeople();
  }

  async function handleEditExpense(exp: any) {
    const today = new Date().toISOString().split('T')[0];
    if (exp.date !== today) {
      alert('❌ Editing is only allowed for today\'s expenses.');
      return;
    }
    setEditingExpense(exp);
    const contributedAmounts = exp.contributed_by.reduce((acc: Record<string, number>, c: any) => ({ ...acc, [c.name]: c.amount }), {});
    setExpense({
      item_name: exp.item_name || '',
      quantity: exp.quantity || 1,
      price_per_unit: String(exp.price_per_unit ?? ''),
      total_price: Number(exp.total_price ?? 0),
      date: exp.date || '',
      contributedAmounts,
      consumed_by: exp.consumed_by || [],
      file: null,
      document_url: exp.document_url || '',
    });
    setShowExpenseModal(true);
  }

  async function handleDeleteExpense(id: number | string) {
    const today = new Date().toISOString().split('T')[0];
    const expenseToDelete = dailyExpenses.find((e) => e.id === id);
    if (!expenseToDelete || expenseToDelete.date !== today) {
      alert('❌ Deletion is only allowed for today\'s expenses.');
      return;
    }
    if (!confirm('Delete this expense permanently?')) return;
    const previous = dailyExpenses;
    setDailyExpenses((prev) => prev.filter((e) => e.id !== id));

    // Revert balance changes for the deleted expense
    if (expenseToDelete) {
      const perConsumerShare = expenseToDelete.consumed_by.length > 0 ? expenseToDelete.total_price / expenseToDelete.consumed_by.length : 0;
      for (const contrib of expenseToDelete.contributed_by) {
        const person = peopleList.find((p) => p.name === contrib.name);
        if (person) {
          let updateAmount = Number(person.balance || 0) - contrib.amount;
          if (expenseToDelete.consumed_by.includes(contrib.name)) {
            updateAmount += perConsumerShare;
          }
          await supabase.from('people').update({ balance: updateAmount }).eq('name', contrib.name);
        }
      }
      for (const personName of expenseToDelete.consumed_by) {
        if (!expenseToDelete.contributed_by.some((c: any) => c.name === personName)) {
          const person = peopleList.find((p) => p.name === personName);
          if (person) {
            await supabase.from('people').update({ balance: Number(person.balance || 0) + perConsumerShare }).eq('name', personName);
          }
        }
      }
    }

    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      alert('❌ Failed to delete: ' + error.message);
      setDailyExpenses(previous);
    } else {
      fetchDailyExpenses();
      fetchPeople();
      if (showAnalytics) loadAnalytics(filter, analyticsMode);
    }
  }

  /* ---------------- People ---------------- */
  async function fetchPeople() {
    const { data, error } = await supabase.from('people').select('*').order('name', { ascending: true });
    if (!error && data) setPeopleList(data);
    else if (error) console.error('fetchPeople error', error);
  }

  async function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    let document_url = person.document_url;
    if (person.file) {
      const fileName = `person_${Date.now()}.${person.file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('people_docs').upload(fileName, person.file);
      if (uploadError) {
        alert('❌ Upload failed: ' + uploadError.message);
        return;
      }
      document_url = supabase.storage.from('people_docs').getPublicUrl(uploadData.path).data.publicUrl;
    }
    const payload = { ...person, balance: Number(person.balance || 0), document_url };

    if (editingPerson) {
      const previousBalance = Number(editingPerson.balance || 0);
      const newBalanceInput = Number(person.balance || 0);
      const netBalance = previousBalance + newBalanceInput; // Add new amount to existing balance

      if (!confirm(`Update balance from PKR ${previousBalance.toFixed(2)} to PKR ${netBalance.toFixed(2)}?`)) {
        return;
      }

      const { error } = await supabase
        .from('people')
        .update({ ...payload, balance: netBalance })
        .eq('id', editingPerson.id);
      if (error) {
        alert('❌ ' + error.message);
      } else {
        alert('✅ Person updated! New balance: PKR ' + netBalance.toFixed(2));
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
      setPerson({ name: '', joining_date: '', address: '', phone: '', balance: 0, file: null, document_url: '' });
      fetchPeople();
    }
  }

  async function handleEditPerson(p: any) {
    setEditingPerson(p);
    setPerson({
      name: p.name || '',
      joining_date: p.joining_date || '',
      address: p.address || '',
      phone: p.phone || '',
      balance: 0, // For adding to existing
      file: null,
      document_url: p.document_url || '',
    });
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
    }
  }

  /* ---------------- Analytics ---------------- */
  async function loadAnalytics(filterType: 'daily' | 'monthly' = filter, mode: 'contributor' | 'item' | 'balances' | 'per_person' = analyticsMode) {
    setFilter(filterType);
    setAnalyticsMode(mode);

    let startDate = new Date();
    if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
    else startDate.setMonth(startDate.getMonth() - 1);
    const startDateStr = startDate.toISOString().split('T')[0];

    if (mode === 'balances') {
      const { data: peopleData, error } = await supabase.from('people').select('name,balance');
      if (error) {
        alert('❌ ' + error.message);
        return;
      }
      const formatted = (peopleData || []).map((p: any) => ({
        name: p.name || 'Unknown',
        balance: Number(p.balance || 0),
      }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    } else if (mode === 'contributor') {
      const { data, error } = await supabase
        .from('expenses')
        .select('contributed_by, total_price, date')
        .gte('date', startDateStr);

      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      const totals: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        (d.contributed_by || []).forEach((contrib: {name: string, amount: number}) => {
          totals[contrib.name] = (totals[contrib.name] || 0) + contrib.amount;
        });
      });

      const formatted = Object.entries(totals).map(([key, total]) => ({ name: key, total }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    } else if (mode === 'item') {
      const { data, error } = await supabase
        .from('expenses')
        .select('item_name, total_price, date')
        .gte('date', startDateStr);

      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      const totals: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        const key = d.item_name || 'Unknown';
        totals[key] = (totals[key] || 0) + Number(d.total_price || 0);
      });

      const formatted = Object.entries(totals).map(([key, total]) => ({ name: key, total }));
      setAnalytics(formatted);
      setShowAnalytics(true);
    } else if (mode === 'per_person') {
      const { data, error } = await supabase
        .from('expenses')
        .select('item_name, date, total_price, contributed_by, consumed_by')
        .gte('date', startDateStr);

      if (error) {
        alert('❌ ' + error.message);
        return;
      }

      const perPersonData: any[] = [];
      (data || []).forEach((d: any) => {
        const numConsumers = d.consumed_by.length;
        const perConsumer = numConsumers > 0 ? d.total_price / numConsumers : 0;
        d.consumed_by.forEach((consumer: string) => {
          let paid = 0;
          const contrib = d.contributed_by.find((c: any) => c.name === consumer);
          if (contrib) paid = contrib.amount;
          perPersonData.push({
            name: consumer,
            item_name: d.item_name,
            date: d.date,
            expense_share: perConsumer,
            paid,
          });
        });
      });
      setAnalytics(perPersonData);
      setShowAnalytics(true);
    }
  }

  /* ---------------- Search & Filtering for expenses ---------------- */
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return dailyExpenses.filter((e) => {
      const matchesQuery =
        !q ||
        (e.item_name || '').toLowerCase().includes(q) ||
        String(e.quantity || '').includes(q) ||
        (e.contributed_by || []).some((c: any) => c.name.toLowerCase().includes(q) || String(c.amount).includes(q)) ||
        (e.consumed_by || []).some((p: string) => p.toLowerCase().includes(q));
      const inFrom = !dateFrom || (e.date && e.date >= dateFrom);
      const inTo = !dateTo || (e.date && e.date <= dateTo);
      return matchesQuery && inFrom && inTo;
    });
  }, [dailyExpenses, searchQuery, dateFrom, dateTo]);

  /* ---------------- Export Utilities ---------------- */
  function downloadCSV(rows: string[][], filename = 'report.csv') {
    const csv = rows.map((r) => r.map((c) => (typeof c === 'string' && c.includes(',') ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  }

  function exportExpensesCSV() {
    const headers = ['Item', 'Quantity', 'Price/Unit', 'Total', 'Contributed By', 'Consumed By', 'Date', 'Document'];
    const rows = [headers];
    filteredExpenses.forEach((e) => {
      rows.push([
        e.item_name,
        String(e.quantity),
        String(e.price_per_unit),
        String(e.total_price),
        e.contributed_by.map((c: any) => `${c.name}:${c.amount}`).join(';'),
        (e.consumed_by || []).join(';'),
        e.date,
        e.document_url || '',
      ]);
    });
    downloadCSV(rows, `expenses_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportExpensesXLSX() {
    const wsData = [
      ['Item', 'Quantity', 'Price/Unit', 'Total', 'Contributed By', 'Consumed By', 'Date', 'Document'],
      ...filteredExpenses.map((e) => [
        e.item_name,
        e.quantity,
        e.price_per_unit,
        e.total_price,
        e.contributed_by.map((c: any) => `${c.name}:${c.amount}`).join(';'),
        (e.consumed_by || []).join(';'),
        e.date,
        e.document_url || '',
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `expenses_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function exportExpensesPDF() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text('Expenses Report', 14, 12);
    const body = filteredExpenses.map((e) => [
      e.item_name,
      e.quantity,
      e.price_per_unit,
      e.total_price,
      e.contributed_by.map((c: any) => `${c.name}:${c.amount}`).join(';'),
      (e.consumed_by || []).join(';'),
      e.date,
      e.document_url || '',
    ]);
    (doc as any).autoTable({
      head: [['Item', 'Qty', 'Price/Unit', 'Total', 'Contributed By', 'Consumed By', 'Date', 'Document']],
      body,
      startY: 18,
      styles: { fontSize: 9 },
    });
    doc.save(`expenses_${filter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function exportAnalyticsCSV() {
    if (analyticsMode === 'balances') {
      const headers = ['Name', 'Balance (PKR)'];
      const rows = [headers, ...analytics.map((r: any) => [r.name, String(r.balance || 0)])];
      downloadCSV(rows, `analytics_balances_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (analyticsMode === 'per_person') {
      const headers = ['Name', 'Item Name', 'Date', 'Expense Share (PKR)', 'Paid (PKR)'];
      const rows = [headers, ...analytics.map((r: any) => [r.name, r.item_name, r.date, String(r.expense_share.toFixed(2)), String(r.paid.toFixed(2))])];
      downloadCSV(rows, `analytics_per_person_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const headers = ['Key', 'Total (PKR)'];
      const rows = [headers, ...analytics.map((r: any) => [r.name, String(r.total || 0)])];
      downloadCSV(rows, `analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  }

  function exportAnalyticsXLSX() {
    let wsData: any[];
    if (analyticsMode === 'balances') {
      wsData = [['Name', 'Balance'], ...analytics.map((r: any) => [r.name, r.balance || 0])];
    } else if (analyticsMode === 'per_person') {
      wsData = [['Name', 'Item Name', 'Date', 'Expense Share', 'Paid'], ...analytics.map((r: any) => [r.name, r.item_name, r.date, r.expense_share, r.paid])];
    } else {
      wsData = [['Key', 'Total'], ...analytics.map((r: any) => [r.name, r.total || 0])];
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function exportAnalyticsPDF() {
    const jsPDF = (await import('jspdf')).default;
    await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text(`Analytics - ${analyticsMode} (${filter})`, 14, 12);
    let head: any, body: any;
    if (analyticsMode === 'balances') {
      head = [['Name', 'Balance']];
      body = analytics.map((r: any) => [r.name, r.balance || 0]);
    } else if (analyticsMode === 'per_person') {
      head = [['Name', 'Item Name', 'Date', 'Expense Share', 'Paid']];
      body = analytics.map((r: any) => [r.name, r.item_name, r.date, r.expense_share.toFixed(2), r.paid.toFixed(2)]);
    } else {
      head = [['Key', 'Total']];
      body = analytics.map((r: any) => [r.name, r.total || 0]);
    }
    (doc as any).autoTable({ head, body, startY: 18, styles: { fontSize: 9 } });
    doc.save(`analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function handlePrint() {
    window.print();
  }

  /* ---------------- Chart data ---------------- */
  const chartData = useMemo(() => {
    return analytics.map((a: any) => ({
      name: a.name,
      value: analyticsMode === 'balances' ? a.balance || 0 : a.total || 0,
    }));
  }, [analytics, analyticsMode]);

  /* ---------------- UI Cards actions  ---------------- */
  const cards = [
    {
      title: '💸 Add Expense',
      onClick: () => {
        setEditingExpense(null);
        setExpense({
          item_name: '',
          quantity: 1,
          price_per_unit: '',
          total_price: 0,
          date: todayISO(),
          contributedAmounts: {},
          consumed_by: [],
          file: null,
          document_url: '',
        });
        setShowExpenseModal(true);
      },
    },
    {
      title: '👥 Add Person',
      onClick: () => {
        setEditingPerson(null);
        setPerson({ name: '', joining_date: todayISO(), address: '', phone: '', balance: 0, file: null, document_url: '' });
        setShowPeopleModal(true);
      },
    },
    { title: '📋 People List', onClick: () => setShowPeopleList(true) },
    { title: '📈 Analytics', onClick: () => loadAnalytics('monthly', 'balances') },
  ];

  /* =========================
     JSX Render
     ========================= */
  return (
    <div style={baseStyles.wrapper(dark)}>
      <div style={baseStyles.header(dark)}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={baseStyles.title}>Mini Expense & Balance Tracker</h1>
          <div style={{ fontSize: 12 }}>{new Date().toLocaleString()}</div>
        </div>

        <div style={baseStyles.topControls}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={dark}
                onChange={() => {
                  setDark((v) => !v);
                  localStorage.setItem('me_dark', !dark ? '1' : '0');
                }}
              />
              Dark
            </label>
            <button
              style={baseStyles.primaryBtn}
              onClick={() => {
                setShowAnalytics(true);
                loadAnalytics(filter, analyticsMode);
              }}
            >
              Open Analytics
            </button>
            <button style={baseStyles.primaryBtn} onClick={handlePrint}>
              Print
            </button>
            <button style={baseStyles.logoutBtn(dark)} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={baseStyles.cardRow}>
        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            PKR {summary.totalExpenses.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Period: {filter}</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total People
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {summary.totalPeople}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Manage members</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total Balance
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            PKR {summary.totalBalance.toFixed(2)}
          </div>
          <div style={{ fontSize: 12, marginTop: 6 }}>All members</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              style={baseStyles.primaryBtn}
              onClick={() => {
                setEditingExpense(null);
                setExpense({
                  item_name: '',
                  quantity: 1,
                  price_per_unit: '',
                  total_price: 0,
                  date: todayISO(),
                  contributedAmounts: {},
                  consumed_by: [],
                  file: null,
                  document_url: '',
                });
                setShowExpenseModal(true);
              }}
            >
              + Expense
            </button>
            <button
              style={baseStyles.primaryBtn}
              onClick={() => {
                setEditingPerson(null);
                setPerson({
                  name: '',
                  joining_date: todayISO(),
                  address: '',
                  phone: '',
                  balance: 0,
                  file: null,
                  document_url: '',
                });
                setShowPeopleModal(true);
              }}
            >
              + Person
            </button>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div style={{ ...baseStyles.cardRow, marginBottom: 6 }}>
        {cards.map((c, idx) => (
          <div
            key={idx}
            style={{ ...baseStyles.card(dark), cursor: 'pointer' }}
            onClick={c.onClick}
          >
            <div style={{ fontWeight: 700 }}>{c.title}</div>
          </div>
        ))}
      </div>

      {/* Expense Search / Filter */}
      <div style={{ ...baseStyles.dailyCard(dark) }}>
        <h2 style={baseStyles.sectionTitle}>📅 All Expenses</h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select
            value={expenseFilter}
            onChange={(e) => {
              const newFilter = e.target.value as 'daily' | 'monthly' | 'all';
              setExpenseFilter(newFilter);
              fetchDailyExpenses(newFilter);
            }}
            style={baseStyles.select(dark)}
          >
            <option value="all">All Time</option>
            <option value="monthly">This Month</option>
            <option value="daily">Today</option>
          </select>
          <input
            placeholder="Search item / qty / people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={baseStyles.input(dark)}
          />
          <input
            type="date"
            value={dateFrom || ''}
            onChange={(e) => setDateFrom(e.target.value || null)}
            style={baseStyles.input(dark)}
          />
          <input
            type="date"
            value={dateTo || ''}
            onChange={(e) => setDateTo(e.target.value || null)}
            style={baseStyles.input(dark)}
          />
          <button
            style={baseStyles.primaryBtn}
            onClick={() => {
              setSearchQuery('');
              setDateFrom(null);
              setDateTo(null);
            }}
          >
            Reset
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesCSV}>
              CSV
            </button>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesXLSX}>
              XLSX
            </button>
            <button style={baseStyles.primaryBtn} onClick={exportExpensesPDF}>
              PDF
            </button>
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
                  <th style={baseStyles.th(dark)}>Contributed By</th>
                  <th style={baseStyles.th(dark)}>Consumed By</th>
                  <th style={baseStyles.th(dark)}>Date</th>
                  <th style={baseStyles.th(dark)}>Document</th>
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
                    <td style={baseStyles.td(dark)}>
                      {exp.contributed_by.map((c: any) => `${c.name}: ${c.amount}`).join(', ')}
                    </td>
                    <td style={baseStyles.td(dark)}>
                      {(exp.consumed_by || []).join(', ')}
                    </td>
                    <td style={baseStyles.td(dark)}>{exp.date}</td>
                    <td style={baseStyles.td(dark)}>
                      {exp.document_url ? <a href={exp.document_url} target="_blank">View</a> : ''}
                    </td>
                    <td style={baseStyles.td(dark)}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        {exp.date === new Date().toISOString().split('T')[0] && (
                          <>
                            <button
                              style={{
                                ...baseStyles.smallDeleteBtn(dark),
                                background: dark ? '#08304a' : '#fff',
                              }}
                              onClick={() => handleEditExpense(exp)}
                            >
                              ✏️
                            </button>
                            <button
                              style={baseStyles.deleteBtn}
                              onClick={() => handleDeleteExpense(exp.id)}
                            >
                              🗑️
                            </button>
                          </>
                        )}
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
        <Modal
          title={`People (${peopleList.length})`}
          onClose={() => setShowPeopleList(false)}
          dark={dark}
        >
          <div>
            {peopleList.length === 0 ? (
              <p>No people added yet.</p>
            ) : (
              <div>
                {peopleList.map((p) => (
                  <div key={p.id} style={baseStyles.peopleRow(dark)}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div
                        style={{
                          fontSize: 12,
                          color: dark ? '#9fb4d9' : '#475569',
                        }}
                      >
                        {p.phone ? p.phone + ' • ' : ''} {p.joining_date}
                        <div
                          style={{
                            fontSize: 12,
                            color: dark ? '#9fb4d9' : '#64748b',
                          }}
                        >
                          {p.address} • Balance: PKR {Number(p.balance || 0).toFixed(2)}
                          {p.document_url && <a href={p.document_url} target="_blank"> • Document</a>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 20 }}>🧑</span>
                      <button
                        style={baseStyles.primaryBtn}
                        onClick={() => handleEditPerson(p)}
                      >
                        Edit
                      </button>
                      <button
                        style={baseStyles.smallDeleteBtn(dark)}
                        onClick={() => handleDeletePerson(p.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr
            style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #eef2ff' }}
          />

          <h3 style={{ marginBottom: 8 }}>Add Person</h3>
          <form onSubmit={(e) => handleAddPerson(e)} style={baseStyles.form as React.CSSProperties}>
            <input
              placeholder="Name"
              value={person.name}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              type="date"
              value={person.joining_date}
              onChange={(e) => setPerson({ ...person, joining_date: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Address"
              value={person.address}
              onChange={(e) => setPerson({ ...person, address: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Phone"
              value={person.phone}
              onChange={(e) => setPerson({ ...person, phone: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Add to Balance"
              type="number"
              value={person.balance}
              onChange={(e) => setPerson({ ...person, balance: Number(e.target.value) })}
              style={baseStyles.input(dark)}
              step="0.01"
              min="0"
            />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setPerson({ ...person, file: e.target.files?.[0] || null })}
              style={baseStyles.input(dark)}
            />
            {person.document_url && <a href={person.document_url} target="_blank">Current Document</a>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>
                {editingPerson ? 'Update Person' : 'Save Person'}
              </button>
              <button
                type="button"
                style={baseStyles.smallDeleteBtn(dark)}
                onClick={() => {
                  setPerson({
                    name: '',
                    joining_date: todayISO(),
                    address: '',
                    phone: '',
                    balance: 0,
                    file: null,
                    document_url: '',
                  });
                  setEditingPerson(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <Modal
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
          onClose={() => {
            setShowExpenseModal(false);
            setEditingExpense(null);
          }}
          dark={dark}
        >
          <form onSubmit={handleAddExpense} style={baseStyles.form as React.CSSProperties}>
            <input
              placeholder="Item Name"
              value={expense.item_name}
              onChange={(e) => setExpense({ ...expense, item_name: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={expense.quantity}
              onChange={(e) => setExpense({ ...expense, quantity: Number(e.target.value) })}
              style={baseStyles.input(dark)}
              min={1}
              required
            />
            <input
              type="number"
              placeholder="Price per Unit"
              value={expense.price_per_unit as any}
              onChange={(e) => setExpense({ ...expense, price_per_unit: e.target.value })}
              style={baseStyles.input(dark)}
              step="0.01"
              min={0}
              required
            />
            <input
              type="text"
              placeholder="Total Price (auto)"
              value={String(expense.total_price ?? '')}
              readOnly
              style={{ ...baseStyles.input(dark), background: dark ? '#062033' : '#f1f5f9' }}
            />
            <div style={baseStyles.checklistContainer(dark)}>
              <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>
                Contributors & Consumers
              </label>
              {peopleList.length === 0 ? (
                <p style={{ fontSize: 12, color: dark ? '#9fb4d9' : '#64748b' }}>
                  No people available
                </p>
              ) : (
                peopleList.map((p) => (
                  <div key={p.id} style={baseStyles.checklistItem}>
                    <label>{p.name}</label>
                    <input
                      type="number"
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      value={expense.contributedAmounts[p.name] || 0}
                      onChange={(e) => setExpense({
                        ...expense,
                        contributedAmounts: { ...expense.contributedAmounts, [p.name]: Number(e.target.value) || 0 },
                      })}
                      style={{ width: '100px', ...baseStyles.input(dark) }}
                    />
                    <input
                      type="checkbox"
                      checked={expense.consumed_by.includes(p.name)}
                      onChange={(e) => {
                        const updatedConsumers = e.target.checked
                          ? [...expense.consumed_by, p.name]
                          : expense.consumed_by.filter((name) => name !== p.name);
                        setExpense({ ...expense, consumed_by: updatedConsumers });
                      }}
                    />
                    <label>Consumed</label>
                  </div>
                ))
              )}
            </div>
            <input
              type="date"
              value={expense.date}
              onChange={(e) => setExpense({ ...expense, date: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setExpense({ ...expense, file: e.target.files?.[0] || null })}
              style={baseStyles.input(dark)}
            />
            {expense.document_url && <a href={expense.document_url} target="_blank">Current Document</a>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>
                {editingExpense ? 'Update' : 'Save Expense'}
              </button>
              <button
                type="button"
                style={baseStyles.smallDeleteBtn(dark)}
                onClick={() => {
                  setExpense({
                    item_name: '',
                    quantity: 1,
                    price_per_unit: '',
                    total_price: 0,
                    date: '',
                    contributedAmounts: {},
                    consumed_by: [],
                    file: null,
                    document_url: '',
                  });
                  setEditingExpense(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* People Modal (separate) */}
      {showPeopleModal && (
        <Modal
          title={editingPerson ? 'Edit Person' : 'Add Person'}
          onClose={() => {
            setShowPeopleModal(false);
            setEditingPerson(null);
          }}
          dark={dark}
        >
          <form onSubmit={(e) => handleAddPerson(e)} style={baseStyles.form as React.CSSProperties}>
            <input
              placeholder="Name"
              value={person.name}
              onChange={(e) => setPerson({ ...person, name: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              type="date"
              value={person.joining_date}
              onChange={(e) => setPerson({ ...person, joining_date: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Address"
              value={person.address}
              onChange={(e) => setPerson({ ...person, address: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Phone"
              value={person.phone}
              onChange={(e) => setPerson({ ...person, phone: e.target.value })}
              style={baseStyles.input(dark)}
              required
            />
            <input
              placeholder="Add to Balance"
              type="number"
              value={person.balance}
              onChange={(e) => setPerson({ ...person, balance: Number(e.target.value) })}
              style={baseStyles.input(dark)}
              step="0.01"
              min="0"
            />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setPerson({ ...person, file: e.target.files?.[0] || null })}
              style={baseStyles.input(dark)}
            />
            {person.document_url && <a href={person.document_url} target="_blank">Current Document</a>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={baseStyles.primaryBtn}>
                {editingPerson ? 'Update Person' : 'Save Person'}
              </button>
              <button
                type="button"
                style={baseStyles.smallDeleteBtn(dark)}
                onClick={() => {
                  setPerson({
                    name: '',
                    joining_date: todayISO(),
                    address: '',
                    phone: '',
                    balance: 0,
                    file: null,
                    document_url: '',
                  });
                  setEditingPerson(null);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <Modal title="Analytics" onClose={() => setShowAnalytics(false)} dark={dark}>
          <div style={baseStyles.analyticsControls}>
            <label style={{ fontWeight: 600 }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => loadAnalytics(e.target.value as 'daily' | 'monthly', analyticsMode)}
              style={{ ...baseStyles.input(dark), width: 160 }}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            <label style={{ fontWeight: 600 }}>Group by:</label>
            <select
              value={analyticsMode}
              onChange={(e) => loadAnalytics(filter, e.target.value as 'contributor' | 'item' | 'balances' | 'per_person')}
              style={{ ...baseStyles.input(dark), width: 180 }}
            >
              <option value="contributor">Contributor (expenses)</option>
              <option value="item">Item (expenses)</option>
              <option value="balances">Balances (per person)</option>
              <option value="per_person">Per Person Details</option>
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsCSV}>
                CSV
              </button>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsXLSX}>
                XLSX
              </button>
              <button style={baseStyles.primaryBtn} onClick={exportAnalyticsPDF}>
                PDF
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={baseStyles.table(dark)}>
              <thead>
                <tr>
                  {analyticsMode === 'per_person' ? (
                    <>
                      <th style={baseStyles.th(dark)}>Name</th>
                      <th style={baseStyles.th(dark)}>Item Name</th>
                      <th style={baseStyles.th(dark)}>Date</th>
                      <th style={baseStyles.th(dark)}>Expense Share (PKR)</th>
                      <th style={baseStyles.th(dark)}>Paid (PKR)</th>
                    </>
                  ) : (
                    <>
                      <th style={baseStyles.th(dark)}>Name</th>
                      <th style={baseStyles.th(dark)}>
                        {analyticsMode === 'balances' ? 'Balance (PKR)' : 'Total Expense (PKR)'}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr>
                    <td style={baseStyles.td(dark)} colSpan={analyticsMode === 'per_person' ? 5 : 2}>
                      No data
                    </td>
                  </tr>
                ) : (
                  analytics.map((row: any) => (
                    <tr key={row.name + (row.item_name || '')}>
                      <td style={baseStyles.td(dark)}>{row.name}</td>
                      {analyticsMode === 'per_person' ? (
                        <>
                          <td style={baseStyles.td(dark)}>{row.item_name}</td>
                          <td style={baseStyles.td(dark)}>{row.date}</td>
                          <td style={baseStyles.td(dark)}>{row.expense_share.toFixed(2)}</td>
                          <td style={baseStyles.td(dark)}>{row.paid.toFixed(2)}</td>
                        </>
                      ) : (
                        <td style={baseStyles.td(dark)}>
                          {Number(analyticsMode === 'balances' ? row.balance : row.total).toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ width: '100%', height: 360, marginTop: 16 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Modal>
      )}

      {/* Footer */}
      <div style={baseStyles.footer}>
        <div style={baseStyles.footerBox(dark)}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Mini Expense Tracker — Contact & Credits
          </div>

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

          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: dark ? '#9fb4d9' : '#475569',
            }}
          >
            © {new Date().getFullYear()} Mini Expense Tracker — made by Himayat Ali and Ahmad Shahi. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   🧩 Modal Component (local)
   ========================= */
function Modal({
  title,
  children,
  onClose,
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  dark?: boolean;
}) {
  return (
    <div style={baseStyles.modalOverlay}>
      <div style={baseStyles.modal(dark)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                border: 'none',
                padding: '8px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
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