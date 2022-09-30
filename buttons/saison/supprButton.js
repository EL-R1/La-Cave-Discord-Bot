const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField } = require('discord.js');

const supprModal = new ModalBuilder()
    .setCustomId('suppr-modal')
    .setTitle('Choisissez un jour de la semaine :')
    .addComponents([
        new SelectMenuBuilder()
            .setCustomId('suppr-menu')
            .setPlaceholder('Choisissez un jour de la semaine')
            .addOptions(
                {
                    label:"Lundi",
                    description: "test",
                    value:"Lundi",
                },
                {
                    label:"Mardi",
                    description: "test",
                    value:"Mardi",
                }
            
            )
        
    ]);
module.exports = {
    name: 'suppr-button',
    permissions: [],
    runInteraction(client, interaction) {
        interaction.showModal(supprModal);
    }
}