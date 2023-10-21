const { PermissionsBitField, ChannelType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const databases = { config: require("../../../data/config.json"), notifications: require("../../../data/notifications.json"), current_shows: require("../../../data/current_shows.json") }
const yarss = { yarss: require("../../../data/yarss2/yarss2.json") }
const { writeFile } = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env'});

const embed_animes = new EmbedBuilder()
    .setTitle("Anime - ")
    .addFields(
        { name: `Lundi`, value: '``` ```', inline: false },
        { name: `Mardi`, value: '``` ```', inline: false },
        { name: `Mercredi`, value: '``` ```', inline: false },
        { name: `Jeudi`, value: '``` ```', inline: false },
        { name: `Vendredi`, value: '``` ```', inline: false },
        { name: `Samedi`, value: '``` ```', inline: false },
        { name: `Dimanche`, value: '``` ```', inline: false },
    );

const embed_series = new EmbedBuilder()
    .setTitle("Séries en cours de Parution")
    .addFields(
        { name: `Lundi`, value: '``` ```', inline: false },
        { name: `Mardi`, value: '``` ```', inline: false },
        { name: `Mercredi`, value: '``` ```', inline: false },
        { name: `Jeudi`, value: '``` ```', inline: false },
        { name: `Vendredi`, value: '``` ```', inline: false },
        { name: `Samedi`, value: '``` ```', inline: false },
        { name: `Dimanche`, value: '``` ```', inline: false },
    );

module.exports = {
    name: 'config',
    description: 'Configuration des channels',
    permissions: [PermissionsBitField.Flags.Administrator],
    options: [
        {
            name: 'type',
            description: 'Quel type de channel configurer ?',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'suggest',
                    value: 'suggest'
                },
                {
                    name: 'report',
                    value: 'report'
                },
                {
                    name: 'notifications',
                    value: 'notifications'
                }
            ]
        },
        {
            name: 'channel',
            description: 'Quel channel assigner ?',
            type: 7, //channel type
            required: false,
        },
        {
            name: 'channel_series',
            description: 'Quel channel assigner pour les séries (uniquement pour /notifications) ?',
            type: 7, //channel type
            required: false,
        },
        {
            name: 'calendrier',
            description: 'Quel channel assigner pour le calendrier ?',
            type: 7, //channel type
            required: false,
        },
        {
            name: 'delete',
            description: 'Voulez vous le supprimer ?',
            type: 5,
            required: false,
        }
    ],
    runInteraction: async (client, interaction) => {

        let typeChoice = interaction.options.getString('type');
        const channelChoice = interaction.options.getChannel('channel');
        const calendarChoice = interaction.options.getChannel('calendrier');
        const deleteChoice = interaction.options.getBoolean('delete');
        const channel_series = interaction.options.getChannel('channel_series');
        if (typeChoice === "notifications"){
            typeChoice = "animes"
        }

        //console.log(!databases.config[interaction.guildId].hasOwnProperty(typeChoice), channelChoice)
        if (!databases.config[interaction.guildId]) {
            databases.config[interaction.guildId] = {}
        }
        console.log(Object.keys(databases.notifications).length, Object.keys(databases.current_shows).length)
        if (Object.keys(databases.current_shows).length === 0){
            databases.current_shows = { "animes": {}, "series": {} }
            const configCurrentData = JSON.stringify(databases.current_shows, null, 4)
            writeFile("../data/current_shows.json", configCurrentData, (err) => { if (err) { console.log(err) } });
            
        }
        if (Object.keys(databases.notifications).length === 0){
            databases.notifications = { "animes": [], "series": [] }
            const configDataNotif = JSON.stringify(databases.notifications, null, 4)
            writeFile("../data/notifications.json", configDataNotif, (err) => { if (err) { console.log(err) } });
        }
        

        if (!databases.config[interaction.guildId].hasOwnProperty(typeChoice) || deleteChoice) {
            let config = databases.config[interaction.guildId];
            if (deleteChoice) {
                if (!config.hasOwnProperty(typeChoice)) {
                    interaction.reply({ content: `Aucun channel n'est pas encore configuré pour la commande : **\`${typeChoice}\`**`, ephemeral: true });
                } else {
                    interaction.reply({ content: `Le channel <#${config[typeChoice]}> a été dé-configuré pour la commande : **\`${typeChoice}\`**`, ephemeral: true });

                    if (typeChoice === "animes" || typeChoice === "suggest") {
                        const fetchedChannel = interaction.guild.channels.cache.get(config["series"]);
                        const thread = await fetchedChannel.threads.cache.fetch(config[`${typeChoice}-thread`]);

                        delete config[`${typeChoice}-thread`];
                        await thread.delete();

                        if (typeChoice === "animes") {
                            const fetchedChannel_series = interaction.guild.channels.cache.get(config["series"]);
                            const thread_series = await fetchedChannel_series.threads.cache.fetch(config["series-thread"]);
                            delete config[`series-thread`];
                            delete config[`series`];
                            thread_series.delete();

                            const channel = interaction.guild.channels.cache.get(config["calendar"]);
                            const calendar_msg = await channel.messages.fetch(config["calendar_msg_id"]);
                            calendar_msg.delete();

                            delete config["calendar"];
                            delete config["calendar_msg_id"];

                            databases.current_shows = { "animes": {}, "series": {} }
                            databases.notifications = { "animes": [], "series": [] }
                            //databases.notifications["animes"].length = 0;
                            //databases.notifications["animes"].length = 0;

                            const configDataNotif = JSON.stringify(databases.notifications, null, 4)
                            const configCurrentData = JSON.stringify(databases.current_shows, null, 4)

                            yarss.yarss.rssfeeds['4'].site = process.env.BASE_URL_YGG;
                            yarss.yarss.rssfeeds['4'].url = process.env.BASE_URL_YGG + "/rss?action=generate&type=subcat&id=2184&passkey=" + process.env.PASSKEY_YGG_R1;

                            yarss.yarss.rssfeeds['5'].site = process.env.BASE_URL_YGG;
                            yarss.yarss.rssfeeds['5'].url = process.env.BASE_URL_YGG + "/rss?action=generate&type=subcat&id=2179&passkey=" + process.env.PASSKEY_YGG_R1;
                            
                            yarss.yarss.subscriptions = {};
                            const configDataRss = JSON.stringify(yarss.yarss, null, 4)

                            writeFile("../data/notifications.json", configDataNotif, (err) => { if (err) { console.log(err) } });
                            writeFile("../data/current_shows.json", configCurrentData, (err) => { if (err) { console.log(err) } });
                            writeFile("../data/yarss2/yarss2.json", configDataRss, (err) => { if (err) { console.log(err) } });
                        }
                    }
                    delete config[typeChoice];

                }

            } else if (channelChoice) {

                if ((typeChoice === "animes" && calendarChoice) || typeChoice === "suggest") {
                    if (typeChoice === "animes" && calendarChoice) {
                        const url = 'https://www.livechart.me/api/v1/charts/nearest';
                        const response = await axios.get(url, {
                            headers: { "Accept-Encoding": "gzip,deflate,compress" }
                        });
                        const nom_saison = response.data.title;

                        embed_animes.data.title = 'Anime - ' + nom_saison;
                        const calendar_msg = await client.channels.cache.get(calendarChoice.id).send({ embeds: [embed_animes, embed_series] });
                        config["calendar"] = calendarChoice.id;
                        config["calendar_msg_id"] = calendar_msg.id;

                        //Thread for current series
                        config[`series`] = channel_series.id;
                        const thread_series = await channel_series.threads.create({
                            name: `Gestion-series`,
                            autoArchiveDuration: 10080,
                            type: ChannelType.PrivateThread,
                        });
                        config[`series-thread`] = thread_series.id;
                        await thread_series.members.add(interaction.user.id);

                    }

                    //Thread for animes or suggest
                    const thread = await channelChoice.threads.create({
                        name: `Gestion-${typeChoice}`,
                        autoArchiveDuration: 10080,
                        type: ChannelType.PrivateThread,
                    });
                    config[`${typeChoice}-thread`] = thread.id;
                    await thread.members.add(interaction.user.id);
                    config[typeChoice] = channelChoice.id;

                    //return
                    await interaction.reply({ content: `Le channel <#${config[typeChoice]}> a été configuré pour la commande : **\`${typeChoice}\`**`, ephemeral: true });

                } else if (typeChoice === "report") {
                    config[typeChoice] = channelChoice.id;
                    console.log("test")
                    //return
                    await interaction.reply({ content: `Le channel <#${config[typeChoice]}> a été configuré pour la commande : **\`${typeChoice}\`**`, ephemeral: true });

                } else {
                    console.log("test")
                    //return
                    return interaction.reply({ content: `Merci de faire un vrai choix :)`, ephemeral: true });
                }
            } else {
                //return
                return interaction.reply({ content: `Merci de faire un vrai choix :)`, ephemeral: true });
            }

            //write in config.json
            const configData = JSON.stringify(databases.config, null, 4)
            writeFile("../data/config.json", configData, (err) => {
                if (err) {
                    console.log(err);
                }
            });

        } else {
            //return
            return interaction.reply({ content: `Le channel pour la commande : **\`${typeChoice}\`**, est déjà configuré`, ephemeral: true });
        }
    }
}