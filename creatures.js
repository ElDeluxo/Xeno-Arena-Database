const __ASSET = path => (typeof ASSETS !== 'undefined' && ASSETS[path]) ? ASSETS[path] : path;

const TYPES = {
    fire: { name: 'FIRE', icon: 'icons/fire.avif' },
    tropical: { name: 'TROPICAL', icon: 'icons/tropical.avif' },
    anomalous: { name: 'ANOMALOUS', icon: 'icons/anomalous.avif' },
    toxic: { name: 'TOXIC', icon: 'icons/toxic.avif' },
    radioactive: { name: 'RADIOACTIVE', icon: 'icons/radioactive.avif' },
    desert: { name: 'DESERT', icon: 'icons/desert.avif' },
    ice: { name: 'ICE', icon: 'icons/cold.avif' },
    mechanical: { name: 'MECHANICAL', icon: 'icons/mecanical.avif' },
};

const RATINGS = { 'C': 1, 'B': 2, 'A': 3, 'S': 4 };

const SUPABASE_URL = (typeof ENV !== 'undefined') ? ENV.SUPABASE_URL : '';
const SUPABASE_ANON_KEY = (typeof ENV !== 'undefined') ? ENV.SUPABASE_ANON_KEY : '';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let originalData = [];
let displayData = [];
let sortConfig = { key: null, direction: 'asc' };

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    document.getElementById('search-input').addEventListener('input', handleSearch);
});

async function loadData() {
    const loading = document.getElementById('loading');
    const tableBody = document.getElementById('table-body');
    const resultsCount = document.getElementById('results-count');

    try {
        const { data, error } = await supabaseClient
            .from('nokemons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        originalData = data.map(item => {
            const combat = RATINGS[item.attributes?.combat] || 0;
            const agility = RATINGS[item.attributes?.agility] || 0;
            return {
                ...item,
                combat_val: combat,
                agility_val: agility,
                strength_val: (combat + agility) / 2,
                hp_val: parseInt(item.hp) || 0
            };
        });

        displayData = [...originalData];
        loading.style.display = 'none';
        renderTable();
        updateCount();

    } catch (err) {
        loading.innerText = 'ATLAS CONNECTION ERROR: ' + err.message;
        console.error(err);
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (displayData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--dim);">NO RECORDS MATCHING SEARCH CRITERIA</td></tr>';
        return;
    }

    displayData.forEach(item => {
        const typeInfo = TYPES[item.type] || { name: 'UNKNOWN', icon: '' };
        const row = document.createElement('tr');

        row.innerHTML = `
            <td style="color: var(--teal); font-weight: bold;">${item.name || 'Unnamed'}</td>
            <td>
                <div class="type-cell">
                    <img src="${__ASSET(typeInfo.icon)}" class="type-icon-small">
                    <span>${typeInfo.name}</span>
                </div>
            </td>
            <td>
                <div style="display:flex; align-items:center; gap:5px;">
                    <div style="height:4px; width:50px; background:rgba(77,207,207,0.1); border-radius:2px; overflow:hidden;">
                        <div style="height:100%; width:${(item.strength_val / 4) * 100}%; background:var(--teal); box-shadow:0 0 10px var(--teal);"></div>
                    </div>
                    <span style="font-size:10px;">${item.strength_val.toFixed(1)}</span>
                </div>
            </td>
            <td>${item.hp || '0'} HP</td>
            <td><span class="rating-badge rank-${item.attributes?.combat || 'C'}">${item.attributes?.combat || 'C'}</span></td>
            <td><span class="rating-badge rank-${item.attributes?.agility || 'C'}">${item.attributes?.agility || 'C'}</span></td>
            <td style="font-size: 11px; color: var(--dim);">${item.location || 'Unknown Sector'}</td>
        `;
        tbody.appendChild(row);
    });
}

function handleSearch(e) {
    const term = e.target.value.toLowerCase();
    displayData = originalData.filter(item =>
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term)) ||
        (item.type && item.type.toLowerCase().includes(term))
    );
    renderTable();
    updateCount();
}

function sortTable(key) {
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }

    document.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-active');
        if (th.innerText.toLowerCase().includes(key)) th.classList.add('sort-active');
    });

    displayData.sort((a, b) => {
        let valA, valB;

        if (key === 'name') {
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        } else if (key === 'type') {
            valA = (a.type || '').toLowerCase();
            valB = (b.type || '').toLowerCase();
        } else if (key === 'hp') {
            valA = a.hp_val;
            valB = b.hp_val;
        } else if (key === 'strength') {
            valA = a.strength_val;
            valB = b.strength_val;
        } else if (key === 'combat') {
            valA = a.combat_val;
            valB = b.combat_val;
        } else if (key === 'agility') {
            valA = a.agility_val;
            valB = b.agility_val;
        } else if (key === 'location') {
            valA = (a.location || '').toLowerCase();
            valB = (b.location || '').toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderTable();
}

function updateCount() {
    const countEl = document.getElementById('results-count');
    countEl.innerText = `${displayData.length} SPECIES RECORDED IN THIS SECTOR`;
}
