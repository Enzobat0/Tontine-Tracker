// frontend/app.js
// CONFIG: change if your backend runs on a different host/port
const API_BASE = 'http://localhost:4000';

// Helpers
function authHeader() {
  const token = localStorage.getItem('tt_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// UI elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const createTontineCard = document.getElementById('createTontineCard');
const addMemberCard = document.getElementById('addMemberCard');
const tontineDetailsCard = document.getElementById('tontineDetailsCard');
const tontineList = document.getElementById('tontineList');
const selectTontineForMember = document.getElementById('selectTontineForMember');
const selectMemberForContribution = document.getElementById('selectMemberForContribution');
const selectMemberForPayout = document.getElementById('selectMemberForPayout');
const tontineDetails = document.getElementById('tontineDetails');
const ledgerPre = document.getElementById('ledgerPre');

let currentUser = null;
let tontinesCache = [];
let currentTontine = null;

// Initial UI state
function setLoggedOutUI() {
  hide(userBadge);
  show(document.getElementById('authCard'));
  hide(createTontineCard);
  hide(addMemberCard);
  hide(tontineDetailsCard);
}
function setLoggedInUI(user) {
  currentUser = user;
  userNameEl.textContent = user.name;
  show(userBadge);
  hide(document.getElementById('authCard'));
  show(createTontineCard);
  show(addMemberCard);
  loadTontines();
}

// Auth handlers
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  try {
    const res = await fetch(API_BASE + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) return alert('Register failed: ' + (data.error || JSON.stringify(data)));
    alert('Registered successfully — you can now login.');
  } catch (err) {
    alert('Register error: ' + err.message);
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch(API_BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return alert('Login failed: ' + (data.error || JSON.stringify(data)));
    localStorage.setItem('tt_token', data.token);
    const meRes = await fetch(API_BASE + '/api/auth/me', { headers: { ...authHeader() } });
    const me = await meRes.json();
    setLoggedInUI(me);
  } catch (err) {
    alert('Login error: ' + err.message);
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('tt_token');
  currentUser = null;
  setLoggedOutUI();
});

// Create tontine
document.getElementById('createTontineForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('tName').value;
  const description = document.getElementById('tDescription').value;
  const contributionAmount = Number(document.getElementById('tAmount').value);
  const rotationLength = document.getElementById('tRotation').value || null;
  try {
    const res = await fetch(API_BASE + '/api/tontines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name, description, contributionAmount, rotationLength })
    });
    const data = await res.json();
    if (!res.ok) return alert('Create failed: ' + (data.error || JSON.stringify(data)));
    alert('Tontine created');
    loadTontines();
  } catch (err) {
    alert('Create error: ' + err.message);
  }
});

// Load tontines
async function loadTontines() {
  try {
    const res = await fetch(API_BASE + '/api/tontines');
    tontinesCache = await res.json();
    renderTontineList();
    populateTontineSelects();
  } catch (err) { console.error(err); }
}

function renderTontineList() {
  tontineList.innerHTML = '';
  tontinesCache.forEach(t => {
    const el = document.createElement('button');
    el.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
    el.innerHTML = `
      <div class="ms-2 me-auto">
        <div class="fw-bold">${t.name}</div>
        <div class="small text-muted">${t.description || ''}</div>
      </div>
      <span class="badge bg-primary rounded-pill">${t.memberCount}</span>
    `;
    el.addEventListener('click', () => showTontineDetails(t.id));
    tontineList.appendChild(el);
  });
}

async function showTontineDetails(id) {
  try {
    const res = await fetch(API_BASE + '/api/tontines/' + id);
    if (!res.ok) return alert('Error loading tontine');
    const t = await res.json();
    currentTontine = t;
    show(tontineDetailsCard);
    tontineDetails.innerHTML = `
      <p><strong>${t.name}</strong> — ${t.description || ''}</p>
      <p>Contribution amount: <strong>${t.contributionAmount}</strong></p>
      <p>Members: ${t.members.length}</p>
      <p>Current Round: ${t.currentRound}</p>
    `;

    // populate members selects
    selectMemberForContribution.innerHTML = '';
    selectMemberForPayout.innerHTML = '';
    t.members.forEach(m => {
      const opt = document.createElement('option'); opt.value = m.id; opt.textContent = m.name; selectMemberForContribution.appendChild(opt);
      const opt2 = opt.cloneNode(true); selectMemberForPayout.appendChild(opt2);
    });

    // render ledger
    ledgerPre.textContent = JSON.stringify({
      members: t.members,
      contributions: t.contributions,
      payouts: t.payouts,
      nextPayout: t.members.length > 0 ? t.members[t.payouts.length % t.members.length] : null
    }, null, 2);
  } catch (err) { console.error(err); }
}

function populateTontineSelects() {
  selectTontineForMember.innerHTML = '';
  tontinesCache.forEach(t => {
    const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.name; selectTontineForMember.appendChild(opt);
  });
}

// Add member
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tontineId = selectTontineForMember.value;
  const name = document.getElementById('memberName').value;
  const contact = document.getElementById('memberContact').value;
  try {
    const res = await fetch(API_BASE + /api/tontines/${tontineId}/members, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name, contact })
    });
    const data = await res.json();
    if (!res.ok) return alert('Add member failed: ' + (data.error || JSON.stringify(data)));
    alert('Member added');
    if (currentTontine && currentTontine.id === tontineId) showTontineDetails(tontineId); else loadTontines();
  } catch (err) { alert('Error: ' + err.message); }
});

// Record contribution
document.getElementById('contributionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentTontine) return alert('Select a tontine first');
  const memberId = selectMemberForContribution.value;
  const amountVal = document.getElementById('contribAmount').value;
  const body = { memberId };
  if (amountVal) body.amount = Number(amountVal);
  try {
    const res = await fetch(API_BASE + /api/tontines/${currentTontine.id}/contributions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return alert('Record failed: ' + (data.error || JSON.stringify(data)));
    alert('Contribution recorded');
    showTontineDetails(currentTontine.id);
  } catch (err) { alert('Error: ' + err.message); }
});

// Record payout
document.getElementById('payoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentTontine) return alert('Select a tontine first');
  const memberId = selectMemberForPayout.value;
  try {
    const res = await fetch(API_BASE + /api/tontines/${currentTontine.id}/payouts, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ memberId })
    });
    const data = await res.json();
    if (!res.ok) return alert('Payout failed: ' + (data.error || JSON.stringify(data)));
    alert('Payout recorded');
    showTontineDetails(currentTontine.id);
    loadTontines();
  } catch (err) { alert('Error: ' + err.message); }
});

// On load: detect token and fetch /me
(async function init() {
  const token = localStorage.getItem('tt_token');
  if (token) {
    try {
      const meRes = await fetch(API_BASE + '/api/auth/me', { headers: { ...authHeader() } });
      if (meRes.ok) {
        const me = await meRes.json();
        setLoggedInUI(me);
      } else {
        setLoggedOutUI();
      }
    } catch (err) { setLoggedOutUI(); }
  } else {
    setLoggedOutUI();
  }
})();