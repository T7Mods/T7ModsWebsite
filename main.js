const heroImages = [
    '../bo3_mods/images/slideshow_1.jpg',
    '../bo3_mods/images/slideshow_2.jpg',
    '../bo3_mods/images/slideshow_3.jpg',
    '../bo3_mods/images/slideshow_4.jpg'
];

let currentImageIndex = 0;

function cycleHeroImages() {
    const heroImagesContainer = document.querySelector('.hero-images');
    heroImagesContainer.innerHTML = '';

    heroImages.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Hero image ${index + 1}`;
        img.className = index === 0 ? 'active' : '';
        heroImagesContainer.appendChild(img);
    });

    setInterval(() => {
        const images = document.querySelectorAll('.hero-images img');
        images[currentImageIndex].classList.remove('active');
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].classList.add('active');
    }, 5000); // Change image every 5 seconds
}

document.addEventListener('DOMContentLoaded', () => {
    cycleHeroImages();
    if (document.querySelector('.mod-grid')) {
        renderFeaturedMods();
    }
    if (document.querySelector('.forum-container')) {
        renderForumCategories();
        renderForumPosts();
    }

    const createPostForm = document.querySelector('.create-post-form');
    const createPostSection = document.querySelector('.create-post');
    if (createPostSection) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            createPostSection.style.display = 'block';
        } else {
            createPostSection.style.display = 'none';
        }
    }

    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.querySelector('#post-title').value;
            const content = document.querySelector('#post-content').value;
            const categoryId = document.querySelector('#post-category').value;

            try {
                const success = await createForumPost(title, content, categoryId);
                if (success) {
                    console.log('Post created successfully');
                    alert('Post created successfully!');
                    // Clear the form
                    document.querySelector('#post-title').value = '';
                    document.querySelector('#post-content').value = '';
                    // Refresh the forum posts
                    renderForumPosts(categoryId);
                }
            } catch (error) {
                console.error('Failed to create post:', error);
                alert(`Failed to create post: ${error.message}`);
            }
        });
    }
});

// Sample data for featured mods
const featuredMods = [
    { title: "Zombie Chronicles Remastered", author: "ModMaster", image: "path/to/mod1.jpg" },
    { title: "Custom Weapons Pack", author: "WeaponGuru", image: "path/to/mod2.jpg" },
    { title: "Enhanced Graphics Overhaul", author: "VisualWizard", image: "path/to/mod3.jpg" },
    { title: "New Multiplayer Maps", author: "MapCreator", image: "path/to/mod4.jpg" }
];

// Sample data for latest forum posts
const latestPosts = [
    { title: "How to install mods?", author: "NewModder", date: "2023-04-15" },
    { title: "Best zombies mods 2023", author: "ZombiesFan", date: "2023-04-14" },
    { title: "Multiplayer balance patch discussion", author: "BalanceGuru", date: "2023-04-13" }
];

function renderFeaturedMods() {
    const modGrid = document.querySelector('.mod-grid');
    featuredMods.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'mod-card';
        modCard.innerHTML = `
            <img src="${mod.image}" alt="${mod.title}">
            <h3>${mod.title}</h3>
            <p>By ${mod.author}</p>
        `;
        modGrid.appendChild(modCard);
    });
}

function renderLatestPosts() {
    const postList = document.querySelector('.post-list');
    latestPosts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
            <h3>${post.title}</h3>
            <p>By ${post.author} on ${post.date}</p>
        `;
        postList.appendChild(postItem);
    });
}

// Call these functions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.mod-grid')) {
        renderFeaturedMods();
    }
    if (document.querySelector('.forum-container')) {
        renderForumCategories();
        renderForumPosts();
    }

    const createPostForm = document.querySelector('.create-post-form');
    const createPostSection = document.querySelector('.create-post');
    if (createPostSection) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            createPostSection.style.display = 'block';
        } else {
            createPostSection.style.display = 'none';
        }
    }

    if (createPostForm) {
        createPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.querySelector('#post-title').value;
            const content = document.querySelector('#post-content').value;
            const categoryId = document.querySelector('#post-category').value;

            try {
                const success = await createForumPost(title, content, categoryId);
                if (success) {
                    console.log('Post created successfully');
                    alert('Post created successfully!');
                    // Clear the form
                    document.querySelector('#post-title').value = '';
                    document.querySelector('#post-content').value = '';
                    // Refresh the forum posts
                    renderForumPosts(categoryId);
                }
            } catch (error) {
                console.error('Failed to create post:', error);
                alert(`Failed to create post: ${error.message}`);
            }
        });
    }
});

async function renderForumPosts(categoryId = null, searchResults = null) {
    const forumPosts = document.querySelector('.forum-posts');
    if (!forumPosts) return;

    forumPosts.innerHTML = '<h2>Forum Posts</h2>';
    const allPosts = searchResults || await getForumPosts();
    
    const posts = categoryId 
        ? allPosts.filter(post => post.categoryId === parseInt(categoryId))
        : allPosts;

    if (posts.length === 0) {
        forumPosts.innerHTML += '<p>No posts found.</p>';
        return;
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const currentUser = JSON.parse(localStorage.getItem('user'));

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'forum-post';
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <p>By ${post.author} on ${new Date(post.date).toLocaleString()}</p>
            <p>Category: ${getCategoryName(post.categoryId)}</p>
            <p>Likes: <span class="like-count">${post.likes}</span></p>
            <button class="like-button" data-id="${post.id}">Like</button>
            <a href="post.html?id=${post.id}">Read more</a>
        `;

        if (currentUser && currentUser.id === post.authorId) {
            postElement.innerHTML += `
                <button class="edit-post" data-id="${post.id}">Edit</button>
                <button class="delete-post" data-id="${post.id}">Delete</button>
            `;
        }

        forumPosts.appendChild(postElement);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-post').forEach(button => {
        button.addEventListener('click', handleEditPost);
    });
    document.querySelectorAll('.delete-post').forEach(button => {
        button.addEventListener('click', handleDeletePost);
    });

    // Add event listener for like buttons
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', handleLikePost);
    });
}

function getCategoryName(categoryId) {
    const category = forumCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
}

// Check if user is authenticated
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
    handleDiscordAuth(code).then(userData => {
        console.log('Logged in as:', userData.username);
        // Update UI to show logged-in state
    }).catch(error => {
        console.error('Authentication error:', error);
    });
}

// Add event listener for forum post creation
document.querySelector('.create-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.querySelector('#post-title').value;
    const content = document.querySelector('#post-content').value;
    const categoryId = document.querySelector('#post-category').value;

    try {
        const success = await createForumPost(title, content, categoryId);
        if (success) {
            console.log('Post created successfully');
            alert('Post created successfully!');
            // Clear the form
            document.querySelector('#post-title').value = '';
            document.querySelector('#post-content').value = '';
            // Refresh the forum posts
            renderForumPosts(categoryId);
        }
    } catch (error) {
        console.error('Failed to create post:', error);
        alert(`Failed to create post: ${error.message}`);
    }
});

function handleEditPost(event) {
    const postId = event.target.getAttribute('data-id');
    if (postId) {
        window.location.href = `edit-post.html?id=${encodeURIComponent(postId)}`;
    } else {
        alert('Invalid post ID. Cannot edit post.');
    }
}

function handleDeletePost(event) {
    const postId = event.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this post?')) {
        deleteForumPost(postId).then(success => {
            if (success) {
                renderForumPosts(); // Refresh the post list
            }
        });
    }
}

function showEditModal(postId) {
    // Implement this function to show a modal with an edit form
    // You'll need to create this modal in your HTML
}