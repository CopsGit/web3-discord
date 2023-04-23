const puppeteer = require('puppeteer');
const Discord = require('discord.js');
const config = require('../../config.json');
const axios = require("axios");
const DISCORD_WEBHOOK_URL = config.discordWebhookUrl;

const img = 'https://europe1.discourse-cdn.com/standard20/uploads/starknet1/original/2X/9/9c7af6ef31efbf89cfc6fcfdf1116100c37f4f4e.png';

let previousGasPrice = null;

const scrapeGasPrice = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/root/.cache/puppeteer/chrome/linux-1108766/chrome-linux/chrome',
        headless: false,
    })
    const page = await browser.newPage();
    await page.goto('https://starkscan.co/stats#overview');
    await page.waitForSelector('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(1) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary');
    console.log('Page loaded')
    const gasPrice1 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(1) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 1 is ' + gasPrice1)
    const gasPrice2 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(2) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 2 is ' + gasPrice2)
    const gasPrice3 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(3) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 3 is ' + gasPrice3)
    const gasPrice4 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(4) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 4 is ' + gasPrice4)
    const gasPrice5 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(5) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 5 is ' + gasPrice5)
    const gasPrice6 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(6) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 6 is ' + gasPrice6)
    const gasPrice7 = await page.$eval('#__next > div > div.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.pt-10.pb-20 > div.pb-16.pt-6 > dl > div:nth-child(2) > dd > div.flex.items-baseline > span:nth-child(7) > span.text-2xl.font-semibold.text-indigo-600.dark\\:text-darkPrimary', element => element.textContent.trim());
    console.log('Gas price 7 is ' + gasPrice7)
    const gasPrice = gasPrice1 + gasPrice2 + gasPrice3 + gasPrice4 + gasPrice5 + gasPrice6 + gasPrice7;
    console.log(`Gas price is ${gasPrice}`);
    await browser.close();
    return gasPrice;
};

const scrapeEthPrice = async () => {
    const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    const ethPrice = res.data.ethereum.usd;
    console.log(`Eth price is ${ethPrice}`);
    return ethPrice;
}

const sendDiscordMessage = async (gasPrice, ethPrice) => {
    const webhook = new Discord.WebhookClient({
        url: DISCORD_WEBHOOK_URL
    });
    const embed = new Discord.EmbedBuilder()
        .setTitle('StarkNet Gas Price Update')
        .addFields([
            {
                name: 'Average Gas Price',
                value: `${gasPrice} $ETH`,
            },
            {
                name: 'Average Gas Price (USD)',
                value: `${(gasPrice * ethPrice).toFixed(2)} $USD`,
            }
        ])
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
    const ethPrice = await scrapeEthPrice();
    if (gasPrice !== previousGasPrice) {
        await sendDiscordMessage(gasPrice, ethPrice);
        previousGasPrice = gasPrice;
    }
};

setInterval(checkGasPrice, 60000); // Check every minute