// script.js
const poke_container = document.getElementById('poke-container');
const searchInput = document.querySelector('.search-input');
const typeFilter = document.querySelector('.type-filter');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const loader = document.querySelector('.loader');
const pokemon_count = 150;

const colors = {
  fire: '#FF6B6B',
  grass: '#7BC74D',
  water: '#4D9DE0',
  electric: '#FFD93D',
  psychic: '#FF9B85',
  ice: '#96D9D6',
  dragon: '#6F35FC',
  dark: '#705746',
  fairy: '#F469A9',
  normal: '#A8A77A',
  fighting: '#C22E28',
  flying: '#A98FF3',
  poison: '#A33EA1',
  ground: '#E2BF65',
  rock: '#B6A136',
  bug: '#A6B91A',
  ghost: '#735797',
  steel: '#B7B7CE',
};

let allPokemon = [];

const fetchPokemons = async () => {
  try {
    for (let i = 1; i <= pokemon_count; i++) {
      await getPokemon(i);
    }
    populateTypeFilter();
    loader.style.display = 'none';
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    loader.textContent = 'Failed to load Pokémon';
  }
};

const getPokemon = async (id) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  allPokemon.push(data);
  createPokemonCard(data);
};

const createPokemonCard = (pokemon) => {
  const pokemonEl = document.createElement('div');
  pokemonEl.classList.add('pokemon');
  
  const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
  const id = pokemon.id.toString().padStart(3, '0');
  const types = pokemon.types.map(type => type.type.name);
  const mainType = types[0];
  const color = colors[mainType] || '#777';

  pokemonEl.innerHTML = `
    <div class="img-container">
      <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${name}">
    </div>
    <div class="info">
      <span class="number">#${id}</span>
      <h3 class="name">${name}</h3>
      <div class="types">${types.map(type => `
        <span class="type" style="background: ${colors[type]}">${type}</span>
      `).join('')}</div>
    </div>
  `;

  pokemonEl.style.border = `3px solid ${color}`;
  pokemonEl.addEventListener('click', () => showModal(pokemon));
  poke_container.appendChild(pokemonEl);
};

const populateTypeFilter = () => {
  const types = [...new Set(allPokemon.flatMap(p => p.types.map(t => t.type.name)))];
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });
};

const filterPokemon = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;
  
  poke_container.innerHTML = '';
  
  allPokemon.filter(pokemon => {
    const matchesSearch = pokemon.name.includes(searchTerm) || 
      pokemon.id.toString().includes(searchTerm);
    const matchesType = selectedType === 'all' || 
      pokemon.types.some(t => t.type.name === selectedType);
    return matchesSearch && matchesType;
  }).forEach(createPokemonCard);
};

const showModal = (pokemon) => {
  const types = pokemon.types.map(type => type.type.name);
  const stats = pokemon.stats.map(stat => ({
    name: stat.stat.name,
    value: stat.base_stat
  }));

  modalContent.innerHTML = `
    <div class="modal-header" style="border-color: ${colors[types[0]]}">
      <h2>${pokemon.name.toUpperCase()}</h2>
      <span class="number">#${pokemon.id.toString().padStart(3, '0')}</span>
    </div>
    <div class="modal-body">
      <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
      <div class="stats">
        ${stats.map(stat => `
          <div class="stat">
            <span class="stat-name">${stat.name}</span>
            <div class="stat-bar">
              <div class="stat-progress" style="width: ${stat.value}%; background: ${colors[types[0]]};"></div>
            </div>
            <span class="stat-value">${stat.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.add('active');
};

// Event Listeners
searchInput.addEventListener('input', filterPokemon);
typeFilter.addEventListener('change', filterPokemon);
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('active');
});

// Initialize
fetchPokemons();