module.exports = async(interaction, client) => {
    if (interaction.member.user.bot) return;
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== client.config.guildID) return;

    if (interaction.customId === "ticket-close-q" && interaction.channel.name.includes("ticket")) {
        let channel = interaction.channel;
        let user = interaction.guild.members.cache.get(channel.topic);

        const row = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
            .setStyle("SUCCESS")
            .setLabel("Yes Close")
            .setEmoji("🔒")
            .setCustomId("ticket-open-close"),
            new client.discord.MessageButton()
            .setStyle("SECONDARY")
            .setLabel("Cancel Close")
            .setEmoji("❌")
            .setCustomId("ticket-close-cancel")
        );

        const closeQ = new client.discord.MessageEmbed()
        .setDescription("Are you sure you want to close the ticket?\n\n**NOTE:** This message will be deleted in 20 seconds!")
        .setColor(client.config.embeds.waitingColor)
        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

        await interaction.reply({ embeds: [closeQ], components: [row] });

        const collector = channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 20000
        });

        collector.on('collect', async(i) => {
            if(i.customId === "ticket-open-close") {
                const row = new client.discord.MessageActionRow()
                .addComponents(
                    new client.discord.MessageButton()
                    .setStyle("DANGER")
                    .setLabel("Close Ticket")
                    .setEmoji("🔒")
                    .setDisabled(true)
                    .setCustomId("ticket-close-q")
                );

                await interaction.message.edit({ components: [row] })

                const rowCloseD = new client.discord.MessageActionRow()
                .addComponents(
                    new client.discord.MessageButton()
                    .setLabel("Delete Ticket")
                    .setStyle("DANGER")
                    .setEmoji("🗑️")
                    .setDisabled(true)
                    .setCustomId("ticket-delete")
                );

                const rowCloseE = new client.discord.MessageActionRow()
                .addComponents(
                    new client.discord.MessageButton()
                    .setLabel("Delete Ticket")
                    .setStyle("DANGER")
                    .setEmoji("🗑️")
                    .setDisabled(false)
                    .setCustomId("ticket-delete")
                );

                const closeEmbed = new client.discord.MessageEmbed()
                .setDescription(`Ticket close by <@!${i.user.id}>\n\n**NOTE:** The transcript is saved and is sent to the transcripts channel automatically by hitting the \`🗑️\` Delete Ticket button`)
                .setColor(client.config.embeds.errorColor)
                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                interaction.editReply({ embeds: [closeEmbed], components: [rowCloseD] }).then(() => setTimeout(() => {
                    interaction.channel.edit({ name: `close-${user.user.username}` });
                    interaction.editReply({ components: [rowCloseE] })
                }, 2000));;

                interaction.channel.permissionOverwrites.edit(user, {
                    VIEW_CHANNEL: false
                }).then(async () => {
                    if (client.config.channels.logs) {
                        const logsChannel = client.channels.cache.get(client.config.channels.logs);
            
                        const log = new client.discord.MessageEmbed()
                        .setTitle("Tickets | Logs")
                        .addFields(
                            { name: "Action", value: "Close Ticket" },
                            { name: "By", value: `<@!${i.user.id}>` },
                            { name: "Channel", value: `${interaction.channel.name}` },
                            { name: "Ticket Owner", value: `<@!${user.id}>` }
                        )
                        .setColor(client.config.embeds.waitingColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
            
                        logsChannel.send({ embeds: [log] });
                    }
                });

                i.deferUpdate();
                collector.stop();
            };

            if(i.customId === "ticket-close-cancel") {
                interaction.deleteReply();
                collector.stop();
            }
        });

        collector.on('end', (i) => {
            if (i.size < 1) {
                interaction.deleteReply();
            }
        });
    }
}