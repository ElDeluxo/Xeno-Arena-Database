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

const SUPABASE_URL = (typeof ENV !== 'undefined') ? ENV.SUPABASE_URL : '';
const SUPABASE_ANON_KEY = (typeof ENV !== 'undefined') ? ENV.SUPABASE_ANON_KEY : '';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', loadGallery);

async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  const loading = document.getElementById('loading');

  try {
    const { data, error } = await supabaseClient
      .from('nokemons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loading.style.display = 'none';

    if (data.length === 0) {
      grid.innerHTML = '<div style="color:#aaa; grid-column: 1/-1; text-align:center;">No discoveries recorded in this sector.</div>';
      return;
    }

    data.forEach(item => {
      if (!item.card_image) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'gallery-item';
      wrapper.innerHTML = `<img src="${item.card_image}" style="width:350px; border-radius:10px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
      grid.appendChild(wrapper);
    });

  } catch (err) {
    loading.innerText = 'ATLAS CONNECTION ERROR: ' + err.message;
  }
}
