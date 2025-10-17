'use client';
import { useState, useEffect } from 'react';

/**
 * Attendance structure in localStorage:
 * {
 *   "2025-10-14": { "Ali": { breakfast: true, lunch: false, dinner: true }, "Bilal": {...} },
 *   "2025-10-15": { ... }
 * }
 *
 * This component:
 * - Lets you toggle breakfast/lunch/dinner per person per selected date.
 * - Lets you choose a month (YYYY-MM) and shows a per-person summary:
 *   - mealsAttended (sum of all three meals across days in month)
 *   - maxMeals = daysInMonth * 3
 *   - daysPresent = count of days where any meal true
 *   - daysAbsent = daysInMonth - daysPresent
 */

export default function AttendancePage() {
  const [people, setPeople] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<string, MealRecord>>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // format YYYY-MM

  useEffect(() => {
    const savedPeople = localStorage.getItem('people');
    if (savedPeople) setPeople(JSON.parse(savedPeople));

    const savedAttendance = localStorage.getItem('attendance');
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

    const today = new Date();
    const iso = today.toISOString().split('T')[0];
    setSelectedDate(iso);
    setSelectedMonth(iso.slice(0, 7)); // YYYY-MM
  }, []);

  // Toggle a meal for a person on the selected date
  const toggleMeal = (person: string, meal: MealKey) => {
    const updated = { ...attendance };
    if (!updated[selectedDate]) updated[selectedDate] = {};
    if (!updated[selectedDate][person]) updated[selectedDate][person] = { breakfast: false, lunch: false, dinner: false };

    updated[selectedDate][person][meal] = !updated[selectedDate][person][meal];

    setAttendance(updated);
    localStorage.setItem('attendance', JSON.stringify(updated));
  };

  const getMealStatus = (person: string, meal: MealKey, date = selectedDate) => {
    return Boolean(attendance[date]?.[person]?.[meal]);
  };

  // ---------- Monthly summary calculations ----------
  function daysInMonthFromYYYYMM(ym: string) {
    // ym format: 'YYYY-MM'
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m, 0).getDate(); // day 0 => last day of previous month, so month param is m
  }

  function iterateDatesInMonth(ym: string) {
    const [yearStr, monthStr] = ym.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12
    const days = daysInMonthFromYYYYMM(ym);
    const dates: string[] = [];
    for (let d = 1; d <= days; d++) {
      const dt = new Date(year, month - 1, d);
      const iso = dt.toISOString().split('T')[0];
      dates.push(iso);
    }
    return dates;
  }

  function computeMonthlySummary(ym: string) {
    const dates = iterateDatesInMonth(ym);
    const daysCount = dates.length;
    const result = people.map((person) => {
      let mealsAttended = 0;
      let daysPresent = 0;
      for (const date of dates) {
        const rec = attendance[date]?.[person];
        if (rec) {
          const presentMeals = Number(Boolean(rec.breakfast)) + Number(Boolean(rec.lunch)) + Number(Boolean(rec.dinner));
          mealsAttended += presentMeals;
          if (presentMeals > 0) daysPresent++;
        }
      }
      const maxMeals = daysCount * 3;
      const daysAbsent = daysCount - daysPresent;
      return {
        person,
        mealsAttended,
        maxMeals,
        daysPresent,
        daysAbsent,
      };
    });
    return result;
  }

  const monthlySummary = selectedMonth ? computeMonthlySummary(selectedMonth) : [];

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={heading}>🍽️ Mess Attendance</h2>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={input}
            />
          </div>

          <div>
            <label style={{ fontWeight: 600, marginRight: 8 }}>Select Month (summary):</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={input}
            />
          </div>
        </div>

        {/* Attendance table for selected date */}
        <div style={{ marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: '#0f172a', marginBottom: 10 }}>Mark meals for {selectedDate}</h3>

          {people.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No people added yet. Go to People page to add members.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Person</th>
                  <th style={th}>Breakfast</th>
                  <th style={th}>Lunch</th>
                  <th style={th}>Dinner</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person, i) => (
                  <tr key={i}>
                    <td style={tdLeft}>{person}</td>

                    <td style={tdCenter}>
                      <input
                        type="checkbox"
                        checked={getMealStatus(person, 'breakfast')}
                        onChange={() => toggleMeal(person, 'breakfast')}
                      />
                    </td>

                    <td style={tdCenter}>
                      <input
                        type="checkbox"
                        checked={getMealStatus(person, 'lunch')}
                        onChange={() => toggleMeal(person, 'lunch')}
                      />
                    </td>

                    <td style={tdCenter}>
                      <input
                        type="checkbox"
                        checked={getMealStatus(person, 'dinner')}
                        onChange={() => toggleMeal(person, 'dinner')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Monthly summary */}
        <div>
          <h3 style={{ margin: '12px 0', color: '#0f172a' }}>📅 Monthly Summary — {selectedMonth}</h3>

          {people.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No people to summarize.</p>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Person</th>
                  <th style={th}>Meals Attended</th>
                  <th style={th}>Possible Meals</th>
                  <th style={th}>Days Present</th>
                  <th style={th}>Days Absent</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((row) => (
                  <tr key={row.person}>
                    <td style={tdLeft}>{row.person}</td>
                    <td style={tdCenter}>
                      <strong>{row.mealsAttended}</strong>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        ({Math.round((row.mealsAttended / row.maxMeals) * 100)}%)
                      </div>
                    </td>
                    <td style={tdCenter}>{row.maxMeals}</td>
                    <td style={tdCenter}>{row.daysPresent}</td>
                    <td style={tdCenter}>{row.daysAbsent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p style={{ marginTop: 18, color: '#2563eb', fontWeight: 600 }}>
          ✅ All attendance data is stored in localStorage and grouped by date.
        </p>
      </div>
    </div>
  );
}

// ---------- types ----------
type MealKey = 'breakfast' | 'lunch' | 'dinner';
type MealRecord = { breakfast: boolean; lunch: boolean; dinner: boolean };

// ---------- STYLES (inline) ----------
const wrap: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 36,
  minHeight: '100vh',
  backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
};

const card: React.CSSProperties = {
  width: 900,
  maxWidth: '98%',
  background: 'white',
  padding: 22,
  borderRadius: 10,
  boxShadow: '0 8px 28px rgba(2,6,23,0.06)',
};

const heading: React.CSSProperties = {
  color: '#2563eb',
  marginBottom: 6,
  fontSize: 20,
};

const input: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #e6e9ef',
  background: 'white',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: 8,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #e6e9ef',
  background: '#fbfdff',
  fontWeight: 700,
  color: '#0f172a',
};

const tdLeft: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f1f5f9',
};

const tdCenter: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f1f5f9',
  textAlign: 'center',
};

