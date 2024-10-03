const CLIENT_ID = '1290076168598589510';
const REDIRECT_URI = window.location.origin + '/bo3_mods/index.html';
const GITHUB_TOKEN = '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';
const GITHUB_REPO = 'Debinno/bo3-mods-data';
const GITHUB_API_URL = 'https://api.github.com';

function loginWithDiscord() {
    const REDIRECT_URI = encodeURIComponent(window.location.origin + '/bo3_mods/index.html');
    const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=identify`;
    window.location.href = DISCORD_OAUTH_URL;
}

async function handleAuth() {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    if (accessToken) {
        try {
            const response = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${accessToken}`,
                },
            });
            const userData = await response.json();
            const { username, avatar, id } = userData;
            const user = { username, avatar, id, lastLogin: new Date().toISOString() };
            localStorage.setItem('user', JSON.stringify(user));
            updateLoginButton();
            if (window.location.pathname.includes('profile.html')) {
                displayProfile(user);
            }
            await storeUserData(user);
        } catch (error) {
            console.error('Error during authentication:', error);
        }
    }
}

async function storeUserData(user) {
    const content = btoa(JSON.stringify(user));
    const path = `users/${user.id}.json`;
    const url = `${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${path}`;

    try {
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
            }
        });

        let method = 'PUT';
        let body = {
            message: `Update user data for ${user.username}`,
            content: content,
        };

        if (checkResponse.ok) {
            const fileData = await checkResponse.json();
            body.sha = fileData.sha;
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Failed to store user data');
        }

        console.log('User data stored successfully');
    } catch (error) {
        console.error('Error storing user data:', error);
    }
}

function updateLoginButton() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        loginBtn.textContent = `Logout (${user.username})`;
        loginBtn.onclick = logout;
    } else {
        loginBtn.textContent = 'Login with Discord';
        loginBtn.onclick = loginWithDiscord;
    }
}

function logout() {
    localStorage.removeItem('user');
    updateLoginButton();
    window.location.reload();
}

window.onload = () => {
    handleAuth();
    updateLoginButton();
};

async function getUserData(userId) {
    const path = `users/${userId}.json`;
    const url = `${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${path}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        return content;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export { getUserData, storeUserData };
