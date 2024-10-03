import { getForumPosts } from './forum.js';
import { getUserData, storeUserData } from './discord_auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        await displayProfile(user);
        await fetchUserActivity(user.id);
        await displayUserMods(user.id);
        setupEditBio();
        setupImageUpload('change-avatar-btn', 'avatar');
        setupImageUpload('change-banner-btn', 'banner');
    } else {
        window.location.href = 'index.html';
    }
});

async function displayProfile(user) {
    const userData = await getUserData(user.id);
    document.getElementById('username').textContent = userData.username;
    
    const avatarUrl = userData.avatar || `https://cdn.discordapp.com/avatars/${userData.id}/${user.avatar}.png`;
    const profileAvatar = document.getElementById('profile-avatar');
    profileAvatar.src = avatarUrl;

    document.getElementById('rank').textContent = userData.rank || 'Member';
    document.getElementById('joined').textContent = new Date(userData.lastLogin).toLocaleDateString();
    document.getElementById('user-bio').textContent = userData.bio || 'No bio available.';
    
    const profileBanner = document.getElementById('profile-banner');
    profileBanner.style.backgroundImage = `url(${userData.banner || 'default-banner.jpg'})`;

    displayUserStats(userData);
    displayRecentActivity(userData.id);
    displayUserMods(userData.id);
}

function setupImageUpload(buttonId, imageType) {
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`Button with id ${buttonId} not found`);
        return;
    }
    
    button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any default action
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const imageUrl = await uploadImage(file);
                if (imageUrl) {
                    updateUserImage(imageType, imageUrl);
                }
            }
        };
        input.click();
    });
}

async function uploadImage(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            const base64Image = event.target.result.split(',')[1];
            const fileName = `${Date.now()}_${file.name}`;
            const path = `images/${fileName}`;
            const url = `${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${path}`;

            try {
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Upload user image',
                        content: base64Image,
                        branch: 'main'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                resolve(data.content.download_url);
            } catch (error) {
                console.error('Error uploading image:', error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function updateUserImage(imageType, imageUrl) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        // Update local display
        if (imageType === 'avatar') {
            document.getElementById('profile-avatar').src = imageUrl;
        } else if (imageType === 'banner') {
            document.getElementById('profile-banner').style.backgroundImage = `url(${imageUrl})`;
        }

        // Update user data
        const userData = await getUserData(user.id);
        userData[imageType] = imageUrl;
        await storeUserData(userData);

        // Update local storage
        user[imageType] = imageUrl;
        localStorage.setItem('user', JSON.stringify(user));

        console.log(`${imageType} updated successfully`);
    } catch (error) {
        console.error('Error updating user image:', error);
    }
}

async function updateUserData(userId, updateData) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            throw new Error('Failed to update user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

function setupEditBio() {
    const bioElement = document.getElementById('user-bio');
    const editBioBtn = document.getElementById('edit-bio-btn');
    
    editBioBtn.addEventListener('click', () => {
        const currentBio = bioElement.textContent;
        const textarea = document.createElement('textarea');
        textarea.value = currentBio;
        bioElement.replaceWith(textarea);
        
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', async () => {
            const newBio = textarea.value;
            try {
                await updateUserBio(newBio);
                bioElement.textContent = newBio;
                textarea.replaceWith(bioElement);
                saveBtn.remove();
            } catch (error) {
                console.error('Error updating bio:', error);
            }
        });
        
        editBioBtn.parentNode.insertBefore(saveBtn, editBioBtn.nextSibling);
    });
}

async function updateUserBio(newBio) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userData = await getUserData(user.id);
    userData.bio = newBio;
    await storeUserData(userData);
}

async function fetchUserActivity(userId) {
    try {
        const userData = await getUserData(userId);
        const activity = userData.activity || [];
        
        const activityList = document.getElementById('activity-list');
        activityList.innerHTML = '';
        activity.slice(0, 10).forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.action} - ${new Date(item.date).toLocaleString()}`;
            activityList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
    }
}

async function displayUserMods(userId) {
    const userModsList = document.getElementById('user-mods-list');
    userModsList.innerHTML = '<p>Loading user mods...</p>';

    try {
        const mods = await getUserMods(userId);
        userModsList.innerHTML = '';
        mods.forEach(mod => {
            const modElement = document.createElement('div');
            modElement.className = 'mod-card';
            modElement.innerHTML = `
                <img src="${mod.image || 'default-mod-image.jpg'}" alt="${mod.title}">
                <h3>${mod.title}</h3>
                <p>${mod.description}</p>
            `;
            userModsList.appendChild(modElement);
        });

        if (mods.length === 0) {
            userModsList.innerHTML = '<p>No mods created yet</p>';
        }
    } catch (error) {
        console.error('Error fetching user mods:', error);
        userModsList.innerHTML = '<p>Error loading user mods</p>';
    }
}

async function updateUserReputation(userId, change) {
    const userData = await getUserData(userId);
    userData.reputation = (userData.reputation || 0) + change;
    await storeUserData(userData);
    document.getElementById('user-reputation').textContent = userData.reputation;
}

function displayUserStats(userData) {
    document.getElementById('total-posts').textContent = userData.totalPosts || 0;
    document.getElementById('mods-created').textContent = userData.modsCreated || 0;
    document.getElementById('user-reputation').textContent = userData.reputation || 0;
}

async function displayRecentActivity(userId) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '<li>Loading recent activity...</li>';

    try {
        const posts = await getForumPosts();
        const userPosts = posts.filter(post => post.authorId === userId);
        userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentPosts = userPosts.slice(0, 5);

        activityList.innerHTML = '';
        recentPosts.forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="post.html?id=${post.id}">${post.title}</a> - ${new Date(post.date).toLocaleDateString()}`;
            activityList.appendChild(li);
        });

        if (recentPosts.length === 0) {
            activityList.innerHTML = '<li>No recent activity</li>';
        }
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        activityList.innerHTML = '<li>Error loading recent activity</li>';
    }
}

async function getUserMods(userId) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/mods/${userId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return []; // User has no mods
            }
            throw new Error('Failed to fetch user mods');
        }
        const files = await response.json();
        const mods = await Promise.all(files.map(async file => {
            const modResponse = await fetch(file.download_url);
            return await modResponse.json();
        }));
        return mods;
    } catch (error) {
        console.error('Error fetching user mods:', error);
        return [];
    }
}