document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const assetId = urlParams.get('id');
  
  if (!assetId) {
    window.location.href = '/404.html';
    return;
  }

  try {
    const response = await fetch('/content/assets/index.json');
    const assets = await response.json();
    const asset = assets.find(a => a.id === assetId);

    if (!asset) {
      window.location.href = '/404.html';
      return;
    }

    // Update page content
    document.title = `${asset.name} - T7Mods`;
    
    // Update header info
    document.getElementById('assetTitle').textContent = asset.name;
    document.getElementById('assetCategory').textContent = asset.category;
    document.getElementById('assetAuthor').textContent = `by ${asset.author}`;

    // Update preview section
    const previewSection = document.querySelector('.asset-preview-large');
    previewSection.innerHTML = `
      <img src="${asset.previewImage}" alt="${asset.name}" class="main-preview">
    `;

    // Update description
    document.querySelector('.asset-description').textContent = asset.description || '';

    // Setup download button
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (!asset.downloadUrl) {
        alert('Download link not available');
        return;
      }
      window.location.href = asset.downloadUrl;
    });

  } catch (error) {
    console.error('Error:', error);
    document.querySelector('.asset-content').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        Failed to load asset. Please try again later.
      </div>
    `;
  }
}); 