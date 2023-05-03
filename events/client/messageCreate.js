module.exports = async(message, client) => {
    if (message.author.bot || !message.guild || !message.content.toLowerCase().startsWith(client.config.prefix)) return;

    const [cmd, ...args] = message.content.slice(client.config.prefix.length).trim().split(" ");

    const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));

    if (!command) return;

    if (command.ownerOnly) {
        if (message.author.id !== client.config.ownerID) {
            return message.reply({ content: "This command only for Bot Owner!", allowedMentions: { repliedUser: false } });
        }
    }

    await command.run(client, message, args);
}