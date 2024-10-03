const wikiData = {
    categories: [
        {
            name: "Getting Started",
            subcategories: [
                {
                    name: "Installation",
                    articles: [
                        {
                            title: "Installing BO3 Mod Tools",
                            content: "Step-by-step guide to install BO3 Mod Tools..."
                        },
                        {
                            title: "Setting Up Your Development Environment",
                            content: "How to set up your development environment for BO3 modding..."
                        }
                    ]
                },
                {
                    name: "Basics",
                    articles: [
                        {
                            title: "Understanding BO3 Mod Structure",
                            content: "An overview of the BO3 mod file structure..."
                        },
                        {
                            title: "Creating Your First Mod",
                            content: "A tutorial on creating your first BO3 mod..."
                        }
                    ]
                }
            ]
        },
        {
            name: "Advanced Topics",
            subcategories: [
                {
                    name: "Scripting",
                    articles: [
                        {
                            title: "GSC Scripting Basics",
                            content: "An introduction to GSC scripting in BO3..."
                        },
                        {
                            title: "Advanced GSC Techniques",
                            content: "Advanced GSC scripting techniques for BO3 mods..."
                        }
                    ]
                },
                {
                    name: "Asset Creation",
                    articles: [
                        {
                            title: "Creating Custom Weapons",
                            content: "A guide to creating custom weapons for BO3..."
                        },
                        {
                            title: "Map Design Principles",
                            content: "Best practices for designing maps in BO3..."
                        }
                    ]
                }
            ]
        }
    ]
};

function renderSidebar() {
    const sidebar = document.querySelector('.wiki-sidebar');
    let html = '<ul>';
    wikiData.categories.forEach(category => {
        html += `<li><a href="#" class="category-link" data-category="${category.name}">${category.name}</a><ul>`;
        category.subcategories.forEach(subcategory => {
            html += `<li><a href="#" class="subcategory-link" data-category="${category.name}" data-subcategory="${subcategory.name}">${subcategory.name}</a></li>`;
        });
        html += '</ul></li>';
    });
    html += '</ul>';
    sidebar.innerHTML = html;

    // Add event listeners to category and subcategory links
    document.querySelectorAll('.category-link, .subcategory-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            const subcategory = e.target.dataset.subcategory;
            if (subcategory) {
                renderSubcategory(category, subcategory);
            } else {
                renderCategory(category);
            }
        });
    });
}

function renderCategory(categoryName) {
    const category = wikiData.categories.find(cat => cat.name === categoryName);
    const content = document.querySelector('.wiki-content');
    let html = `<h1>${categoryName}</h1><ul>`;
    category.subcategories.forEach(subcategory => {
        html += `<li><a href="#" class="subcategory-link" data-category="${categoryName}" data-subcategory="${subcategory.name}">${subcategory.name}</a></li>`;
    });
    html += '</ul>';
    content.innerHTML = html;
    updateBreadcrumb([categoryName]);
}

function renderSubcategory(categoryName, subcategoryName) {
    const category = wikiData.categories.find(cat => cat.name === categoryName);
    const subcategory = category.subcategories.find(subcat => subcat.name === subcategoryName);
    const content = document.querySelector('.wiki-content');
    let html = `<h1>${subcategoryName}</h1><ul>`;
    subcategory.articles.forEach(article => {
        html += `<li><a href="#" class="article-link" data-category="${categoryName}" data-subcategory="${subcategoryName}" data-article="${article.title}">${article.title}</a></li>`;
    });
    html += '</ul>';
    content.innerHTML = html;
    updateBreadcrumb([categoryName, subcategoryName]);

    // Add event listeners to article links
    document.querySelectorAll('.article-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const article = subcategory.articles.find(a => a.title === e.target.dataset.article);
            renderArticle(categoryName, subcategoryName, article);
        });
    });
}

function renderArticle(categoryName, subcategoryName, article) {
    const content = document.querySelector('.wiki-content');
    content.innerHTML = `
        <h1>${article.title}</h1>
        <div class="article-content">${article.content}</div>
        <button id="edit-article">Edit Article</button>
    `;
    updateBreadcrumb([categoryName, subcategoryName, article.title]);

    // Add event listener to edit button
    document.getElementById('edit-article').addEventListener('click', () => {
        editArticle(categoryName, subcategoryName, article);
    });
}

function updateBreadcrumb(path) {
    const breadcrumb = document.querySelector('.wiki-breadcrumb');
    let html = '<a href="#" class="breadcrumb-home">Home</a>';
    path.forEach((item, index) => {
        html += ` > <a href="#" class="breadcrumb-link" data-index="${index}">${item}</a>`;
    });
    breadcrumb.innerHTML = html;

    // Add event listeners to breadcrumb links
    document.querySelectorAll('.breadcrumb-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(e.target.dataset.index);
            const newPath = path.slice(0, index + 1);
            if (newPath.length === 1) {
                renderCategory(newPath[0]);
            } else if (newPath.length === 2) {
                renderSubcategory(newPath[0], newPath[1]);
            } else {
                const category = wikiData.categories.find(cat => cat.name === newPath[0]);
                const subcategory = category.subcategories.find(subcat => subcat.name === newPath[1]);
                const article = subcategory.articles.find(a => a.title === newPath[2]);
                renderArticle(newPath[0], newPath[1], article);
            }
        });
    });
}

function searchWiki() {
    const searchInput = document.getElementById('wiki-search-input');
    const searchTerm = searchInput.value.toLowerCase();

    const results = wikiData.categories.flatMap(category =>
        category.subcategories.flatMap(subcategory =>
            subcategory.articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm)
            ).map(article => ({
                category: category.name,
                subcategory: subcategory.name,
                article: article
            }))
        )
    );

    const content = document.querySelector('.wiki-content');
    let html = '<h1>Search Results</h1>';
    if (results.length > 0) {
        html += '<ul>';
        results.forEach(result => {
            html += `<li><a href="#" class="search-result" data-category="${result.category}" data-subcategory="${result.subcategory}" data-article="${result.article.title}">${result.article.title}</a></li>`;
        });
        html += '</ul>';
    } else {
        html += '<p>No results found.</p>';
    }
    content.innerHTML = html;

    // Add event listeners to search results
    document.querySelectorAll('.search-result').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const { category, subcategory, article } = e.target.dataset;
            const articleObj = wikiData.categories
                .find(cat => cat.name === category)
                .subcategories.find(subcat => subcat.name === subcategory)
                .articles.find(a => a.title === article);
            renderArticle(category, subcategory, articleObj);
        });
    });
}

function editArticle(categoryName, subcategoryName, article) {
    const content = document.querySelector('.wiki-content');
    content.innerHTML = `
        <h1>Edit Article: ${article.title}</h1>
        <textarea id="article-content" rows="20"
    `;
}