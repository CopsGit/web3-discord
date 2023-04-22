const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const GAS_TRACKER_URL = 'https://etherscan.io/gastracker';

const config = require('./config.json');
const DISCORD_WEBHOOK_URL = config.discordWebhookUrl;

let previousGasPrice = null;

const scrapeGasPrice = async () => {
    try {
        const response = await axios.get(GAS_TRACKER_URL);
        const $ = cheerio.load(response.data);
        const gasPrice = $('span[id="spanAvgPrice"]').text();
        console.log(`Gas price is ${gasPrice}`)
        return gasPrice.trim();
    } catch (error) {
        console.error(error);
    }
};

const sendDiscordMessage = async (gasPrice) => {
    const webhook = new Discord.WebhookClient({
        url: DISCORD_WEBHOOK_URL
    });
    const embed = new Discord.EmbedBuilder()
        .setTitle('Ethereum Gas Price Update')
        .setDescription(`The average gas price is now ${gasPrice}.`)
        .setColor(0x00FFFF);

    await webhook.send({
        content: 'Webhook test',
        username: 'some-username',
        avatarURL: 'https://i.imgur.com/AfFp7pu.png',
        embeds: [embed],
    });
};

const checkGasPrice = async () => {
    const gasPrice = await scrapeGasPrice();
    if (gasPrice !== previousGasPrice) {
        await sendDiscordMessage(gasPrice);
        previousGasPrice = gasPrice;
    }
};

setInterval(checkGasPrice, 1000); // Check every minute
