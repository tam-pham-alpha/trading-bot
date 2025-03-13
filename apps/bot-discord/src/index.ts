const dotenv = require('dotenv');
dotenv.config();

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
const { placeOrder } = require('./orders');

/**
 * https://chatgpt.com/share/67d046b6-ea20-800b-94b5-99bdc2766df1
 */

const DISCORD_BOT_ID = process.env.DISCORD_BOT_ID || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

// const CLIENT_ID = '1348671176108539975';
// const setCommands = async () => {
//   const commands = [
//     {
//       name: 'ping',
//       description: 'Replies with Pong!',
//     },
//     {
//       name: 'set_token',
//       description: 'Set the token for the bot',
//     },
//     {
//       name: 'long',
//       description: 'create a long position: /long ticker qty ls_% tp_%',
//     },
//   ];

//   const rest = new REST({ version: '10' }).setToken(TOKEN);

//   try {
//     console.log('Started refreshing application (/) commands.');

//     await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

//     console.log('Successfully reloaded application (/) commands.');
//   } catch (error) {
//     console.error(error);
//   }
// };

// setCommands();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel],
});

const parseTradeCommand = (message: string) => {
  const cmd = message.substring(message.indexOf('>') + 1).trim();
  const [direction, ticker, qty, ls, tp] = cmd.split(' ');
  return {
    direction,
    ticker,
    qty,
    ls,
    tp,
  };
};

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.username}!`);
  console.log('Connected to these servers:');
  client.guilds.cache.forEach((guild) => {
    console.log(` - ${guild.name}`);
  });
});

client.on(Events.MessageCreate, async (message) => {
  const user = await client.users.fetch(message.author.id);
  // console.log('message', JSON.stringify(message));
  // console.log('user', JSON.stringify(user));
  // console.log(`Message: ${message.content}`);

  const cmd = parseTradeCommand(message.content);
  console.log('cmd', cmd);

  if (message.mentions.users.has(DISCORD_BOT_ID)) {
    await placeOrder();

    await message.react('✅');

    // const isThread = await message.channel.isThread();

    // if (!isThread) {
    //   try {
    //     // Create a thread from the message
    //     const thread = await message.startThread({
    //       name: 'Discussion Thread', // Thread name
    //       autoArchiveDuration: 60, // Auto-archive after 60 minutes
    //     });

    //     await thread.send('Hello! This is a new thread.');
    //   } catch (error) {
    //     console.error('Failed to create a thread:', error);
    //   }
    // }
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  const message = await reaction.message.fetch();
  // console.log('reaction', JSON.stringify(reaction));
  // console.log('message', JSON.stringify(message));
  // console.log('user', JSON.stringify(user));
});

client.login(DISCORD_BOT_TOKEN);
