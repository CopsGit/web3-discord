const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const GAS_TRACKER_URL = 'https://etherscan.io/gastracker';

const config = require('../../config.json');
const DISCORD_WEBHOOK_URL = config.discordWebhookUrl;

const img = 'https://media.discordapp.net/attachments/1099414543060451369/1099423465863401554/ZJZZK5B2ZNF25LYQHMUTBTOMLU.png';

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
        .setColor('#627eea')
        .setFooter({
            text: 'Powered by Luckey',
            iconURL: img,
        })
        .setTimestamp(new Date());

    await webhook.send({
        username: 'Ethereum Gas Price Tracker',
        avatarURL: img,
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

setInterval(checkGasPrice, 30000); // Check every minute
