// Helper functions
function formatDownloads(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Mock data for testing (replace with your actual data later)
const mockAssets = [
  {
    id: "ray-gun-mk3",
    name: "Ray Gun Mark III",
    category: "Weapons",
    author: "Username",
    downloads: 1200,
    previewImage: "/assets/previews/weapon1.jpg",
    updated: "2024-03-20"
  },
  {
    id: "zombie-model",
    name: "Custom Zombie",
    category: "Character Models",
    author: "ModderPro",
    downloads: 800,
    previewImage: "/assets/previews/zombie1.jpg",
    updated: "2024-03-19"
  }
];

// Main functionality
document.addEventListener('DOMContentLoaded', async () => {
  const assetsGrid = document.querySelector('.assets-grid');
  const filterSelect = document.querySelector('.filter-select');
  const categoryLinks = document.querySelectorAll('.doc-links a');
  
  let assets = [];
  let currentCategory = 'all';
  
  // Load assets
  try {
    const response = await fetch('/content/assets/index.json');
    assets = await response.json();
    
    // Initial render with newest first
    const sortedAssets = sortAssets(assets, 'newest');
    renderAssets(sortedAssets);
    
    // Handle sorting
    filterSelect.addEventListener('change', (e) => {
      const sortedAssets = sortAssets(assets, e.target.value);
      renderAssets(sortedAssets);
    });
    
    // Handle category filtering
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active state
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Get category from text
        const category = link.textContent.toLowerCase();
        currentCategory = category === 'all assets' ? 'all' : category;
        
        // Filter and render
        const filteredAssets = filterAssets(assets, currentCategory);
        const sortedAssets = sortAssets(filteredAssets, filterSelect.value);
        renderAssets(sortedAssets);
      });
    });
    
  } catch (error) {
    console.error('Error loading assets:', error);
    assetsGrid.innerHTML = '<div class="error-message">Failed to load assets</div>';
  }
});

function filterAssets(assets, category) {
  if (category === 'all') return assets;
  return assets.filter(asset => asset.category.toLowerCase() === category);
}

function sortAssets(assets, sortBy) {
  const sortedAssets = [...assets];
  
  switch(sortBy) {
    case 'newest':
      return sortedAssets.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    case 'oldest':
      return sortedAssets.sort((a, b) => new Date(a.updated) - new Date(b.updated));
    case 'name':
      return sortedAssets.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sortedAssets;
  }
}

function renderAssets(assets) {
  const assetsGrid = document.querySelector('.assets-grid');
  
  if (assets.length === 0) {
    assetsGrid.innerHTML = `
      <div class="no-assets">
        <i class="fas fa-box-open"></i>
        <p>No assets found</p>
      </div>
    `;
    return;
  }
  
  assetsGrid.innerHTML = assets.map(asset => `
    <div class="asset-card">
      <a href="/assets/${asset.id}">
        <div class="asset-preview">
          <img src="${asset.previewImage}" alt="${asset.name}">
        </div>
        <div class="asset-info">
          <h3>${asset.name}</h3>
          <span class="asset-category">${asset.category}</span>
          <div class="asset-meta">
            <span class="asset-author">by ${asset.author}</span>
          </div>
        </div>
      </a>
    </div>
  `).join('');
}

// Setup filters and search using the fetched assets
let currentAssets = []; // Store fetched assets globally

async function setupFilters() {
  const filterSelect = document.querySelector('.filter-select');
  filterSelect.addEventListener('change', (e) => {
    let sorted = [...currentAssets];
    switch(e.target.value) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.updated) - new Date(b.updated));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    renderAssets(sorted);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('assetSearch');
  const categoryLinks = document.querySelectorAll('.doc-links a');

  searchInput.addEventListener('input', debounce((e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = currentAssets.filter(asset => 
      asset.name.toLowerCase().includes(searchTerm) ||
      asset.category.toLowerCase().includes(searchTerm) ||
      asset.author.toLowerCase().includes(searchTerm)
    );
    renderAssets(filtered);
  }, 300));

  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = e.target.textContent;
      
      categoryLinks.forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');

      const filtered = category === 'All Assets' 
        ? currentAssets 
        : currentAssets.filter(asset => asset.category === category);
      renderAssets(filtered);
    });
  });
} 