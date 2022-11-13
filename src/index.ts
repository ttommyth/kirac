#!/usr/bin/env ts-node

import { CommandClient, CommandInteraction, ComponentInteraction, Constants, TextableChannel } from 'eris';

import * as Commands from "./commands";
console.log("program start");
const bot = new CommandClient(`Bot ${process.env.DISCORD_BOT_TOKEN}`, { intents: ['guilds'], maxShards: 'auto',restMode: true })
// Register the stupid ass command
bot.on('ready', async () => {
  await bot.bulkEditCommands(
    Object.values(Commands).filter(it=>it.structure).map(it=>it.structure)
  );
  console.log(`Paste the URL below into your browser to invite your bot!\nhttps://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=3072`)
})
// Stupid ass interaction creation event
bot.on('interactionCreate', async (interaction) => {
  if(interaction.type==Constants["InteractionTypes"]["APPLICATION_COMMAND"]){
    const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction as CommandInteraction<TextableChannel>)?.data?.name);
    targetCommand.forEach(it=>it?.(interaction as any));
  }else if(interaction.type==Constants["InteractionTypes"]["MESSAGE_COMPONENT"]){
    const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction as ComponentInteraction<TextableChannel>)?.message?.interaction?.name);
    targetCommand.forEach(it=>it?.onComponentInteraction?.(interaction as any));
  }
})


bot.connect().catch(err=>console.error("error occurred"));
console.log("program inited");