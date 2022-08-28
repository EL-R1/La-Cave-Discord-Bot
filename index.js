const { Client, Collection } = require('discord.js');

const dotenv = require('dotenv');
dotenv.config();

const client = new Client({ intents: 513 });

['commands', 'buttons', 'modals'].forEach(x => client[x] = new Collection());
['EventUtil', 'CommandUtil', 'ButtonUtil', 'ModalUtil'].forEach(handler => { require(`./utils/handlers/${handler}`)(client) });

process.on('exit', code => { console.log(`Le processus s'est arrêté avec le code: ${code} !`) });
process.on('uncaughtException', (err, origin) => { console.log(`UNCAUGHT_EXCEPTION: ${err}`, `Origine: ${origin}`) });
process.on('unhandledRejection', (reason, promise) => { console.log(`UNHANDLED_REJECTION: ${reason}\n-----\n`, promise) });
process.on('warning', (...args) => console.log(...args));

client.login(process.env.DISCORD_TOKEN);