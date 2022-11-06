const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")}
const axios = require('axios');
const { writeFile } = require('fs');

module.exports = {
    name: 'suppr-button-animes',
    permissions: [],
    runInteraction: async (client, interactionSuppr) => {
        const id = databases.saison[interactionSuppr.guildId].id;

        const all_anime = new ActionRowBuilder()
        .addComponents(
            new SelectMenuBuilder()
                .setCustomId('all-anime')
                .setPlaceholder('Nothing selected')
                .addOptions(id),
        );
        
        await interactionSuppr.editReply({ content: 'Séléctionnez un media à SUPPRIMER', components: [all_anime], ephemeral: true})
    }
}