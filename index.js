const chalk = require("chalk");
const fs = require("fs");
const yaml = require("js-yaml");
const Discord = require("discord.js");
const handler = require("./handler/index");
const { checkValid } = require("./exports/checkValid");
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION' ],
    allowedMentions: { parse: ["users", "roles"] },
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILD_INVITES,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
    ],
});
module.exports = client;

function loadFile(file) {
    return (myFile = yaml.safeLoad(fs.readFileSync(`${file}`, "utf8")));
}

client.discord = Discord;
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.config = loadFile(`./settings/config.yml`);

handler.loadEvents(client);
handler.loadCommands(client);
handler.loadSlashCommands(client);
checkValid(client);

// Error Handling

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception: " + err);
});
  
process.on("unhandledRejection", (reason, promise) => {
    console.log("[FATAL] Possibly Unhandled Rejection at: Promise ", promise, " reason: ", reason.message);
});

client.login(client.config.token).then(() => {
    console.log(chalk.bgBlueBright.black(` Successfully logged in as: ${client.user.username}#${client.user.discriminator} `));
});