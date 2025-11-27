const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:4000/api' 
  : '/api';

console.log('Backend API Target:', API_BASE);

function authHeader() {
  const token = localStorage.getItem('tt_token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function show(el) { el.classList.remove('d-none'); }
function hide(el) { el.classList.add('d-none'); }

function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('globalAlert');
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    alertEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    show(alertEl);
    setTimeout(() => { hide(alertEl); }, 5000);
}

const authCard = document.getElementById('authCard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userBadge = document.getElementById('userBadge');
const userNameEl = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const authFeedback = document.getElementById('authFeedback');

const createActionContainer = document.getElementById('createActionContainer');
const btnToggleCreate = document.getElementById('btnToggleCreate');
const btnCloseCreate = document.getElementById('btnCloseCreate');
const createTontineCard = document.getElementById('createTontineCard');
const createTontineForm = document.getElementById('createTontineForm');

const addMemberCard = document.getElementById('addMemberCard');
const tontineList = document.getElementById('tontineList');
const emptyState = document.getElementById('emptyState');

const tontineDetailsCard = document.getElementById('tontineDetailsCard');
const detailTitle = document.getElementById('detailTitle');
const tontineDetails = document.getElementById('tontineDetails');
const selectTontineForMember = document.getElementById('selectTontineForMember');
const selectMemberForContribution = document.getElementById('selectMemberForContribution');
const selectMemberForPayout = document.getElementById('selectMemberForPayout');
const ledgerPre = document.getElementById('ledgerPre');

let currentUser = null;
let tontinesCache = [];
let currentTontine = null;

function setLoggedOutUI() {
  hide(userBadge);
  show(authCard);
  
  hide(createActionContainer);
  hide(createTontineCard);
  hide(addMemberCard);
  hide(tontineDetailsCard);
  tontineList.innerHTML = ''; 
  hide(emptyState);
}

function setLoggedInUI(user) {
  currentUser = user;
  userNameEl.textContent = user.name;
  
  show(userBadge);
  hide(authCard);
  
  show(createActionContainer);
  show(addMemberCard);
  
  loadTontines();
}

btnToggleCreate.addEventListener('click', () => {
    show(createTontineCard);
    hide(createActionContainer);
});

btnCloseCreate.addEventListener('click', () => {
    hide(createTontineCard);
    show(createActionContainer);
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authFeedback.textContent = '';
  
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    
    if (!res.ok) {
        authFeedback.textContent = data.error || 'Registration failed';
        return;
    }
    
    showAlert('✅ Registration successful! Please log in.', 'success');
    registerForm.reset();
  } catch (err) {
    authFeedback.textContent = 'Network error: ' + err.message;
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authFeedback.textContent = '';

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (!res.ok) {
        authFeedback.textContent = data.error || 'Invalid credentials';
        return;
    }
    
    localStorage.setItem('tt_token', data.token);
    // Fetch full user details
    const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { ...authHeader() } });
    const me = await meRes.json();
    
    setLoggedInUI(me);
    loginForm.reset();
  } catch (err) {
    authFeedback.textContent = 'Login error: ' + err.message;
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('tt_token');
  currentUser = null;
  setLoggedOutUI();
});

document.getElementById('createTontineForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('tName').value;
  const description = document.getElementById('tDescription').value;
  const contributionAmount = Number(document.getElementById('tAmount').value);
  const rotationLength = document.getElementById('tRotation').value || null;
  
  try {
    const res = await fetch(`${API_BASE}/tontines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name, description, contributionAmount, rotationLength })
    });
    const data = await res.json();
    
    if (!res.ok) {
        showAlert('❌ Error creating tontine: ' + data.error, 'danger');
        return;
    }
    
    showAlert('🎉 Tontine Group created successfully!', 'success');
    createTontineForm.reset();
    
    hide(createTontineCard);
    show(createActionContainer);
    loadTontines();
    
  } catch (err) {
    showAlert('Error: ' + err.message, 'danger');
  }
});

async function loadTontines() {
  try {
    const res = await fetch(`${API_BASE}/tontines`, { headers: authHeader() });
    if(!res.ok) throw new Error('Failed to fetch');
    
    tontinesCache = await res.json();
    renderTontineList();
    populateTontineSelects();
  } catch (err) { console.error(err); }
}

function renderTontineList() {
  tontineList.innerHTML = '';
  
  if (tontinesCache.length === 0) {
      show(emptyState);
      return;
  }
  hide(emptyState);

  tontinesCache.forEach(t => {
    const el = document.createElement('button');
    el.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
    el.innerHTML = `
      <div class="ms-2 me-auto">
        <div class="fw-bold text-primary">${t.name}</div>
        <span class="small text-muted">${t.description || 'No description'}</span>
      </div>
      <span class="badge bg-primary rounded-pill">${t.memberCount} Members</span>
    `;
    el.addEventListener('click', () => showTontineDetails(t.id));
    tontineList.appendChild(el);
  });
}

async function showTontineDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/tontines/${id}`, { headers: authHeader() });
    if (!res.ok) return showAlert('Error loading tontine details', 'danger');
    
    const t = await res.json();
    currentTontine = t;
    show(tontineDetailsCard);
    
    detailTitle.textContent = t.name;
    tontineDetails.innerHTML = `
      <div class="alert alert-info">
        <strong>Contribution:</strong> ${t.contributionAmount} | 
        <strong>Round:</strong> ${t.currentRound}
      </div>
      <p class="text-muted small">${t.description || ''}</p>
    `;

    selectMemberForContribution.innerHTML = '<option value="" disabled selected>Select Member</option>';
    selectMemberForPayout.innerHTML = '<option value="" disabled selected>Select Member</option>';
    
    t.members.forEach(m => {
      const opt = document.createElement('option'); 
      opt.value = m._id || m.id;
      opt.textContent = m.name; 
      selectMemberForContribution.appendChild(opt);
      
      const opt2 = opt.cloneNode(true); 
      selectMemberForPayout.appendChild(opt2);
    });

    // Render Ledger
    ledgerPre.textContent = JSON.stringify({
      members: t.members.map(m => m.name),
      contributions: t.contributions,
      payouts: t.payouts
    }, null, 2);
    
  } catch (err) { console.error(err); }
}

function populateTontineSelects() {
  selectTontineForMember.innerHTML = '<option value="" disabled selected>Select Group</option>';
  tontinesCache.forEach(t => {
    const opt = document.createElement('option'); 
    opt.value = t.id; 
    opt.textContent = t.name; 
    selectTontineForMember.appendChild(opt);
  });
}

document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tontineId = selectTontineForMember.value;
  if(!tontineId) return showAlert('Please select a Tontine group', 'warning');

  const name = document.getElementById('memberName').value;
  const contact = document.getElementById('memberContact').value;
  
  try {
    const res = await fetch(`${API_BASE}/tontines/${tontineId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ name, contact })
    });
    
    if (!res.ok) {
        const data = await res.json();
        return showAlert('Add member failed: ' + data.error, 'danger');
    }
    
    showAlert('✅ Member added successfully', 'success');
    document.getElementById('memberName').value = '';
    
    // Refresh views
    if (currentTontine && currentTontine._id === tontineId) showTontineDetails(tontineId); 
    loadTontines(); // To update member counts
    
  } catch (err) { showAlert('Error: ' + err.message, 'danger'); }
});

// Record Contribution
document.getElementById('contributionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentTontine) return;
  
  const memberId = selectMemberForContribution.value;
  const amountVal = document.getElementById('contribAmount').value;
  
  if(!memberId) return showAlert('Select a member first', 'warning');

  const body = { memberId };
  if (amountVal) body.amount = Number(amountVal);
  
  try {
    const res = await fetch(`${API_BASE}/tontines/${currentTontine.id || currentTontine._id}/contributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
        const data = await res.json();
        return showAlert('Record failed: ' + data.error, 'danger');
    }
    
    showAlert('💰 Contribution Recorded!', 'success');
    showTontineDetails(currentTontine.id || currentTontine._id);
  } catch (err) { showAlert('Error: ' + err.message, 'danger'); }
});

// Record Payout
document.getElementById('payoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentTontine) return;
  const memberId = selectMemberForPayout.value;
  
  if(!memberId) return showAlert('Select a member first', 'warning');

  try {
    const res = await fetch(`${API_BASE}/tontines/${currentTontine.id || currentTontine._id}/payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ memberId })
    });
    
    if (!res.ok) {
        const data = await res.json();
        return showAlert('Payout failed: ' + data.error, 'danger');
    }
    
    showAlert('💸 Payout Processed!', 'info');
    showTontineDetails(currentTontine.id || currentTontine._id);
  } catch (err) { showAlert('Error: ' + err.message, 'danger'); }
});

(async function init() {
  const token = localStorage.getItem('tt_token');
  if (token) {
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, { headers: { ...authHeader() } });
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