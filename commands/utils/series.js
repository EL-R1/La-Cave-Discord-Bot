const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const databases = { config: require("../../../data/config.json"), notifications: require("../../../data/notifications.json") }
const { writeFile } = require('fs');

const buttons = [
    new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('notification-button')
                .setLabel(' 🔔 Notifications')
                .setStyle(ButtonStyle.Secondary),
        )

]
const buttonMod = [
    new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('supprimer-button')
                .setLabel('Supprimer cette série')
                .setStyle(ButtonStyle.Danger)
        )
]

module.exports = {
    name: 'add-serie',
    description: 'Ajoute une série qui sort en ce moment !',
    permissions: [PermissionsBitField.Flags.ManageMessages],
    options: [
        {
            name: 'title',
            description: 'Titre de la série',
            type: 3,
            required: true,
        },
        {
            name: 'day',
            description: 'Jour de sortie',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Lundi',
                    value: 'lundi'
                },
                {
                    name: 'Mardi',
                    value: 'mardi'
                },
                {
                    name: 'Mercredi',
                    value: 'mercredi'
                },
                {
                    name: 'Jeudi',
                    value: 'jeudi'
                },
                {
                    name: 'Vendredi',
                    value: 'vendredi'
                },
                {
                    name: 'Samedi',
                    value: 'samedi'
                },
                {
                    name: 'Dimanche',
                    value: 'dimanche'
                },
            ]
        },
        {
            name: 'url_poster',
            description: 'Mettre le lien d\'une image pour la série',
            type: 3,
            required: true,
        },
        {
            name: 'hour',
            description: 'A quelle heure sort la série ? format XXhXX',
            type: 3,
            required: true,
        },
        {
            name: 'season',
            description: 'Quelle est la saison de la série ?',
            type: 4,
            required: true,
        },
        {
            name: 'part',
            description: 'Quelle est la partie de la saison de la série ?',
            type: 4,
            required: false,
        },


    ],
    runInteraction: async (client, interaction) => {
        function isEmpty(obj) {
            return JSON.stringify(obj) === '{}';
        }
        const title = interaction.options.getString('title');
        const day = interaction.options.getString('day');
        let season = interaction.options.getInteger('season');
        const part = interaction.options.getInteger('part');
        const hour = interaction.options.getString('hour');
        const url_poster = interaction.options.getString('url_poster');

        if (isEmpty(databases.config)) {
            return interaction.reply({ content: `Aucun channel n'est configuré`, ephemeral: true });
        } else if (!databases.config[interaction.guildId].hasOwnProperty('series')) {
            return interaction.reply({ content: `Le channel pour la commande : **\`/add-serie\`**, n'est pas configuré`, ephemeral: true });
        } else {
            //Notifications
            const newObject = { [title]: [] };
            databases.notifications["series"].push(newObject);
            const configData = JSON.stringify(databases.notifications, null, 4)
            writeFile("../data/notifications.json", configData, (err) => { if (err) { console.log(err) } });

            //Séries
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(url_poster)
                .addFields(
                    { name: `path_title`, value: `${title}`, inline: false },
                    { name: `Jour`, value: day, inline: true },
                    { name: `Heure`, value: hour, inline: true },
                    { name: `path_season`, value: `${season}`, inline: false }
                );

            if (!part) {
                season = `Saison ${season}`;
            } else {
                season = `Saison ${season} - Partie ${part}`;
            }
            embed.addFields({ name: `\n`, value: `${season}`, inline: false })

            const channel = client.channels.cache.get(databases.config[interaction.guildId]["series"]);
            const thread = await channel.threads.fetch(databases.config[interaction.guildId]["series-thread"]);

            await thread.send({ embeds: [embed], components: buttonMod }).then(() =>
                setTimeout(() => {
                    client.channels.cache.get(databases.config[interaction.guildId]["series"]).send({ embeds: [embed], components: buttons });
                }, 2000)
            );

            //Calendar
            const channel_calendar = await interaction.guild.channels.cache.get(databases.config[interaction.guildId]["calendar"]);
            const calendar_msg = await channel_calendar.messages.fetch(databases.config[interaction.guildId]["calendar_msg_id"]);
            const embed_calendar = await calendar_msg.embeds[1];
            const embed_tmp = await calendar_msg.embeds[0];

            embed_calendar.fields.forEach((semaine, index) => {
                if (day.toLowerCase() === semaine.name.toLowerCase()) {
                    embed_calendar.fields[index].value = embed_calendar.fields[index].value.replace("```", "").replace("ini", "").replace("\n```", "").replace("```", "");
                    const calendar_title = `[${hour}] ${title.trim() + ' '}[${season}]`

                    if (embed_calendar.fields[index].value === " ") {
                        embed_calendar.fields[index].value = "\n- " + calendar_title;
                    } else {
                        embed_calendar.fields[index].value += "\n- " + calendar_title;
                    }
                    embed_calendar.fields[index].value = "```ini" + embed_calendar.fields[index].value + "\n```";

                    const tableau = embed_calendar.fields[index].value.split('\n');
                    tableau.sort((a, b) => {
                        const heureA = a.match(/\d{1,2}h\d{2}/);
                        const heureB = b.match(/\d{1,2}h\d{2}/);
                        if (heureA && heureB) {
                            heureA_minutes = parseInt(heureA[0].replace('h', ''));
                            heureB_minutes = parseInt(heureB[0].replace('h', ''));
                            return heureA_minutes - heureB_minutes;
                        } else {
                            return 0;
                        }
                    });
                    embed_calendar.fields[index].value = tableau.join('\n');

                }
            })

            await channel_calendar.messages.fetch(calendar_msg.id).then(msg => { msg.edit({ embeds: [embed_tmp, embed_calendar] }) });

            return interaction.reply({ content: 'Cette série a été ajouté dans la liste', ephemeral: true });
        }
    }
}