require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
    {
        name: 'cr',
        description: 'Scan',
        type: 1,
        options: [{
            name: 'name',
            type: 3,
            description: 'Oyuncu ismi',
            required: true,
        }],
    },
];



const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log('Komutlar başarıyla yüklendi.');

        await rest.put(
            Routes.applicationGuildCommands(
              process.env.CLIENT_ID,
              process.env.GUILD_ID
            ),
            { body: commands }
          );

        console.log('Komutlar başarıyla kaydedildi.');
    } catch (error) {
        console.error(error);
    }
})();