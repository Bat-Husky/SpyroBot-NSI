/*
SpyroBot
Auteur : Léo Virth
Date : 2021
Entrées : token du bot
Sortie : réponse aux commandes envoyées sur la messagerie Discord
*/

const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const bot = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"], intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] })
const { prefix, token, OwnerID, OwnerGuildID } = require('./JSON/config.json');
const AllCMD = require('./other/stockCMD');

const queue = new Map();


bot.on('ready', function () {
  /*
  Execute ce code quand le bot est prêt
  Met l'activité Discord
  Lance des fonctions async :
  Reaction, reaction règles, Message d'arrivée, pin message, les commandes slash
  */
  console.log("Ready!");
  bot.user.setActivity("crash", { type: 'STREAMING', url: 'https://www.twitch.tv/bat_husky' })
  AllCMD.React.execute(Discord, bot)
  AllCMD.ReactRules.execute(Discord, bot)
  AllCMD.Join.execute(Discord, bot)
  AllCMD.Pin.execute(Discord, bot)
  AllCMD.SlashCommands.execute(bot, OwnerGuildID, OwnerID, prefix)
  AllCMD.InitSlash.execute(Discord, bot, OwnerGuildID)
});


bot.on("guildCreate", guild => {
  /*
  Envoie un message quand il est invité sur un nouveau serveur
  */
  const channels = guild.channels.cache.filter(channel => channel.type == "news") || guild.channels.cache.filter(channel => channel.type == "text");

  const embed = new MessageEmbed()
    .setColor("#5465FF")
    .setTitle("Thank you for inviting me!")
    .setURL("https://docs.google.com/document/d/1uSBdN_1_jUk0arHGbWB0kMjv6YJGQTgoLKO2QhjjhK8/edit?usp=sharing")
    .setDescription("Hi! I am SpyroBot! \nI am a multi-tasking bot developed by `Bat-Husky`. \nI have `🛡 moderation` and `🔊 music` commands. I also have other `☣ Useless` but funny commands. \nTo get started, use the command $help.")
    .setThumbnail(bot.user.avatarURL("png"))
    .addField('\u200b', '\u200b')
    .addFields(
      { name: 'Library :', value: '`discord.js`', inline: true },
      { name: 'Prefix :', value: '`$`', inline: true },
      { name: 'Running on :', value: `\`${bot.guilds.cache.size} servers\``, inline: true }
    )
  channels.first().send(embed).catch(err => console.error(err));
  // channels.first().send({ embeds: [embed] }).catch(err => conbsole.error(err));
});


bot.on('message', async message => {
  /*
  lance le code ci-dessous quand il reçois un message
  le code de l'expérience
  les fonctions de commande se trouvant dans d'autres fichier, sinon cherche les commandes dans celles
  présentes dans l'index
  */
  
  if (!message.guild) return;
  if (message.guild.id == 621427447879172096n && message.channel.id == 839864195314221089n) return AllCMD.xp.execute(message.author, message, prefix, bot);
  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) {
    AllCMD.xp.execute(message.author, message, prefix, bot)
    return;
  }

  let commandUsed = AllCMD.SpyroBot.parse(message, prefix, bot) || AllCMD.givexp.parse(message, prefix) || AllCMD.Help.parse(message, prefix) || AllCMD.MalFoutu.parse(message, prefix) 
  || AllCMD.Kick.parse(message, prefix) || AllCMD.Ban.parse(message, prefix) || AllCMD.Warn.parse(message, prefix) || AllCMD.Infractions.parse(message, prefix) 
  || AllCMD.Baka.parse(message, prefix) || AllCMD.Meme.parse(message, prefix) || AllCMD.Clear.parse(message, prefix) || AllCMD.Crash.parse(message, prefix) 
  || AllCMD.Quoi.parse(message, prefix) || AllCMD.Diagonale.parse(message, prefix) || AllCMD.UserInfo.parse(message, prefix) || AllCMD.Report.parse(message, prefix) 
  || AllCMD.LogsChannel.parse(message, prefix) || AllCMD.QueueChannel.parse(message, prefix) || AllCMD.FaitsDivers.parse(message, prefix) || AllCMD.AddFaitsDivers.parse(message, prefix) 
  || AllCMD.runTest.parse(message, prefix) || AllCMD.cmdPrefix.parse(message, prefix) || AllCMD.cmdStatus.parse(message, prefix) || AllCMD.Coin.parse(message, prefix)
  || AllCMD.Constitution.parse(message, prefix) || AllCMD.OpenPattern.parse(message, prefix) || AllCMD.Focus.parse(message, prefix) || AllCMD.RulesCommand.parse(message, prefix)
  || AllCMD.rank.parse(message, prefix);

  if(commandUsed == false) {
    AllCMD.xp.execute(message.author, message, prefix, bot)
  }
  
  const serverQueue = queue.get(message.guild.id);

  if (message.content.toString().toLowerCase().startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}leave`)) {
    stop(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}volume`)) {
    volume(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}*volume`)) {
    multiplyVolume(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}queue`)) {
    sendQueue(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}loop`)) {
    loup(message, serverQueue);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}ping`)) {
    ping(message, prefix);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}reaction`)) {
    AllCMD.Reaction.execute(message, Discord, bot);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}reactrules`)) {
    AllCMD.ReactionRules.execute(message, Discord, bot);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}info`)) {
    info(message);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}bots`)) {
    botsYEY(message);
    return;
  } else if (message.content.toString().toLowerCase().startsWith(`${prefix}editreact`)) {
    editreact(message);
    return;
  }
});

async function execute(message, serverQueue) {
  /*
  Si une file d'attente est déjà présente, y rajoute la musique, sinon
  en creer une et lance la fonction play
  */
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );

  const songInfo = await ytdl.getInfo(args[1]).catch(err => {console.error(err)});
  //console.log(songInfo)
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        author: message.member
  };


  if (!serverQueue) {
    var QueueChannel;
    var QueueChannels = JSON.parse(fs.readFileSync("../ReBot_test/JSON/QueueChannel.json", "utf8"));
    QueueChannel = message.guild.channels.cache.find(ch => ch.name == QueueChannels[message.guild.id]) || message.guild.channels.cache.find(ch => ch.id == QueueChannels[message.guild.id])

    if (!QueueChannel) {
      message.reply("Définnissez le channel de la Queue comme ceci : \n`SetQueueChannel <id or name>`")
      QueueChannel = message.channel;
    }

    const queueContruct = {
      textChannel: QueueChannel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
      loop: false
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.error(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    const embed = new MessageEmbed()
        .setColor("#0042ff")
        .addField("Added to the queue", `[${song.title}](${song.url})`)
        .addField("From", `${song.author}`)
    return message.channel.send(embed);
    // return message.channel.send({ embeds: [embed] });
  }
}

function play(guild, song) {
  /*
  lance la musique, quand la musique est finie, lance la suivante,
  si pas d'autres musique, quitte le salon et supprime la file d'attente
  */
  const serverQueue = queue.get(guild.id);
  if (!song) {
    //serverQueue.voiceChannel.leave();
    serverQueue.connection.disconnect();
    queue.delete(guild.id);
    return;
  }
  
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url), { filter: "audioandvideo" })
    .on("finish", () => {
      if (serverQueue.loop == true) serverQueue.songs.push(serverQueue.songs[0]);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolume(1);
  const embed = new MessageEmbed()
    .setColor("#0042ff")
    .addField("Now playing", `[${song.title}](${song.url})`)
    .addField("From", `${song.author}`)
  serverQueue.textChannel.send(embed);
  // serverQueue.textchannel.send({ embeds: [embed] });
}

function skip(message, serverQueue) {
  /*
  permet de passer à la musique suivante, si la personne utilisant la commande
  n'a pas les permissions administrateur, lui demande de payer.
  */

  if(!message.member.hasPermission("ADMINISTRATOR")) {
    let coins = JSON.parse(fs.readFileSync("./JSON/coin.json", "utf8"));
    if (coins[message.author.id].coins < 200) return message.reply(`You don't have enough coins to skip! \n\`${coins[message.author.id].coins}\` < \`200\``)
    coins[message.author.id].coins -= 200;
    fs.writeFile("./JSON/coin.json", JSON.stringify(coins), (err) => {
      if (err) {
          console.error(err);
      }
    });
  }
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to skip the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
  message.react("⏭")
}

function stop(message, serverQueue) {
  /*
  stop la musique, le bot quitte le salon et supprime la file d'attente
  */
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );

  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");

  serverQueue.loop = false;
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  message.react("🛑")
}

function volume(message, serverQueue) {
  /*
  permet de changer le volume de la musique
  */
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to change the volume !"
    );
  if (!serverQueue)
    return message.channel.send("There is no song !");
  let vol = message.content.toString().toLowerCase().split(' ')[1];
  const vembed = new MessageEmbed()
    .setColor("#0042ff")
    .addField("Current volume :", `${serverQueue.connection.dispatcher.volume * 100}%`)
  if (!vol) return message.channel.send(vembed)
  serverQueue.connection.dispatcher.setVolume(vol);
  const embed = new MessageEmbed()
    .setColor("#0042ff")
    .addField("Set volume to", `${vol * 100}%`)
  message.channel.send(embed);
  // message.channel.send({ embeds: [embed] });
}

function multiplyVolume(message, serverQueue) {
  /*
  ne sert à rien, il faut que je l'enlève
  */
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to change the volume !"
    );
  if (!serverQueue)
    return message.channel.send("There is no song !");
  let actualVol = serverQueue.connection.dispatcher.volume
  let vol = message.content.toString().toLowerCase().split(' ')[1];
  serverQueue.connection.dispatcher.setVolume(actualVol * vol);
  const embed = new MessageEmbed()
    .setColor("#0042ff")
    .addField("Volume multiplied by :", `${vol}`)
  message.channel.send(embed);
  // message.channel.send({ embeds: [embed] });
}

function sendQueue(message, serverQueue) {
  /*
  Permet d'envoyer la liste des musiques dans la file d'attente
  */
  if (!serverQueue)
    return message.channel.send("There is no song !");
  message.channel.send("Queue :");
  for (const title in serverQueue.songs) {
    message.channel.send("```markdown" + `\n#${serverQueue.songs[title].title}\n` + "```")
  }
}

function loup(message, serverQueue) {
  /*
  Permet de passer la file d'attente en mode répetition
  */
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to loop the music!"
    );

  if (!serverQueue)
    return message.channel.send("There is no song!");
  
    if (serverQueue.loop == false) {
      serverQueue.loop = true;
      const embed = new MessageEmbed()
        .setColor("#0042ff")
        .addField("Loop", '`On`')
      message.channel.send(embed);
      // message.channel.send({ embeds: [embed] });
    } else {
      serverQueue.loop = false;
      const embed = new MessageEmbed()
        .setColor("#0042ff")
        .addField("Loop", '`Off`')
      message.channel.send(embed);
      // message.channel.send({ embeds: [embed] });
    }
}

function info(message) {
  /**
   * envoie des informations sur le vot
   */
  const embed = new MessageEmbed()
    .setColor("#5465FF")
    .setTitle("SpyroBot Info")
    .setURL("https://docs.google.com/document/d/1uSBdN_1_jUk0arHGbWB0kMjv6YJGQTgoLKO2QhjjhK8/edit?usp=sharing")
    .setDescription("Hi! I am SpyroBot! \nI am a multi-tasking bot developed by `Bat-Husky`. \nI have `🛡 moderation` and `🔊 music` commands. I also have other `☣ Useless` but funny commands. \nFor more info about commands, use the command $help.")
    .setThumbnail(bot.user.avatarURL("png"))
    .addField('\u200b', '\u200b')
    .addFields(
      { name: 'Library :', value: '`discord.js`', inline: true },
      { name: 'Prefix :', value: '`$`', inline: true },
      { name: 'Running on :', value: `\`${bot.guilds.cache.size} servers\``, inline: true }
    )
  message.channel.send(embed);
  // message.channel.send({ embeds: [embed] });
}

function botsYEY(message) {
  /**
   * Envoie des infos sur les bots
   */
  let Stinger = message.guild.members.cache.get('835577703884521523')
  let JAAJmo = message.guild.members.cache.get('828587649467154452')
  let ReBot = message.guild.members.cache.get('623244968336818176')
  let Sus = message.guild.members.cache.get('826447138724642817')

  let moi = message.guild.members.cache.get('467284102987382784')
  let VBat = message.guild.members.cache.get('437204882123128832')
  let Mikwel = message.guild.members.cache.get('373801923138158613')

  message.channel.send(`Ce serveur compte de nombreux Bots, néanmoins, certains sont uniques. \nLa quasi-intégralité des commandes et automatisations du serveur sont gérées par des Bots custom : ${bot.user}, ${Stinger} et ${JAAJmo}. \nCes Bots ont été créés respectivement par ${moi}, ${VBat} et ${Mikwel}. Nous les mettons à jour régulièrement, et comme ils sont de notre création, on peut faire ce que l'on veut avec. \nPS : ${ReBot} est la version de test de ${bot.user}, et ${Sus}, celle de ${Stinger}.`)
}

async function editreact(message) {
  /**
   * ne sert à rien non plus
   */
  const channel = message.guild.channels.cache.get('683395478913679580');
  const editmsg = await channel.messages.fetch('833383415528554496');

  const phasmophobiaEmoji = '👻';
  const codingemoji = '💻'
  const debatemoji = '🎤'
  const gameemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'Saitama')
  const Furyemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'furry')
  const Fursuitemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'Ahouuuuu')
  const Ninemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'nintendo')
  const bedrockemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'bedrock')
  const javaemoji = message.guild.emojis.cache.find(emoji => emoji.name == 'minecraft')

  let embed = new Discord.MessageEmbed()
            .setColor('#0042ff')
            .setTitle('Roles : ')
            .setDescription('Si vous voulez accéder aux différents channels : \n\n'
                + `Phasmophobia : ${phasmophobiaEmoji}\n`
                + `Coding : ${codingemoji}\n`
                + `Débats : ${debatemoji}\n`
                + `Jeux : ${gameemoji}\n`
                + `Furry : ${Furyemoji}\n`
                + `Fursuiter : ${Fursuitemoji}\n`
                + `Nintendo : ${Ninemoji}\n`
                + `Minecraft Bedrock : ${bedrockemoji}\n`
                + `Minecraft Java : ${javaemoji}\n`
            );
  editmsg.edit(embed)
  editmsg.react(gameemoji)
  editmsg.react(Furyemoji);
  editmsg.react(Fursuitemoji);
  editmsg.react(Ninemoji);
  editmsg.react(bedrockemoji);
  editmsg.react(javaemoji);
}
    
function ping(message, prefix) {
  /**
   * Permet de remettre l'activité du bot et de voir le temps d'allumage du bot
   */
  if (message.author.id != OwnerID) return message.reply("You can't use that command!");
  if (message.guild.id != 621427447879172096n) return message.reply("Cette commande n'est pas disponible sur ce serveur.");
  bot.user.setActivity(`${prefix}help`, { type: 'WATCHING' });
  const testChannel = message.guild.channels.cache.find(ch => ch.name === 'test');
  let Hours = Math.floor(bot.uptime / 3600000)
  let Minutes = (Math.round((bot.uptime / 60000) * 1000) / 1000) - (Hours * 60)
  testChannel.send(`\`\`\`fix\nPing réussi ! \n\`\`\` \nUptime : \n\`${Hours} hours\` \n\`${Minutes} minutes\``);
}


bot.login(token)