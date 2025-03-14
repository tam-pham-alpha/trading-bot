import dotenv from 'dotenv';
dotenv.config();

import { Client, Events, GatewayIntentBits, Partials } from 'discord.js';
import { getCmdString, parseTradeCommand } from './utils/cmd';
import { binanceMarketData } from './binance/market';

import { PortfolioClient } from 'binance';
import { getFutureOrderData } from './binance/order';
import { placeBatchOrders } from './binance/portfolio-margin';

/**
 * https://chatgpt.com/share/67d046b6-ea20-800b-94b5-99bdc2766df1
 */

const DISCORD_BOT_ID = process.env.DISCORD_BOT_ID || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

const pmClient = new PortfolioClient({
  api_key: BINANCE_API_KEY,
  api_secret: BINANCE_API_SECRET,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel],
});

client.on(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.username}!`);
  console.log('Connected to these servers:');
  client.guilds.cache.forEach((guild) => {
    console.log(` - ${guild.name}`);
  });
});

client.on(Events.MessageCreate, async (message) => {
  const user = await client.users.fetch(message.author.id);
  if (user.bot) return;

  console.log('message', JSON.stringify(message));

  if (message.mentions.users.has(DISCORD_BOT_ID)) {
    const cmd = parseTradeCommand(message.content);

    if (cmd) {
      console.log('Command:', getCmdString(cmd));
      await message.react('✅');

      if (cmd.ticker === 'BTCUSDT') {
        const avgPrice = await binanceMarketData.getAvgPrice(cmd.ticker);
        const ftOrderData = getFutureOrderData(cmd, avgPrice);
        await placeBatchOrders(pmClient, ftOrderData);

        const isThread = await message.channel.isThread();

        if (!isThread) {
          try {
            // Create a thread from the message
            const thread = await message.startThread({
              name: getCmdString(cmd), // Thread name
              autoArchiveDuration: 60, // Auto-archive after 60 minutes
            });

            await thread.send(
              `<@${user.id}> Your orders have been placed for ${cmd.ticker} at an average price of ${avgPrice}`,
            );
          } catch (error) {
            console.error('Failed to create a thread:', error);
          }
        }
      }
    } else {
      await message.react('❌');
    }
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  const message = await reaction.message.fetch();
  console.log(
    `ReactionAdd: ${user.username} reacted with ${reaction.emoji.name} on ${message.content}`,
  );
});

client.login(DISCORD_BOT_TOKEN);
