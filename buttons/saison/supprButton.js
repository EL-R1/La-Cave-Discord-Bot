const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField, Events } = require('discord.js');


const databases = { saison: require("../../data/saison.json") };


let anime = [];

const choixSuppr = new ActionRowBuilder()
    .addComponents(
        new SelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions([
                {
                    label: 'Un Anime ?',
                    value: 'anime',
                },
                {
                    label: 'Une Série ?',
                    value: 'serie',
                },
            ]),
    );
module.exports = {
    name: 'suppr-button',
    permissions: [],
    runInteraction: async (client, interaction) => {
        await interaction.reply({ content: 'Séléctionnez un type de media pour SUPPRIMER', components: [choixSuppr], ephemeral: true})
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isSelectMenu()) return;
        
            const selected = interaction.values[0];
        
            if (selected === 'anime') {
                await interaction.showModal(supprAnimes);
            } else if (selected === 'serie') {
                await interaction.showModal(supprSeries);
            }
            await interaction.editReply({ content: 'Séléctionnez un type de media pour SUPPRIMER', components: [ChoixAjout], ephemeral: true})
        });
    }
}