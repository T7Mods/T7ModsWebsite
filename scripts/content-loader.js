document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const contentType = urlParams.get('type');
  const filename = urlParams.get('file');
  
  if (window.location.pathname.includes('docs.html') || 
      window.location.pathname.includes('template.html')) {
    await loadSidebarLinks(contentType, filename);
  }
  
  if (contentType && filename) {
    await loadTemplateContent(contentType, filename);
  }

  // Remove skeleton loaders when content is loaded
  document.querySelectorAll('.skeleton').forEach(skeleton => {
    skeleton.remove();
  });
});

async function loadSidebarLinks(activeType, activeFile) {
  try {
    let sidebarContent = '';
    const contentTypes = ['docs', 'wiki', 'tutorials'];
    const basePath = window.location.pathname.includes('template.html') ? '../' : '';

    for (const type of contentTypes) {
      try {
        const response = await fetch(`${basePath}content/${type}/`);
        if (!response.ok) continue;
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const files = Array.from(doc.querySelectorAll('a'))
          .filter(a => a.href.endsWith('.txt'))
          .map(a => ({
            name: a.href.split('/').pop().replace('.txt', ''),
            title: formatTitle(a.href.split('/').pop().replace('.txt', ''))
          }));

        if (files.length > 0) {
          sidebarContent += `
            <h2>${formatTitle(type)}</h2>
            ${files.map(file => `
              <a href="${basePath}template.html?type=${type}&file=${file.name}" 
                 class="${activeType === type && activeFile === file.name ? 'active' : ''}">${file.title}</a>
            `).join('')}
          `;
        }
      } catch (error) {
        console.log(`No content found for ${type}`);
        continue;
      }
    }

    const sidebarElement = document.querySelector('.doc-links') || document.querySelector('#sidebar-links');
    if (sidebarElement) {
      sidebarElement.innerHTML = sidebarContent;
    }
  } catch (error) {
    console.error('Error loading sidebar:', error);
  }
}

function formatTitle(filename) {
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function loadTemplateContent(contentType, filename) {
  try {
    const basePath = window.location.pathname.includes('template.html') ? '../' : '';
    const response = await fetch(`${basePath}content/${contentType}/${filename}.txt`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let text = await response.text();
    
    // Just remove frontmatter without adding timestamp
    text = text.replace(/^---[\s\S]*?---\s*\n+/, '');
    
    // Process the rest of the markdown
    text = text
      // Handle headers first
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      
      // Handle double dashes
      .replace(/--(.+?)--/g, '<span class="italic-text">$1</span>')
      
      // Handle code comments
      .replace(/^\/\/ (.+)$/gm, '<code>$1</code>')
      
      // Handle block comments
      .replace(/\/\*([\s\S]*?)\*\//g, (match, content) => {
        const lines = content.trim().split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        return `<pre class="block-comment">${lines.join('\n')}</pre>`;
      })
      
      // Handle download buttons
      .replace(/<dl>(.*?)<\/dl>/g, '<a href="$1" class="download-link">Download <i class="fas fa-download"></i></a>')
      
      // Handle visit buttons
      .replace(/<visit>(.*?)<\/visit>/g, '<a href="$1" class="visit-link">Visit <i class="fas fa-external-link-alt"></i></a>')
      
      // Handle images and gifs
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="content-image">');

    document.getElementById('content').innerHTML = text;
    document.title = `${formatTitle(filename)} - BO3 Mods`;
    
  } catch (error) {
    console.error('Error loading content:', error);
    document.getElementById('content').innerHTML = `
      <h1>Error</h1>
      <p>Failed to load content. Please try again later.</p>
    `;
  }
} 