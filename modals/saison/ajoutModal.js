const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json"), all_anime: require("../../data/all_anime.json"), }
const axios = require('axios');
const { writeFile } = require('fs');

module.exports = {
    name: 'ajout-modal',
    async runInteraction(client, interaction) {
        //Récupération texte du modal
        const titre = interaction.fields.getTextInputValue('saison-title');
        const saison = interaction.fields.getTextInputValue('saison-season');

        //Déclaration de variables
        let id_anime_recherche=[];
        let has_more = true;
        let offset=0;
        let dateStr;
        let doublon = false;
        let trouve = false;
        let id = [];

        //prise en compte 
        if (databases.saison[interaction.guildId].id){
            id = databases.saison[interaction.guildId].id;
        }
        
        //traduction date en jour français
        function getDayName(dateStr, locale){
            let date = new Date(dateStr);
            return date.toLocaleDateString(locale, { weekday: 'long' });        
        }

        //Stockage tous les animes potentiel de la recherche
        while (has_more){
            url = 'https://www.livechart.me/api/v1/anime?q='+titre+'&offset='+offset;
            const response = await axios.get(url);
            response.data.items.forEach((anime)=>{
                id_anime_recherche.push(anime.id);
            })
            has_more = response.data.has_more;
            offset+=50;
        }

        //Détéction d'un anime déjà noté
        id_anime_recherche.forEach((anime_recherche)=> {
            id.forEach((id_present)=> {
                if(id_present == anime_recherche){
                    doublon = true;
                }
            }); 
        });

        //comparaison entre tous les animes de la recherche et des animes de la saison
        if (!doublon){
            databases.all_anime[interaction.guildId].all_anime.forEach((anime_saison)=>{
                anime_saison.forEach((anime_dans_saison)=>{
                    id_anime_recherche.forEach((anime_recherche)=> {
                        if(anime_dans_saison.anime.id == anime_recherche){
                            dateStr = anime_dans_saison.anime.premiere_date;
                            jour = getDayName(dateStr, "fr-FR");
                            id.push(anime_recherche);
                            trouve = true;
                        }
                    });
                });
                
            });
            
            if (trouve){

                //Détection de d'une saison ou d'une partie / nom de partie
                if (saison.length <= 2){
                    ajout_anime="\n- "+titre+" - Saison "+saison;
                }else{
                    ajout_anime="\n- "+titre+" - "+saison;
                }
                

                //stockage de l'anime de l'embed pour éviter les doublons
                databases.saison[interaction.guildId].id = id;
                writeFile("data/saison.json", JSON.stringify(databases.saison), (err) => { if (err) { console.log(err) } }); 
        
                //récupération du message actuel
                const message = await interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message)
                const embed = message.embeds[0];
        
                //modification de la ligne (avec détéction du jour)
                embed.fields.forEach((semaine, index)=>{
                    if (jour == semaine.name.toLowerCase()){
                        if (embed.fields[index].value == "-"){
                            embed.fields[index].value = ajout_anime;
                        }else{
                            embed.fields[index].value += ajout_anime;
                        }
                        
                    }
                })
        
                //modification du message
                interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message).then(msg => {msg.edit({ embeds: [embed, message.embeds[1]]})});
                
                //réponse
                return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true })

            }else{
                //réponse
                return interaction.reply({ content: 'Cet animé n\'est pas dans la liste des animés de saison, veuillez en mettre un actuel', ephemeral: true })
            }
            
        }else{
            //réponse
            return interaction.reply({ content: 'Cet animé est déjà dans la liste', ephemeral: true })
        }

       
    
    }
};