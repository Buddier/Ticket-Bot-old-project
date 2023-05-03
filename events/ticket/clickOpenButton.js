module.exports = async(interaction, client) => {
    if (interaction.member.user.bot) return;
    if (!interaction.isButton()) return;
    if (interaction.guild.id !== client.config.guildID) return;

    if (interaction.customId === "open-ticket") {
        let user = interaction.user;
        let chan = `ticket-${user.username}`.toLowerCase();
        let mainRoles = await client.config.mainCategory.rolesID.map(x => {
            return {
                id: x,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS", "MANAGE_MESSAGES"]
            }
        });

        let generalRoles = await client.config.generalCategory.rolesID.map(x => {
            return {
                id: x,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS", "MANAGE_MESSAGES"]
            }
        });

        let mediaRoles = await client.config.mediaCategory.rolesID.map(x => {
            return {
                id: x,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS", "MANAGE_MESSAGES"]
            }
        });

        let storeRoles = await client.config.storeCategory.rolesID.map(x => {
            return {
                id: x,
                allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES", "EMBED_LINKS", "MANAGE_MESSAGES"]
            }
        });

        let creating = new client.discord.MessageEmbed()
        .setDescription("Creating ticket...")
        .setColor(client.config.embeds.waitingColor);

        await interaction.reply({ embeds: [creating], ephemeral: true });

        if (interaction.guild.channels.cache.find(c => c.topic == interaction.user.id && c.name.includes("ticket"))) {
            let already = new client.discord.MessageEmbed()
            .setDescription("You have already created a ticket!")
            .setColor(client.config.embeds.errorColor);

            return interaction.editReply({ embeds: [already], ephemeral: true });
        }

        const ticketCreated = await interaction.guild.channels.create(chan, {
            type: "text",
            topic: `${user.id}`,
            parent: client.config.mainCategory.categoryID,
            permissionOverwrites: [
                {
                    allow: "VIEW_CHANNEL",
                    deny: "SEND_MESSAGES",
                    id: interaction.user.id,
                },
                {
                    deny: "VIEW_CHANNEL",
                    id: interaction.guild.id,
                },
                ...mainRoles
            ],
        });

        let created = new client.discord.MessageEmbed()
        .setDescription(`Ticket created successfully in ${ticketCreated}!`)
        .setColor(client.config.embeds.successColor);

        await interaction.editReply({ embeds: [created], ephemeral: true });

        const ticketRow = new client.discord.MessageActionRow()
        .addComponents(
            new client.discord.MessageButton()
            .setStyle("DANGER")
            .setLabel("Close Ticket")
            .setEmoji("🔒")
            .setCustomId("ticket-close-q")
        );

        const ticketMsg = new client.discord.MessageEmbed()
        .setTitle("Ticket!")
        .setDescription(`Hi <@!${user.id}>, wait for one of our staff to see your ticket.\n\n**NOTE:** If your ticket has been resolved, please react to 🔒 to close the ticket!`)
        .setColor(client.config.embeds.mainColor)
        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

        await ticketCreated.send({ embeds: [ticketMsg], components: [ticketRow] });

        const ticketECategory = new client.discord.MessageEmbed()
        .setDescription(`:one: Get general support! (Questions, Reports, etc.) 🔧 \n:two: Get media support! (Claim Media Rank, etc) :film_frames: \n:three: Get store support! (Problems with payments, etc.) :shopping_cart:`)
        .setColor(client.config.embeds.waitingColor)
        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
        
        const ticketRCategory = await ticketCreated.send({ content: "**Choose the type of ticket**", embeds: [ticketECategory] });

        await ticketRCategory.react('1️⃣');
        await ticketRCategory.react('2️⃣');
        await ticketRCategory.react('3️⃣');

        ticketRCategory.awaitReactions({
            filter: (reaction, user) => user.id === interaction.user.id,
            max: 1,
            time: 60000,
            errors: ['time']
        }).then(async(collected) => {
            if (collected.first().emoji.name === '1️⃣') {
                await ticketRCategory.reactions.removeAll();

                ticketCreated.edit({
                    parent: client.config.generalCategory.categoryID,
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                        },
                        {
                            id: interaction.guild.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        ...generalRoles
                    ],
                });

                const generalECategory = new client.discord.MessageEmbed()
                .setTitle("Tickets | General Support")
                .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n- Please write your nick in the chat!\`\`\``)
                .setColor(client.config.embeds.waitingColor)
                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                
                let generalO = [];
                await ticketRCategory.edit({ content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [generalECategory] }).then(() => {
                    ticketCreated.awaitMessages({
                        filter: (m) => m.author.id === interaction.user.id,
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async(collected) => {
                        generalO.nick = collected.first().content;
                        collected.first().delete();

                        const generalERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | General Support")
                        .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${generalO.nick}\`\`\`\n> **2) What is your problem?**\n\`\`\`diff\n- Please write your problem in the chat!\`\`\``)
                        .setColor(client.config.embeds.waitingColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [generalERCategory] }).then(() => {
                            ticketCreated.awaitMessages({
                                filter: (m) => m.author.id === interaction.user.id,
                                max: 1,
                                time: 60000,
                                errors: ['time']
                            }).then(async(collected) => {
                                generalO.problem = collected.first().content;
                                collected.first().delete();

                                const generalERCategory = new client.discord.MessageEmbed()
                                .setTitle("Tickets | General Support")
                                .setDescription(`Good, now wait for a staff to attend to you!\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${generalO.nick}\`\`\`\n> **2) What is your problem?**\n\`\`\`diff\n+ ${generalO.problem}\`\`\``)
                                .setColor(client.config.embeds.successColor)
                                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                                
                                await ticketRCategory.edit({ embeds: [generalERCategory] })

                                ticketCreated.send({
                                    content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                                }).then((msg) => setTimeout(() => {
                                    msg.delete()
                                }, 1000));
                            })
                        })
                    }).catch(async(collected) => {
                        const generalERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | General Support")
                        .setDescription(`Problem:\n\`\`\`60s passed and no response has been given!\`\`\``)
                        .setColor(client.config.embeds.successColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [generalERCategory] });

                        ticketCreated.send({
                            content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                        }).then((msg) => setTimeout(() => {
                            msg.delete()
                        }, 1000));
                    });
                });
            } else if (collected.first().emoji.name === '2️⃣') {
                await ticketRCategory.reactions.removeAll();

                ticketCreated.edit({
                    parent: client.config.mediaCategory.categoryID,
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                        },
                        {
                            id: interaction.guild.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        ...mediaRoles
                    ],
                });

                const mediaECategory = new client.discord.MessageEmbed()
                .setTitle("Tickets | Media Support")
                .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n- Please write your nick in the chat!\`\`\``)
                .setColor(client.config.embeds.waitingColor)
                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                
                let mediaO = [];
                await ticketRCategory.edit({ content: `${client.config.mediaCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [mediaECategory] }).then(() => {
                    ticketCreated.awaitMessages({
                        filter: (m) => m.author.id === interaction.user.id,
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async(collected) => {
                        mediaO.nick = collected.first().content;
                        collected.first().delete();

                        const mediaERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | Media Support")
                        .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${mediaO.nick}\`\`\`\n> **2) What is your channel and to what rank do you want to apply?**\n\`\`\`diff\n- Please write your channel and rank to apply! Example: https://youtube.com/c/discord, YouTuber\`\`\``)
                        .setColor(client.config.embeds.waitingColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [mediaERCategory] }).then(() => {
                            ticketCreated.awaitMessages({
                                filter: (m) => m.author.id === interaction.user.id,
                                max: 1,
                                time: 60000,
                                errors: ['time']
                            }).then(async(collected) => {
                                mediaO.channelRank = collected.first().content;
                                collected.first().delete();

                                const mediaERCategory = new client.discord.MessageEmbed()
                                .setTitle("Tickets | Meda Support")
                                .setDescription(`Good, now wait for a staff to attend to you!\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${mediaO.nick}\`\`\`\n> **2) What is your channel and to what rank do you want to apply?**\n\`\`\`diff\n+ ${mediaO.channelRank}\`\`\``)
                                .setColor(client.config.embeds.successColor)
                                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                                
                                await ticketRCategory.edit({ embeds: [mediaERCategory] })

                                ticketCreated.send({
                                    content: `${client.config.mediaCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                                }).then((msg) => setTimeout(() => {
                                    msg.delete()
                                }, 1000));
                            })
                        })
                    }).catch(async(collected) => {
                        const mediaERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | Media Support")
                        .setDescription(`Problem:\n\`\`\`60s passed and no response has been given!\`\`\``)
                        .setColor(client.config.embeds.successColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [mediaERCategory] });

                        ticketCreated.send({
                            content: `${client.config.mediaCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                        }).then((msg) => setTimeout(() => {
                            msg.delete()
                        }, 1000));
                    });
                });
            } else if (collected.first().emoji.name === '3️⃣') {
                await ticketRCategory.reactions.removeAll();

                ticketCreated.edit({
                    parent: client.config.storeCategory.categoryID,
                    permissionOverwrites: [
                        {
                            id: user.id,
                            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                        },
                        {
                            id: interaction.guild.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        ...storeRoles
                    ],
                });

                const storeECategory = new client.discord.MessageEmbed()
                .setTitle("Tickets | Store Support")
                .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n- Please write your nick in the chat!\`\`\``)
                .setColor(client.config.embeds.waitingColor)
                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                
                let storeO = [];
                await ticketRCategory.edit({ content: `${client.config.storeCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [storeECategory] }).then(() => {
                    ticketCreated.awaitMessages({
                        filter: (m) => m.author.id === interaction.user.id,
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }).then(async(collected) => {
                        storeO.nick = collected.first().content;
                        collected.first().delete();

                        const storeERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | Store Support")
                        .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${storeO.nick}\`\`\`\n> **2) What is the problem you have or what is your doubt?**\n\`\`\`diff\n- Please write your problem or what doubt! (Attach captures as you need to be faster when attending)\`\`\``)
                        .setColor(client.config.embeds.waitingColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [storeERCategory] }).then(() => {
                            ticketCreated.awaitMessages({
                                filter: (m) => m.author.id === interaction.user.id,
                                max: 1,
                                time: 60000,
                                errors: ['time']
                            }).then(async(collected) => {
                                storeO.problem = collected.first().content;
                                collected.first().delete();

                                const storeERCategory = new client.discord.MessageEmbed()
                                .setTitle("Tickets | Store Support")
                                .setDescription(`Good, now wait for a staff to attend to you!\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${storeO.nick}\`\`\`\n> **2) What is the problem you have or what is your doubt?**\n\`\`\`diff\n+ ${storeO.problem}\`\`\``)
                                .setColor(client.config.embeds.successColor)
                                .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                                
                                await ticketRCategory.edit({ embeds: [storeERCategory] })

                                ticketCreated.send({
                                    content: `${client.config.storeCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                                }).then((msg) => setTimeout(() => {
                                    msg.delete()
                                }, 1000));
                            })
                        })
                    }).catch(async(collected) => {
                        const storeERCategory = new client.discord.MessageEmbed()
                        .setTitle("Tickets | Store Support")
                        .setDescription(`Problem:\n\`\`\`60s passed and no response has been given!\`\`\``)
                        .setColor(client.config.embeds.successColor)
                        .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

                        await ticketRCategory.edit({ embeds: [storeERCategory] });

                        ticketCreated.send({
                            content: `${client.config.storeCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                        }).then((msg) => setTimeout(() => {
                            msg.delete()
                        }, 1000));
                    });
                });
            }
        }).catch(async(collected) => {
            await ticketRCategory.reactions.removeAll();
            
            ticketCreated.edit({
                parent: client.config.generalCategory.categoryID,
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                    },
                    {
                        id: interaction.guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    ...generalRoles
                ],
            });
            
            const generalECategory = new client.discord.MessageEmbed()
            .setTitle("Tickets | General Support")
            .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n- Please write your nick in the chat!\`\`\``)
            .setColor(client.config.embeds.waitingColor)
            .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
            
            let generalO = [];
            await ticketRCategory.edit({ content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [generalECategory] }).then(() => {
                ticketCreated.awaitMessages({
                    filter: (m) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(async(collected) => {
                    generalO.nick = collected.first().content;
                    collected.first().delete();
                    
                    const generalERCategory = new client.discord.MessageEmbed()
                    .setTitle("Tickets | General Support")
                    .setDescription(`Please answer the following questions:\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${generalO.nick}\`\`\`\n> **2) What is your problem?**\n\`\`\`diff\n- Please write your problem in the chat!\`\`\``)
                    .setColor(client.config.embeds.waitingColor)
                    .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                    
                    await ticketRCategory.edit({ embeds: [generalERCategory] }).then(() => {
                        ticketCreated.awaitMessages({
                            filter: (m) => m.author.id === interaction.user.id,
                            max: 1,
                            time: 60000,
                            errors: ['time']
                        }).then(async(collected) => {
                            generalO.problem = collected.first().content;
                            collected.first().delete();
                            
                            const generalERCategory = new client.discord.MessageEmbed()
                            .setTitle("Tickets | General Support")
                            .setDescription(`Good, now wait for a staff to attend to you!\n\n> **1) What is your nick in the game?**\n\`\`\`diff\n+ ${generalO.nick}\`\`\`\n> **2) What is your problem?**\n\`\`\`diff\n+ ${generalO.problem}\`\`\``)
                            .setColor(client.config.embeds.successColor)
                            .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                            
                            await ticketRCategory.edit({ embeds: [generalERCategory] })
                            
                            ticketCreated.send({
                                content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                            }).then((msg) => setTimeout(() => {
                                 msg.delete()
                            }, 1000));
                        })
                    })
                }).catch(async(collected) => {
                    const generalERCategory = new client.discord.MessageEmbed()
                    .setTitle("Tickets | General Support")
                    .setDescription(`Problem:\n\`\`\`60s passed and no response has been given!\`\`\``)
                    .setColor(client.config.embeds.successColor)
                    .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });
                    
                    await ticketRCategory.edit({ embeds: [generalERCategory] });
                    
                    ticketCreated.send({
                        content: `${client.config.generalCategory.rolesID.map((m) => `<@&${m}>`).join(", ")}`
                    }).then((msg) => setTimeout(() => {
                        msg.delete()
                    }, 1000));
                });
            });
        });

        if (client.config.channels.logs) {
            const logsChannel = client.channels.cache.get(client.config.channels.logs);

            const log = new client.discord.MessageEmbed()
            .setTitle("Tickets | Logs")
            .addFields(
                { name: "Action", value: "Open Ticket" },
                { name: "By", value: `<@!${interaction.user.id}>` },
                { name: "Channel", value: `${ticketCreated.name}` }
            )
            .setColor(client.config.embeds.successColor)
            .setFooter({ text: `${client.config.embeds.footer}`, iconURL: `${client.user.displayAvatarURL()}` });

            logsChannel.send({ embeds: [log] });
        }
    }
}