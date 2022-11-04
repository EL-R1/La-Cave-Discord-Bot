const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")}

module.exports = {
    name: 'ajout-modal-series',
    runInteraction: async (client, interaction) => {
        //Récupération texte du modal
        const titre = interaction.fields.getTextInputValue('title');
        const saison = interaction.fields.getTextInputValue('saison-title');
        console.log(titre, saison)
        //Déclaration Variables
        const titre_final = "\n- "+titre+" - Saison "+saison;


        //récupération du message actuel
        const message = await interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message)
        const embed = message.embeds[1];
        console.log(embed.fields[0].value)
        //modification de la ligne (avec détéction du jour)
        if (embed.fields[0].value == "-"){
            embed.fields[0].value = titre_final;
        }else{
            embed.fields[0].value += titre_final;
        }

        //modification du message
        interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message).then(msg => {msg.edit({ embeds: [message.embeds[0], embed]})});
        
        //réponse
        return interaction.reply({ content: 'Cette série a été ajouté dans la liste', ephemeral: true });
        

        
    }
};


