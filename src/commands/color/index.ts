import { ActionRowBuilder, APIApplicationCommandOptionChoice, ButtonBuilder, ButtonStyle, CommandInteractionOption, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import { range } from "lodash";
import { StructuredCommand } from "../../types/commands";

type ChromaticOptions ={
  r:number,
  g:number,
  b:number,
  str:number,
  dex:number,
  int:number,
  socket:number,
}
const socketComponentSelectOptions =(prefix:string)=> (
  [...new Array(6)].map((_,idx)=>({
    label:prefix+(+idx+1),
    value:prefix+(+idx+1)
  }))
);

const toChromaticOptions = (options: CommandInteractionOption[]):ChromaticOptions=>{
  return ({
    "r":0,
    "g":0,
    "b":0,
    "str":0,
    "dex":0,
    "int":0,
    "socket":6,
    ...(options.filter(it=>(it as any).value)
      .reduce((cur,it:any)=>(cur[it.name]=it.value,cur), {} as any))
  })
}

export const colorCommand: StructuredCommand = async (interaction)=>{
  console.debug(interaction.options)
  const options = toChromaticOptions([...interaction.options.data]);
  await interaction.reply({
    content:"ok",
    components: [
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("socket")
          .setMinValues(1).setMaxValues(1).setPlaceholder("SOCKET: "+options["socket"])
          .setOptions(...socketComponentSelectOptions("SOCKET: "))
      ) as any,
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("r")
          .setMinValues(1).setMaxValues(1).setPlaceholder("R: "+options["r"])
          .setOptions(...socketComponentSelectOptions("R: "))
      ) as any,
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("g")
          .setMinValues(1).setMaxValues(1).setPlaceholder("G: "+options["g"])
          .setOptions(...socketComponentSelectOptions("G: "))
      ) as any,
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("b")
          .setMinValues(1).setMaxValues(1).setPlaceholder("B: "+options["b"])
          .setOptions(...socketComponentSelectOptions("B: "))
      ) as any,
      new ActionRowBuilder().addComponents(
        [
          new ButtonBuilder()
            .setCustomId("str")
            .setLabel("STR: "+options["str"])
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("dex")
            .setLabel("DEX: "+options["int"])
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("int")
            .setLabel("INT: "+options["int"])
            .setStyle(ButtonStyle.Primary)
        ]
      ) as any,
    ]
  })
}

colorCommand.onComponentInteraction=async(interaction)=>{
  console.debug("interaction", interaction.customId)
  if(interaction.customId=="str"){
    // await interaction.
  }
  await interaction.reply("Pong!");
}

const socketChoices= (
  [...new Array(6)].map((_, idx)=>({
    name:""+idx+1,
    value:idx+1
  } as APIApplicationCommandOptionChoice<number>))
)

colorCommand.structure = new SlashCommandBuilder()
  .setName("color")
  .setDescription("color")
  .addIntegerOption((opt)=>(opt.setName("str").setDescription("Item STR requirement")))
  .addIntegerOption((opt)=>(opt.setName("dex").setDescription("Item DEX requirement")))
  .addIntegerOption((opt)=>(opt.setName("int").setDescription("Item INT requirement")))
  .addIntegerOption((opt)=>(opt.setName("r").setDescription("Desired Red Socket").addChoices(...socketChoices)))
  .addIntegerOption((opt)=>(opt.setName("g").setDescription("Desired Green Socket").addChoices(...socketChoices)))
  .addIntegerOption((opt)=>(opt.setName("b").setDescription("Desired Blue Socket").addChoices(...socketChoices)))
  .addIntegerOption((opt)=>(opt.setName("socket").setDescription("Item Sockets").addChoices(...socketChoices)))
  .toJSON()