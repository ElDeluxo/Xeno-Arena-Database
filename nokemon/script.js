/* ============================================================
   NOKEMON — script.js
   ============================================================ */

// ── Type definitions ─────────────────────────────────────
const __ASSET = path => (typeof ASSETS !== 'undefined' && ASSETS[path]) ? ASSETS[path] : path;
const TYPES = {
  fuego: { name: 'FIRE', icon: 'icons/fire.avif' },
  tropical: { name: 'TROPICAL', icon: 'icons/tropical.avif' },
  anomalo: { name: 'ANOMALOUS', icon: 'icons/anomalous.avif' },
  toxico: { name: 'TOXIC', icon: 'icons/toxic.avif' },
  radioactivo: { name: 'RADIOACTIVE', icon: 'icons/radioactive.avif' },
  desierto: { name: 'DESERT', icon: 'icons/desert.avif' },
  hielo: { name: 'ICE', icon: 'icons/cold.avif' },
  mecanico: { name: 'MECHANICAL', icon: 'icons/mecanical.avif' },
};

const RARITY_LABELS = { '1': 'C', '2': 'B', '3': 'A', '4': 'S' };
const RARITY_CLASSES = { '1': 'rating-c', '2': 'rating-b', '3': 'rating-a', '4': 'rating-s' };
const CLASS_ICONS = { 'C': 'classes/CLASS.C.webp', 'B': 'classes/CLASS.B.webp', 'A': 'classes/CLASS.A.webp', 'S': 'classes/CLASS.S.webp' };
const RARITY_TO_LETTER = { '1': 'C', '2': 'B', '3': 'A', '4': 'S' };

// ── App state ─────────────────────────────────────────────
const state = {
  currentType: 'fuego',
  imageDataUrl: null,
  attacks: Array.from({ length: 5 }, () => ({ name: '', desc: '', dmg: '', attackType: 'tipo' })),
  attrs: { combat: 'A', agility: 'B', health: 'B' },
  customFont: null,      // font DataURL or null
  fontScope: 'name',     // 'name' | 'card'
  imageStyle: 'normal',
};

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  buildTypeGrid();
  buildAttacksEditor();
  buildAttributesEditor();
  setupImageUpload();
  setupFontUpload();
  setupFormListeners();
  setupDownload();
  renderCard();
});

// ══════════════════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

// ══════════════════════════════════════════════════════════
// TYPE GRID
// ══════════════════════════════════════════════════════════
function buildTypeGrid() {
  const grid = document.getElementById('type-grid');
  Object.entries(TYPES).forEach(([key, t]) => {
    const btn = document.createElement('button');
    btn.className = 'type-btn' + (key === state.currentType ? ' active' : '');
    btn.dataset.type = key;
    btn.innerHTML = `<img class="type-icon-img" src="${__ASSET(t.icon)}" alt="${t.name}"><span>${t.name}</span>`;
    btn.addEventListener('click', () => selectType(key));
    grid.appendChild(btn);
  });
}
function selectType(type) {
  state.currentType = type;
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.type-btn[data-type="${type}"]`).classList.add('active');
  renderCard();
}

// ══════════════════════════════════════════════════════════
// ATTACKS EDITOR
// ══════════════════════════════════════════════════════════
function buildAttacksEditor() {
  const container = document.getElementById('attacks-editor');
  container.innerHTML = '';
  state.attacks.forEach((atk, i) => {
    const div = document.createElement('div');
    div.className = 'attack-editor-row';
    div.innerHTML = `
      <div class="attack-row-header">Attack ${i + 1}</div>
      <div class="attack-fields">
        <div class="attack-type-name-dmg">
          <div class="form-group" style="margin:0">
            <label>Type</label>
            <select id="atk-type-${i}">
              <option value="tipo">Type</option>
              <option value="normal">Normal</option>
              <option value="escudo">Shield</option>
              <option value="reflector">Reflect</option>
              <option value="vida">Health</option>
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <label>Name</label>
            <input type="text" id="atk-name-${i}" placeholder="Attack name" maxlength="20">
          </div>
          <div class="form-group" style="margin:0">
            <label>Damage</label>
            <input type="number" id="atk-dmg-${i}" placeholder="0" min="0" max="999">
          </div>
        </div>
        <div class="form-group" style="margin:0; margin-top:8px;">
          <label>Description</label>
          <input type="text" id="atk-desc-${i}" placeholder="Effect description..." maxlength="55">
        </div>
      </div>`;
    container.appendChild(div);

    div.querySelector(`#atk-type-${i}`).addEventListener('change', e => { state.attacks[i].attackType = e.target.value; renderCard(); });
    div.querySelector(`#atk-name-${i}`).addEventListener('input', e => { state.attacks[i].name = e.target.value; renderCard(); });
    div.querySelector(`#atk-dmg-${i}`).addEventListener('input', e => { state.attacks[i].dmg = e.target.value; renderCard(); });
    div.querySelector(`#atk-desc-${i}`).addEventListener('input', e => { state.attacks[i].desc = e.target.value; renderCard(); });
  });
}

// ══════════════════════════════════════════════════════════
// ATTRIBUTES EDITOR
// ══════════════════════════════════════════════════════════
const ATTR_DEFS = [
  { key: 'combat', label: 'Combat Potential', icon: '⚔' },
  { key: 'agility', label: 'Agility', icon: '💨' },
  { key: 'health', label: 'Health', icon: '❤' },
];
function buildAttributesEditor() {
  const container = document.getElementById('attributes-editor');
  container.innerHTML = '';
  ATTR_DEFS.forEach(({ key, label, icon }) => {
    const div = document.createElement('div');
    div.className = 'attr-editor-row';
    div.innerHTML = `
      <span class="attr-ed-label">${label}</span>
      <div class="rating-btns">
        ${['C', 'B', 'A', 'S'].map(r => `
          <button class="rating-btn ${state.attrs[key] === r ? 'active' : ''}"
                  data-attr="${key}" data-rating="${r}">
            <img src="${__ASSET('classes/CLASS.' + r + '.webp')}" alt="${r}" class="class-icon-btn">
          </button>
        `).join('')}
      </div>`;
    container.appendChild(div);
  });
  container.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { attr, rating } = btn.dataset;
      state.attrs[attr] = rating;
      container.querySelectorAll(`.rating-btn[data-attr="${attr}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCard();
    });
  });
}

// ══════════════════════════════════════════════════════════
// IMAGE UPLOAD
// ══════════════════════════════════════════════════════════
function setupImageUpload() {
  const zone = document.getElementById('image-drop-zone');
  const input = document.getElementById('inp-image');
  const prev = document.getElementById('drop-preview');
  const ph = document.getElementById('drop-placeholder');
  const rmBtn = document.getElementById('btn-remove-img');
  const artRow = document.getElementById('art-style-row');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
  });
  input.addEventListener('change', () => { if (input.files[0]) loadImage(input.files[0]); });
  rmBtn.addEventListener('click', e => {
    e.stopPropagation();
    state.imageDataUrl = null;
    prev.style.display = 'none';
    ph.style.display = 'flex';
    rmBtn.style.display = 'none';
    artRow.style.display = 'none';
    input.value = '';
    renderCard();
  });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      state.imageDataUrl = ev.target.result;
      prev.src = ev.target.result;
      prev.style.display = 'block';
      ph.style.display = 'none';
      rmBtn.style.display = 'block';
      artRow.style.display = 'grid';
      renderCard();
    };
    reader.readAsDataURL(file);
  }
}

// ══════════════════════════════════════════════════════════
// CUSTOM FONT
// ══════════════════════════════════════════════════════════
function setupFontUpload() {
  const input = document.getElementById('inp-font');
  const uploadBtn = document.getElementById('btn-font-upload');
  const nameLabel = document.getElementById('font-name-display');
  const clearBtn = document.getElementById('btn-font-clear');
  const scopeBtns = document.querySelectorAll('.scope-btn');

  uploadBtn.addEventListener('click', () => input.click());

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      state.customFont = ev.target.result;

      // Inject @font-face
      const old = document.getElementById('_nmsCustomFont');
      if (old) old.remove();
      const style = document.createElement('style');
      style.id = '_nmsCustomFont';
      style.textContent = `@font-face { font-family:'NokemonCustom'; src:url('${ev.target.result}'); font-weight:normal; font-style:normal; }`;
      document.head.appendChild(style);

      nameLabel.textContent = file.name;
      clearBtn.style.display = 'block';
      renderCard();
    };
    reader.readAsDataURL(file);
  });

  clearBtn.addEventListener('click', () => {
    state.customFont = null;
    const old = document.getElementById('_nmsCustomFont');
    if (old) old.remove();
    input.value = '';
    nameLabel.textContent = 'No font loaded';
    clearBtn.style.display = 'none';
    renderCard();
  });

  scopeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      scopeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.fontScope = btn.dataset.scope;
      renderCard();
    });
  });
}

// ══════════════════════════════════════════════════════════
// FORM LISTENERS
// ══════════════════════════════════════════════════════════
function setupFormListeners() {
  ['inp-name', 'inp-hp', 'inp-rarity', 'inp-number', 'inp-img-style'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      if (id === 'inp-img-style') state.imageStyle = e.target.value;
      renderCard();
    });
  });
  const flavor = document.getElementById('inp-flavor');
  const counter = document.getElementById('flavor-counter');
  flavor.addEventListener('input', () => {
    counter.textContent = `${flavor.value.length} / 110`;
    renderCard();
  });
}

// ══════════════════════════════════════════════════════════
// RENDER CARD
// ══════════════════════════════════════════════════════════
function renderCard() {
  const card = document.getElementById('card');
  const type = state.currentType;
  const t = TYPES[type];

  // Type
  card.dataset.type = type;
  const typeBadge = document.getElementById('prev-type-icon');
  typeBadge.innerHTML = `<img src="${__ASSET(t.icon)}" alt="${t.name}" class="type-badge-img">`;
  document.getElementById('prev-type-tag').textContent = t.name;

  // Name
  const name = document.getElementById('inp-name').value.trim() || 'Creature Name';
  const nameEl = document.getElementById('prev-name');
  nameEl.textContent = name;

  // Custom font
  if (state.customFont) {
    const cf = "'NMSGeo', sans-serif";
    if (state.fontScope === 'name') {
      nameEl.style.fontFamily = cf;
      card.style.fontFamily = '';
    } else {
      // scope = 'card'
      nameEl.style.fontFamily = cf;
      card.style.fontFamily = "'NMSGeo', sans-serif";
    }
  } else {
    nameEl.style.fontFamily = '';
    card.style.fontFamily = '';
  }

  // HP
  document.getElementById('prev-hp').textContent = document.getElementById('inp-hp').value || '120';

  // Rarity / Class
  const rarLetter = RARITY_TO_LETTER[document.getElementById('inp-rarity').value] || 'A';
  const rarTag = document.getElementById('prev-rarity-tag');
  rarTag.innerHTML = `<img src="${__ASSET('classes/CLASS.' + rarLetter + '.webp')}" alt="${rarLetter}" class="class-icon-card">`;
  rarTag.className = 'illus-rarity-tag';

  // Card number
  document.getElementById('prev-num').textContent = document.getElementById('inp-number').value.trim() || '001';

  // Flavor
  const flavor = document.getElementById('inp-flavor').value.trim();
  document.getElementById('prev-flavor').textContent = flavor;

  // Image
  const illusInner = document.getElementById('prev-illus');
  const fullBg = document.getElementById('card-full-bg');

  if (state.imageDataUrl) {
    if (state.imageStyle === 'full') {
      fullBg.src = state.imageDataUrl;
      fullBg.style.display = 'block';
      card.classList.add('is-full-art');
      illusInner.innerHTML = `<div class="illus-empty" style="opacity:0"></div>`;
    } else {
      fullBg.style.display = 'none';
      card.classList.remove('is-full-art');
      let img = illusInner.querySelector('img');
      if (!img) {
        illusInner.innerHTML = '';
        img = document.createElement('img');
        img.alt = name;
        illusInner.appendChild(img);
      }
      img.src = state.imageDataUrl;
      img.style.display = 'block';
      img.style.objectFit = state.imageStyle === 'fit' ? 'contain' : 'cover';
    }
  } else {
    fullBg.style.display = 'none';
    card.classList.remove('is-full-art');
    illusInner.innerHTML = `<div class="illus-empty"><span>📷</span><p>Upload your creature</p></div>`;
  }

  // Attacks
  renderAttacks();
  // Attributes
  renderAttrs();

  // Card wrapper glow
  const glowMap = {
    fuego: 'rgba(255,100,0,0.4)', tropical: 'rgba(93,192,0,0.4)',
    anomalo: 'rgba(155,48,208,0.4)', toxico: 'rgba(212,176,0,0.4)',
    radioactivo: 'rgba(128,187,0,0.4)', desierto: 'rgba(156,99,32,0.4)',
    hielo: 'rgba(48,176,204,0.4)', mecanico: 'rgba(26,74,175,0.4)',
  };
  document.querySelector('.card-wrapper').style.filter =
    `drop-shadow(0 16px 50px ${glowMap[type]}) drop-shadow(0 0 30px ${glowMap[type]})`;
}

function renderAttacks() {
  const container = document.getElementById('prev-attacks');

  const typeIcon = __ASSET(TYPES[state.currentType].icon);
  const attackIcons = {
    tipo: typeIcon,
    normal: __ASSET('icons/attack_normal.avif'),
    escudo: __ASSET('icons/shield.avif'),
    reflector: __ASSET('icons/shield_reflector.avif'),
    vida: __ASSET('icons/health.avif')
  };

  container.innerHTML = '';
  state.attacks.forEach(atk => {
    const iconToUse = attackIcons[atk.attackType || 'tipo'];
    const row = document.createElement('div');
    row.className = 'attack-row';
    row.innerHTML = `
      <div class="attack-icon"><img src="${iconToUse}" alt="" class="attack-type-img"></div>
      <div class="attack-name">${atk.name || '—'}</div>
      <div class="attack-dmg">${atk.dmg !== '' ? atk.dmg : '—'}</div>
      <div class="attack-desc">${atk.desc || 'No description.'}</div>`;
    container.appendChild(row);
  });
}

function renderAttrs() {
  ['combat', 'agility', 'health'].forEach(key => {
    const el = document.getElementById(`prev-${key}`);
    const rating = state.attrs[key];
    el.innerHTML = `<img src="${__ASSET('classes/CLASS.' + rating + '.webp')}" alt="${rating}" class="class-icon-card">`;
    el.className = 'attr-rating';
  });
}

// ══════════════════════════════════════════════════════════
// DOWNLOAD
// ══════════════════════════════════════════════════════════
function setupDownload() {
  document.getElementById('btn-download').addEventListener('click', downloadCard);
}
async function downloadCard() {
  const btn = document.getElementById('btn-download');
  const card = document.getElementById('card');

  btn.classList.add('loading');
  btn.innerHTML = '<span>⏳</span> Generating...';

  try {
    // swap all images inside card to base64 before capture
    if (typeof ASSETS !== 'undefined') {
      card.querySelectorAll('img').forEach(img => {
        let src = img.getAttribute('src');
        if (src && ASSETS[src]) img.src = ASSETS[src];
      });
    }

    card.style.transform = 'none';
    card.classList.add('exporting');
    const canvas = await html2canvas(card, {
      scale: 4, useCORS: true, logging: false, backgroundColor: null,
    });
    card.classList.remove('exporting');
    card.style.transform = '';

    const slug = (document.getElementById('inp-name').value.trim() || 'nokemon-card')
      .toLowerCase().replace(/[^a-z0-9]/g, '-');
    const a = document.createElement('a');
    a.download = `${slug}-xeno-card.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch (err) {
    console.error('Download failed:', err);
    alert('Could not generate card image. Please try again.');
    card.style.transform = '';
  }

  btn.classList.remove('loading');
  btn.innerHTML = '<span>⬇</span> Download Card';
}
