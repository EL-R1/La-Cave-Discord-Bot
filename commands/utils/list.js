const databases = { config: require("../../../data/config.json"), notifications: require("../../../data/notifications.json"), current_shows: require("../../../data/current_shows.json"), }

module.exports = {
    name: 'list',
    description: 'Liste les animes auxquels tu es notifié !',
    permissions: [],
    runInteraction: async (client, interaction) => {
        const notifications = databases.notifications;
        const currentData = databases.current_shows;
        const user_id = interaction.user.id;

        function getTitles(type, isAnime) {
            const notifs = notifications[type] || [];
            const data = currentData[type] || {};
            
            const keys = notifs
                .filter(obj => Object.values(obj)[0].includes(user_id))
                .map(obj => Object.keys(obj)[0]);

            if (keys.length === 0) {
                return `Pas encore de notifications pour ${type} :)`;
            }

            let titles
            if(isAnime){
                titles = keys.map(key => Object.values(data).find(item => item.id === String(key)).title);
            }else{
                titles = keys.map(key => Object.values(data).find(item => item.title === String(key)).title);
            }

            if (titles.length === 0) {
                return `Aucun titre trouvé pour les notifications de ${type} :(`;
            }

            return titles.map(title => `- ${title}`).join('\n');
        }

        const animeTitles = getTitles("animes", true);
        const seriesTitles = getTitles("series", false);

        const content = `Voici ta liste d'animes : \n\`\`\`${animeTitles}\`\`\`\nVoici ta liste de séries : \n\`\`\`${seriesTitles}\`\`\``;

        return interaction.reply({ content, ephemeral: true });

    }
}