const Discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');

const client = new Discord.Client();

client.login(config.token);

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', (message) => {
  // exit and stop if no prefix or by bot
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.split(' ').slice(1);

  if (message.content.startsWith(config.prefix + 'ping')) {
    message.channel.send('pong!');
  } else if (message.content.startsWith(config.prefix + 'foo')) {
    message.channel.send('bar!');
  } 

  // Owner-only commands
  if (message.content.startsWith(config.prefix + 'eval')) {
    if(message.author.id !== config.ownerID) return;
    // Eval command
    
    try {
      const code = args.join(' ');
      let evaled = eval(code);

      if (typeof evaled !== 'string')
        evaled = require('util').inspect(evaled);

      message.channel.send(clean(evaled), {code:'xl'});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  } else if(message.content.startsWith(config.prefix + 'prefix')) {
    if(message.author.id !== config.ownerID) return;
    // Change prefix command

    // Gets the prefix from the command (eg. "!prefix +" it will take the "+" from it)
    let newPrefix = message.content.split(' ').slice(1, 2)[0];
    // change the configuration in memory
    config.prefix = newPrefix;
    // Now we have to save the file.
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => { if(err) console.error(err) });
    message.channel.send("Prefix changed to '" + config.prefix + "'.");
  }
});

client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (oldMember.voiceChannel == null) {
    console.log(newMember.user.username + " joined voice channel \"" + newMember.voiceChannel.name + "\".");
  } else if (newMember.voiceChannel == null) {
    console.log(newMember.user.username + " left voice channel \"" + oldMember.voiceChannel.name + "\".");
  } else if (oldMember.voiceChannel != newMember.voiceChannel) {
    console.log(newMember.user.username + " switched from channel \"" + oldMember.voiceChannel.name + "\" to \"" + newMember.voiceChannel.name + "\".");
  }
});

function clean(text) {
  if (typeof(text) === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
  else
      return text;
}

// Error logs
client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));