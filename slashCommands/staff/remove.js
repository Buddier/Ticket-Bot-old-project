module.exports = {
    name: "remove",
    type: "CHAT_INPUT",
    options: [
        {
            name: "user",
            description: "Write the user you want to remove to the ticket!",
            type: "USER",
            required: true
        }
    ],
    permissions: ["Staff"],
    category: "Staff",
    description: "Remove user to ticket!",
    run: async (client, interaction, args) => {
        let user = interaction.options.getUser("user");

        if(interaction.channel.name.includes("close") || interaction.channel.name.includes("ticket")) {
            interaction.channel.permissionOverwrites.edit(user.id, {
                ATTACH_FILES: false,
                READ_MESSAGE_HISTORY: false,
                SEND_MESSAGES: false,
                VIEW_CHANNEL: false
            });

            const embed = new client.discord.MessageEmbed()
            .setDescription(`${user} was removed to the ticket by ${interaction.user}`)
            .setColor(client.config.embeds.errorColor);

            interaction.reply({ embeds: [embed] });
        } else {
            interaction.reply({ content: "This command can only be used on tickets!", ephemeral: true });
        }
    }
}