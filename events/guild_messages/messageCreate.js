const databases = { suggest: require("../../../data/suggest.json"), report: require("../../../data/report.json"), current_shows: require("../../../data/current_shows.json"), config: require("../../../data/config.json"), notifications: require("../../../data/notifications.json") }
const yarss = { yarss: require("../../../data/yarss2/yarss2.json") }
const { writeFile } = require('fs');
const axios = require('axios');
const { log } = require("console");
const dotenv = require('dotenv');
dotenv.config({ path: '../.env'});

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        async function getJour(id) {
            let jour_;
            let time_;
            const url = `https://api.jikan.moe/v4/anime/${id}`;
            const response = await axios.get(url, {
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            });
            //Date de Japon  à france   
            const jour_semaine = {
                nom_fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
                nom_en: ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
            };

            for (const data in response.data.data) {
                if (data === "broadcast") {
                    const day = response.data.data[data].day;
                    time_ = response.data.data[data].time;
                    let index = jour_semaine.nom_en.findIndex((en) => en === day);

                    if (index !== -1) {
                        if (time_ < "07:00") {
                            index = index === 0 ? index = 6 : index -= 1;
                        }
                        jour_ = jour_semaine.nom_fr[index];
                        break;
                    }
                }
            }

            if (!jour_) return undefined;

            return jour_;
        }

        function setYarss(path_title, path_season, command) {
            //Yarss2 config
            const key = Object.keys(yarss.yarss.subscriptions).length;
            const new_show_sub = JSON.parse('{"active": true,"add_torrents_in_paused_state": "Default","auto_managed": "Default","custom_text_lines": "","download_location": "/ocean/animes/One Piece/S1/","email_notifications": {},"ignore_timestamp": false,"key": "0","label": "","last_match": "","max_connections": -2,"max_download_speed": -2,"max_upload_slots": -2,"max_upload_speed": -2,"move_completed": "/ocean/animes/One Piece/S1/","name": "One Piece","prioritize_first_last_pieces": "Default","regex_exclude": "(?i) FRENCH | MULTI |.mp4|AMZN|HULU|B-Global|S\d{2}E\d{2}-","regex_exclude_ignorecase": true,"regex_include": "(?i)One Piece.*1080p","regex_include_ignorecase": true,"rssfeed_key": "0","sequential_download": "Default"}');
            const date = new Date(new Date(Date.now()).setDate(new Date(Date.now()).getDate() - 1)).toISOString().replace(/\.\d+/, "").replace(/Z$/, "+00:00");
            const date_now = new Date(Date.now()).toISOString().replace(/\.\d+/, "").replace(/Z$/, "+00:00");

            path_title = path_title.replace(/[’]+/, "'");
            path_title = path_title.replace(/[.]+/, ". ");
            path_title = path_title.replace(/[\[\]]/g, "");
            const replaced_title = path_title.replace(/[\/#+$~%"`:;*<>\[{}|^@!,? ]+/, " ").replace("  ", " ").trim();

            const path = `/ocean/${command}/${replaced_title}/S0${path_season}`;
            const regex = replaced_title.split(" ").slice(0, 2).join(" ");
            const regex_words = regex.split(" ");
            const regex_results = regex_words.map(function (word) {
                return "(?=.*" + word + ")";
            });
            const result = regex_results.join("");

            new_show_sub.key = String(`${key}`);
            new_show_sub.last_match = String(`${date}`);
            new_show_sub.name = replaced_title;
            new_show_sub.download_location = path;
            new_show_sub.move_completed = path;
            new_show_sub.regex_include = `(?i)${result}(?=.*1080p)(?=.*S\\d{2}E\\d{2}).+`;

            if (command === "animes"){
                new_show_sub.regex_exclude = `(?i) FRENCH | MULTI |.mp4|AMZN|HULU|B-Global|S\d{2}E\d{2}-`
            }else if (command === "series"){
                new_show_sub.regex_exclude = `(?i) FRENCH |.mp4|AMZN|HULU|B-Global|S\d{2}E\d{2}-`
            }
            

            const rssJson = yarss.yarss;

            for (const key in rssJson.subscriptions) {
                const sub = rssJson.subscriptions[key];
                sub.last_match = String(`${date_now}`);
                rssJson.subscriptions[key] = JSON.parse(JSON.stringify(sub));
            }

            rssJson.subscriptions[key] = new_show_sub;

            rssJson.rssfeeds['4'].site = process.env.BASE_URL_YGG;
            rssJson.rssfeeds['4'].url = process.env.BASE_URL_YGG + "/rss?action=generate&type=subcat&id=2184&passkey=" + process.env.PASSKEY_YGG_R1;

            rssJson.rssfeeds['5'].site = process.env.BASE_URL_YGG;
            rssJson.rssfeeds['5'].url = process.env.BASE_URL_YGG + "/rss?action=generate&type=subcat&id=2179&passkey=" + process.env.PASSKEY_YGG_R1;
            

            const configDataRss = JSON.stringify(rssJson, null, 4)
            writeFile("../data/yarss2/yarss2.json", configDataRss, (err) => { if (err) { console.log(err) } });

            const conf = JSON.stringify(yarss.yarss, null, 4);
            const str_start = JSON.stringify(JSON.parse('{"file": 8,"format": 1}'), null, 2);
            const str_FINAL = str_start + conf
            writeFile("../data/yarss2/yarss2.conf", str_FINAL, (err) => { if (err) { console.log(err) } });

        }

        const msg_type = [0, 20];

        if (message.guildId !== null && message.author.bot && (msg_type.includes(message.type)) && message.embeds.length !== 0 && message.webhookId === null) {
            const config = databases.config[message.guildId];
            let id;
            let channelId;
            let message_value;
            let command = false;
            let jour;
            let path_title;
            let path_season;
            let title;

            if (message.channelId === config["report"]) {
                command = "report";
            } else if ((config["animes"] && config["series"]) || config["suggest"]) {

                const types = ["suggest", "animes", "series"];
                const channels = {};
                const threads = {};

                for (const type of types) {
                    channels[type] = message.guild.channels.cache.get(config[type]);
                    if (channels[type]) {
                        threads[type] = await channels[type].threads.fetch(config[`${type}-thread`]);
                        if (threads[type]) {
                            if (threads[type].parentId === message.channelId || threads[type].id === message.channelId) {
                                command = type;
                                channelId = threads[type].parentId;

                                if (command === "animes" || command === "series") {
                                    channelId = config[command];
                                    const dernier_objet = databases.notifications[command][databases.notifications[command].length - 1];

                                    if (command === "animes") {
                                        id = Object.keys(dernier_objet)[Object.keys(dernier_objet).length - 1];
                                        jour = await getJour(id);
                                    } else if (command === "series") {
                                        title = Object.keys(dernier_objet)[Object.keys(dernier_objet).length - 1];
                                        console.log("title : ", title)
                                    }
                                    
                                }
                            }
                        }
                    }
                }
            }

            if (command) {

                let compare;
                if (command !== "report") {
                    compare = (message.channelId !== channelId)
                    if (command === "suggest") {
                        id = channelId;
                    } else if (command === "animes" || command === "series") {
                        //récupération du message actuel
                        const embed_animes = await message.embeds[0];

                        path_title = embed_animes.fields.filter(item => item.name === 'path_title').map(item => item.value)[0];
                        path_season = embed_animes.fields.filter(item => item.name === 'path_season').map(item => item.value)[0];
                        if (!jour) jour = embed_animes.fields.filter(item => item.name === 'Jour').map(item => item.value)[0];

                        let index = await embed_animes.fields.findIndex(({ name }) => name === 'path_title');
                        if (index !== -1) embed_animes.fields.splice(index, 1);

                        index = await embed_animes.fields.findIndex(({ name }) => name === 'path_season');
                        if (index !== -1) embed_animes.fields.splice(index, 1);

                        setTimeout(() => {
                            message.edit({ embeds: [embed_animes] });
                        }, 2000)
                    }
                }
                else {
                    compare = (message.channelId === config[command]);
                }
                if (compare) {
                    message_value = message.id;
                } else {
                    let value;
                    let key;
                    if (command === "suggest") {
                        const value = Object.values(databases[command]).find(o => o.id === id);
                        const index = Object.values(databases[command]).indexOf(value);
                        key = Object.keys(databases[command])[index];

                        id = undefined;
                    } else {
                        if (command === "animes") {
                            value = Object.values(databases.current_shows[command]).find(o => o.id === id);
                        }else if(command === "series"){
                            value = Object.values(databases.current_shows[command]).find(o => o.title === title);
                        }
                        const index = Object.values(databases.current_shows[command]).indexOf(value);
                        key = Object.keys(databases.current_shows[command])[index];
                    }
                    message_value = key;

                };
                if ((command === "animes" || command === "series")) {
                    databases.current_shows[command][message_value] = {
                        author: undefined,
                        title: message.embeds[0].title,
                        media: undefined,
                        id: command === 'animes' ? id : undefined,
                        message_id: message.id,
                        day: jour,
                    }
                } else {
                    databases[command][message_value] = {
                        author: client.users.cache.find(user => user.username == message.embeds[0].footer.text.split("#")[0]).id,
                        title: message.embeds[0].title,
                        media: command === 'report' ? message.embeds[0].fields[0].value : undefined,
                        id: command !== 'report' ? id : undefined,
                        message_id: command !== 'report' ? message.id : undefined,
                        day: undefined,
                    }
                }

                const configData = JSON.stringify(databases.current_shows, null, 4);
                writeFile(`../data/current_shows.json`, configData, (err) => { if (err) { console.log(err) } });
                if ((command === "animes" || command === "series") && compare) {
                    setYarss(path_title, path_season, command);
                }
            }

        }

        if (!message.author.bot && message.content.startsWith("+suggest")) {
            return message.reply({ content: `La commande +suggest n'existe plus ! Veuillez utiliser **\`/suggest\`** à la place !` });
        }


        // if (message.author.bot) return;
        // if (!message.content.startsWith(prefix)) return;

        // const args = message.content.slice(prefix.length).trim().split(/ +/g);
        // const cmdName = args.shift().toLowerCase();
        // if (cmdName.length == 0) return;

        // let cmd = client.commands.get(cmdName);
        // if (cmd) cmd.run(client, message, args);
    },
}