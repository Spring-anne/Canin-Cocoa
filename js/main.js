/* =========================================================
   Canin Cocoa — Interactividad
   Cada bloque revisa si su elemento existe en la página,
   así el mismo archivo sirve para todas las páginas.
   ========================================================= */

/* ---------- 1. Menú móvil ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open);
  });
}

/* ---------- 2. Pestañas de módulos (modulos.html) ---------- */
const tabs = document.querySelectorAll('.tab');
if (tabs.length) {
  function showStage(stage) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.stage === stage));
    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === stage));
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      showStage(tab.dataset.stage);
      history.replaceState(null, '', '#' + tab.dataset.stage);
    });
  });
  // Abrir la etapa indicada en la URL, p. ej. modulos.html#menopause
  const fromUrl = location.hash.replace('#', '');
  if (fromUrl && document.getElementById(fromUrl)) showStage(fromUrl);
}

/* ---------- 3. Análisis de síntomas (sintomas.html) ---------- */
const symptomForm = document.getElementById('symptomForm');
const result = document.getElementById('result');
if (symptomForm && result) {
  const emptyResult = result.innerHTML;

  const RESULTS = {
    high: {
      icon: '🚨', label: 'Alto',
      message: 'Tus síntomas requieren atención médica pronto.',
      recommendation: 'Acude con una médica o visita urgencias si los síntomas son intensos. No esperes más de 48 horas.'
    },
    medium: {
      icon: '⚡', label: 'Moderado',
      message: 'Algunos síntomas pueden necesitar evaluación profesional.',
      recommendation: 'Agenda una consulta preventiva en las próximas 1–2 semanas para descartar condiciones tratables.'
    },
    low: {
      icon: '✅', label: 'Bajo',
      message: 'Síntomas leves identificados.',
      recommendation: 'Monitorea tus síntomas. Si persisten más de 2 semanas o se intensifican, consulta a tu médica.'
    }
  };

  // Devuelve el texto de la opción elegida en un grupo (o null si no hay)
  function elegido(name) {
    const input = symptomForm.querySelector(`input[name="${name}"]:checked`);
    if (!input) return null;
    const span = input.nextElementSibling;
    return { value: input.value, text: span.childNodes[0].textContent.trim() };
  }

  symptomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    symptomForm.querySelectorAll('.field.missing').forEach(f => f.classList.remove('missing'));

    const checked = [...symptomForm.querySelectorAll('input[name="symptom"]:checked')];
    const count = checked.length;
    const cardiac = checked.some(c => c.dataset.category === 'cardiac');
    const edad = elegido('age');
    const duracion = elegido('duracion');
    const intensidad = elegido('intensidad');
    const evolucion = elegido('evolucion');
    const impacto = elegido('impacto');

    if (count === 0) {
      result.className = 'result';
      result.innerHTML = '<div class="big-icon">👆</div><p style="font-weight:700;color:var(--dark)">Selecciona al menos un síntoma para obtener orientación.</p>';
      return;
    }
    if (!duracion) {
      const campo = symptomForm.querySelector('input[name="duracion"]').closest('.field');
      campo.classList.add('missing');
      campo.scrollIntoView({ behavior: 'smooth', block: 'center' });
      result.className = 'result';
      result.innerHTML = '<div class="big-icon">🗓️</div><p style="font-weight:700;color:var(--dark)">Indica desde cuándo tienes los síntomas.</p><p style="font-size:12px;margin:0">Es necesario para darte una orientación más precisa.</p>';
      return;
    }

    // ---- Cálculo del nivel: 0 = bajo, 1 = moderado, 2 = alto ----
    let nivel = 0;
    const motivos = [];
    const subir = (n, motivo) => { if (n > nivel) nivel = n; motivos.push(motivo); };

    if (cardiac) subir(2, 'Palpitaciones o dolor en el pecho deben revisarse pronto.');
    if (count >= 5) subir(2, `Presentas ${count} síntomas al mismo tiempo.`);
    else if (count >= 3) subir(1, `Presentas ${count} síntomas al mismo tiempo.`);

    const largo = ['2-4sem', '1-3meses', '3meses+'].includes(duracion.value);
    if (duracion.value === '3meses+') subir(1, 'Llevan más de 3 meses: conviene revisarlos aunque te hayas acostumbrado.');
    else if (largo) subir(1, 'Llevan más de 2 semanas.');

    const fuerte = intensidad && intensidad.value === 'fuerte';
    const empeora = evolucion && evolucion.value === 'empeorando';
    const limita = impacto && impacto.value === 'si';
    if (fuerte && (empeora || limita)) subir(2, 'Son molestias fuertes que empeoran o te impiden tus actividades.');
    else if (fuerte) subir(1, 'Las molestias son fuertes (7 a 10 de 10).');
    if (empeora && !fuerte) subir(1, 'Los síntomas van empeorando.');
    if (limita && !fuerte) subir(1, 'Te impiden hacer tus actividades diarias.');
    if (motivos.length === 0) motivos.push('Pocos síntomas, de corta duración y sin señales de alarma.');

    const level = ['low', 'medium', 'high'][nivel];
    const r = RESULTS[level];

    // Recomendación ajustada a la duración
    let recomendacion = r.recommendation;
    if (level === 'medium' && ['1-3meses', '3meses+'].includes(duracion.value)) {
      recomendacion = 'Agenda una consulta en los próximos días. Llevan tiempo y vale la pena encontrar la causa.';
    }
    if (level === 'low' && evolucion && evolucion.value === 'mejorando') {
      recomendacion = 'Van mejorando: sigue observándolos. Si regresan, empeoran o duran más de 2 semanas, consulta a tu médica.';
    }
    let urgencia = '';
    if (cardiac) {
      urgencia = '<div class="note" style="margin-bottom:12px;color:var(--rose);font-weight:700">🚑 Si el dolor de pecho es intenso, se extiende al brazo, la espalda o la mandíbula, o te falta el aire, llama al 911.</div>';
    }

    // Resumen para llevar a la consulta
    const filas = [
      ['Síntomas', `${count} seleccionado${count > 1 ? 's' : ''}`],
      ['Desde hace', duracion.text],
      ['Intensidad', intensidad ? intensidad.text : 'Sin indicar'],
      ['Evolución', evolucion ? evolucion.text : 'Sin indicar'],
      ['Actividades diarias', impacto ? (impacto.value === 'no' ? 'No las afecta' : impacto.text) : 'Sin indicar'],
    ];
    if (edad) filas.unshift(['Edad', edad.text + ' años']);

    result.className = 'result filled ' + level;
    result.innerHTML = `
      <div class="level-icon">${r.icon}</div>
      <div class="level">Nivel de atención: ${r.label}</div>
      <h4>${r.message}</h4>
      <p>${recomendacion}</p>
      ${urgencia}
      <div class="result-why-title">Por qué este nivel</div>
      <ul class="result-why">${motivos.map(m => `<li>${m}</li>`).join('')}</ul>
      <div class="result-why-title">Resumen para tu consulta</div>
      <ul class="result-facts">${filas.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('')}</ul>
      <div class="note">⚕️ Recuerda: esta información es orientativa. Solo una profesional de salud puede dar un diagnóstico.</div>
    `;
    if (window.innerWidth < 768) result.scrollIntoView({ behavior: 'smooth' });
  });

  symptomForm.addEventListener('reset', () => {
    symptomForm.querySelectorAll('.field.missing').forEach(f => f.classList.remove('missing'));
    result.className = 'result';
    result.innerHTML = emptyResult;
  });
}

/* ---------- 4. Registro por pasos (perfil.html) ---------- */
const profileForm = document.getElementById('profileForm');
if (profileForm) {
  const steps = profileForm.querySelectorAll('.form-step');
  const stepDots = document.querySelectorAll('#steps .step');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const saveBtn = document.getElementById('saveBtn');
  const success = document.getElementById('success');
  let current = 1;
  const total = steps.length;

  function render() {
    steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === current));
    stepDots.forEach((d, i) => {
      d.classList.toggle('done', i < current);
      const line = d.querySelector('.line');
      if (line) line.classList.toggle('full', i + 1 < current);
    });
    prevBtn.style.visibility = current > 1 ? 'visible' : 'hidden';
    nextBtn.hidden = current === total;
    saveBtn.hidden = current !== total;
  }

  // Revisa los campos obligatorios del paso actual antes de avanzar
  function stepIsValid() {
    const fields = steps[current - 1].querySelectorAll('input, textarea');
    for (const f of fields) {
      if (!f.checkValidity()) { f.reportValidity(); return false; }
    }
    return true;
  }

  nextBtn.addEventListener('click', () => { if (stepIsValid()) { current++; render(); } });
  prevBtn.addEventListener('click', () => { current--; render(); });

  function recommendedStage(age) {
    if (age < 20) return { id: 'adolescence', label: 'Adolescencia' };
    if (age < 40) return { id: 'reproductive', label: 'Edad Reproductiva' };
    if (age < 60) return { id: 'menopause', label: 'Transición y Menopausia' };
    return { id: 'senior', label: 'Adultez Mayor' };
  }

  function showSuccess(data) {
    const stage = recommendedStage(Number(data.age));
    document.getElementById('successName').textContent = data.name;
    document.getElementById('recommendedLink').href = 'modulos.html#' + stage.id;
    document.getElementById('recommendedLink').textContent = 'Ver módulo: ' + stage.label;
    const rows = [
      ['Edad', data.age ? data.age + ' años' : '—'],
      ['Primera menstruación', data.menarche ? data.menarche + ' años' : '—'],
      ['Embarazos', data.pregnancies || '—'],
      ['Actividad física', data.exercise || '—'],
      ['Alimentación', data.diet || '—'],
    ];
    const summary = document.getElementById('summary');
    summary.innerHTML = '';
    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      row.innerHTML = '<dt></dt><dd></dd>';
      row.querySelector('dt').textContent = k;
      row.querySelector('dd').textContent = v;
      summary.appendChild(row);
    });
    profileForm.hidden = true;
    document.getElementById('steps').style.display = 'none';
    success.classList.add('show');
  }

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(profileForm));
    // Guarda el perfil en el navegador (solo para el prototipo)
    try { localStorage.setItem('caninCocoaPerfil', JSON.stringify(data)); } catch (err) {}
    showSuccess(data);
  });

  document.getElementById('editProfile').addEventListener('click', () => {
    success.classList.remove('show');
    profileForm.hidden = false;
    document.getElementById('steps').style.display = '';
    current = 1;
    render();
  });

  // Si ya había un perfil guardado, lo carga en el formulario
  try {
    const saved = JSON.parse(localStorage.getItem('caninCocoaPerfil'));
    if (saved) {
      Object.entries(saved).forEach(([name, value]) => {
        const els = profileForm.elements[name];
        if (!els) return;
        if (els instanceof RadioNodeList) {
          els.forEach(r => { r.checked = r.value === value; });
        } else {
          els.value = value;
        }
      });
      showSuccess(saved);
    }
  } catch (err) {}

  render();
}

/* ---------- 5. Filtro de artículos (aprende.html) ---------- */
const filters = document.querySelectorAll('#filters .chip');
if (filters.length) {
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.article').forEach(a => {
        a.classList.toggle('hidden', f !== 'todos' && a.dataset.tag !== f);
      });
    });
  });
}

/* ---------- 6. Carrusel de banners (index.html) ---------- */
const carousel = document.getElementById('carousel');
if (carousel) {
  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.slide');
  const dotsBox = carousel.querySelector('.carousel-dots');
  const INTERVALO = 6000; // milisegundos entre banners
  let index = 0;
  let timer = null;

  // Crea un punto por cada banner
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', 'Ir al banner ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); restart(); });
    dotsBox.appendChild(dot);
  });
  const dots = dotsBox.querySelectorAll('button');

  function goTo(i) {
    index = (i + slides.length) % slides.length; // da la vuelta al llegar al final
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, n) => d.classList.toggle('active', n === index));
    slides.forEach((s, n) => {
      s.setAttribute('aria-hidden', n !== index);
      // Evita que el tabulador llegue a botones de banners ocultos
      s.querySelectorAll('a').forEach(a => a.tabIndex = n === index ? 0 : -1);
    });
  }

  // Avance automático (se desactiva si la persona prefiere menos movimiento)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start() { if (!reduceMotion) timer = setInterval(() => goTo(index + 1), INTERVALO); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  carousel.querySelector('.prev').addEventListener('click', () => { goTo(index - 1); restart(); });
  carousel.querySelector('.next').addEventListener('click', () => { goTo(index + 1); restart(); });

  // Pausa mientras el cursor o el foco están sobre el carrusel
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  // Deslizar con el dedo en celular
  let startX = 0;
  carousel.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) goTo(diff < 0 ? index + 1 : index - 1);
    start();
  });

  // Flechas del teclado
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { goTo(index - 1); }
    if (e.key === 'ArrowRight') { goTo(index + 1); }
  });

  goTo(0);
  start();
}

/* ---------- 7. Abrir un artículo desde un enlace (aprende.html#vph) ---------- */
const linked = location.hash && document.querySelector('.article' + location.hash);
if (linked) {
  const details = linked.querySelector('details');
  if (details) details.open = true;
  linked.style.outline = '3px solid var(--lilac)';
  linked.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
