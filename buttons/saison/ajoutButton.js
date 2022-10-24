const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField } = require('discord.js');

const ajoutModal = new ModalBuilder()
    .setCustomId('ajout-modal')
    .setTitle('Entrez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('saison-title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`My Hero Academia (pas besoin de préciser la saison)`)
                .setRequired(true)
        )
    ]);
module.exports = {
    name: 'ajout-button',
    permissions: [],
    runInteraction: async (client, interaction) => {
        await interaction.showModal(ajoutModal);
    }
}