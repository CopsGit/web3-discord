const axios = require('axios');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const GAS_TRACKER_URL = 'https://starkscan.co/stats#overview';

const config = require('../../config.json');
const DISCORD_WEBHOOK_URL = config.discordWebhookUrl;

const img = 'https://europe1.discourse-cdn.com/standard20/uploads/starknet1/original/2X/9/9c7af6ef31efbf89cfc6fcfdf1116100c37f4f4e.png';

let previousGasPrice = null;

const scrapeGasPrice = async () => {
    try {
        const response = await axios.get(GAS_TRACKER_URL);
        const $ = cheerio.load(response.data);
        // const value = $('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(1) > span:nth-child(2) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary.currentTicker').text();
        // console.log(value);
        const span = $('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(1) > span:nth-child(2)');

        let value = '';
        span.find('span.currentTicker').each((i, el) => {
            value += $(el).text();
        });
        value += span.find('span.hiddenTicker').first().text();

        console.log(value);
        const gasPrice = value;
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
        .setTitle('StarkNet Gas Price Update')
        .setDescription(`The average gas price is now ${gasPrice}.`)
        .setColor('#0c0c4f')
        .setFooter({
            text: 'Powered by Luckey',
            iconURL: img,
        })
        .setTimestamp(new Date());

    await webhook.send({
        username: 'StarkNet Gas Price Tracker',
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

checkGasPrice().then(() => console.log('Done!'));

// setInterval(checkGasPrice, 100000); // Check every minute
