const { FPSBot } = require('@fps.ms/bot');

const bot = new FPSBot({
  token: process.env.DISCORD_BOT_TOKEN,
  intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.command('createForumPost', async (args) => {
  const { title, content, categoryId, username, discriminator } = args;
  const FORUM_CHANNEL_ID = process.env.FORUM_CHANNEL_ID;

  try {
    const forumChannel = await bot.channels.fetch(FORUM_CHANNEL_ID);
    if (!forumChannel || forumChannel.type !== 15) { // 15 is the channel type for forum channels
      throw new Error('Invalid forum channel');
    }

    const thread = await forumChannel.threads.create({
      name: title,
      message: {
        content: `**${username}#${discriminator}** posted:\n\n${content}`,
      },
      appliedTags: [categoryId],
    });

    return { threadId: thread.id };
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
});

bot.login();
