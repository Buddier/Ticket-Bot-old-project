const fs = require("fs");
const chalk = require("chalk");

/**
 * Load Events
 */
const loadEvents = async function (client) {
    const clientEvent = (event) => require(`../events/client/${event}`);
    const ticketEvent = (event) => require(`../events/ticket/${event}`);

    // Client Events
    client.on("ready", () => clientEvent("ready")(client));
    client.on("messageCreate", (m) => clientEvent("messageCreate")(m, client));
    client.on("interactionCreate", (m) => clientEvent("interactionCreate")(m, client));

    // Ticket Events
    client.on("interactionCreate", (m) => ticketEvent("clickOpenButton")(m, client));
    client.on("interactionCreate", (m) => ticketEvent("clickCloseButton")(m, client));
    client.on("interactionCreate", (m) => ticketEvent("clickDeleteButton")(m, client));
}

/**
 * Load Prefix Commands
 */
const loadCommands = async function (client) {
    const commandFolders = fs.readdirSync("./commands");
    for (const folder of commandFolders) {
        const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
        
        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            
            if (command.name) {
                client.commands.set(command.name, command);
                console.log(chalk.bgBlueBright.black(` ✔️ => Prefix Command ${file} is being loaded `));
            } else {
                console.log(chalk.bgRedBright.black(` ❌ => Prefix Command ${file} missing a help.name or help.name is not in string `));
                continue;
            }
            
            if (command.aliases && Array.isArray(command))
            command.aliases.forEach((alias) => client.aliases.set(alias, command.name));
        }
    }
}

/**
 * Load SlashCommands
 */
const loadSlashCommands = async function (client) {
    let slash = []

    const commandFolders = fs.readdirSync("./slashCommands");
    for (const folder of commandFolders) {
        const commandFiles = fs
        .readdirSync(`./slashCommands/${folder}`)
        .filter((file) => file.endsWith(".js"));
        
        for (const file of commandFiles) {
            const command = require(`../slashCommands/${folder}/${file}`);
            
            if (command.name) {
                client.slash.set(command.name, command);
                slash.push(command)
                console.log(chalk.bgBlueBright.black(` ✔️ => SlashCommand ${file} is being loaded `));
            } else {
                console.log(chalk.bgRedBright.black(` ❌ => SlashCommand ${file} missing a help.name or help.name is not in string `));
                continue;
            }
            if (command.userPerms) {
                command.defaultPermission = false;
            }
        }
    }

    client.on("ready", async() => {
        const guild = client.guilds.cache.get(client.config.guildID);
        await guild.commands.set(slash).then((cmd) => {
            const getRoles = (commandName) => {
                const permissions = slash.find(x => x.name == commandName).permissions;
                if (!permissions) return null;
    
                const arrayRoles = client.config.permissions[permissions];
                return guild.roles.cache.filter(x => arrayRoles?.includes(x.id) || arrayRoles?.includes(x.name));
            }

            const fullPermissions = cmd.reduce((accumulator, x) => {
                const roles = getRoles(x.name);

                if (!roles) return accumulator;

                const permissions = roles.reduce((a, v) => {
                    return [
                        ...a,
                        {
                            id: v.id,
                            type: "ROLE",
                            permission: true,
                        },
                        {
                            id: guild.id,
                            type: "ROLE",
                            permission: false,
                        }
                    ]
                }, [])

                return [
                    ...accumulator,
                    {
                        id: x.id,
                        permissions
                    }
                ]
            }, [])

            guild.commands.permissions.set({ fullPermissions });
        })
    })
}

module.exports = {
    loadEvents,
    loadCommands,
    loadSlashCommands
}