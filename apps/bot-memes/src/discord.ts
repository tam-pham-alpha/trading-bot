import axios from 'axios';

// Replace this with your Discord webhook URL
const WEBHOOK_URL =
  'https://discord.com/api/webhooks/1338850530356891658/XhwnHTrn9v6Skaz5GGurgHp5VLQcMNVtAMlqALEVOWsINzT5RDmkk7C79p8j7cJdmwx0';

export async function sendDiscordMessage(content: string): Promise<void> {
  try {
    const payload = { content };
    const response = await axios.post(WEBHOOK_URL, payload);

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
