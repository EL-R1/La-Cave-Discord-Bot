const databases = { suggests: require("../../data/suggests.json"), reports: require("../../data/reports.json") , config: require("../../data/config.json") }
const { writeFile } = require('fs');

module.exports = {
    name: 'messageCreate',
    once: false,
    execute(client, message) {

        if ((message.type == 18) && (message.channel.id == databases.config[message.guildId].report)) { message.delete(); }

        if (message.author.bot && (message.channel.id == databases.config[message.guildId].suggest) && (message.embeds.length == 1)) {
            let author = client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id;
            databases.suggests[message.id] = {
                author: author,
                title: message.embeds[0].title
            }

            writeFile("data/suggests.json", JSON.stringify(databases.suggests), (err) => { if (err) { console.log(err) } });
        }

        if (message.author.bot && (message.channel.id == databases.config[message.guildId].report) && (message.embeds.length == 1)) {
            let author = client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id;
            databases.reports[message.id] = {
                author: author,
                title: message.embeds[0].title,
                media: message.embeds[0].fields[0].value
            }

            writeFile("data/reports.json", JSON.stringify(databases.reports), (err) => { if (err) { console.log(err) } });
        }

        // if (message.content.startsWith("+suggest")) {
        //     message.delete();
        //     message.channel.send({ content: `La commande +suggest n'existe plus ! Veuillez utiliser /suggest à la place !`, ephemeral: true })
        // }

        return;
        // if (message.author.bot) return;
        // if (!message.content.startsWith(prefix)) return;
    
        // const args = message.content.slice(prefix.length).trim().split(/ +/g);
        // const cmdName = args.shift().toLowerCase();
        // if (cmdName.length == 0) return;

        // let cmd = client.commands.get(cmdName);
        // if (cmd) cmd.run(client, message, args);
    },
}