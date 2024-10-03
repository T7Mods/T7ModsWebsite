require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

app.post('/api/create-forum-post', async (req, res) => {
  const { title, content, categoryId, user } = req.body;

  try {
    // Create a thread in Discord
    const threadResponse = await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/threads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: title,
        type: 11,
        auto_archive_duration: 1440,
      }),
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.json();
      throw new Error(`Failed to create Discord thread: ${errorData.message}`);
    }

    const threadData = await threadResponse.json();

    // Send the post content as a message in the thread
    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${threadData.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: `**${user.username}#${user.discriminator}** posted:\n\n${content}`,
      }),
    });

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json();
      throw new Error(`Failed to send message in Discord thread: ${errorData.message}`);
    }

    res.json({ success: true, threadId: threadData.id });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
