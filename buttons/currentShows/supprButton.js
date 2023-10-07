const { PermissionsBitField } = require('discord.js');
const databases = { current_shows: require("../../../data/current_shows.json"), notifications: require("../../../data/notifications.json"), config: require("../../../data/config.json"), }
const yarss = { yarss: require("../../../data/yarss2/yarss2.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'supprimer-button',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    overwritePermissions: {
        id: 1055462207011422218,
        deny: ['SEND_MESSAGES'],
    },
    async runInteraction(client, interaction) {

        const config = databases.config[interaction.guildId];
        const channelId = interaction.channelId;

        let type = "";
        if (channelId === config["animes-thread"]) {
            type = "animes";
        } else if (channelId === config["series-thread"]) {
            type = "series";
        }

        if (databases.current_shows[type][interaction.message.id]) {
            const id = databases.current_shows[type][interaction.message.id].message_id;
            const data_suppr = databases.current_shows[type][interaction.message.id];

            const channel_calendar = await interaction.guild.channels.cache.get(config["calendar"]);
            const calendar_msg = await channel_calendar.messages.fetch(config["calendar_msg_id"]);
            let embed_calendar;
            let embed_tmp;

            if (type === "animes") {
                embed_calendar = await calendar_msg.embeds[0];
                embed_tmp = await calendar_msg.embeds[1];

            } else if (type === "series") {
                embed_calendar = await calendar_msg.embeds[1];
                embed_tmp = await calendar_msg.embeds[0];
            }

            embed_calendar.fields.forEach((semaine, index) => {
                if (data_suppr.day.toLowerCase() === semaine.name.toLowerCase()) {
                    const lignes = embed_calendar.fields[index].value.split('\n');
                    const lignesFiltrees = lignes.filter(ligne => !ligne.includes(data_suppr.title)).filter((ligne) => { return ligne !== ''; });
                    const nouveauTexte = lignesFiltrees.join('\n');
                    embed_calendar.fields[index].value = nouveauTexte;

                    if (embed_calendar.fields[index].value !== "```ini\n```") {

                        embed_calendar.fields[index].value = embed_calendar.fields[index].value;
                    } else {
                        embed_calendar.fields[index].value = "``` ```";
                    }
                }
            })

            if (type === "animes") {
                await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_calendar, embed_tmp] }) });
            } else if (type === "series") {
                await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_tmp, embed_calendar] }) });
            }

            //TODO notification animes / series

            async function deleteNotification(type, channelId, messageId) {
                // Supprimer un message dans le canal spécifié
                await client.channels.fetch(channelId).then(channel => {
                    channel.messages.delete(messageId);
                }).then(() =>
                    setTimeout(() => {
                        interaction.message.delete()
                    }, 1000));

                // Trouver l'index de l'élément dans la partie spécifiée (animes ou series)
                let index;
                console.log("datasuppr : ", data_suppr, "notifications : ", databases.notifications[type])
                if (type === "animes") {
                    index = databases.notifications[type].findIndex(obj => Object.keys(obj)[0] === data_suppr.id);
                } else if (type === "series") {
                    index = databases.notifications[type].findIndex(obj => Object.keys(obj)[0] === data_suppr.title);
                }


                if (index !== -1) {
                    const rssJson = yarss.yarss;
                    const index_tab = [];

                    const isAnimes = type === 'animes';
                    const isSeries = type === 'series';

                    for (const key in rssJson.subscriptions) {
                        const downloadLocation = rssJson.subscriptions[key].download_location;
                        if ((isAnimes && downloadLocation.includes('animes')) || (isSeries && downloadLocation.includes('series'))) {
                            index_tab.push(rssJson.subscriptions[key].key)
                        }
                    }
                    console.log(index, index_tab[index])
                    var test = index_tab[index]
                    delete rssJson.subscriptions[test];

                    let i = 0;
                    for (const key in rssJson.subscriptions) {
                        if (parseInt(i) !== parseInt(key)) {
                            rssJson.subscriptions[i] = rssJson.subscriptions[key];
                            rssJson.subscriptions[i].key = `${i}`;
                            delete rssJson.subscriptions[key];
                        }
                        i++;
                    }

                    const configDataRss = JSON.stringify(rssJson, null, 4)
                    writeFile("../data/yarss2/yarss2.json", configDataRss, (err) => { if (err) { console.log(err) } });

                    const conf = JSON.stringify(yarss.yarss, null, 4);
                    const str_start = JSON.stringify(JSON.parse('{"file": 8,"format": 1}'), null, 2);
                    const str_FINAL = str_start + conf
                    writeFile("../data/yarss2/yarss2.conf", str_FINAL, (err) => { if (err) { console.log(err) } });
                    
                    databases.notifications[type].splice(index, 1);
                    const configData = JSON.stringify(databases.notifications, null, 4);
                    writeFile("../data/notifications.json", configData, (err) => { if (err) { console.log(err) } });

                    delete databases.current_shows[type][interaction.message.id];
                    const configData_ = JSON.stringify(databases.current_shows, null, 4);
                    writeFile("../data/current_shows.json", configData_, (err) => { if (err) { console.log(err) } });
                }
            }

            deleteNotification(type, config[type], id);

        }

        return interaction.reply({ content: 'Anime supprimé !', ephemeral: true })
    }
};