#!/usr/bin/env ts-node

import { InteractionType, REST, Routes } from 'discord.js';
import { Client, GatewayIntentBits } from 'discord.js';

import * as Commands from "./commands";
import { seedDb } from './data/db';
console.log("program start");
console.log("seeding db");
seedDb();
console.log("seed db completed");
const bot =  new Client({ intents: [GatewayIntentBits.Guilds] });

bot.on('ready', async () => {
  await bot.rest.put(Routes.applicationCommands(bot.application!.id), { body: Object.values(Commands).filter(it=>it.structure).map(it=>it.structure) });

  console.log(`Following command structure are submitted: ${Object.values(Commands).filter(it=>it.structure).map(it=>it.structure.name).join(", ")}`)
  console.log(`Paste the URL below into your browser to invite your bot!\nhttps://discord.com/oauth2/authorize?client_id=${bot.user.id}&scope=applications.commands%20bot&permissions=3072`)
})

bot.on('interactionCreate', async (interaction) => {
  try{
    if(interaction.type==InteractionType.ApplicationCommand){
      const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction)?.commandName);
      await Promise.all(targetCommand.map(it=>it?.(interaction as any)));
    }else if(interaction.type==InteractionType.MessageComponent || interaction.type==InteractionType.ModalSubmit){
      const targetCommand = Object.values(Commands).filter(it=>it.structure?.name == (interaction)?.message?.interaction?.commandName);
      await Promise.all(targetCommand.map(it=>it?.onComponentInteraction?.(interaction as any)));
    }
  }catch(err){
    console.error(err)
  }
})

bot.login(process.env.DISCORD_BOT_TOKEN).catch(err=>console.error("error occurred"));
console.log("program inited");