/*
 * AFK-Bot
 * A bot for personal use on ONE server
 * Developed by Benjamin Mo
 */

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

  if (message.content.startsWith(config.prefix + 'taebak')) {
    message.channel.send('http://i.imgur.com/CJN1lXh.gifv');
  } else if (message.content.startsWith(config.prefix + 'foo')) {
    message.channel.send('bar!');
  } 

  // Owner-only commands below
  if(message.author.id !== config.ownerID) return;

  if (message.content.startsWith(config.prefix + 'eval')) {
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
  } else if (message.content.startsWith(config.prefix + 'prefix')) {
    // Change prefix command
    let newPrefix = message.content.split(' ').slice(1, 2)[0];
    config.prefix = newPrefix;
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => { if(err) console.error(err) });
    
    message.channel.send("Prefix changed to '" + config.prefix + "'.");
  } else if (message.content.startsWith(config.prefix + 'log_channel') || 
             message.content.startsWith(config.prefix + 'lc')) {
    // Change log channel
    config.logChannelID = message.channel.id;
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => { if(err) console.error(err) });
    message.channel.send("Log channel changed to **" + message.channel.name + "**");
  } else if (message.content.startsWith(config.prefix + 'main_channel') || 
             message.content.startsWith(config.prefix + 'mc')) {
    // Change main channel (#general in most servers)
    config.mainChannelID = message.channel.id;
    fs.writeFile('./config.json', JSON.stringify(config, null, 2), (err) => { if(err) console.error(err) });
    message.channel.send("Main channel changed to **" + message.channel.name + "**");
  }
});


// Sends a message in the log channel (config.logChannelID) 
// when a user joins or leaves voice channel
client.on('voiceStateUpdate', (oldMember, newMember) => {
  if (oldMember.voiceChannel == null) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + " joined voice channel **" + newMember.voiceChannel.name + "**."
    );
  } else if (newMember.voiceChannel == null) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + " left voice channel **" + oldMember.voiceChannel.name + "**."
    );
  } else if (oldMember.voiceChannel != newMember.voiceChannel) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + " switched from channel **" + oldMember.voiceChannel.name + "** to **" + newMember.voiceChannel.name + "**."
    );
  }
});

// Sends a message in the log channel (config.logChannelID)
// when a user comes online or goes offline
client.on('presenceUpdate', (oldMember, newMember) => {
  if (oldMember.presence.status == newMember.presence.status) return;

  if (oldMember.presence.status == 'offline') {
    // User coming online
    client.channels.get(config.logChannelID).send(
      newMember.user.username + " has come online."
    );
  } else if (newMember.presence.status == 'offline') {
    // User going offline
    client.channels.get(config.logChannelID).send(
      newMember.user.username + " disconnected."
    );
  }
});

// Sends a message in the log channel (config.logChannelID)
// when a user's role or nickname is modified
client.on('guildMemberUpdate', (oldMember, newMember) => {
  // Nickname changes
  if (oldMember.nickname == null && newMember.nickname != null) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + "'s nickname was set to **" + newMember.nickname + "**."
    );
  } else if (oldMember.nickname != null && newMember.nickname == null) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + "'s nickname **" + oldMember.nickname + "** was removed."
    );
  } else if (oldMember.nickname != newMember.nickname) {
    client.channels.get(config.logChannelID).send(
      newMember.user.username + "'s nickname was changed from **" + oldMember.nickname + 
      "** to **" + newMember.nickname  + "**."
    );
  }

  // Role changes
  // To be added later :)
});

// Send message in main channel 
// when a new user joins the server
client.on('guildMemberAdd', (member) => {
  client.channels.get(config.mainChannelID).send(
    "**" + member.user.username + "** has joined " + member.guild.name + ". Annyeong!"
  );
});

// Send message in main channel 
// when a user leaves the server
client.on('guildMemberRemove', (member) => {
  client.channels.get(config.mainChannelID).send(
    "**" + member.user.username + "** has left " + member.guild.name + ". Bye!"
  );
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