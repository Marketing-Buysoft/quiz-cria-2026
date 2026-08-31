/* ============================================
   QUIZ PERFIL CRIATIVO — LOGIC & INTERACTION
   Buysoft × CRIA Senac SP 2026
   ============================================ */

// ─── CONFIG ─────────────────────────────────
// Replace with your Google Apps Script Web App URL after deploying
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyvW3Ynlju7f4kqupu2zPL_-UCg_sapSBP4lvcV4kNCvc-LMR2yh2CMChJu5O63cS4w/exec';

// ─── QUIZ DATA ──────────────────────────────
const QUESTIONS = [
  {
    text: 'Ao iniciar um projeto novo, qual é o seu primeiro impulso?',
    options: [
      { letter: 'A', text: 'Pesquiso referências e construo uma base sólida antes de começar.', profile: 'chocolate' },
      { letter: 'B', text: 'Começo a desenhar na hora para colocar a ideia no papel sem perder o ritmo.', profile: 'morango' },
      { letter: 'C', text: 'Questiono o briefing e busco novos caminhos antes de definir a direção.', profile: 'maracuja' },
    ]
  },
  {
    text: 'Quando surge uma limitação técnica no meio do trabalho, o que você faz?',
    options: [
      { letter: 'A', text: 'Estudo a restrição a fundo e transformo o detalhe técnico em diferencial.', profile: 'chocolate' },
      { letter: 'B', text: 'Improviso com agilidade e uso a restrição como estímulo para criar.', profile: 'morango' },
      { letter: 'C', text: 'Mudo a abordagem e encontro uma solução alternativa e mais eficiente.', profile: 'maracuja' },
    ]
  },
  {
    text: 'Com o projeto finalizado, como você prefere apresentar o resultado?',
    options: [
      { letter: 'A', text: 'Com uma narrativa completa, cuidando de cada detalhe para gerar impacto.', profile: 'chocolate' },
      { letter: 'B', text: 'Direto ao ponto, deixando o próprio resultado falar por si.', profile: 'morango' },
      { letter: 'C', text: 'Mostrando a visão de futuro e o potencial de expansão do projeto.', profile: 'maracuja' },
    ]
  }
];

const PROFILES = {
  chocolate: {
    emoji: '🍫',
    name: 'O Arquiteto de Sensações',
    description:
      `Você constrói experiências completas e intencionais.\n\n` +
      `Cada detalhe do seu projeto tem propósito. Enquanto outros apenas esboçam, você pensa na harmonia e no impacto de cada elemento.\n\n` +
      `Seu processo é consistente, envolvente e marcante.\n\n` +
      `Profundidade técnica e sensibilidade visual são as suas maiores qualidades.`,
    powers: [
      'Atenção rigorosa aos detalhes',
      'Narrativa visual envolvente',
      'Execução técnica de alto nível',
    ],
    quote: `"O bom design não se explica, se sente."\nSabor Chocolate`,
    flavor: 'chocolate',
  },
  morango: {
    emoji: '🍓',
    name: 'O Criativo Sem Filtro',
    description:
      `Você tem instinto criativo ágil e espontâneo.\n\n` +
      `Enquanto outros ainda estão no planejamento, você já testou caminhos na prática e colocou ideias em movimento.\n\n` +
      `Sua energia é dinâmica e contagiante.\n\n` +
      `Velocidade de criação e autenticidade são as suas marcas registradas.`,
    powers: [
      'Agilidade para transformar ideias em realidade',
      'Coragem para testar e colocar projetos no mundo',
      'Energia criativa que impulsiona qualquer equipe',
    ],
    quote: `"Ideia boa é ideia realizada."\nSabor Morango`,
    flavor: 'morango',
  },
  maracuja: {
    emoji: '🥭',
    name: 'O Visionário Inquieto',
    description:
      `Você questiona o óbvio e enxerga conexões onde ninguém mais vê.\n\n` +
      `Onde muitos enxergam apenas uma tarefa, você visualiza um sistema completo e propõe novas soluções.\n\n` +
      `Seu pensamento é estratégico, autêntico e transformador.\n\n` +
      `Inovação e pensamento crítico são a sua essência criativa.`,
    powers: [
      'Visão estratégica e pensamento sistêmico',
      'Habilidade para reformular problemas complexos',
      'Capacidade de antecipar tendências e oportunidades',
    ],
    quote: `"O futuro é construído por quem ousa fazer diferente."\nSabor Maracujá`,
    flavor: 'maracuja',
  },
};

// ─── STATE ──────────────────────────────────
let currentQuestion = 0;
const answers = [];
let calculatedProfile = null;

// ─── DOM REFS ───────────────────────────────
const $progressBar = document.getElementById('progress-bar');
const $progressFill = document.getElementById('progress-fill');
const $btnStart = document.getElementById('btn-start');
const $questionText = document.getElementById('question-text');
const $questionCurrent = document.getElementById('q-current');
const $optionsContainer = document.getElementById('options-container');
const $contactForm = document.getElementById('contact-form');

// ─── SCREEN MANAGEMENT ─────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }
}

function updateProgress(step, total) {
  const pct = (step / total) * 100;
  $progressFill.style.width = `${pct}%`;
}

// ─── QUIZ FLOW ──────────────────────────────
function startQuiz() {
  currentQuestion = 0;
  answers.length = 0;

  $progressBar.classList.add('visible');
  updateProgress(0, QUESTIONS.length);

  showScreen('screen-quiz');
  renderQuestion(0);
}

function renderQuestion(index) {
  const q = QUESTIONS[index];

  $questionCurrent.textContent = index + 1;

  $questionText.classList.remove('animate-in');
  $questionText.textContent = q.text;

  // Force reflow then animate
  void $questionText.offsetWidth;
  $questionText.classList.add('animate-in');

  // Render options
  $optionsContainer.innerHTML = '';

  q.options.forEach((opt, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'option-card';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', 'false');
    card.innerHTML = `
      <span class="option-letter">${opt.letter}</span>
      <span class="option-text">${opt.text}</span>
    `;

    card.addEventListener('click', () => selectOption(card, opt.profile));

    $optionsContainer.appendChild(card);

    // Trigger stagger animation
    requestAnimationFrame(() => {
      card.classList.add('animate-in');
    });
  });
}

function selectOption(card, profileKey) {
  // Visual feedback
  card.classList.add('selected');
  card.setAttribute('aria-checked', 'true');

  // Store answer
  answers.push(profileKey);

  // Update progress
  updateProgress(currentQuestion + 1, QUESTIONS.length);

  // Advance after brief pause for visual feedback
  setTimeout(() => {
    currentQuestion++;

    if (currentQuestion < QUESTIONS.length) {
      renderQuestion(currentQuestion);
    } else {
      calculatedProfile = calculateProfile();
      showContactForm();
    }
  }, 500);
}

function calculateProfile() {
  const count = { chocolate: 0, morango: 0, maracuja: 0 };

  answers.forEach(a => count[a]++);

  // Find max
  const max = Math.max(count.chocolate, count.morango, count.maracuja);

  // If clear winner
  if (count.chocolate === max && count.morango < max && count.maracuja < max) return 'chocolate';
  if (count.morango === max && count.chocolate < max && count.maracuja < max) return 'morango';
  if (count.maracuja === max && count.chocolate < max && count.morango < max) return 'maracuja';

  // Tie-breaker: use last answer (question 3)
  return answers[2];
}

// ─── CONTACT FORM ───────────────────────────
function showContactForm() {
  $progressBar.classList.remove('visible');
  showScreen('screen-contact');

  // Focus first field after transition
  setTimeout(() => {
    document.getElementById('field-name').focus();
  }, 800);
}

function validateForm() {
  let valid = true;
  const fields = [
    { id: 'field-name', msg: 'Preencha seu nome' },
    { id: 'field-email', msg: 'E-mail inválido', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id: 'field-phone', msg: 'Preencha seu WhatsApp' },
  ];

  fields.forEach(({ id, msg, validate: customValidate }) => {
    const input = document.getElementById(id);
    const group = input.closest('.form-group');
    const value = input.value.trim();

    // Remove previous error
    group.classList.remove('has-error');
    const prevErr = group.querySelector('.error-msg');
    if (prevErr) prevErr.remove();

    const isValid = customValidate ? customValidate(value) : value.length > 0;

    if (!isValid) {
      valid = false;
      group.classList.add('has-error');
      const errEl = document.createElement('div');
      errEl.className = 'error-msg';
      errEl.textContent = msg;
      group.appendChild(errEl);
    }
  });

  return valid;
}

function getFormData() {
  return {
    name: document.getElementById('field-name').value.trim(),
    email: document.getElementById('field-email').value.trim(),
    phone: document.getElementById('field-phone').value.trim(),
    course: document.getElementById('field-course').value.trim(),
    institution: document.getElementById('field-institution').value.trim(),
    answer1: answers[0] || '',
    answer2: answers[1] || '',
    answer3: answers[2] || '',
    profile: calculatedProfile,
    profileName: PROFILES[calculatedProfile].name,
    timestamp: new Date().toISOString(),
  };
}

async function submitToGoogleSheets(data) {
  if (!GOOGLE_SHEETS_URL) {
    console.warn('Google Sheets URL not configured. Saving to localStorage as fallback.');
    saveToLocalStorage(data);
    return;
  }

  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Failed to submit to Google Sheets:', err);
    saveToLocalStorage(data);
  }
}

function saveToLocalStorage(data) {
  const stored = JSON.parse(localStorage.getItem('quiz_backup') || '[]');
  stored.push(data);
  localStorage.setItem('quiz_backup', JSON.stringify(stored));
}

// ─── RESULT SCREEN ──────────────────────────
function showLoading() {
  showScreen('screen-loading');

  setTimeout(() => {
    showResult();
  }, 2200);
}

function showResult() {
  const profile = PROFILES[calculatedProfile];
  const resultScreen = document.getElementById('screen-result');

  // Apply flavor theme
  resultScreen.setAttribute('data-flavor', profile.flavor);

  // Populate content
  document.getElementById('result-emoji').textContent = profile.emoji;
  document.getElementById('result-name').textContent = profile.name;
  document.getElementById('result-description').textContent = profile.description;
  document.getElementById('result-quote').textContent = profile.quote;

  // Powers
  const powersList = document.getElementById('result-powers-list');
  powersList.innerHTML = '';
  profile.powers.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    powersList.appendChild(li);
  });

  // Show screen
  showScreen('screen-result');

  // Trigger animations
  requestAnimationFrame(() => {
    const card = document.getElementById('result-card');
    const cta = resultScreen.querySelector('.result-cta');
    const footer = resultScreen.querySelector('.result-footer');

    if (card) card.classList.add('animate-in');
    if (cta) cta.classList.add('animate-in');
    if (footer) footer.classList.add('animate-in');
  });

  // Celebration particles
  spawnParticles();
}

function spawnParticles() {
  const brandColors = ['#169fdb', '#4FC3F7', '#0C5A8A', '#ffffff', '#80D8FF'];

  const container = document.createElement('div');
  container.className = 'particles';
  document.body.appendChild(container);

  for (let i = 0; i < 28; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.backgroundColor = brandColors[Math.floor(Math.random() * brandColors.length)];
    particle.style.animationDelay = `${Math.random() * 1.5}s`;
    particle.style.animationDuration = `${2 + Math.random() * 2}s`;
    particle.style.width = `${4 + Math.random() * 8}px`;
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }

  // Remove particles after animation
  setTimeout(() => container.remove(), 5000);
}

// ─── EVENT LISTENERS ────────────────────────
$btnStart.addEventListener('click', startQuiz);

$contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const data = getFormData();

  // Show loading screen
  showLoading();

  // Submit data in background
  await submitToGoogleSheets(data);
});

// Keyboard support: Enter on options
document.addEventListener('keydown', (e) => {
  if (e.key >= '1' && e.key <= '3') {
    const screen = document.getElementById('screen-quiz');
    if (screen.classList.contains('active')) {
      const idx = parseInt(e.key) - 1;
      const cards = $optionsContainer.querySelectorAll('.option-card');
      if (cards[idx] && !cards[idx].classList.contains('selected')) {
        cards[idx].click();
      }
    }
  }
});
