'use client';
import React, { useEffect, useMemo, useState } from 'react';
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
    padding: '16px 12px',
    minHeight: '100vh',
    background: dark ? '#0b1220' : 'linear-gradient(135deg, #89f7fe, #66a6ff)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    fontFamily:
      'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    color: dark ? '#e6eefc' : '#0f172a',
    fontSize: '14px', // Base font size for mobile
  }),
  header: (dark: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 1200,
    marginBottom: '16px',
    gap: 12,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
    }
  }),
  title: { 
    fontSize: '1.4rem', 
    fontWeight: 700,
    marginBottom: '8px',
    '@media (min-width: 768px)': {
      fontSize: '1.6rem',
      marginBottom: 0,
    }
  },
  topControls: { 
    display: 'flex', 
    gap: 8, 
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  logoutBtn: (dark: boolean) => ({
    background: 'linear-gradient(90deg,#ef4444,#f97316)',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '12px',
  }),
  cardRow: { 
    display: 'flex', 
    gap: '8px', 
    flexWrap: 'wrap' as const, 
    marginBottom: 16, 
    width: '100%', 
    maxWidth: 1200,
    justifyContent: 'center',
  },
  card: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    borderRadius: '10px',
    padding: '12px',
    width: 'calc(50% - 8px)',
    minWidth: '140px',
    boxShadow: dark ? '0 4px 8px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.06)',
    textAlign: 'left' as const,
    color: dark ? '#e6eefc' : '#0f172a',
    '@media (min-width: 768px)': {
      width: '220px',
      padding: '14px',
    }
  }),
  dailyCard: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    padding: '14px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: 1200,
    margin: '8px auto',
    boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  }),
  sectionTitle: { 
    fontSize: '1.1rem', 
    marginBottom: 10, 
    fontWeight: 600,
    '@media (min-width: 768px)': {
      fontSize: '1.15rem',
    }
  },
  table: (dark: boolean) => ({
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: dark ? '#071325' : '#f8fafc',
    color: dark ? '#e6eefc' : '#0f172a',
    fontSize: '12px',
    '@media (min-width: 768px)': {
      fontSize: '14px',
    }
  }),
  th: (dark: boolean) => ({
    backgroundColor: dark ? '#0b2540' : '#0070f3',
    color: '#fff',
    padding: '8px 6px',
    fontWeight: 600,
    textAlign: 'center' as const,
    fontSize: '11px',
    whiteSpace: 'nowrap' as const,
    '@media (min-width: 768px)': {
      padding: '10px 12px',
      fontSize: '14px',
    }
  }),
  td: (dark: boolean) => ({
    padding: '6px 4px',
    borderBottom: dark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #e6eefc',
    textAlign: 'center' as const,
    color: dark ? '#e6eefc' : '#0f172a',
    fontSize: '11px',
    wordBreak: 'break-word' as const,
    '@media (min-width: 768px)': {
      padding: '8px 10px',
      fontSize: '14px',
    }
  }),
  deleteBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '4px 6px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    '@media (min-width: 768px)': {
      padding: '6px 10px',
      fontSize: '12px',
    }
  },
  smallDeleteBtn: (dark: boolean) => ({
    background: dark ? '#071325' : '#fff',
    border: '1px solid #f87171',
    color: '#ef4444',
    padding: '4px 6px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '10px',
    '@media (min-width: 768px)': {
      padding: '6px 8px',
    }
  }),
  primaryBtn: {
    background: 'linear-gradient(90deg,#2563eb,#7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12px',
    '@media (min-width: 768px)': {
      padding: '8px 12px',
    }
  },
  input: (dark: boolean) => ({
    padding: '6px 8px',
    borderRadius: 6,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    width: '100%',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
    boxSizing: 'border-box' as const,
    fontSize: '14px',
  }),
  select: (dark: boolean) => ({
    padding: '6px 8px',
    borderRadius: 6,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
    boxSizing: 'border-box' as const,
    fontSize: '14px',
  }),
  checklistContainer: (dark: boolean) => ({
    maxHeight: '150px',
    overflowY: 'auto' as const,
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #d1d5db',
    borderRadius: 6,
    padding: '6px',
    background: dark ? '#062033' : '#fff',
    color: dark ? '#e6eefc' : '#0f172a',
    fontSize: '12px',
  }),
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 0',
    fontSize: '12px',
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
    padding: '10px',
  },
  modal: (dark: boolean) => ({
    background: dark ? '#04121a' : 'white',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
    color: dark ? '#e6eefc' : undefined,
    '@media (min-width: 768px)': {
      padding: 18,
      maxWidth: 860,
    }
  }),
  form: { 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: 6, 
    marginTop: 8,
    fontSize: '14px',
  },
  peopleRow: (dark: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 6,
    background: dark ? 'rgba(255,255,255,0.02)' : '#fbfdff',
    marginBottom: 8,
    gap: 8,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    }
  }),
  analyticsControls: { 
    display: 'flex', 
    flexDirection: 'column' as const,
    gap: 8, 
    alignItems: 'stretch', 
    marginBottom: 12, 
    flexWrap: 'wrap' as const,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
    }
  },
  footer: { 
    marginTop: 16, 
    width: '100%', 
    maxWidth: 1200, 
    textAlign: 'center' as const, 
    padding: '16px 0' 
  },
  footerBox: (dark: boolean) => ({
    background: dark ? '#04121a' : '#fff',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    boxShadow: dark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.06)',
    color: dark ? '#e6eefc' : undefined,
    fontSize: '12px',
    '@media (min-width: 768px)': {
      padding: 16,
      fontSize: '14px',
    }
  }),
  filterRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap' as const,
    '@media (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
    }
  },
  mobileHidden: {
    display: 'none',
    '@media (min-width: 768px)': {
      display: 'table-cell',
    }
  },
  mobileShow: {
    display: 'table-cell',
    '@media (min-width: 768px)': {
      display: 'none',
    }
  }
};

/* =========================
   ✅ Main Component
   ========================= */
export default function ExpenseDashboard() {
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
  const [currentTime, setCurrentTime] = useState('');

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
  const [analyticsMode, setAnalyticsMode] = useState<'item' | 'person'>('item');
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
    // Set current time on client side
    setCurrentTime(new Date().toLocaleString());
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
    if (!error && data) {
      // Fix: Parse JSON strings to arrays
      const parsedData = data.map(expense => ({
        ...expense,
        contributed_by: typeof expense.contributed_by === 'string' 
          ? JSON.parse(expense.contributed_by) 
          : expense.contributed_by || [],
        consumed_by: typeof expense.consumed_by === 'string'
          ? JSON.parse(expense.consumed_by)
          : expense.consumed_by || []
      }));
      setDailyExpenses(parsedData);
    }
    else if (error) console.error('fetchDailyExpenses error', error);
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate only today's expenses can be added
    const today = new Date().toISOString().split('T')[0];
    if (expense.date !== today) {
      alert('❌ You can only add expenses for today.');
      return;
    }

    const contributed_by = Object.entries(expense.contributedAmounts || {}).map(([name, amount]) => ({ name, amount })).filter(c => c.amount > 0);
    const totalCont = contributed_by.reduce((s, c) => s + c.amount, 0);
    if (totalCont !== expense.total_price) {
      alert('Sum of contributions must equal total price');
      return;
    }
    let document_url = expense.document_url;
    if (expense.file) {
      const fileName = `expense_doc_${Date.now()}.${expense.file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('document').upload(fileName, expense.file);
      if (uploadError) {
        alert('❌ Upload failed: ' + uploadError.message);
        return;
      }
      document_url = supabase.storage.from('document').getPublicUrl(uploadData.path).data.publicUrl;
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
      date: today,
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
      const fileName = `person_doc_${Date.now()}.${person.file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('document').upload(fileName, person.file);
      if (uploadError) {
        alert('❌ Upload failed: ' + uploadError.message);
        return;
      }
      document_url = supabase.storage.from('document').getPublicUrl(uploadData.path).data.publicUrl;
    }
    const payload = { ...person, balance: Number(person.balance || 0), document_url };

    if (editingPerson) {
      const { error } = await supabase
        .from('people')
        .update(payload)
        .eq('id', editingPerson.id);
      if (error) {
        alert('❌ ' + error.message);
      } else {
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
      setPerson({ name: '', joining_date: todayISO(), address: '', phone: '', balance: 0, file: null, document_url: '' });
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
async function loadAnalytics(filterType: 'daily' | 'monthly' = filter, mode: 'item' | 'person' = analyticsMode) {
  setFilter(filterType);
  setAnalyticsMode(mode);

  let startDate = new Date();
  if (filterType === 'daily') startDate.setDate(startDate.getDate() - 1);
  else startDate.setMonth(startDate.getMonth() - 1);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: false });

  if (error) {
    alert('❌ ' + error.message);
    return;
  }

  // Parse JSON strings to arrays for all expenses
  const parsedExpenses = (data || []).map(expense => ({
    ...expense,
    contributed_by: typeof expense.contributed_by === 'string' 
      ? JSON.parse(expense.contributed_by) 
      : expense.contributed_by || [],
    consumed_by: typeof expense.consumed_by === 'string'
      ? JSON.parse(expense.consumed_by)
      : expense.consumed_by || []
  }));

  if (mode === 'item') {
    // Item Expense Details - Show each item with full breakdown
    const itemDetails = parsedExpenses.map(expense => {
      const totalConsumers = expense.consumed_by.length;
      const perConsumerShare = totalConsumers > 0 ? expense.total_price / totalConsumers : 0;
      
      return {
        id: expense.id,
        item_name: expense.item_name || 'Unknown',
        date: expense.date,
        quantity: expense.quantity,
        price_per_unit: expense.price_per_unit,
        total_price: expense.total_price,
        contributors: expense.contributed_by.map((c: any) => `${c.name}: PKR ${c.amount}`).join(', '),
        consumers: expense.consumed_by.join(', '),
        per_consumer_share: perConsumerShare.toFixed(2),
        document_url: expense.document_url
      };
    });
    
    setAnalytics(itemDetails);
    setShowAnalytics(true);
    
  } else if (mode === 'person') {
    // Person Expense Details - Complete financial summary per person
    const personSummary: Record<string, any> = {};

    // Initialize all people
    peopleList.forEach(person => {
      personSummary[person.name] = {
        name: person.name,
        total_contributed: 0,
        total_expense_share: 0,
        net_balance: 0,
        expenses: [] as any[]
      };
    });

    // Calculate contributions and expense shares
    parsedExpenses.forEach(expense => {
      const totalConsumers = expense.consumed_by.length;
      const perConsumerShare = totalConsumers > 0 ? expense.total_price / totalConsumers : 0;

      // Process contributors
      expense.contributed_by.forEach((contrib: any) => {
        if (personSummary[contrib.name]) {
          personSummary[contrib.name].total_contributed += contrib.amount;
          personSummary[contrib.name].net_balance += contrib.amount;
          
          // Add to expense details
          personSummary[contrib.name].expenses.push({
            item_name: expense.item_name,
            date: expense.date,
            type: 'contribution',
            amount: contrib.amount,
            description: `Contributed to ${expense.item_name}`
          });
        }
      });

      // Process consumers
      expense.consumed_by.forEach((consumer: string) => {
        if (personSummary[consumer]) {
          personSummary[consumer].total_expense_share += perConsumerShare;
          personSummary[consumer].net_balance -= perConsumerShare;
          
          // Check if they also contributed to this expense
          const contributed = expense.contributed_by.find((c: any) => c.name === consumer);
          const netForThisItem = (contributed?.amount || 0) - perConsumerShare;
          
          personSummary[consumer].expenses.push({
            item_name: expense.item_name,
            date: expense.date,
            type: 'consumption',
            amount: -perConsumerShare,
            description: `Share for ${expense.item_name}${contributed ? ` (Contributed: PKR ${contributed.amount})` : ''}`
          });
        }
      });
    });

    // Convert to array format for display
    const formattedAnalytics = Object.values(personSummary).map((person: any) => ({
      name: person.name,
      total_contributed: person.total_contributed || 0,
      total_expense_share: person.total_expense_share || 0,
      net_balance: person.net_balance || 0,
      expense_count: person.expenses.length
    }));

    setAnalytics(formattedAnalytics);
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
    if (analyticsMode === 'person') {
      const headers = ['Name', 'Total Contributed (PKR)', 'Total Expense Share (PKR)', 'Net Balance (PKR)', 'Expense Count'];
      const rows = [headers, ...analytics.map((r: any) => [
        r.name, 
        (r.total_contributed || 0).toFixed(2), 
        (r.total_expense_share || 0).toFixed(2), 
        (r.net_balance || 0).toFixed(2),
        r.expense_count || 0
      ])];
      downloadCSV(rows, `person_expenses_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    } else {
      const headers = ['Item Name', 'Date', 'Quantity', 'Price/Unit', 'Total Price', 'Contributors', 'Consumers', 'Per Consumer Share'];
      const rows = [headers, ...analytics.map((r: any) => [
        r.item_name,
        r.date,
        r.quantity,
        r.price_per_unit,
        r.total_price,
        r.contributors,
        r.consumers,
        r.per_consumer_share
      ])];
      downloadCSV(rows, `item_expenses_${filter}_${new Date().toISOString().slice(0, 10)}.csv`);
    }
  }

  function exportAnalyticsXLSX() {
    let wsData: any[];
    if (analyticsMode === 'person') {
      wsData = [
        ['Name', 'Total Contributed (PKR)', 'Total Expense Share (PKR)', 'Net Balance (PKR)', 'Expense Count'],
        ...analytics.map((r: any) => [
          r.name, 
          r.total_contributed || 0, 
          r.total_expense_share || 0, 
          r.net_balance || 0,
          r.expense_count || 0
        ])
      ];
    } else {
      wsData = [
        ['Item Name', 'Date', 'Quantity', 'Price/Unit', 'Total Price', 'Contributors', 'Consumers', 'Per Consumer Share'],
        ...analytics.map((r: any) => [
          r.item_name,
          r.date,
          r.quantity,
          r.price_per_unit,
          r.total_price,
          r.contributors,
          r.consumers,
          r.per_consumer_share
        ])
      ];
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
    if (analyticsMode === 'person') {
      head = [['Name', 'Total Contributed', 'Total Expense Share', 'Net Balance', 'Expense Count']];
      body = analytics.map((r: any) => [
        r.name, 
        (r.total_contributed || 0).toFixed(2), 
        (r.total_expense_share || 0).toFixed(2), 
        (r.net_balance || 0).toFixed(2),
        r.expense_count || 0
      ]);
    } else {
      head = [['Item Name', 'Date', 'Quantity', 'Price/Unit', 'Total Price', 'Contributors', 'Consumers', 'Per Consumer Share']];
      body = analytics.map((r: any) => [
        r.item_name,
        r.date,
        r.quantity,
        r.price_per_unit,
        r.total_price,
        r.contributors,
        r.consumers,
        r.per_consumer_share
      ]);
    }
    (doc as any).autoTable({ head, body, startY: 18, styles: { fontSize: 8 } });
    doc.save(`analytics_${analyticsMode}_${filter}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function handlePrint() {
    window.print();
  }

  /* ---------------- Chart data ---------------- */
  const chartData = useMemo(() => {
    if (analyticsMode === 'person') {
      return analytics.map((a: any) => ({
        name: a.name,
        contributed: a.total_contributed || 0,
        expense_share: a.total_expense_share || 0,
        net_balance: a.net_balance || 0,
      }));
    } else {
      return analytics.map((a: any) => ({
        name: a.item_name,
        value: a.total_price || 0,
      }));
    }
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
    { title: '📈 Analytics', onClick: () => loadAnalytics('monthly', 'item') },
  ];

  /* =========================
     JSX Render
     ========================= */
  return (
    <div style={baseStyles.wrapper(dark)}>
      <div style={baseStyles.header(dark)}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <h1 style={baseStyles.title}>Expense Tracker</h1>
          <div style={{ fontSize: 11, color: dark ? '#9fb4d9' : '#64748b' }}>{currentTime}</div>
        </div>

        <div style={baseStyles.topControls}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={dark}
                onChange={() => {
                  setDark((v) => !v);
                  localStorage.setItem('me_dark', !dark ? '1' : '0');
                }}
                style={{ width: 16, height: 16 }}
              />
              Dark
            </label>
            <button
              style={{...baseStyles.primaryBtn, fontSize: 11, padding: '4px 8px'}}
              onClick={() => {
                setShowAnalytics(true);
                loadAnalytics(filter, analyticsMode);
              }}
            >
              Analytics
            </button>
            <button style={{...baseStyles.primaryBtn, fontSize: 11, padding: '4px 8px'}} onClick={handlePrint}>
              Print
            </button>
            <button style={{...baseStyles.logoutBtn(dark), fontSize: 11, padding: '4px 8px'}} onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={baseStyles.cardRow}>
        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 10, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            PKR {summary.totalExpenses.toFixed(0)}
          </div>
          <div style={{ fontSize: 10, marginTop: 4 }}>All expenses</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 10, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total People
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {summary.totalPeople}
          </div>
          <div style={{ fontSize: 10, marginTop: 4 }}>Manage members</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 10, color: dark ? '#9fb4d9' : '#64748b' }}>
            Total Balance
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            PKR {summary.totalBalance.toFixed(0)}
          </div>
          <div style={{ fontSize: 10, marginTop: 4 }}>All members</div>
        </div>

        <div style={baseStyles.card(dark)}>
          <div style={{ fontSize: 10, color: dark ? '#9fb4d9' : '#64748b' }}>
            Quick Actions
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, flexDirection: 'column' }}>
            <button
              style={{...baseStyles.primaryBtn, fontSize: 10, padding: '4px 6px'}}
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
              style={{...baseStyles.primaryBtn, fontSize: 10, padding: '4px 6px'}}
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
            style={{ ...baseStyles.card(dark), cursor: 'pointer', textAlign: 'center' as const }}
            onClick={c.onClick}
          >
            <div style={{ fontWeight: 700, fontSize: 12 }}>{c.title}</div>
          </div>
        ))}
      </div>

      {/* Expense Search / Filter */}
      <div style={{ ...baseStyles.dailyCard(dark) }}>
        <h2 style={baseStyles.sectionTitle}>📅 Expenses</h2>

        <div style={baseStyles.filterRow}>
          <select
            value={expenseFilter}
            onChange={(e) => {
              const newFilter = e.target.value as 'daily' | 'monthly' | 'all';
              setExpenseFilter(newFilter);
              fetchDailyExpenses(newFilter);
            }}
            style={{...baseStyles.select(dark), width: '100%'}}
          >
            <option value="all">All Time</option>
            <option value="monthly">This Month</option>
            <option value="daily">Today</option>
          </select>
          <input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={baseStyles.input(dark)}
          />
          <div style={{display: 'flex', gap: 8, width: '100%'}}>
            <input
              type="date"
              value={dateFrom || ''}
              onChange={(e) => setDateFrom(e.target.value || null)}
              style={{...baseStyles.input(dark), flex: 1}}
            />
            <input
              type="date"
              value={dateTo || ''}
              onChange={(e) => setDateTo(e.target.value || null)}
              style={{...baseStyles.input(dark), flex: 1}}
            />
          </div>
          <button
            style={{...baseStyles.primaryBtn, width: '100%'}}
            onClick={() => {
              setSearchQuery('');
              setDateFrom(null);
              setDateTo(null);
            }}
          >
            Reset Filters
          </button>

          <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'center' }}>
            <button style={{...baseStyles.primaryBtn, fontSize: 11, padding: '6px 8px'}} onClick={exportExpensesCSV}>
              CSV
            </button>
            <button style={{...baseStyles.primaryBtn, fontSize: 11, padding: '6px 8px'}} onClick={exportExpensesXLSX}>
              Excel
            </button>
            <button style={{...baseStyles.primaryBtn, fontSize: 11, padding: '6px 8px'}} onClick={exportExpensesPDF}>
              PDF
            </button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: 10, fontSize: 14 }}>No expenses found.</p>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={baseStyles.table(dark)}>
              <thead>
                <tr>
                  <th style={baseStyles.th(dark)}>Item</th>
                  <th style={baseStyles.th(dark)}>Total</th>
                  <th style={{...baseStyles.th(dark), ...baseStyles.mobileHidden}}>Contributors</th>
                  <th style={{...baseStyles.th(dark), ...baseStyles.mobileHidden}}>Consumers</th>
                  <th style={baseStyles.th(dark)}>Date</th>
                  <th style={baseStyles.th(dark)}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={baseStyles.td(dark)}>
                      <div style={{fontWeight: 'bold'}}>{exp.item_name}</div>
                      <div style={{fontSize: 10, color: dark ? '#9fb4d9' : '#64748b'}}>
                        Qty: {exp.quantity} × {exp.price_per_unit}
                      </div>
                    </td>
                    <td style={baseStyles.td(dark)}>
                      <strong>PKR {exp.total_price}</strong>
                    </td>
                    <td style={{...baseStyles.td(dark), ...baseStyles.mobileHidden}}>
                      {Array.isArray(exp.contributed_by) 
                        ? exp.contributed_by.map((c: any) => (
                            <div key={c.name} style={{fontSize: 10}}>
                              {c.name}: {c.amount}
                            </div>
                          ))
                        : 'Invalid data'
                      }
                    </td>
                    <td style={{...baseStyles.td(dark), ...baseStyles.mobileHidden}}>
                      {Array.isArray(exp.consumed_by) 
                        ? exp.consumed_by.join(', ')
                        : 'Invalid data'
                      }
                    </td>
                    <td style={baseStyles.td(dark)}>
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td style={baseStyles.td(dark)}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexDirection: 'column' }}>
                        {exp.date === new Date().toISOString().split('T')[0] && (
                          <>
                            <button
                              style={{
                                ...baseStyles.smallDeleteBtn(dark),
                                background: dark ? '#08304a' : '#fff',
                                fontSize: 10,
                                padding: '2px 4px'
                              }}
                              onClick={() => handleEditExpense(exp)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              style={{...baseStyles.deleteBtn, fontSize: 10, padding: '2px 4px'}}
                              onClick={() => handleDeleteExpense(exp.id)}
                            >
                              🗑️ Delete
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
        <DashboardModal
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
                            fontSize: 11,
                            color: dark ? '#9fb4d9' : '#64748b',
                          }}
                        >
                          {p.address} • Balance: PKR {Number(p.balance || 0).toFixed(2)}
                          {p.document_url && <a href={p.document_url} target="_blank" rel="noopener noreferrer"> • Document</a>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        style={{...baseStyles.primaryBtn, fontSize: 11, padding: '4px 8px'}}
                        onClick={() => handleEditPerson(p)}
                      >
                        Edit
                      </button>
                      <button
                        style={{...baseStyles.smallDeleteBtn(dark), fontSize: 11, padding: '4px 8px'}}
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
            {person.document_url && <a href={person.document_url} target="_blank" rel="noopener noreferrer">Current Document</a>}
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
        </DashboardModal>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <DashboardModal
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
            <div style={{display: 'flex', gap: 8}}>
              <input
                type="number"
                placeholder="Quantity"
                value={expense.quantity}
                onChange={(e) => setExpense({ ...expense, quantity: Number(e.target.value) })}
                style={{...baseStyles.input(dark), flex: 1}}
                min={1}
                required
              />
              <input
                type="number"
                placeholder="Price per Unit"
                value={expense.price_per_unit as any}
                onChange={(e) => setExpense({ ...expense, price_per_unit: e.target.value })}
                style={{...baseStyles.input(dark), flex: 1}}
                step="0.01"
                min={0}
                required
              />
            </div>
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
                    <label style={{minWidth: 80}}>{p.name}</label>
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
                      style={{ ...baseStyles.input(dark), width: 80 }}
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
                    <label style={{fontSize: 12}}>Consumed</label>
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
            {expense.document_url && <a href={expense.document_url} target="_blank" rel="noopener noreferrer">Current Document</a>}
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
                    date: todayISO(),
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
        </DashboardModal>
      )}

      {/* People Modal (separate) */}
      {showPeopleModal && (
        <DashboardModal
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
            {person.document_url && <a href={person.document_url} target="_blank" rel="noopener noreferrer">Current Document</a>}
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
        </DashboardModal>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <DashboardModal title="Analytics" onClose={() => setShowAnalytics(false)} dark={dark}>
          <div style={baseStyles.analyticsControls}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Filter:</label>
            <select
              value={filter}
              onChange={(e) => loadAnalytics(e.target.value as 'daily' | 'monthly', analyticsMode)}
              style={{ ...baseStyles.input(dark), width: '100%' }}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>

            <label style={{ fontWeight: 600, fontSize: 14 }}>Report Type:</label>
            <select
              value={analyticsMode}
              onChange={(e) => loadAnalytics(filter, e.target.value as 'item' | 'person')}
              style={{ ...baseStyles.input(dark), width: '100%' }}
            >
              <option value="item">Item Expenses</option>
              <option value="person">Person Summary</option>
            </select>

            <div style={{ display: 'flex', gap: 6, width: '100%', justifyContent: 'center' }}>
              <button style={{...baseStyles.primaryBtn, fontSize: 11}} onClick={exportAnalyticsCSV}>
                CSV
              </button>
              <button style={{...baseStyles.primaryBtn, fontSize: 11}} onClick={exportAnalyticsXLSX}>
                Excel
              </button>
              <button style={{...baseStyles.primaryBtn, fontSize: 11}} onClick={exportAnalyticsPDF}>
                PDF
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={baseStyles.table(dark)}>
              <thead>
                <tr>
                  {analyticsMode === 'person' ? (
                    <>
                      <th style={baseStyles.th(dark)}>Name</th>
                      <th style={baseStyles.th(dark)}>Contributed</th>
                      <th style={baseStyles.th(dark)}>Share</th>
                      <th style={baseStyles.th(dark)}>Balance</th>
                    </>
                  ) : (
                    <>
                      <th style={baseStyles.th(dark)}>Item</th>
                      <th style={baseStyles.th(dark)}>Date</th>
                      <th style={baseStyles.th(dark)}>Total</th>
                      <th style={{...baseStyles.th(dark), ...baseStyles.mobileHidden}}>Share/Person</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr>
                    <td style={baseStyles.td(dark)} colSpan={analyticsMode === 'person' ? 4 : 4}>
                      No data
                    </td>
                  </tr>
                ) : (
                  analytics.map((row: any, index: number) => (
                    <tr key={index}>
                      {analyticsMode === 'person' ? (
                        <>
                          <td style={baseStyles.td(dark)}>{row.name}</td>
                          <td style={baseStyles.td(dark)}>{(row.total_contributed || 0).toFixed(0)}</td>
                          <td style={baseStyles.td(dark)}>{(row.total_expense_share || 0).toFixed(0)}</td>
                          <td style={baseStyles.td(dark)}>
                            <span style={{ 
                              color: (row.net_balance || 0) >= 0 ? (dark ? '#4ade80' : '#16a34a') : (dark ? '#f87171' : '#dc2626'),
                              fontWeight: 'bold'
                            }}>
                              {(row.net_balance || 0).toFixed(0)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={baseStyles.td(dark)}>{row.item_name}</td>
                          <td style={baseStyles.td(dark)}>{new Date(row.date).toLocaleDateString()}</td>
                          <td style={baseStyles.td(dark)}>{row.total_price}</td>
                          <td style={{...baseStyles.td(dark), ...baseStyles.mobileHidden}}>{row.per_consumer_share}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ width: '100%', height: 300, marginTop: 12 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={60} fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                {analyticsMode === 'person' ? (
                  <>
                    <Bar dataKey="contributed" fill="#2563eb" name="Contributed" />
                    <Bar dataKey="expense_share" fill="#dc2626" name="Share" />
                  </>
                ) : (
                  <Bar dataKey="value" fill="#7c3aed" name="Total" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardModal>
      )}

      {/* Footer */}
      <div style={baseStyles.footer}>
        <div style={baseStyles.footerBox(dark)}>
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>
            Expense Tracker
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' as const }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Himayat Ali (Developer)</div>
              <div style={{fontSize: 11}}>📞 0347-2424022</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Ahmad Shahi (Engineer)</div>
              <div style={{fontSize: 11}}>📞 0310-5855299</div>
            </div>

            <div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Contact:</div>
              <div style={{fontSize: 11}}>himayatali@example.com</div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 10,
              color: dark ? '#9fb4d9' : '#475569',
            }}
          >
            © {new Date().getFullYear()} Expense Tracker
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   🧩 Modal Component (local)
   ========================= */
function DashboardModal({
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>{title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
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