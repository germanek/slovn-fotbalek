const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const words = require('./words.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let gameActive = false;
let expectedFirstLetter = null;

client.once('ready', () => {
    console.log(`✅ Přihlášen jako ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const userMessage = message.content.trim().toLowerCase();

    if (userMessage === "!startgame") {
        gameActive = true;
        expectedFirstLetter = null;
        message.channel.send("🎮 Slovní fotbal začíná! Napiš první slovo!");
        return;
    }

    if (!gameActive) return;

    if (expectedFirstLetter === null) {
        if (!words.includes(userMessage)) {
            message.channel.send("❌ To slovo neznám! Zkus jiné.");
            return;
        }
        expectedFirstLetter = userMessage[userMessage.length - 1];
        botRespond(message);
        return;
    }

    if (userMessage[0] !== expectedFirstLetter) {
        message.channel.send(`❌ Tvoje slovo musí začínat na **${expectedFirstLetter.toUpperCase()}**!`);
        return;
    }

    if (!words.includes(userMessage)) {
        message.channel.send("❌ To slovo neznám! Zkus jiné.");
        return;
    }

    expectedFirstLetter = userMessage[userMessage.length - 1];
    botRespond(message);
});

function botRespond(message) {
    const possibleWords = words.filter(word => word.startsWith(expectedFirstLetter));

    if (possibleWords.length === 0) {
        message.channel.send("🏆 Vyhrál jsi! Já už žádné slovo neznám!");
        gameActive = false;
        return;
    }

    const botWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
    message.channel.send(`🤖 Moje slovo: **${botWord}**`);
    expectedFirstLetter = botWord[botWord.length - 1];
}

client.login(process.env.TOKEN);
