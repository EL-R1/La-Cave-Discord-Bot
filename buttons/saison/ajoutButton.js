const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField, Events } = require('discord.js');

const ajoutModalAnimes = new ModalBuilder()
    .setCustomId('ajout-modal-animes')
    .setTitle('Entrez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`My Hero Academia (pas besoin de préciser la saison)`)
                .setRequired(true)
        )
    ]);


 const ajoutModalSeries = new ModalBuilder()
    .setCustomId('ajout-modal-series')
    .setTitle('Entrez un nouvel anime')
    .addComponents([
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('title')
                .setLabel('Titre')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`DARK`)
                .setRequired(true)                
        ),
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('saison-title')
                .setLabel('Numero de la saison')
                .setMaxLength(2)
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(`1, 2, 3...`)
                .setRequired(true)
        )
    ]);

const ChoixAjout = new ActionRowBuilder()
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
    name: 'ajout-button',
    permissions: [],
    runInteraction: async (client, interaction) => {
        await interaction.reply({ content: 'Séléctionnez un type de media pour AJOUTER', components: [ChoixAjout], ephemeral: true})
        client.on(Events.InteractionCreate, async interaction => {
            if (!interaction.isSelectMenu()) return;
            const selected = interaction.values[0];
            
            if (selected === 'anime') {
                await interaction.showModal(ajoutModalAnimes);
            } else if (selected === 'serie') {
                await interaction.showModal(ajoutModalSeries);
            }
            await interaction.editReply({ content: 'Séléctionnez un type de media pour AJOUTER', components: [ChoixAjout], ephemeral: true})
        });
    }
}