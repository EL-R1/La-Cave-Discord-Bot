const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")}
const axios = require('axios');
const { writeFile } = require('fs');

module.exports = {
    name: 'suppr-button-series',
    permissions: [],
    runInteraction: async (client, interactionSuppr) => {

    }
}