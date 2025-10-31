// public/script.js — consolidated and defensive
document.addEventListener('DOMContentLoaded', () => {
  // ---------- global helpers ----------


  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- contact form (demo) ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thanks — message sent (demo). Implement server/email endpoint to receive real messages.');
      contactForm.reset();
    });
  }

  // FAQs content (questions + answers). Replace answers as you wish.
const faqs = [
  { q: "What is a Cooperative Society?", a: "A cooperative society is a voluntary association of people who pool resources to meet common economic needs and goals. (Provide your full answer here.)" },
  { q: "What are the Objectives of the Smile Cooperative Society Nigeria Ltd?", a: "To encourage thrift, provide loans at minimal interest, promote mutual co-operation, operate warehouses and more. (Add more details here)" },
  { q: "What does being a registered member of the society mean?", a: "Registered members enjoy access to cooperative services like savings, loans, voting in meetings and benefits as defined in the society rules." },
  { q: "What are my main responsibilities as a member of the Society?", a: "Paying contributions, attending general meetings, observing rules, and participating in cooperative activities." },
  { q: "Is there a fee payable on application for membership of the society?", a: "Yes — there is usually a one-time application fee. (Insert your exact fee and process here.)" },
  { q: "What should I do next on admission as a member of the society?", a: "Complete registration, start contributing to thrift/ordinary savings and follow onboarding steps provided by the society." },
  { q: "What is Patronage Rebate?", a: "A rebate distributed to members based on patronage (amount of business transacted with the cooperative) usually at year-end." },
  { q: "What is Dividend?", a: "Dividend is the share of profits allocated to members on the basis of their share capital." },
  { q: "Can a member withdraw his/her membership?", a: "Yes — withdrawal is permitted according to society rules, subject to approvals and settlement of liabilities." },
  { q: "Can I reapply for membership after withdrawal?", a: "In many cases yes, subject to the society's re-admission rules and any waiting period or conditions." },
  { q: "How do I get briefed on the performance of the Cooperative Society?", a: "Attend general meetings, request periodic reports, or view financial updates provided to members." },
  { q: "How do I make contribution for ordinary savings?", a: "Contribute through the society's collection channels (bank transfer, teller, or official collection points). Provide your member ID." },
  { q: "Can I withdraw a part of my thrift credit contribution as any time?", a: "Partial withdrawals depend on policy—some cooperatives allow withdrawals subject to conditions; confirm with management." },
  { q: "Can I request for my account statement as to know total thrift credit contribution I have made?", a: "Yes — request account statement from the society's admin or download from member portal (if available)." },
  { q: "How do I obtain Loan facility from the Cooperative?", a: "Apply using the loan form, meet eligibility (savings, guarantors), and await approval per society procedures." },
  { q: "What is the maximum loan limit I am entitled to request for?", a: "Loan limits depend on savings, share capital and society policy. Provide details in the loan policy section." },
  { q: "What is the maximum Tenor for the loan to be repaid?", a: "Tenor varies by loan type — short-term, medium-term and special loans each have defined maximum tenors." },
  { q: "On joining the cooperative, how soon can I be considered for a loan on request?", a: "The waiting period is defined in the policy — often you must meet a minimum savings or membership duration." },
  { q: "What is management committee?", a: "The elected body responsible for the governance and management of the cooperative." },
  { q: "What are the interest rates for each type of credits?", a: "Interest rates are determined by society policy; consult the loans schedule for exact rates." },
  { q: "At what point am I expected to pay interest on loan and handling charges?", a: "Interest and charges are payable as defined in the loan agreement (monthly, quarterly, etc.)." },
  { q: "What other information can assist me make a loan decision?", a: "Your savings history, share capital, repayment capacity and guarantors will help. Get loan schedule and terms." },
  { q: "How often am I expected to participate in the general meeting?", a: "General meetings are usually held annually; special meetings may be scheduled as needed. Members are encouraged to attend." },
  { q: "How do I know if I am qualified/eligible to become a Member of the Society?", a: "Check membership criteria in the constitution—usually residency, employment affiliation and adherence to rules." },
  { q: "Is there a fee payable on application for membership of the society?", a: "Yes — (duplicate question in source). Provide fee details here." },
  { q: "What is minimum Share Capital?", a: "Minimum share capital is the smallest amount required to hold membership shares in the society." },
  { q: "What is maximum Share Capital?", a: "Maximum share capital is defined in the society rules or policy." },
  { q: "What is Ordinary Savings and the minimum monthly savings?", a: "Ordinary savings are regular contributions; the minimum monthly amount is set by policy." },
  { q: "What is special saving?", a: "Special savings are targeted deposits for specific goals or projects." },
  { q: "What is retirement savings?", a: "Savings meant for retirement benefits or pension-like purposes, as defined in your policy." },
  { q: "What is Special deposit?", a: "A fixed deposit for a specific purpose or term — check terms and withdrawal conditions." },
  { q: "What is buffer savings and what are the conditions to be granted a loan request after buffer savings?", a: "Buffer savings protect the society’s liquidity; conditions to borrow after building buffer savings vary—please consult the loans policy." },
  { q: "What is the minimum thrift savings amount I can contribute monthly?", a: "The minimum thrift savings amount is specified in the society's contribution schedule." }
];

// render FAQs
const faqsGrid = document.getElementById('faqsGrid');
if (faqsGrid) {
  faqsGrid.innerHTML = '';
  faqs.forEach((item, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'faq-item';
    wrapper.setAttribute('role', 'listitem');

    // question button
    const qBtn = document.createElement('button');
    qBtn.className = 'faq-question';
    qBtn.type = 'button';
    qBtn.setAttribute('aria-expanded', 'false');
    qBtn.setAttribute('aria-controls', `faq-answer-${idx}`);
    qBtn.innerHTML = `<span class="faq-qtext">${item.q}</span>
                      <span class="faq-toggle" aria-hidden="true">+</span>`;

    // answer container
    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    answer.id = `faq-answer-${idx}`;
    answer.setAttribute('aria-hidden', 'true');
    answer.innerHTML = `<div class="faq-answer-inner"><p>${item.a}</p></div>`;

    // click handler
    qBtn.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');
      if (isOpen) {
        closeItem(wrapper, answer, qBtn);
      } else {
        openItem(wrapper, answer, qBtn);
      }
    });

    // keyboard: Enter and Space also toggle
    qBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        qBtn.click();
      }
    });

    wrapper.appendChild(qBtn);
    wrapper.appendChild(answer);
    faqsGrid.appendChild(wrapper);
  });
}

// helper open/close with smooth height
function openItem(wrapper, answerEl, btn) {
  wrapper.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  answerEl.setAttribute('aria-hidden', 'false');

  // measure & animate max-height
  const content = answerEl.querySelector('.faq-answer-inner');
  const fullH = content.scrollHeight;
  answerEl.style.maxHeight = fullH + 'px';
}

function closeItem(wrapper, answerEl, btn) {
  wrapper.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  answerEl.setAttribute('aria-hidden', 'true');

  // collapse
  answerEl.style.maxHeight = '0px';
}

// optional: allow only one open at a time
// Uncomment below if you want single-open behavior
/*
faqsGrid.addEventListener('click', (e) => {
  const clicked = e.target.closest('.faq-item');
  if (!clicked) return;
  document.querySelectorAll('.faq-item.open').forEach(it => {
    if (it !== clicked) {
      const btn = it.querySelector('.faq-question');
      const ans = it.querySelector('.faq-answer');
      closeItem(it, ans, btn);
    }
  });
});
*/

// ---------- Gallery ----------
const viewMoreBtn = document.getElementById('view-more-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
let expanded = false;

if (viewMoreBtn) {
  viewMoreBtn.addEventListener('click', () => {
    if (!expanded) {
      // Show all hidden items
      galleryItems.forEach((item, index) => {
        if (index >= 4) item.classList.remove('hidden');
      });
      viewMoreBtn.textContent = 'View Less';
      expanded = true;
    } else {
      // Hide back to first 4
      galleryItems.forEach((item, index) => {
        if (index >= 8) item.classList.add('hidden');
      });
      viewMoreBtn.textContent = 'View More';
      expanded = false;
    }
  });
}



  // ---------- hamburger nav ----------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');
  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mainNav.classList.toggle('open');
      const expanded = mainNav.classList.contains('open');
      hamburgerBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // ---------- modal & login wiring ----------
  const loginModal = document.getElementById('loginModal'); // modal wrapper
  const modalOverlay = loginModal ? loginModal.querySelector('.modal-overlay') : null;
  const modalCloseBtn = document.getElementById('closeLoginBtn');
  const desktopLoginBtn = document.querySelector('.cta-group .btn-outline'); // desktop login in header
  const mobileLoginBtn = document.getElementById('loginBtnMobile'); // mobile login inside nav
  const anyOutlineLogins = document.querySelectorAll('.btn.btn-outline'); // defensive: any outline buttons

  // open/close utilities (keeps behavior consistent)
  function openLoginModal() {
    if (!loginModal) return;
    loginModal.classList.add('active');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove('active');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach to the desktop button if present
  if (desktopLoginBtn) {
    desktopLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mainNav && mainNav.classList.contains('open')) mainNav.classList.remove('open');
      openLoginModal();
    });
  }

  // Attach to mobile login (if present)
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mainNav && mainNav.classList.contains('open')) mainNav.classList.remove('open');
      openLoginModal();
    });
  }

  // Also attach to any .btn-outline inside nav/cta-group (defensive)
  anyOutlineLogins.forEach(btn => {
    if (btn === desktopLoginBtn || btn === mobileLoginBtn) return; // already handled
    if (btn.closest('.cta-group') || btn.closest('#mainNav')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mainNav && mainNav.classList.contains('open')) mainNav.classList.remove('open');
        openLoginModal();
      });
    }
  });

  // overlay and close button
  if (modalOverlay) modalOverlay.addEventListener('click', closeLoginModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeLoginModal);

  // ---------- login submit (fetch to backend) ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email ? loginForm.email.value.trim() : '';
      const password = loginForm.password ? loginForm.password.value : '';

      if (!email || !password) {
        alert('Please enter email and password.');
        return;
      }

     fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
})
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      // ✅ Add redirect here:
      window.location.href = '/portal.html';
    } else {
      alert(data.error || 'Login failed');
    }
  })
  .catch(err => console.error('Login error', err));

  if (data.redirect) {
  location.href = data.redirect;
} else {
  location.href = '/portal.html';
}

    });
  }

  // Accessibility: close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
      closeLoginModal();
    }
  });

 // ---------- change password modal ----------
const openChangePasswordBtn = document.getElementById('openChangePasswordBtn');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeChangePasswordBtn = document.getElementById('closeChangePasswordBtn');
const closeChangePasswordOverlay = document.getElementById('closeChangePassword');

if (openChangePasswordBtn && changePasswordModal) {
  openChangePasswordBtn.addEventListener('click', () => {
    changePasswordModal.setAttribute('aria-hidden', 'false');
  });
}
if (closeChangePasswordBtn) {
  closeChangePasswordBtn.addEventListener('click', () => {
    changePasswordModal.setAttribute('aria-hidden', 'true');
  });
}
if (closeChangePasswordOverlay) {
  closeChangePasswordOverlay.addEventListener('click', () => {
    changePasswordModal.setAttribute('aria-hidden', 'true');
  });
}

// ---------- handle password change ----------
// ---------- change password modal ----------
const changePasswordForm = document.getElementById('changePasswordForm');
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = changePasswordForm.currentPassword.value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const msgEl = document.getElementById('changePasswordMsg');

    if (!currentPassword || !newPassword || !confirmPassword) {
      msgEl.textContent = 'Please fill out all fields.';
      msgEl.style.color = 'red';
      return;
    }

    if (newPassword !== confirmPassword) {
      msgEl.textContent = 'Passwords do not match.';
      msgEl.style.color = 'red';
      return;
    }

    const res = await fetch('/api/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (data.ok) {
      msgEl.textContent = 'Password updated successfully.';
      msgEl.style.color = 'green';
      changePasswordForm.reset();
      setTimeout(() => {
        document.getElementById('changePasswordModal').setAttribute('aria-hidden', 'true');
        msgEl.textContent = '';
      }, 1500);
    } else {
      msgEl.textContent = data.error || 'Error updating password.';
      msgEl.style.color = 'red';
    }
  });
}

// ---------- show/hide password toggles ----------
document.getElementById('toggleNewPassword').addEventListener('click', () => {
  const input = document.getElementById('newPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});

document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
  const input = document.getElementById('confirmPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});





  // === PORTAL ONLY CODE (initialize only if portal UI exists) ===
  const portalYearSelect = document.getElementById('yearSelect');
  if (!portalYearSelect) return; // not on portal page — stop here

  // portal elements
  const yearSelect = portalYearSelect;
  const refreshBtn = document.getElementById('refreshBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const statsGrid = document.getElementById('statsGrid');
  const welcome = document.getElementById('welcome');
  const txContainer = document.getElementById('transactionsContainer');

  // Helper: format currency
  const fmt = n => n == null ? '—' : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(n);

   fetch('/api/me', { credentials: 'include' })
  .then(r => r.json())
  .then(data => {
    if (data.user) {
      document.getElementById('username').textContent = data.user.fullname;
    } else {
      window.location.href = '/'; // redirect to login if not authenticated
    }
  });

  // Fetch current user info from backend (with credentials). If backend fails, fallback to demo user.
  async function fetchMe() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Not authenticated');
      return await res.json(); // { user: { ... } }
    } catch (err) {
      console.warn('fetchMe failed, using demo fallback:', err.message);
      // demo fallback (keeps UI functional without backend)
      return {
        user: {
          id: 1,
          fullname: 'Demo User',
          email: 'demo@example.com',
          created_at: '2018-03-15'
        }
      };
    }
  }

  // Request transactions for current user up to endISO using the server endpoint '/api/me/transactions?to=...'
  async function fetchTransactionsUpTo(endISO) {
    try {
      // server endpoint expects to=YYYY-MM-DDT... or default to now
      const res = await fetch(`/api/me/transactions?to=${encodeURIComponent(endISO)}`, { credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(()=>({}));
        throw new Error(body.error || `Server responded ${res.status}`);
      }
      const j = await res.json();
      return j.transactions || [];
    } catch (err) {
      console.warn('fetchTransactionsUpTo failed — falling back to demo txs:', err.message);
      // demo fallback dataset
      return demoTransactions();
    }
  }

  function demoTransactions() {
    return [
      { id: 1, user_id: 1, date: '2018-04-01', type: 'deposit', amount: 20000, desc: 'Initial savings' },
      { id: 2, user_id: 1, date: '2018-10-15', type: 'withdrawal', amount: 5000, desc: 'Member withdrawal' },
      { id: 3, user_id: 1, date: '2019-03-10', type: 'deposit', amount: 15000, desc: 'Monthly savings' },
      { id: 4, user_id: 1, date: '2020-06-20', type: 'loan', amount: 50000, desc: 'Personal loan' },
      { id: 5, user_id: 1, date: '2021-02-12', type: 'repayment', amount: 10000, desc: 'Loan repayment' },
      { id: 6, user_id: 1, date: '2022-09-25', type: 'deposit', amount: 12000, desc: 'Savings' },
      { id: 7, user_id: 1, date: '2023-01-05', type: 'deposit', amount: 20000, desc: 'Savings' },
    ];
  }

  // render stats and table; transactions may use 'occurred_at' or 'date' fields
  function render(transactions, joinYear, endYear) {
    if (!transactions || transactions.length === 0) {
      txContainer.innerHTML = '<div class="no-data">No transactions for the selected range.</div>';
      statsGrid.innerHTML = '';
      return;
    }

    const start = new Date(`${joinYear}-01-01T00:00:00Z`);
    const end = new Date(`${endYear}-12-31T23:59:59Z`);

    const normalized = transactions.map(t => {
      // prefer occurred_at returned by server, otherwise fallback to t.date
      const occurred = t.occurred_at || t.date || t.occurredAt || t.created_at;
      return {
        ...t,
        occurred_at: occurred,
        amount: Number(t.amount || t.amt || 0)
      };
    }).filter(t => {
      const d = new Date(t.occurred_at);
      return !isNaN(d) && d >= start && d <= end;
    }).sort((a,b)=> new Date(b.occurred_at) - new Date(a.occurred_at));

    if (normalized.length === 0) {
      txContainer.innerHTML = '<div class="no-data">No transactions for the selected range.</div>';
      statsGrid.innerHTML = '';
      return;
    }

    // aggregates
   let deposits = 0, withdrawals = 0, loansTaken = 0, repayments = 0, savings = 0;
normalized.forEach(t => {
  deposits += Number(t.thirteenth_month || 0);
  withdrawals += Number(t.electronics_loan || 0);; // you can add if you track separately
  loansTaken += Number(t.emergency_loan || 0);
  repayments += Number(t.main_loan || 0);
  savings += Number(t.savings || 0)
});
const balance = savings;

    

    // render stats
    statsGrid.innerHTML = `
      <div class="stat"><h3>Thirteenth Month</h3><p>${fmt(deposits)}</p></div>
      <div class="stat"><h3>Electronics Loan</h3><p>${fmt(withdrawals)}</p></div>
      <div class="stat"><h3>Emergency Loan</h3><p>${fmt(loansTaken)}</p></div>
      <div class="stat"><h3>Main Loan</h3><p>${fmt(repayments)}</p></div>
      <div class="stat"><h3>Savings(approx.)</h3><p>${fmt(balance)}</p></div>
    `;

    // render table
    const rows = normalized.map(t => {
const date = new Date(t.occurred_at).toLocaleDateString();



  const desc = t.description || '';
  return `
    <tr>
      <td>${date}</td>
      <td>${desc}</td>
      <td>${fmt(t.thirteenth_month)}</td>
      <td>${fmt(t.electronics_loan)}</td>
      <td>${fmt(t.emergency_loan)}</td>
      <td>${fmt(t.main_loan)}</td>
      <td>${fmt(t.savings)}</td>
    </tr>
  `;
}).join('');


    txContainer.innerHTML = `
  <div class="small">Showing ${normalized.length} transactions from ${joinYear} → ${endYear}</div>
  <div class="tx-scroll" role="region" aria-label="Transactions table, horizontally scrollable">
    <table class="tx-table" aria-live="polite">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>13th month</th>
          <th>Electronics Loan</th>
          <th>Emergency Loan</th>
          <th>Main Loan</th>
          <th>Savings</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
`;

  }

  // populate year select
  function buildYearOptions(joinYear) {
    const cur = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let y = cur; y >= joinYear; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }
  }

  // Load user, fill UI, and fetch transactions
  (async function initPortal(){
    const meResp = await fetchMe();
    const user = meResp.user || meResp; // support shapes
    const joinYear = (user.created_at ? new Date(user.created_at).getFullYear() : (user.join_year || 2018));
    welcome.innerHTML = `Welcome, <strong>${user.fullname || user.email}</strong>`;

    buildYearOptions(joinYear);
    yearSelect.value = new Date().getFullYear();

    async function loadForSelectedYear(){
      const endYear = Number(yearSelect.value);
      const endISO = `${endYear}-12-31T23:59:59Z`;
      // fetch server transactions up to endISO
      const txs = await fetchTransactionsUpTo(endISO);
      render(txs, joinYear, endYear);
    }

    // initial load
    await loadForSelectedYear();

    // event handlers
    if (refreshBtn) refreshBtn.addEventListener('click', loadForSelectedYear);
    if (yearSelect) yearSelect.addEventListener('change', loadForSelectedYear);

    if (logoutBtn) logoutBtn.addEventListener('click', async ()=> {
      try { await fetch('/api/auth/logout', { method:'POST', credentials:'include' }); } catch(e){/*ignore*/}
      // redirect to homepage (index)
      window.location.href = '/';
    });
  })();

}); // end DOMContentLoaded
