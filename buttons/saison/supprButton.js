const { TextInputBuilder, TextInputStyle, ActionRowBuilder, ModalBuilder, SelectMenuBuilder, PermissionsBitField, Events, EmbedBuilder } = require('discord.js');
const databases = { config: require("../../data/config.json"), saison: require("../../data/saison.json")};
const axios = require('axios');
const supprAnimes = require('../../modals/saison/supprAnimes');
const { writeFile } = require('fs');

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

const embed_series = new EmbedBuilder()
.setTitle(`Series`)
.addFields(
    { name: `En cours`, value: '-', inline: false },
);

module.exports = {
    name: 'suppr-button',
    permissions: [],
    runInteraction: async (client, interactionSuppr) => {
        let all_anime = [];
        let id;
        await interactionSuppr.reply({ content: 'Séléctionnez un type de media pour SUPPRIMER', components: [choixSuppr], ephemeral: true})
        client.on(Events.InteractionCreate, async interactionSuppr => {
            const selected = await interactionSuppr.values[0];
        
            if (selected === 'anime') {
                id = databases.saison[interactionSuppr.guildId].id;

                all_anime = new ActionRowBuilder()
                    .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('all-anime')
                        .setPlaceholder('Choisis ton anime')
                        .addOptions(id)
                );

                await interactionSuppr.update('Chargement des animes...');
                await interactionSuppr.editReply({ content: 'Séléctionnez un anime à SUPPRIMER', components: [all_anime], ephemeral: true})
                client.on(Events.InteractionCreate, async interactionSuppr => {
                    const selected_id = interactionSuppr.values[0];

                    const embed_animes = new EmbedBuilder()
                        .setTitle("Anime - "+databases.saison[interactionSuppr.guildId].nom_saison)
                        .addFields(
                            { name: `Lundi`, value: '-', inline: false },
                            { name: `Mardi`, value: '-', inline: false },
                            { name: `Mercredi`, value: '-', inline: false },
                            { name: `Jeudi`, value: '-', inline: false },
                            { name: `Vendredi`, value: '-', inline: false },
                            { name: `Samedi`, value: '-', inline: false },
                            { name: `Dimanche`, value: '-', inline: false },
                        );

                    id.forEach((id_present, index)=> {
                        if(parseInt(id_present.value) == selected_id){
                            id.splice(index, 1)
                        }
                    });

                    databases.saison[interactionSuppr.guildId].id = id;
                    writeFile("data/saison.json", JSON.stringify(databases.saison), (err) => { if (err) { console.log(err) } }); 
                    
                    id = databases.saison[interactionSuppr.guildId].id;

                    all_anime = new ActionRowBuilder()
                        .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('all-anime')
                            .setPlaceholder('Choisis ton anime')
                            .addOptions(id)
                    );

                    const message = await interactionSuppr.channel.messages.fetch(databases.saison[interactionSuppr.guildId].saison_message)
                    console.log(embed_animes.data.fields)
                    embed_animes.data.fields.forEach((semaine, index)=>{
                        id.forEach((detail_anime) => {
                            if (detail_anime.description.toLowerCase() == semaine.name.toLowerCase()){
                                if (embed_animes.data.fields[index].value == "-"){
                                    embed_animes.data.fields[index].value = "\n- "+detail_anime.label;
                                }else{
                                    embed_animes.data.fields[index].value += "\n- "+detail_anime.label;
                                }
                                
                            }
                        });
                        
                    });

                    await interactionSuppr.update('Chargement des animes...');
                    await interactionSuppr.editReply({ content: 'Séléctionnez un anime à SUPPRIMER', components: [all_anime], ephemeral: true});
                    console.log(Object.keys(id).length)

                    await interactionSuppr.channel.messages.fetch(databases.saison[interactionSuppr.guildId].saison_message).then(msg => {msg.edit({ embeds: [embed_animes, message.embeds[1]]})});
                    

                });

               
            } else if (selected === 'serie') {
                
                await interactionSuppr.update('Chargement des series...');
                await interactionSuppr.editReply({ content: 'Séléctionnez une série à SUPPRIMER', components: [all_anime], ephemeral: true})
                
            }
        });
    }
}