const chalk = require("chalk");

module.exports = (client) => {
    console.log(chalk.bgGreenBright.black(` I'm ready now! `));

    let textList = client.config.status.messages;
    client.user.setStatus(client.config.status.status);
    setInterval(() => {
        var text = textList[Math.floor(Math.random() * textList.length)];
        client.user.setActivity(text, { type: `${client.config.status.activity}` });
    }, 25000);
}