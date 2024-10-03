const featuredMods = [
    {
        title: "Zombie Chronicles Remastered",
        author: "ZombiesMaster",
        description: "A complete overhaul of Zombie Chronicles maps with new features and enhanced graphics.",
        image: "images/zombie-chronicles-remastered.jpg"
    },
    {
        title: "Advanced Warfare Weapons Pack",
        author: "WeaponsMod",
        description: "Adds 20+ weapons from Advanced Warfare to BO3 multiplayer and zombies.",
        image: "images/aw-weapons-pack.jpg"
    },
    {
        title: "Custom Zombies - Facility",
        author: "MapCreator",
        description: "A new zombies map set in an abandoned research facility with unique easter eggs.",
        image: "images/facility-zombies.jpg"
    }
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
            <p>${mod.description}</p>
            <a href="#" class="mod-download-btn">Download</a>
        `;
        modGrid.appendChild(modCard);
    });
}

document.addEventListener('DOMContentLoaded', renderFeaturedMods);
