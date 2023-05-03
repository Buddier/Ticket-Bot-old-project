const sourcebin = require('sourcebin_js');

module.exports = async(interaction, client) => {
    if (interaction.member.user.bot) return;
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== client.config.guildID) return;

    if (interaction.customId === "ticket-delete" && interaction.channel.name.includes("close")) {
        let channel = interaction.channel;
        const transcriptsChannel = client.channels.cache.get(client.config.channels.transcripts);
        let user = interaction.guild.members.cache.get(channel.topic);

        const rowCloseD = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
            .setLabel("Delete Ticket")
            .setStyle("DANGER")
            .setEmoji("🗑️")
            .setDisabled(true)
            .setCustomId("ticket-delete")
        );

        interaction.message.edit({ components: [rowCloseD] });

        interaction.deferUpdate();

        const saving = new client.discord.MessageEmbed()
        .setDescription(`Saving transcript...`)
        .setColor(client.config.embeds.waitingColor);

        let msg = channel.send({ embeds: [saving] });

        const users = interaction.channel.messages.cache.filter(m => m.author.id !== interaction.client.user.id).map(m => m.author.id);
        const usersData = users.map(u => interaction.client.users.cache.get(u));
        const usersX = [];
        usersData.forEach(u => {
            const messages = interaction.channel.messages.cache.filter(m => m.author.id === u.id).size;
            usersX.push(`${messages} | <@!${u.id}> - ${u.tag}`);
        });
        const uniqueUsers = [...new Set(usersX)]

        channel.messages.fetch().then(async (messages) => {
            const content = messages.reverse().map(m => `${new Date(m.createdAt).toLocaleString('en-US')} - ${m.author.tag}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');
    
            let response;
            response = await sourcebin.create([{ name: `${channel.name}`, content: content, languageId: 'text' }], {
                title: `Chat transcript for ${channel.name}`,
                description: ' ',
            });
    
            const row = new client.discord.MessageActionRow()
            .addComponents(
                new client.discord.MessageButton()
                .setLabel("Go to Transcript")
                .setStyle("LINK")
                .setEmoji("📑")
                .setURL(`${response.url}`)
            );
    
            const embed = new client.discord.MessageEmbed()
            .setTitle("Tickets | Transcripts")
            .addFields(
                { name: "Channel", value: `${interaction.channel.name}` },
                { name: "Ticket Owner", value: `<@!${user.id}>` },
                { name: "Direct Transcript", value: `[Direct Transcript](${response.url})` },
                { name: "Users in transcript", value: `${uniqueUsers.join("\n") || "No users!"}` }
            )
            .setColor(client.config.embeds.mainColor)
            .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
    
            await transcriptsChannel.send({ embeds: [embed], components: [row] });
        });

        const savingDone = new client.discord.MessageEmbed()
        .setDescription(`Transcript saved to <#${transcriptsChannel.id}>`)
        .setColor(client.config.embeds.successColor);
        
        ;(await msg).edit({ embeds: [savingDone] });

        const deleteTicket = new client.discord.MessageEmbed()
        .setDescription(`Ticket will be deleted in a few seconds!`)
        .setColor(client.config.embeds.errorColor)

        await channel.send({ embeds: [deleteTicket] });

        setTimeout(async function () {
            channel.delete();
        }, 5000);

        if (client.config.channels.logs) {
            const logsChannel = client.channels.cache.get(client.config.channels.logs);

            const log = new client.discord.MessageEmbed()
            .setTitle("Tickets | Logs")
            .addFields(
                { name: "Action", value: "Delete Ticket" },
                { name: "By", value: `<@!${interaction.user.id}>` },
                { name: "Channel", value: `${interaction.channel.name}` },
                { name: "Ticket Owner", value: `<@!${user.id}>` }
            )
            .setColor(client.config.embeds.errorColor)
            .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

            logsChannel.send({ embeds: [log] });
        }
    }
}