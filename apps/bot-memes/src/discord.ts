import axios from 'axios';

// Replace this with your Discord webhook URL
const DISCORD_GENERAL_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1338850530356891658/XhwnHTrn9v6Skaz5GGurgHp5VLQcMNVtAMlqALEVOWsINzT5RDmkk7C79p8j7cJdmwx0';
const DISCORD_MICRO_CAP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1340213697448247378/oM1hm8OKNbnEBjBmELMofpyQY_msv5iKNUzb_e1scM5AGW0LTJo0FFaJJ5XMcA34LV7x';
const DISCORD_LOW_CAP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1340213873424207872/im798ajXwj1zxNxCh7q1XJA8mjopmkXKoFx4DV7VzFdmEuCMHrV8DeBv3ZNtRExb6aNm';
const DISCORD_MID_CAP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1340213942592602132/lu4DjU1wtadkSjwBUNN78SSgPQZEUWX9vt-LbgGH_IDGjglmQbeSdc7RY1MfMhbNh6sr';

export async function sendDiscordMessage(
  hook: string,
  content: string,
): Promise<void> {
  try {
    const payload = { content };
    const response = await axios.post(hook, payload);

    if (response.status === 204) {
      console.log(content);
    } else {
      console.log(
        `Failed to send message: ${response.status} - ${response.statusText}`,
      );
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

export async function sendToGeneralDiscord(content: string): Promise<void> {
  await sendDiscordMessage(DISCORD_GENERAL_WEBHOOK_URL, content);
}

export async function sendToMicroCapDiscord(content: string): Promise<void> {
  await sendDiscordMessage(DISCORD_MICRO_CAP_WEBHOOK_URL, content);
}

export async function sendToLowCapDiscord(content: string): Promise<void> {
  await sendDiscordMessage(DISCORD_LOW_CAP_WEBHOOK_URL, content);
}

export async function sendToMidCapDiscord(content: string): Promise<void> {
  await sendDiscordMessage(DISCORD_MID_CAP_WEBHOOK_URL, content);
}
