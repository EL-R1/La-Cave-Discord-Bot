const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField } = require('discord.js');


const databases = { saison: require("../../data/saison.json") };


let anime = [];

const supprMenu = new ActionRowBuilder()
.addComponents(
    new SelectMenuBuilder()
        .setCustomId('select')
        .setPlaceholder('Nothing selected')
        .addOptions(
            {
                label: 'Select me',
                value: 'first_option',
            },
            {
                label: 'You can select me too',
                value: 'second_option',
            },
        ),
);
module.exports = {
    name: 'suppr-button',
    permissions: [],
    runInteraction: async (client, interaction) => {

        await interaction.reply({ content: 'Séléctionnez un anime à supprimer', components: [supprMenu], ephemeral: true})
    }
}