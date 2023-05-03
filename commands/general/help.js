module.exports = {
    name: "help",
    aliases: ["h", "ayuda"],
    category: "General",
    description: "Return help message!",
    run: async (client, message, args) => {
        const embed = new client.discord.MessageEmbed()
        .setTitle("Bot | Help")
        .setDescription("If you need help you can open a ticket in the <#942461447106084974> channel or go to teamspeak ts.asd.net!")
        .setColor(client.config.embeds.mainColor)
        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
}