document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const contentType = urlParams.get('type');
  const filename = urlParams.get('file');
  
  // If we're on template.html, load the specific content
  if (contentType && filename) {
    await loadTemplateContent(contentType, filename);
  }
  
  // Always load sidebar links
  await loadSidebarLinks();
});

async function loadSidebarLinks() {
  const currentPage = window.location.pathname.split('/').pop();
  const contentType = currentPage === 'tutorials.html' ? 'tutorial' : 
                     currentPage === 'wiki.html' ? 'wiki' : null;
  
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Load directory entries
  if (contentType) {
    const files = await loadDirectoryEntries(contentType);
    const links = files.map(entry => `
      <a href="template.html?type=${contentType}&file=${entry.file}">
        ${formatTitle(entry.title)}
      </a>
    `).join('');
    
    sidebar.querySelector('.tutorial-links').innerHTML = links;
  }
}

function formatTitle(title) {
  return title.replace(/-/g, ' ');
}

async function loadTemplateContent(contentType, filename) {
  try {
    const response = await fetch(`/content/${contentType}/${filename}.txt`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    
    // Process headings, blockquotes, and comment blocks
    const processedText = text
      // Process headings
      .replace(/^(#+)\s+(.+)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        return `<h${level}>${title}</h${level}>`;
      })
      // Process blockquotes
      .replace(/^>\s+(.+)$/gm, (match, content) => {
        return `<blockquote>${content}</blockquote>`;
      })
      // Process comment blocks
      .replace(/^>\/([\s\S]*?)\/>/gm, (match, content) => {
        return `<div class="comment-block">${content}</div>`;
      });
    
    // Update main content
    document.getElementById('content').innerHTML = `<pre>${processedText}</pre>`;
    
    // Update title
    const titleMatch = text.match(/^#\s+(.+)$/m);
    const title = titleMatch ? formatTitle(titleMatch[1]) : formatTitle(filename);
    document.title = `${title} - BO3 Mods`;

    // Load both directories
    const sidebar = document.querySelector('.sidebar');
    sidebar.innerHTML = `
      <h2>Navigation</h2>
      <div class="sidebar-links">
        <h3>Tutorials</h3>
        <div class="tutorial-links" id="tutorial-links"></div>
        <hr class="sidebar-divider">
        <h3>Wiki</h3>
        <div class="wiki-links" id="wiki-links"></div>
      </div>
    `;

    // Load and populate tutorial entries
    const tutorialFiles = await loadDirectoryEntries('tutorial');
    document.getElementById('tutorial-links').innerHTML = tutorialFiles
      .map(entry => `
        <a href="template.html?type=tutorial&file=${entry.file}" 
           class="${contentType === 'tutorial' && entry.file === filename ? 'active' : ''}">
           ${formatTitle(entry.title)}
        </a>
      `).join('');

    // Load and populate wiki entries
    const wikiFiles = await loadDirectoryEntries('wiki');
    document.getElementById('wiki-links').innerHTML = wikiFiles
      .map(entry => `
        <a href="template.html?type=wiki&file=${entry.file}"
           class="${contentType === 'wiki' && entry.file === filename ? 'active' : ''}">
           ${formatTitle(entry.title)}
        </a>
      `).join('');

  } catch (error) {
    console.error('Failed to load content:', error);
    document.getElementById('content').innerHTML = '<h1>Content Not Found</h1>';
  }
}

async function loadDirectoryEntries(type) {
  const entries = [];
  const response = await fetch(`/content/${type}/`);
  const files = await response.text();
  
  // Parse directory listing for .md files
  const parser = new DOMParser();
  const doc = parser.parseFromString(files, 'text/html');
  const links = Array.from(doc.querySelectorAll('a'))
    .filter(a => a.href.endsWith('.txt'))
    .map(entry => ({
      file: entry.href.split('/').pop().replace('.txt', ''),
      title: entry.textContent
    }));

  // Load each file to get its title
  for (const link of links) {
    const content = await fetch(`/content/${type}/${link.file}.txt`).then(r => r.text());
    const titleMatch = content.match(/^#\s+(.+)$/m);
    entries.push({
      file: link.file,
      title: titleMatch ? titleMatch[1] : link.file
    });
  }

  return entries;
} 