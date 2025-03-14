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
