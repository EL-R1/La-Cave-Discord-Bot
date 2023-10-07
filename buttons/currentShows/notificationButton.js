const databases = { config: require("../../../data/config.json"), current_shows: require("../../../data/current_shows.json"), notifications: require("../../../data/notifications.json") }
const { writeFile } = require('fs');


module.exports = {
    name: 'notification-button',
    permissions: [],
    runInteraction(client, interaction) {
        const channelId = interaction.channelId;
        let type;

        if (channelId === databases.config[interaction.guildId]["animes"]){
            type = "animes";
        }else if (channelId === databases.config[interaction.guildId]["series"]){
            type = "series";
        }
        
        const value = Object.values(databases.current_shows[type]).find(o => o.message_id === interaction.message.id);
        let content = "";
        const search_value = (type === "animes") ? value.id : (type === "series") ? value.title : undefined;

        const obj = databases.notifications[type].find(obj => Object.keys(obj)[0] === String(search_value));
        if (obj) {
            const exists = obj[String(search_value)].includes(interaction.user.id);
            if (exists) {
                obj[String(search_value)].splice(obj[search_value].indexOf(interaction.user.id), 1);
                content = `[ :x: ] Tu as enlevé **\`${value.title}\`** de ta liste de notification ! \n **\`/list\`** pour voir toutes tes notifications`
            } else {
                obj[String(search_value)].push(interaction.user.id);
                content = `[ :white_check_mark: ] Tu as ajouté **\`${value.title}\`** à ta liste de notification ! \n **\`/list\`** pour voir toutes tes notifications`
            }
        }
        const configData = JSON.stringify(databases.notifications, null, 4);
        writeFile("../data/notifications.json", configData, (err) => { if (err) { console.log(err) } });
        return interaction.reply({ content: content, ephemeral: true })
    }
};