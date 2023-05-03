module.exports = {
    name: "add",
    type: "CHAT_INPUT",
    options: [
        {
            name: "user",
            description: "Write the user you want to add to the ticket!",
            type: "USER",
            required: true
        }
    ],
    permissions: ["Staff"],
    category: "Staff",
    description: "Add user to ticket!",
    run: async (client, interaction, args) => {
        let user = interaction.options.getUser("user");

        if(interaction.channel.name.includes("close") || interaction.channel.name.includes("ticket")) {
            interaction.channel.permissionOverwrites.edit(user.id, {
                ATTACH_FILES: true,
                READ_MESSAGE_HISTORY: true,
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            });

            const embed = new client.discord.MessageEmbed()
            .setDescription(`${user} was added to the ticket by ${interaction.user}`)
            .setColor(client.config.embeds.successColor);

            interaction.reply({ embeds: [embed] });
        } else {
            interaction.reply({ content: "This command can only be used on tickets!", ephemeral: true });
        }
    }
}