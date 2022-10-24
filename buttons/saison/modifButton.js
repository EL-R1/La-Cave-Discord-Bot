const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")}
const axios = require('axios');
const { writeFile } = require('fs');

module.exports = {
    name: 'modif-button',
    permissions: [],
    runInteraction: async (client, interaction) => {
        
        //récupération de la saison enregistré
        let titre = databases.saison[interaction.guildId].nom_saison;
        
        //récupération de la saison actuelle
        url = 'https://www.livechart.me/api/v1/charts/nearest';         
        const response = await axios.get(url);

        //assignations de variables
        let nom_saison = response.data.slug;
        let affichage_saison = response.data.title;

        //récupération du message
        const message = await interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message);
        const embed = message.embeds[0];
        
        //modification du message
        if(nom_saison != titre){
            embed.data.title = "Anime - "+affichage_saison;

            databases.saison[interaction.guildId].nom_saison = nom_saison;
            writeFile("data/saison.json", JSON.stringify(databases.saison), (err) => { if (err) { console.log(err) } });

            interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message)
            .then(msg => {msg.edit({ embeds: [embed, message.embeds[1]]})});

            return interaction.reply({ content: 'La saison a changé', ephemeral: true })
        }else{
            return interaction.reply({ content: 'La saison n\'a pas changé', ephemeral: true })
        }             
        
    }
}
