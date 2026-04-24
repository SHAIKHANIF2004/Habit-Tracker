// ===== Storage (MongoDB via Backend API) =====
let data = { habits: [], checks: {}, currentYear: new Date().getFullYear(), currentMonth: new Date().getMonth() };

async function loadData() {
  try {
    const res = await fetch('http://localhost:3000/api/data');
    if (res.ok) {
      const parsed = await res.json();
      // Migration: if habits were stored as plain strings, convert them
      if (parsed.habits && parsed.habits.length > 0 && typeof parsed.habits[0] === 'string') {
        const now = new Date();
        parsed.habits = parsed.habits.map(name => ({
          name, addedYear: now.getFullYear(), addedMonth: now.getMonth(), hiddenMonths: []
        }));
        await saveData(parsed);
      }
      data = parsed;
    }
  } catch (err) {
    console.error('Failed to load data from server:', err);
    showToast('Failed to load data. Is the server running?');
  }
}

async function saveData(dataToSave) {
  const payload = dataToSave || data;
  try {
    const res = await fetch('http://localhost:3000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      showToast('Error saving data. Check connection.');
    }
  } catch (err) {
    console.error('Failed to save data to server:', err);
    showToast('Failed to save data. Network error.');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  setTimeout(() => { toast.className = toast.className.replace('show', ''); }, 3000);
}


// ===== Auto-Emoji =====
const EMOJI_MAP = {
  read: '📚', book: '📚', study: '📖', learn: '🧠',
  gym: '🏋️', workout: '💪', exercise: '🏃', run: '🏃', jog: '🏃',
  water: '💧', hydrat: '💧', drink: '🥤',
  meditat: '🧘', yoga: '🧘', mindful: '🧘',
  code: '💻', program: '💻', dev: '💻', dsa: '💻', leetcode: '💻',
  sleep: '😴', wake: '⏰', morning: '🌅',
  eat: '🥗', diet: '🥗', food: '🍽️', cook: '👨‍🍳',
  walk: '🚶', step: '👟',
  write: '✍️', journal: '📝', blog: '📝', note: '📝',
  pray: '🤲', quran: '📖', namaz: '🤲',
  music: '🎵', guitar: '🎸', piano: '🎹',
  paint: '🎨', draw: '✏️', art: '🎨',
  clean: '🧹', organize: '📂',
  save: '💰', money: '💰', invest: '📈',
  apply: '📋', job: '💼', interview: '🎤',
  system: '🏗️', design: '🏗️',
  java: '☕', python: '🐍', react: '⚛️',
  stretch: '🤸', plank: '🧱',
  skin: '🧴', groom: '💈',
  call: '📞', family: '👨‍👩‍👧', friend: '👋',
  no_match: '✅'
};

function autoEmoji(name) {
  const lower = name.toLowerCase();
  for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
    if (keyword === 'no_match') continue;
    if (lower.includes(keyword)) return name + ' ' + emoji;
  }
  return name;
}

// ===== Sound Effects =====
function playCheckSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) {}
}

// ===== Undo =====
let undoStack = [];

function pushUndo() {
  undoStack.push(JSON.stringify(data));
  if (undoStack.length > 20) undoStack.shift();
}

async function undo() {
  if (undoStack.length === 0) {
    showToast('Nothing to undo');
    return;
  }
  data = JSON.parse(undoStack.pop());
  await saveData();
  render();
  showToast('Undone!');
}

// ===== Quotes =====
const QUOTES = [
  "Discipline is a habit.",
  "Small daily improvements lead to stunning results.",
  "Motivation gets you started. Habit keeps you going.",
  "You will never change your life until you change something you do daily.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "We are what we repeatedly do. Excellence is not an act, but a habit.",
  "The secret of your future is hidden in your daily routine.",
  "Don't count the days, make the days count.",
  "Consistency is the true foundation of trust.",
  "A year from now you will wish you had started today.",
  "The only bad workout is the one that didn't happen.",
  "Progress is progress, no matter how small.",
  "Fall seven times, stand up eight.",
  "It does not matter how slowly you go as long as you do not stop.",
  "What you do every day matters more than what you do once in a while.",
  "Habits are the compound interest of self-improvement.",
  "One day or day one. You decide.",
  "Be stronger than your excuses.",
  "Push yourself, because no one else is going to do it for you.",
  "Dream it. Wish it. Do it.",
  "Great things never come from comfort zones.",
  "The harder you work, the luckier you get.",
  "Do something today that your future self will thank you for.",
  "It always seems impossible until it's done.",
  "Your only limit is your mind.",
  "Believe you can and you're halfway there.",
  "Strive for progress, not perfection.",
  "Action is the foundational key to all success.",
  "Don't wish for it. Work for it.",
  "The best time to start was yesterday. The next best time is now.",
  "Winners are not people who never fail, but people who never quit."
];

function getDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

// ===== Month Helpers =====
const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthDays(year, month) {
  const totalDays = getDaysInMonth(year, month);
  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push({ day: d, dayName: DAY_NAMES[date.getDay()], date });
  }
  return days;
}

function getVisibleHabits() {
  const viewYear = data.currentYear;
  const viewMonth = data.currentMonth;
  const viewKey = `${viewYear}-${viewMonth}`;
  const result = [];
  data.habits.forEach((habit, originalIndex) => {
    const addedDate = habit.addedYear * 12 + habit.addedMonth;
    const viewDate = viewYear * 12 + viewMonth;
    const hidden = habit.hiddenMonths || [];
    if (addedDate <= viewDate && !hidden.includes(viewKey)) {
      result.push({ ...habit, originalIndex });
    }
  });
  return result;
}

function checkKey(originalIdx, day) {
  return `${originalIdx}-${data.currentYear}-${data.currentMonth}-${day}`;
}

function isChecked(originalIdx, day) {
  return !!data.checks[checkKey(originalIdx, day)];
}

function isHabitActiveOnDay(habit, y, m, d) {
  const addedVal = (habit.addedYear * 400) + (habit.addedMonth * 32) + (habit.addedDay || 1);
  const currentVal = (y * 400) + (m * 32) + d;
  return addedVal <= currentVal;
}

async function toggleCheck(originalIdx, day) {
  const cellDate = new Date(data.currentYear, data.currentMonth, day);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  
  // Only allow checking today's habits
  if (cellDate.getTime() !== today.getTime()) return;

  pushUndo();
  const key = checkKey(originalIdx, day);
  data.checks[key] = !data.checks[key];
  if (data.checks[key]) playCheckSound();
  await saveData();
  render();

  // Check if all habits are done for this day — trigger confetti + success sound
  const visible = getVisibleHabits();
  if (visible.length > 0) {
    let allDone = true;
    visible.forEach(h => { if (!isChecked(h.originalIndex, day)) allDone = false; });
    if (allDone && data.checks[key]) {
      launchConfetti();
      playSuccessSound();
    }
  }
}

// ===== Streak Calculator =====
function calculateStreak() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  // Go backwards day by day from today
  for (let offset = 0; offset <= 365; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();

    // Get habits visible for that month
    const viewKey = `${y}-${m}`;
    const visibleForDay = data.habits.filter((habit, idx) => {
      const addedVal = (habit.addedYear * 400) + (habit.addedMonth * 32) + (habit.addedDay || 1);
      const currentVal = (y * 400) + (m * 32) + day;
      const hidden = habit.hiddenMonths || [];
      return addedVal <= currentVal && !hidden.includes(viewKey);
    });

    if (visibleForDay.length === 0) {
      if (offset === 0) continue;
      else break;
    }

    let allDone = true;
    visibleForDay.forEach((habit, i) => {
      const origIdx = data.habits.indexOf(habit);
      const key = `${origIdx}-${y}-${m}-${day}`;
      if (!data.checks[key]) allDone = false;
    });

    if (allDone) {
      streak++;
    } else {
      if (offset === 0) {
        // Today is not completed yet. We don't break the streak from yesterday!
      } else {
        break; // A past day wasn't completed, streak is broken.
      }
    }
  }

  return streak;
}

// ===== Confetti =====
let confettiParticles = [];
let confettiAnimating = false;

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colorfulPalette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  confettiParticles = [];
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      color: colorfulPalette[Math.floor(Math.random() * colorfulPalette.length)],
      life: 1
    });
  }

  if (!confettiAnimating) {
    confettiAnimating = true;
    animateConfetti(canvas, ctx);
  }
}

function animateConfetti(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = false;

  confettiParticles.forEach(p => {
    if (p.life <= 0) return;
    alive = true;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.rotSpeed;
    p.vy += 0.05;
    p.life -= 0.005;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (alive) {
    requestAnimationFrame(() => animateConfetti(canvas, ctx));
  } else {
    confettiAnimating = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ===== CSV Export =====
function exportCSV() {
  const visible = getVisibleHabits();
  const totalDays = getDaysInMonth(data.currentYear, data.currentMonth);
  const monthName = MONTHS[data.currentMonth] + ' ' + data.currentYear;

  let csv = 'Habit';
  for (let d = 1; d <= totalDays; d++) csv += ',' + d;
  csv += ',Completed,Total\n';

  visible.forEach(h => {
    let row = '"' + h.name + '"';
    let done = 0;
    for (let d = 1; d <= totalDays; d++) {
      const checked = isChecked(h.originalIndex, d);
      row += ',' + (checked ? '1' : '0');
      if (checked) done++;
    }
    row += ',' + done + ',' + totalDays;
    csv += row + '\n';
  });

  // Progress row
  csv += 'Progress %';
  for (let d = 1; d <= totalDays; d++) {
    let done = 0;
    visible.forEach(h => { if (isChecked(h.originalIndex, d)) done++; });
    const pct = visible.length > 0 ? Math.round((done / visible.length) * 100) : 0;
    csv += ',' + pct + '%';
  }
  csv += '\n';

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habits_${monthName.replace(' ', '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== Render =====
function render() {
  renderHeader();
  renderStreak();
  renderInsights();
  renderQuote();
  renderTable();
  renderAnalysis();
  renderChart();
  renderHeatmap();
}

function renderHeader() {
  document.getElementById('month-title').textContent = MONTHS[data.currentMonth] + ' ' + data.currentYear;
}

function renderStreak() {
  const streak = calculateStreak();
  const banner = document.getElementById('streak-banner');
  if (streak > 0) {
    banner.style.display = 'flex';
    document.getElementById('streak-text').textContent = streak + ' day streak!';
  } else {
    banner.style.display = 'none';
  }
}

function renderQuote() {
  document.getElementById('daily-quote').textContent = '"' + getDailyQuote() + '"';
}

function renderTable() {
  const table = document.getElementById('tracker-table');
  const days = getMonthDays(data.currentYear, data.currentMonth);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === data.currentYear && today.getMonth() === data.currentMonth;
  const todayDay = today.getDate();
  const visible = getVisibleHabits();

  if (visible.length === 0) {
    table.innerHTML = '<tr><td colspan="32" class="empty-state"><p>No habits for this month</p><small>Add your first habit above to start tracking</small></td></tr>';
    return;
  }

  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < days.length; i++) {
    currentWeek.push(days[i]);
    if (days[i].date.getDay() === 6 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  let html = '<thead>';
  html += '<tr><th rowspan="3" style="min-width:130px; text-align:left; padding-left:12px;">Habits</th>';
  weeks.forEach((week, wi) => { html += `<th colspan="${week.length}">Week ${wi + 1}</th>`; });
  html += '</tr>';

  html += '<tr>';
  days.forEach(d => {
    const cls = (isCurrentMonth && d.day === todayDay) ? ' class="today-col"' : '';
    html += `<th${cls}>${d.dayName}</th>`;
  });
  html += '</tr>';

  html += '<tr>';
  days.forEach(d => {
    const cls = (isCurrentMonth && d.day === todayDay) ? ' class="today-col"' : '';
    html += `<th${cls}>${d.day}</th>`;
  });
  html += '</tr></thead>';

  html += '<tbody>';
  visible.forEach(habit => {
    html += '<tr>';
    html += `<td>${habit.name} <button class="habit-delete" onclick="deleteHabit(${habit.originalIndex})" title="Remove from this month">&times;</button></td>`;
    days.forEach(d => {
      const cellDate = new Date(data.currentYear, data.currentMonth, d.day);
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      const isDisabled = cellDate.getTime() !== today.getTime();
      let cls = (isCurrentMonth && d.day === todayDay) ? ' today-col' : '';

      const isActive = isHabitActiveOnDay(habit, data.currentYear, data.currentMonth, d.day);
      if (!isActive) {
        html += `<td class="${cls}"></td>`;
        return;
      }

      const checked = isChecked(habit.originalIndex, d.day);
      if (isDisabled) cls += ' disabled-col';
      
      const onClickAttr = isDisabled ? '' : ` onclick="toggleCheck(${habit.originalIndex}, ${d.day})"`;
      html += `<td class="${cls}"${onClickAttr}>`;
      html += `<div class="cell-check${checked ? ' checked' : ''}${isDisabled ? ' disabled' : ''}"></div>`;
      html += '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody>';

  // Footer
  html += '<tfoot>';

  // Progress row with color coding
  html += '<tr class="row-progress"><td>Progress</td>';
  days.forEach(d => {
    let done = 0;
    let activeCount = 0;
    visible.forEach(h => { 
      if (isHabitActiveOnDay(h, data.currentYear, data.currentMonth, d.day)) {
        activeCount++;
        if (isChecked(h.originalIndex, d.day)) done++;
      }
    });
    const pct = activeCount > 0 ? Math.round((done / activeCount) * 100) : 0;
    let colorCls = 'pct-zero';
    if (pct === 100) colorCls = 'pct-green';
    else if (pct >= 50) colorCls = 'pct-yellow';
    else if (pct > 0) colorCls = 'pct-red';
    const todayCls = (isCurrentMonth && d.day === todayDay) ? ' today-col' : '';
    html += `<td class="${colorCls}${todayCls}">${pct}%</td>`;
  });
  html += '</tr>';

  // Done row
  html += '<tr class="row-done"><td>Done</td>';
  days.forEach(d => {
    let done = 0;
    visible.forEach(h => { 
      if (isHabitActiveOnDay(h, data.currentYear, data.currentMonth, d.day)) {
        if (isChecked(h.originalIndex, d.day)) done++; 
      }
    });
    const cls = (isCurrentMonth && d.day === todayDay) ? ' class="today-col"' : '';
    html += `<td${cls}>${done}</td>`;
  });
  html += '</tr>';

  // Not Done row
  html += '<tr class="row-notdone"><td>Not Done</td>';
  days.forEach(d => {
    let done = 0;
    let activeCount = 0;
    visible.forEach(h => { 
      if (isHabitActiveOnDay(h, data.currentYear, data.currentMonth, d.day)) {
        activeCount++;
        if (isChecked(h.originalIndex, d.day)) done++; 
      }
    });
    const notDone = activeCount - done;
    const cls = (isCurrentMonth && d.day === todayDay) ? ' class="today-col"' : '';
    html += `<td${cls}>${notDone}</td>`;
  });
  html += '</tr>';

  html += '</tfoot>';
  table.innerHTML = html;
}

function renderAnalysis() {
  const body = document.getElementById('analysis-body');
  const totalDays = getDaysInMonth(data.currentYear, data.currentMonth);
  const visible = getVisibleHabits();

  if (visible.length === 0) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#9ca3af; padding:20px;">No habits to analyze</td></tr>';
    return;
  }

  let html = '';
  visible.forEach(habit => {
    let actual = 0;
    for (let d = 1; d <= totalDays; d++) {
      if (isChecked(habit.originalIndex, d)) actual++;
    }
    const pct = Math.round((actual / totalDays) * 100);
    html += `<tr>
      <td>${habit.name}</td>
      <td>${totalDays}</td>
      <td>${actual}</td>
      <td class="progress-bar-cell">
        <div class="analysis-bar"><div class="analysis-bar-fill" style="width:${pct}%"></div></div>
      </td>
    </tr>`;
  });
  body.innerHTML = html;
}

function renderChart() {
  const canvas = document.getElementById('progress-chart');
  const ctx = canvas.getContext('2d');
  const totalDays = getDaysInMonth(data.currentYear, data.currentMonth);
  const visible = getVisibleHabits();

  const rect = canvas.parentElement.getBoundingClientRect();
  const w = rect.width - 48;
  const h = 180;
  canvas.width = w * 2;
  canvas.height = h * 2;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(2, 2);
  ctx.clearRect(0, 0, w, h);

  if (visible.length === 0) {
    ctx.fillStyle = '#d1d5db';
    ctx.font = '500 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Add habits to see the chart', w / 2, h / 2);
    return;
  }

  const pcts = [];
  for (let d = 1; d <= totalDays; d++) {
    let done = 0;
    visible.forEach(h => { if (isChecked(h.originalIndex, d)) done++; });
    pcts.push(visible.length > 0 ? (done / visible.length) * 100 : 0);
  }

  const padL = 35, padR = 10, padT = 15, padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const stepX = chartW / (totalDays - 1 || 1);

  // Grid
  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 11px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let v = 0; v <= 100; v += 25) {
    const y = padT + chartH - (v / 100) * chartH;
    ctx.fillText(v + '%', padL - 10, y);
    ctx.strokeStyle = '#f8f9fa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#9ca3af';
  for (let d = 0; d < totalDays; d++) {
    if (d % 3 === 0 || d === totalDays - 1) {
      ctx.fillText(d + 1, padL + d * stepX, padT + chartH + 12);
    }
  }

  // Area fill
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  for (let d = 0; d < totalDays; d++) {
    const x = padL + d * stepX;
    const y = padT + chartH - (pcts[d] / 100) * chartH;
    if (d === 0) ctx.lineTo(x, y);
    else {
      const prevX = padL + (d - 1) * stepX;
      const prevY = padT + chartH - (pcts[d - 1] / 100) * chartH;
      const cpx = (prevX + x) / 2;
      ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
    }
  }
  ctx.lineTo(padL + (totalDays - 1) * stepX, padT + chartH);
  ctx.closePath();
  ctx.fillStyle = '#f3f4f6';
  ctx.fill();

  // Line
  ctx.beginPath();
  for (let d = 0; d < totalDays; d++) {
    const x = padL + d * stepX;
    const y = padT + chartH - (pcts[d] / 100) * chartH;
    if (d === 0) ctx.moveTo(x, y);
    else {
      const prevX = padL + (d - 1) * stepX;
      const prevY = padT + chartH - (pcts[d - 1] / 100) * chartH;
      const cpx = (prevX + x) / 2;
      ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
    }
  }
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Dots
  for (let d = 0; d < totalDays; d++) {
    if (pcts[d] > 0) {
      const x = padL + d * stepX;
      const y = padT + chartH - (pcts[d] / 100) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1f2937';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
}

// ===== Actions =====
async function addHabit(name) {
  if (!name.trim()) return;
  pushUndo();
  const now = new Date();
  const finalName = autoEmoji(name.trim());
  data.habits.push({
    name: finalName,
    addedYear: now.getFullYear(),
    addedMonth: now.getMonth(),
    addedDay: now.getDate(),
    hiddenMonths: []
  });
  await saveData();
  render();
}

async function deleteHabit(originalIndex) {
  pushUndo();
  const viewKey = `${data.currentYear}-${data.currentMonth}`;
  if (!data.habits[originalIndex].hiddenMonths) {
    data.habits[originalIndex].hiddenMonths = [];
  }
  data.habits[originalIndex].hiddenMonths.push(viewKey);
  await saveData();
  render();
}

async function changeMonth(offset) {
  data.currentMonth += offset;
  if (data.currentMonth > 11) { data.currentMonth = 0; data.currentYear++; }
  if (data.currentMonth < 0) { data.currentMonth = 11; data.currentYear--; }
  await saveData();
  render();
}

async function goToToday() {
  const now = new Date();
  data.currentYear = now.getFullYear();
  data.currentMonth = now.getMonth();
  await saveData();
  render();
}

// ===== Heatmap =====
function renderHeatmap() {
  const grid = document.getElementById('heatmap-grid');
  const monthsRow = document.getElementById('heatmap-months');
  if (!grid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cellSize = 13;
  const gapSize = 3;

  let gridHtml = '';
  let monthsHtml = '';

  // Render each month as its own block
  for (let m = 0; m <= today.getMonth(); m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const firstDow = new Date(year, m, 1).getDay(); // 0=Sun

    // Build week columns for this month
    const monthWeeks = [];
    let week = new Array(7).fill(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, m, d);
      if (dateObj > today) break; // don't go past today

      const dow = dateObj.getDay();
      const viewKey = `${year}-${m}`;

      const activeHabits = data.habits.filter(h => {
        const addedVal = (h.addedYear * 400) + (h.addedMonth * 32) + (h.addedDay || 1);
        const currentVal = (year * 400) + (m * 32) + d;
        const hidden = h.hiddenMonths || [];
        return addedVal <= currentVal && !hidden.includes(viewKey);
      });

      let pct = 0;
      if (activeHabits.length > 0) {
        let done = 0;
        activeHabits.forEach(h => {
          const origIdx = data.habits.indexOf(h);
          if (data.checks[`${origIdx}-${year}-${m}-${d}`]) done++;
        });
        pct = (done / activeHabits.length) * 100;
      }

      week[dow] = { pct, date: dateObj };

      if (dow === 6 || d === daysInMonth || (m === today.getMonth() && d === today.getDate())) {
        monthWeeks.push(week);
        week = new Array(7).fill(null);
      }
    }

    // Add gap before month (except first)
    if (m > 0) {
      gridHtml += '<div class="heatmap-gap"></div>';
    }

    // Render week columns for this month
    const weekCount = monthWeeks.length;
    monthWeeks.forEach(w => {
      gridHtml += '<div class="heatmap-week">';
      w.forEach(cell => {
        if (!cell) {
          gridHtml += '<div class="heat-cell heat-empty"></div>';
        } else {
          let lvl = 0;
          if (cell.pct > 0) lvl = 1;
          if (cell.pct >= 50) lvl = 2;
          if (cell.pct >= 75) lvl = 3;
          if (cell.pct >= 100) lvl = 4;
          const title = `${cell.date.toLocaleDateString()}: ${Math.round(cell.pct)}%`;
          gridHtml += `<div class="heat-cell heat-lvl-${lvl}" title="${title}"></div>`;
        }
      });
      gridHtml += '</div>';
    });

    // Month label width = number of week columns * (cell + gap)
    const labelWidth = weekCount * (cellSize + gapSize) - gapSize + (m > 0 ? 8 : 0);
    monthsHtml += `<span style="width:${labelWidth}px">${monthNames[m]}</span>`;
  }

  grid.innerHTML = gridHtml;
  monthsRow.innerHTML = monthsHtml;
}

// ===== Insights =====
function renderInsights() {
  // Best Day
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < 90; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const dow = d.getDay();
    const viewKey = `${y}-${m}`;

    const activeHabits = data.habits.filter(h => {
      const addedVal = (h.addedYear * 400) + (h.addedMonth * 32) + (h.addedDay || 1);
      const currentVal = (y * 400) + (m * 32) + day;
      const hidden = h.hiddenMonths || [];
      return addedVal <= currentVal && !hidden.includes(viewKey);
    });

    if (activeHabits.length > 0) {
      let done = 0;
      activeHabits.forEach(h => {
        const origIdx = data.habits.indexOf(h);
        if (data.checks[`${origIdx}-${y}-${m}-${day}`]) done++;
      });
      dayCounts[dow] += done;
      dayTotals[dow] += activeHabits.length;
    }
  }

  let bestDayIdx = 0;
  let bestPct = 0;
  for (let i = 0; i < 7; i++) {
    const pct = dayTotals[i] > 0 ? (dayCounts[i] / dayTotals[i]) * 100 : 0;
    if (pct > bestPct) { bestPct = pct; bestDayIdx = i; }
  }
  document.getElementById('insight-best-day').textContent = dayTotals[bestDayIdx] > 0 ? dayNames[bestDayIdx] : '—';

  // Longest Streak
  let longest = 0;
  let current = 0;
  for (let offset = 365; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const viewKey = `${y}-${m}`;

    const activeHabits = data.habits.filter(h => {
      const addedVal = (h.addedYear * 400) + (h.addedMonth * 32) + (h.addedDay || 1);
      const currentVal = (y * 400) + (m * 32) + day;
      const hidden = h.hiddenMonths || [];
      return addedVal <= currentVal && !hidden.includes(viewKey);
    });

    if (activeHabits.length === 0) continue;

    let allDone = true;
    activeHabits.forEach(h => {
      const origIdx = data.habits.indexOf(h);
      if (!data.checks[`${origIdx}-${y}-${m}-${day}`]) allDone = false;
    });

    if (allDone) { current++; longest = Math.max(longest, current); }
    else { current = 0; }
  }
  document.getElementById('insight-longest-streak').textContent = longest;

  // Consistency (last 30 days)
  let totalChecks = 0;
  let totalPossible = 0;
  for (let offset = 0; offset < 30; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    const viewKey = `${y}-${m}`;

    const activeHabits = data.habits.filter(h => {
      const addedVal = (h.addedYear * 400) + (h.addedMonth * 32) + (h.addedDay || 1);
      const currentVal = (y * 400) + (m * 32) + day;
      const hidden = h.hiddenMonths || [];
      return addedVal <= currentVal && !hidden.includes(viewKey);
    });

    totalPossible += activeHabits.length;
    activeHabits.forEach(h => {
      const origIdx = data.habits.indexOf(h);
      if (data.checks[`${origIdx}-${y}-${m}-${day}`]) totalChecks++;
    });
  }
  const consistency = totalPossible > 0 ? Math.round((totalChecks / totalPossible) * 100) : 0;
  document.getElementById('insight-consistency').textContent = consistency + '%';
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();

  if (data.currentYear === undefined) {
    data.currentYear = new Date().getFullYear();
    data.currentMonth = new Date().getMonth();
  }

  render();

  // Add habit
  document.getElementById('add-habit-btn').addEventListener('click', () => {
    const input = document.getElementById('habit-input');
    addHabit(input.value);
    input.value = '';
    input.focus();
  });

  document.getElementById('habit-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHabit(e.target.value);
      e.target.value = '';
    }
  });

  // Month navigation
  document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
  document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

  // Today button
  document.getElementById('today-btn').addEventListener('click', goToToday);

  // Export button
  document.getElementById('export-btn').addEventListener('click', exportCSV);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') changeMonth(-1);
    if (e.key === 'ArrowRight') changeMonth(1);
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
  });

  // Resize chart
  window.addEventListener('resize', () => renderChart());
});
