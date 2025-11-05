// === DATOS DE EJEMPLO ===
const flowers = [
  {id:1,name:'Jinu',color:'Rojo',desc:'Es el líder del grupo, e incluso se menciona la inspiración detrás de su diseño',img:'https://ella.janitorai.com/bot-avatars/6qhqNNYZyn9pQZl3l1awT.webp?width=1200',tags:['romántica','clásica']},
  {id:2,name:'Abby',color:'Amarillo',desc:'Es uno de los personajes de Saja Boys, interpretado por el actor SungWon Cho en la voz original.',img:'https://media.tenor.com/hVA454BqwkYAAAAe/saja-boys-abby-saja.png',tags:['primavera','vibrante']},
  {id:3,name:'Romance',color:'Amarillo',desc:'Antagonista secundario que se disfraza de ídolo del K-Pop, con la voz de Joel Kim Booster.',img:'https://static.wikia.nocookie.net/kpop-demon-hunters/images/f/fe/Romanceportrait.jpeg',tags:['verano','campo']},
  {id:4,name:'Baby',color:'Morado',desc:'Es otro de los Saja Boys.',img:'https://static.wikia.nocookie.net/kpop-demon-hunters/images/2/2d/Babyportrait.jpeg',tags:['exótica','elegante']},
  {id:5,name:'Mystery',color:'Blanco',desc:'Completa la lista de los nombres de los miembros de la banda.',img:'https://static.wikia.nocookie.net/sonypicturesanimation/images/2/20/Mysterysaja.jpg',tags:['clásica','serena']},
];

// === REFERENCIAS DOM ===
const grid = document.getElementById('grid');
const filter = document.getElementById('filter');
const search = document.getElementById('search');
const empty = document.getElementById('empty');

// === LLENAR SELECT DE COLORES ===
const colors = Array.from(new Set(flowers.map(f => f.color)));
colors.forEach(c => {
  const o = document.createElement('option');
  o.value = c;
  o.textContent = c;
  filter.appendChild(o);
});

// === FUNCIÓN PARA VALIDAR IMÁGENES ===
async function checkImage(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// === RENDERIZAR TARJETAS ===
async function render(list) {
  grid.innerHTML = '';
  if (list.length === 0) {
    empty.style.display = 'block';
    return;
  } else {
    empty.style.display = 'none';
  }

  for (const f of list) {
    const card = document.createElement('article');
    card.className = 'card';

    // Verifica si la imagen carga correctamente
    const validImg = await checkImage(f.img);
    const imgUrl = validImg ? f.img : 'https://via.placeholder.com/300x200?text=Sin+imagen';

    const th = document.createElement('div');
    th.className = 'thumb';
    th.style.backgroundImage = `url('${imgUrl}')`;
    th.style.backgroundSize = 'cover';
    th.style.backgroundPosition = 'center';
    th.style.backgroundRepeat = 'no-repeat';

    const body = document.createElement('div');
    body.className = 'card-body';

    const tr = document.createElement('div');
    tr.className = 'title-row';

    const name = document.createElement('div');
    name.innerHTML = `<div class="flower-name">${f.name}</div><div class="flower-sub">${f.color}</div>`;

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn';
    viewBtn.textContent = 'Ver';
    viewBtn.addEventListener('click', () => openModal(f));

    tr.appendChild(name);
    tr.appendChild(viewBtn);

    const desc = document.createElement('div');
    desc.className = 'flower-sub';
    desc.textContent = f.desc;

    const tags = document.createElement('div');
    tags.className = 'tags';
    f.tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      tags.appendChild(span);
    });

    body.appendChild(tr);
    body.appendChild(desc);
    body.appendChild(tags);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const fav = document.createElement('button');
    fav.className = 'btn';
    fav.textContent = '♥';
    fav.title = 'Favorito (no persistente)';
    fav.onclick = () => fav.classList.toggle('active');

    footer.appendChild(fav);
    card.appendChild(th);
    card.appendChild(body);
    card.appendChild(footer);
    grid.appendChild(card);
  }
}

// === FILTROS ===
function applyFilters() {
  const q = search.value.trim().toLowerCase();
  const c = filter.value;
  const res = flowers.filter(f => {
    const matchesQuery =
      f.name.toLowerCase().includes(q) ||
      f.color.toLowerCase().includes(q) ||
      f.tags.join(' ').toLowerCase().includes(q);
    const matchesColor = c === 'all' || f.color === c;
    return matchesQuery && matchesColor;
  });
  render(res);
}

search.addEventListener('input', applyFilters);
filter.addEventListener('change', applyFilters);

// === MODAL ===
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const mTitle = document.getElementById('mTitle');
const mDesc = document.getElementById('mDesc');
const mTags = document.getElementById('mTags');
const closeModalBtn = document.getElementById('closeModal');
const backdrop = document.getElementById('backdrop');

function openModal(f) {
  modal.style.display = 'flex';
  modalImg.style.backgroundImage = `url(${f.img})`;
  modalImg.style.backgroundSize = 'cover';
  modalImg.style.backgroundPosition = 'center';
  mTitle.textContent = `${f.name} — ${f.color}`;
  mDesc.textContent = f.desc;
  mTags.innerHTML = '';
  f.tags.forEach(t => {
    const s = document.createElement('span');
    s.className = 'tag';
    s.style.marginRight = '6px';
    s.textContent = t;
    mTags.appendChild(s);
  });
}

function closeModal() {
  modal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);

// === TEMA OSCURO / CLARO ===
const tBtn = document.getElementById('toggleTheme');
let dark = false;
tBtn.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.style.setProperty('--bg', dark ? '#0b1220' : '#f7f7fb');
  document.documentElement.style.setProperty('--card', dark ? '#0f1724' : '#ffffff');
  document.documentElement.style.setProperty('--text', dark ? '#e6eef8' : '#222');
  tBtn.textContent = dark ? '☀️' : '🌙';
});

// === INICIAL ===
render(flowers);
