module.exports = {
    name: "send-panel",
    type: "CHAT_INPUT",
    options: [
        {
            name: "channel",
            description: "Example: #ticket-panel",
            type: "CHANNEL",
            channelTypes: ["GUILD_TEXT"],
            required: true
        }
    ],
    permissions: ["Admin"],
    category: "Admin",
    description: "Send ticket panel to specific channel!",
    run: async (client, interaction, args) => {
        const channel = interaction.options.getChannel("channel");

        const row = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
            .setStyle("SECONDARY")
            .setLabel("Open Ticket")
            .setEmoji("📩")
            .setCustomId("open-ticket")
        );

        const embed = new client.discord.MessageEmbed()
        .setTitle("Create ticket")
        .setDescription("To create a ticket react with 📩")
        .setColor(client.config.embeds.mainColor)
        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

        interaction.reply({ content: `Ticket panel success send to ${channel}!`, ephemeral: true });
        return channel.send({ embeds: [embed], components: [row] });
    }
}