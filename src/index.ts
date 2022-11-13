#!/usr/bin/env ts-node

import { CommandClient, CommandInteraction, ComponentInteraction, Constants, TextableChannel } from 'eris';

import * as Commands from "./commands";
console.log("program start");
const bot = new CommandClient(`Bot ${process.env.DISCORD_BOT_TOKEN}`, { intents: ['guilds'], maxShards: 'auto',restMode: true })

bot.on('ready', async () => {
  await bot.bulkEditCommands(
    Object.values(Commands).filter(it=>it.structure).map(it=>it.structure)
  );
  console.log(`Paste the URL below into your browser to invite your bot!\nhttps://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=3072`)
})

bot.on('interactionCreate', async (interaction) => {
  try{
    if(interaction.type==Constants["InteractionTypes"]["APPLICATION_COMMAND"]){
      const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction as CommandInteraction<TextableChannel>)?.data?.name);
      await Promise.all(targetCommand.map(it=>it?.(interaction as any)));
    }else if(interaction.type==Constants["InteractionTypes"]["MESSAGE_COMPONENT"]){
      const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction as ComponentInteraction<TextableChannel>)?.message?.interaction?.name);
      await Promise.all(targetCommand.map(it=>it?.onComponentInteraction?.(interaction as any)));
    }
  }catch(err){
    console.error(err)
  }
})


bot.connect().catch(err=>console.error("error occurred"));
console.log("program inited");