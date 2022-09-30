const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json") }
import fetch from "node-fetch";


const buttons = [
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('complete-button')
            .setLabel('Complétée !')
            .setStyle(ButtonStyle.Success),
        // new ButtonBuilder()
        //     .setCustomId('copy-button')
        //     .setLabel('Copier')
        //     .setStyle(ButtonStyle.Secondary)
    )

]

module.exports = {
    name: 'ajout-modal',
    async runInteraction(client, interaction) {
        //const message = await channel.messages.fetch(databases.config[interaction.guildId].saison_message)

        //console.log(message);

        const titre = interaction.fields.getTextInputValue('saison-title');
        const saison = interaction.fields.getTextInputValue('saison-season');
        
        const jour_semaine=["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        const jour="";
        
        const infos_anime = {};
        const info_anime = await fetch('https://www.livechart.me/api/v1/anime?q='+titre,
        {
          headers: {
            'User-Agent': 'le ban abuse aussi la'
          }
        })
    
        if (movieRes.ok) {
          infos_anime = await info_anime.json()
        } else {
          // handle l'error
        }
        console.log(infos_anime);
        
        const embed = new EmbedBuilder() 
            .setTitle(titre)
            // .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('#a81313')
            .addFields(
                { name: `Type`, value: 'Anime', inline: true },
            );

            if (season) { embed.addFields({ name: `Saison`, value: season, inline: true }) }
            if (infos) { embed.addFields({ name: `Informations complémentaires`, value: infos, inline: false }) }

        client.channels.cache.get(databases.config[interaction.guildId].suggest).send({ embeds: [embed], components: buttons });
        return interaction.reply({ content: `Vous avez demandé ${title} !`, ephemeral: true })
    }
};