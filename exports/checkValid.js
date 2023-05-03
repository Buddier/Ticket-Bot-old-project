const checkValid = async function (client) {
    if (!client.config.token) {
        throw ReferenceError("[ERROR_TOKEN] Please check your config.yml and set your token bot!");
    }

    if (!client.config.prefix) {
        throw ReferenceError("[ERROR_PREFIX] Please check your config.yml and set the bot prefix!");
    }

    if (!client.config.ownerID) {
        throw ReferenceError("[ERROR_OWNERID] Please check your config.yml and set the bot owner id!");
    }

    if (!client.config.guildID) {
        throw ReferenceError("[ERROR_GUILDID] Please check your config.yml and set the guild id!");
    }
}

module.exports = {
    checkValid,
}