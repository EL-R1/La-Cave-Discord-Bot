const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")}
const axios = require('axios');
const { writeFile } = require('fs');

module.exports = {
    name: 'ajout-modal-animes',
    runInteraction: async (client, interaction) => {
        //Récupération texte du modal
        const titre = interaction.fields.getTextInputValue('title');

        //Déclaration variable
        let id=[];
        let jour;
        let doublon = false;
        var jour_semaine = {
            nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
            nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
        };
        

        //prise en compte 
        if (databases.saison[interaction.guildId].id){
            id = databases.saison[interaction.guildId].id;
        }

        //Recherche nom anime natif
        url_name = "https://www.livechart.me/api/v1/anime?q="+titre;
        const response_name = await axios.get(url_name);
        
        if (response_name.data.items[0] != undefined){
            let title = encodeURIComponent(response_name.data.items[0].native_title.replace("-", " "));
        
            //Recherche infos anime
            let url = 'https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&type=tv&status=airing&q='+title;
            let response = await axios.get(url);

            if (response.data.data[0] == undefined){
                title = encodeURIComponent(response_name.data.items[0].romaji_title);
                url = 'https://api.jikan.moe/v4/anime?order_by=popularity&sort=asc&type=tv&status=airing&q='+title;
                response = await axios.get(url);
            }
            
            if(response.data.data[0] != undefined) {
                //Récupération nom
                let nom_anime = response.data.data[0].title_english;
                if(nom_anime == null){
                    nom_anime = response.data.data[0].title;
                }
                nom_anime = nom_anime.replace("Season", "- Saison");

                //Récupération jour sortie
                let i=0;
                let time;
                let day;
                while(response.data.data[i].broadcast.day == null){    
                    i++;
                }
                time = response.data.data[i].broadcast.time;
                day = response.data.data[i].broadcast.day;

                jour_semaine.nom_en.forEach((en, index) =>{
                    if (day == en){
                        if(time < "07:00"){
                            index = ((index == 0) ? index = 6 : index -= 1 );
                        }
                        jour = jour_semaine.nom_fr[index];
                    };
                });

                //Récupération id
                const id_anime_recherche = response.data.data[i].mal_id;

                //Détéction d'un anime en double
                console.log(id)
                id.forEach((id_present)=> {
                    if(parseInt(id_present.value) == id_anime_recherche){
                        doublon = true;
                    }
                });

                if (!doublon){
                    
                    //récupération du message actuel
                    const message = await interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message)
                    const embed = message.embeds[0];
            
                    //modification de la ligne (avec détéction du jour)
                    embed.fields.forEach((semaine, index)=>{
                        if (jour.toLowerCase() == semaine.name.toLowerCase()){
                            if (embed.fields[index].value == "-"){
                                embed.fields[index].value = "\n- "+nom_anime;
                            }else{
                                embed.fields[index].value += "\n- "+nom_anime;
                            }
                            
                        }
                    })
            
                    //modification du message
                    interaction.channel.messages.fetch(databases.saison[interaction.guildId].saison_message).then(msg => {msg.edit({ embeds: [embed, message.embeds[1]]})});
                    
                    //ajout aux id acutels
                    id.push({
                        label: nom_anime,
                        description: jour,
                        value: id_anime_recherche.toString(),
                        
                    });

                    //stockage de l'anime de l'embed pour éviter les doublons
                    databases.saison[interaction.guildId].id = id;
                    writeFile("data/saison.json", JSON.stringify(databases.saison), (err) => { if (err) { console.log(err) } }); 

                    //réponse
                    return interaction.reply({ content: 'Cet animé a été ajouté dans la liste', ephemeral: true });
                    
                }else{
                    //réponse
                    return interaction.reply({ content: 'Cet animé est déjà dans la liste', ephemeral: true });
                }
            }else{
                //réponse
                return interaction.reply({ content: 'Cet animé n\'existe pas ou n\'est pas dans les animes en cours / à venir', ephemeral: true });
            }
        }else{
            //réponse
            return interaction.reply({ content: 'Cet animé n\'existe pas ou n\'est pas dans les animes en cours / à venir', ephemeral: true });
        }
        
    }
};

