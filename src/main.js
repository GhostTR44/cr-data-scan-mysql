require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const mysql = require('mysql2/promise');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds] });

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('messageCreate', async event => {
    if (event.channel.id == process.env.CHANNEL_ID && !event.member.roles.cache.has(process.env.ROLE_ID)) {
        event.delete();
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    const CHANNEL_ID = process.env.CHANNEL_ID;
    const ROLE_ID = process.env.ROLE_ID;

    if (interaction.channel.id !== CHANNEL_ID) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply('Bu kanalda botu kullanamazsın!');
        return;
    }

    if (!interaction.member.roles.cache.has(ROLE_ID)) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply('Bu komutu kullanmak için yetkin yok!');
        return;
    }

    if (commandName === 'cr') {
        await interaction.deferReply({ ephemeral: true });
        const startTime = new Date();

        const usernameToFind = options.getString('name').toLowerCase();

        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(username) = ?', [usernameToFind]);
            const foundUser = rows[0];

            if (foundUser) {
                await interaction.editReply({ content: `Kullanıcı Adı: ${foundUser.username}\nŞifre: ${foundUser.password}\nMail: ${foundUser.email}`, ephemeral: true });
            } else {
                await interaction.editReply({ content: 'User not found.', ephemeral: true });
            }

            const endTime = new Date();
            const elapsedTimeInMs = endTime - startTime;
            console.log(`Arama süresi: ${elapsedTimeInMs} milliseconds`);
        } catch (error) {
            console.error('MySQL sorgu hatası:', error);
            await interaction.editReply({ content: 'Bir hata oluştu. Lütfen tekrar deneyin.', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
