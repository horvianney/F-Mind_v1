// Navigation entre les modules
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Retirer la classe active de tous les boutons
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    // Ajouter la classe active au bouton cliqué
    btn.classList.add('active');

    // Cacher tous les modules
    document.querySelectorAll('.module').forEach(mod => mod.classList.remove('active'));
    // Afficher le module correspondant
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Gestion des tâches
const taskInput = document.getElementById('taskInput');
const taskDesc = document.getElementById('taskDesc');
const taskDueDate = document.getElementById('taskDueDate');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskFilter = document.querySelector('.task-filter');

// Charger les tâches depuis localStorage au démarrage
let tasks = JSON.parse(localStorage.getItem('fMindTasks')) || [];

function renderTasks() {
  const filter = document.querySelector('input[name="filter"]:checked').value;
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${index}">
      <div class="task-content">
        <span class="task-text">${task.text}</span>
        ${task.description ? `<p class="task-desc">${task.description}</p>` : ''}
        ${task.dueDate ? `<span class="task-due ${isOverdue(task.dueDate) ? 'overdue' : ''}">📅 ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
      </div>
      <button class="task-delete" data-index="${index}">×</button>
    `;
    taskList.appendChild(li);
  });
}

function isOverdue(dueDate) {
  const today = new Date().setHours(0, 0, 0, 0);
  const due = new Date(dueDate).setHours(0, 0, 0, 0);
  return due < today && !isNaN(due);
}

function saveTasks() {
  localStorage.setItem('fMindTasks', JSON.stringify(tasks));
}

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const description = taskDesc.value.trim();
  const dueDate = taskDueDate.value;

  if (text) {
    tasks.push({
      text,
      description,
      dueDate,
      completed: false
    });
    taskInput.value = '';
    taskDesc.value = '';
    taskDueDate.value = '';
    renderTasks();
    saveTasks();
  }
});

taskList.addEventListener('change', (e) => {
  if (e.target.classList.contains('task-checkbox')) {
    const index = parseInt(e.target.getAttribute('data-index'));
    tasks[index].completed = e.target.checked;
    renderTasks();
    saveTasks();
  }
});

taskList.addEventListener('click', (e) => {
  if (e.target.classList.contains('task-delete')) {
    const index = parseInt(e.target.getAttribute('data-index'));
    const li = e.target.closest('.task-item');
    li.classList.add('removing');
    setTimeout(() => {
      tasks.splice(index, 1);
      renderTasks();
      saveTasks();
    }, 300);
  }
});

// Écouteur pour le filtre
taskFilter.addEventListener('change', renderTasks);

// Initialiser l'affichage
renderTasks();

// Gestion des finances
const amountInput = document.getElementById('amountInput');
const typeInput = document.getElementById('typeInput');
const categoryInput = document.getElementById('categoryInput');
const addFinanceBtn = document.getElementById('addFinanceBtn');
const financeList = document.getElementById('financeList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');

// Charger les finances depuis localStorage au démarrage
let finances = JSON.parse(localStorage.getItem('fMindFinances')) || [];

function renderFinances() {
  financeList.innerHTML = '';
  let totalIncome = 0;
  let totalExpense = 0;

  finances.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(item.date).toLocaleDateString()}</td>
      <td class="${item.type}">${item.type === 'income' ? 'Revenu' : 'Dépense'}</td>
      <td>${item.category}</td>
      <td>${item.amount} €</td>
      <td><button class="delete-btn" data-index="${index}">🗑️</button></td>
    `;
    financeList.appendChild(tr);

    if (item.type === 'income') {
      totalIncome += item.amount;
    } else {
      totalExpense += item.amount;
    }
  });

  totalIncomeEl.textContent = totalIncome.toFixed(2) + ' FCFA';
  totalExpenseEl.textContent = totalExpense.toFixed(2) + ' FCFA';
  balanceEl.textContent = (totalIncome - totalExpense).toFixed(2) + ' FCFA';
}

function saveFinances() {
  localStorage.setItem('fMindFinances', JSON.stringify(finances));
}

addFinanceBtn.addEventListener('click', () => {
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;

  if (isNaN(amount) || amount <= 0) {
    alert('Veuillez entrer un montant valide.');
    return;
  }

  finances.push({
    date: new Date().toISOString(),
    type,
    category,
    amount
  });

  amountInput.value = '';
  renderFinances();
  saveFinances();
});

financeList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const index = parseInt(e.target.getAttribute('data-index'));
    finances.splice(index, 1);
    renderFinances();
    saveFinances();
  }
});

// Initialiser l'affichage des finances
renderFinances();

// Gestion du F-Timer
const timerHours = document.getElementById('timerHours');
const timerMinutes = document.getElementById('timerMinutes');
const timerSeconds = document.getElementById('timerSeconds');
const setTimerBtn = document.getElementById('setTimerBtn');
const timerDisplay = document.getElementById('timerDisplay');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const timerStatus = document.getElementById('timerStatus');

let fTimerTotal = 0;    // Temps F-Timer total en secondes (affiché)
let fTimerRemaining = 0; // Temps F-Timer restant en secondes (affiché)
let timerInterval = null;
let isRunning = false;
let isPaused = false;

// Compteur de sessions
let sessionCount = 0;
let maxSessions = 4; // Tu peux changer ça
const sessionCounter = document.createElement('div');
sessionCounter.id = 'sessionCounter';
sessionCounter.style.textAlign = 'center';
sessionCounter.style.margin = '1rem 0';
sessionCounter.style.fontSize = '0.9rem';
sessionCounter.style.color = '#aaa';
document.getElementById('timer').appendChild(sessionCounter);

function updateSessionCounter() {
  sessionCounter.textContent = `Session ${sessionCount + 1}/${maxSessions}`;
}

// Fonction pour démarrer un mode Pomodoro
function startPomodoro(hours, minutes) {
  timerHours.value = hours;
  timerMinutes.value = minutes;
  timerSeconds.value = 0;
  setTimer(); // Démarre automatiquement
  sessionCount = 0;
  updateSessionCounter();
}

// Écouteurs pour les modes Pomodoro
document.getElementById('pomodoro25Btn').addEventListener('click', () => {
  startPomodoro(0, 25);
});

document.getElementById('pomodoro50Btn').addEventListener('click', () => {
  startPomodoro(0, 50);
});

// Charger le dernier temps réglé depuis localStorage
const savedTimer = JSON.parse(localStorage.getItem('fMindTimer')) || { hours: 0, minutes: 0, seconds: 0 };
timerHours.value = savedTimer.hours;
timerMinutes.value = savedTimer.minutes;
timerSeconds.value = savedTimer.seconds;

// Si le temps sauvegardé est 0, afficher 00:00:00
if (savedTimer.hours === 0 && savedTimer.minutes === 0 && savedTimer.seconds === 0) {
  fTimerRemaining = 0;
  fTimerTotal = 0;
} else {
  fTimerTotal = savedTimer.hours * 3600 + savedTimer.minutes * 60 + savedTimer.seconds;
  fTimerRemaining = fTimerTotal;
}

function saveTimerSettings() {
  localStorage.setItem('fMindTimer', JSON.stringify({
    hours: parseInt(timerHours.value),
    minutes: parseInt(timerMinutes.value),
    seconds: parseInt(timerSeconds.value)
  }));
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(fTimerRemaining);
}

function startTimer() {
  if (isRunning) return;
  if (fTimerRemaining <= 0) {
    timerStatus.textContent = "Temps écoulé !";
    return;
  }

  isRunning = true;
  isPaused = false;
  timerStatus.textContent = "En cours...";

  // 1 seconde F-Timer = 50/60 secondes réelles = 833ms réelles
  const tickInterval = Math.round(1000 * 50 / 60); // ≈ 833ms

  timerInterval = setInterval(() => {
    fTimerRemaining -= 1;
    updateDisplay();

    if (fTimerRemaining <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      timerStatus.textContent = "✅ Temps écoulé !";
      playAlarm();
    }
  }, tickInterval);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = true;
  timerStatus.textContent = "⏸️ En pause";
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = false;
  fTimerRemaining = 0; // ✅ On remet à 0
  timerHours.value = 0;
  timerMinutes.value = 0;
  timerSeconds.value = 0;
  updateDisplay();
  timerStatus.textContent = "Prêt";
  sessionCount = 0; // Réinitialiser le compteur de sessions
  updateSessionCounter();
  saveTimerSettings(); // Sauvegarder 00:00:00
}

function setTimer() {
  const hours = parseInt(timerHours.value) || 0;
  const minutes = parseInt(timerMinutes.value) || 0;
  const seconds = parseInt(timerSeconds.value) || 0;

  fTimerTotal = hours * 3600 + minutes * 60 + seconds; // en secondes F-Timer
  fTimerRemaining = fTimerTotal;

  updateDisplay();
  saveTimerSettings();
  timerStatus.textContent = "En cours...";

  // ✅ Démarrer immédiatement après réglage
  startTimer();
}

// 🔊 Son personnalisé
function playAlarm() {
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gainNode = audio.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audio.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audio.currentTime); // Do5
  gainNode.gain.setValueAtTime(1, audio.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.5);

  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + 1.5);

  // Incrémenter la session si on est en mode Pomodoro
  if (sessionCount < maxSessions - 1) {
    sessionCount++;
    updateSessionCounter();
  } else {
    sessionCount = 0;
    updateSessionCounter();
    timerStatus.textContent = "✅ Session terminée !";
  }
}

// bouton “Reprendre”
const resumeBtn = document.getElementById('resumeBtn');

// Fonction pour démarrer une longue pause
function startLongBreak() {
  timerHours.value = 0;
  timerMinutes.value = 15;
  timerSeconds.value = 0;
  setTimer(); // Démarre automatiquement
  sessionCount = 0;
  updateSessionCounter();
  resumeBtn.style.display = 'none';
  timerStatus.textContent = "⏳ Longue pause";
}

// Écouteur pour le bouton “Reprendre”
resumeBtn.addEventListener('click', () => {
  // Démarrer un nouveau cycle (ex. : 25min travail)
  startPomodoro(0, 25);
  resumeBtn.style.display = 'none';
  timerStatus.textContent = "En cours...";
});

// Écouteur pour le son à la fin — incrémenter la session
function playAlarm() {
  const audio = new AudioContext();
  const oscillator = audio.createOscillator();
  const gainNode = audio.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audio.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audio.currentTime);
  gainNode.gain.setValueAtTime(1, audio.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.5);

  oscillator.start(audio.currentTime);
  oscillator.stop(audio.currentTime + 1.5);

  // Incrémenter la session si on est en mode Pomodoro
  if (sessionCount < maxSessions - 1) {
    sessionCount++;
    updateSessionCounter();
  } else {
    // Après 4 sessions → longue pause
    sessionCount = 0;
    updateSessionCounter();
    timerStatus.textContent = "⏳ Longue pause";
    resumeBtn.style.display = 'block';
    startLongBreak();
  }
}

// Écouteurs
setTimerBtn.addEventListener('click', setTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// Initialiser l'affichage sans démarrer
updateDisplay();
timerStatus.textContent = "Prêt";