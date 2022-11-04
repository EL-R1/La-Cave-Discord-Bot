const { channel } = require('diagnostics_channel');
const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json") }
const { writeFile } = require('fs');
const axios = require("axios");


const buttons = [
    new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('ajout-button')
            .setLabel('Ajouter')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('modif-button')
            .setLabel('Mettre à jour la saison')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('suppr-button')
            .setLabel('Supprimer')
            .setStyle(ButtonStyle.Danger),

        
        
    ),
]
const embed_animes = new EmbedBuilder()
    .setTitle("Anime - ")
    .addFields(
        { name: `Lundi`, value: '-', inline: false },
        { name: `Mardi`, value: '-', inline: false },
        { name: `Mercredi`, value: '-', inline: false },
        { name: `Jeudi`, value: '-', inline: false },
        { name: `Vendredi`, value: '-', inline: false },
        { name: `Samedi`, value: '-', inline: false },
        { name: `Dimanche`, value: '-', inline: false },
    );

const embed_series = new EmbedBuilder()
.setTitle(`Series`)
.addFields(
    { name: `En cours`, value: '-', inline: false },
);


module.exports = {
    name: 'config',
    description: 'Configuration des channels',
    permissions: [PermissionsBitField.Flags.Administrator],
    options : [
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
                    name: 'saison',
                    value: 'saison'
                }
            ]
        },
        {
            name: 'channel',
            description: 'Quel channel assigner ?',
            type: 7, //channel type
            required: true,
        },
        {
            name: 'delete',
            description: 'Voulez vous le supprimer ?',
            type: 5, 
            required: false,
        }
    ],
    runInteraction: async (client, interaction) => {

        const typeChoice = interaction.options.getString('type');
        const channelChoice = interaction.options.getChannel('channel');
        const deleteChoice = interaction.options.getBoolean('delete');

        if (!databases.config[interaction.guildId]) {
            databases.config[interaction.guildId] = {};
        }
        if(!databases.saison[interaction.guildId]){
            databases.saison[interaction.guildId] = {};
        }

        if (deleteChoice) {
            if (typeChoice == 'suggest') { delete databases.config[interaction.guildId].suggest }
            else if (typeChoice == 'saison') { delete databases.config[interaction.guildId].saison }
            else { delete databases.config[interaction.guildId].report 
            
            }

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Ce channel a été délink !` })
        }

        else if (typeChoice == 'suggest') {
            databases.config[interaction.guildId].suggest = channelChoice.id;

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Le channel ${channelChoice} a été configuré pour recevoir les suggestions.`, ephemeral: true });
        }

        else if (typeChoice == 'report') {
            databases.config[interaction.guildId].report = channelChoice.id;

            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Le channel ${channelChoice} a été configuré pour recevoir les reports de bugs.`, ephemeral: true });
        }
        else if (typeChoice == 'saison') {
            databases.config[interaction.guildId].saison = channelChoice.id;
            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
           
            let url = 'https://www.livechart.me/api/v1/charts/nearest';         
            const response = await axios.get(url);
            const nom_saison = response.data.title;
            const Nom_saison = response.data.slug;
            
            databases.saison[interaction.guildId].nom_saison = Nom_saison;
            embed_animes.setTitle('Anime - '+ nom_saison);
            const saison_actu = response.data.slug;

            const message = await client.channels.cache.get(databases.config[interaction.guildId].saison).send({ embeds: [embed_animes, embed_series], components: buttons });
            databases.saison[interaction.guildId].saison_message = message.id;
                
            writeFile("data/config.json", JSON.stringify(databases.config), (err) => { if (err) { console.log(err) } });
            writeFile("data/saison.json", JSON.stringify(databases.saison), (err) => { if (err) { console.log(err) } });
            return interaction.reply({ content: `Le channel ${channelChoice} a été configuré pour afficher les animes de la saison.`, ephemeral: true });
        }
    }
}