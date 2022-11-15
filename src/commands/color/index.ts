import { ActionRow, ActionRowBuilder, APIApplicationCommandOptionChoice, APIEmbedField, ButtonBuilder, ButtonStyle, CommandInteractionOption, ComponentType, EmbedBuilder, MessageActionRowComponent, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { last, minBy, range } from "lodash";
import { StructuredCommand } from "../../types/commands";
import { ChromaticOptions, ChromaticResult, prebuiltEngine } from '@src/services/chromatic/engine';
import { AnyMxRecord } from "dns";
import { genTableImage } from "@src/services/chromatic/tableImage";

const socketComponentSelectOptions =(prefix:string)=> (
  [...new Array(7)].map((_,idx)=>({
    label:prefix+(+idx),
    value:prefix+(+idx)
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
const componentsToChromaticOptions = (rows: ActionRow<MessageActionRowComponent>[]):ChromaticOptions=>{
  return rows.reduce((cur, it)=>{
    it.components.forEach(it=>{
      if(["r","g","b","str","dex","int","socket"].indexOf(it.customId??"")<0)
        return;
      switch (it.type) {
      case ComponentType.Button:
        cur[it.customId as keyof ChromaticOptions] = +(last(it.label?.split(":")??[])??1);
        break;
      case ComponentType.StringSelect:
        cur[it.customId as keyof ChromaticOptions] = +(last(it.placeholder?.split(":")??[])??1);
        break;
      default:
        break;
      }
    })
    return cur;
  }, {} as unknown as ChromaticOptions)
}
const createCommandComponents = (options: ChromaticOptions)=>{
  return [
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId("socket")
        .setMinValues(1).setMaxValues(1).setPlaceholder("SOCKET: "+options["socket"])
        .setOptions(...socketComponentSelectOptions("SOCKET: "))
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId("r")
        .setMinValues(1).setMaxValues(1).setPlaceholder("R: "+options["r"])
        .setOptions(...socketComponentSelectOptions("R: "))
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId("g")
        .setMinValues(1).setMaxValues(1).setPlaceholder("G: "+options["g"])
        .setOptions(...socketComponentSelectOptions("G: "))
    ),
    new ActionRowBuilder<SelectMenuBuilder>().addComponents(
      new SelectMenuBuilder()
        .setCustomId("b")
        .setMinValues(1).setMaxValues(1).setPlaceholder("B: "+options["b"])
        .setOptions(...socketComponentSelectOptions("B: "))
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      [
        new ButtonBuilder()
          .setCustomId("str")
          .setLabel("STR: "+options["str"])
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("dex")
          .setLabel("DEX: "+options["dex"])
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("int")
          .setLabel("INT: "+options["int"])
          .setStyle(ButtonStyle.Primary)
      ]
    )
  ]
}

const socketChoices= (
  [...new Array(7)].map((_, idx)=>({
    name:`${idx}`,
    value:idx
  } as APIApplicationCommandOptionChoice<number>))
)

const fillResultToEmbed=(result:ChromaticResult[], builder:EmbedBuilder): EmbedBuilder=>{
  let b = builder;
  const bestCost = minBy(result , it=>it.avgCost=="-"?999999:it.avgCost);
  const bestTry = minBy(result , it=>it.avgTries);
  return b.addFields(
    [
      { name: "Best Cost",  value:bestCost?.recipeName ??"-"},
      { name: "Avg Cost",  value:bestCost?.avgCost??"-" },
      { name: "Avg Tries",  value:bestCost?.avgTries??"-" },
      { name: "Best Tries",  value:bestTry?.recipeName ??"-"},
      { name: "Avg Cost",  value:bestTry?.avgCost??"-" },
      { name: "Avg Tries",  value:bestTry?.avgTries??"-" },
    ].map((it:APIEmbedField)=>(it.inline=true, it))
  );
  console.debug(result)
  const first = result.splice(0,1)[0];
  const pair = result.reduce((cur, it)=>{
    const latest = last(cur);
    if((latest?.length??0)>=2){
      cur.push([it])
    }else if (latest){
      cur[cur.length-1][1] = it;
    }
    return cur;
  }, [[]] as [ChromaticResult[]]);
  b=b.addFields([
    { name: "Recipe Name",  value:first.recipeName },
    { name: "Chance",  value:first.chance },
    { name: "Avg Tries",  value:first.avgTries },
    { name: "Recipe Cost",  value:first.recipeCost },
    { name: "Average Cost",  value:first.avgCost },
    { name: "StdDev",  value:first.stdDev },
  ].map((it:APIEmbedField)=>(it.inline=true, it))
    .map(it=>{
      return it;
    })
  )
  // pair.forEach(it=>{
  //   b=b.addFields([
  //     { name: it[0]?.recipeName,  value:it[1]?.recipeName ??"-"},
  //     { name: it[0]?.chance,  value:it[1]?.chance??"-" },
  //     { name: it[0]?.avgTries,  value:it[1]?.avgTries??"-" },
  //     { name: it[0]?.recipeCost,  value:it[1]?.recipeCost??"-" },
  //     { name: it[0]?.avgCost,  value:it[1]?.avgCost??"-" },
  //     { name: it[0]?.stdDev,  value:it[1]?.stdDev??"-" },
  //   ].map((it:APIEmbedField)=>(it.inline=true, it))
  //     .map(it=>{
  //       it.name = it.name??"-"
  //       it.value = it.value??"-"
  //       return it
  //     })
  //   )
  // });
  return b;
}

export const colorCommand: StructuredCommand = async (interaction)=>{
  console.debug(interaction.options)
  const options = toChromaticOptions([...interaction.options.data]);
  const result = prebuiltEngine.calculate(options);
  await interaction.reply({
    embeds:[
      fillResultToEmbed(result[0], new EmbedBuilder())      
    ],
    files:[
      {
        name: "test.png",
        attachment: await genTableImage(result[0])
      }
    ],
    components: [
      ...createCommandComponents(options)
    ]
  })
}

colorCommand.onComponentInteraction=async(interaction)=>{
  console.debug("interaction", interaction.customId)
  const options = componentsToChromaticOptions(interaction.message.components);
  if(["str","dex","int"].indexOf(interaction.customId)>=0 && interaction.componentType==ComponentType.Button){
    // await interaction.
    await interaction.showModal(new ModalBuilder()
      .setCustomId('myModal')
      .setTitle('My Modal').addComponents(
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        
          new TextInputBuilder()
            .setCustomId("str")
            .setLabel("STR")
            .setValue(""+options.str)
            .setStyle(TextInputStyle.Short)
        
        ),    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        
          new TextInputBuilder()
            .setCustomId("dex")
            .setLabel("DEX")
            .setValue(""+options.dex)
            .setStyle(TextInputStyle.Short)
        
        ),    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        
          new TextInputBuilder()
            .setCustomId("int")
            .setLabel("INT")
            .setValue(""+options.int)
            .setStyle(TextInputStyle.Short)
        
        )
      ))
  }else if (["r","g","b","socket"].indexOf(interaction.customId)>=0 && interaction.componentType == ComponentType.StringSelect){
    options[interaction.customId as keyof ChromaticOptions] = +(last(interaction.values[0].split(":"))??1);
    await interaction.deferUpdate();
    const result = prebuiltEngine.calculate(options);
    await interaction.message?.edit({
      embeds:[
        fillResultToEmbed(result[0], new EmbedBuilder())      
      ],
      files:[
        {
          name: "test.png",
          attachment: await genTableImage(result[0])
        }
      ],
      components: createCommandComponents(options)
    });
  }
}
colorCommand.onModalSubmit = async(interaction)=>{
  console.log("modal submit", interaction);
  if(interaction.message?.components){
    const options = componentsToChromaticOptions(interaction.message?.components);   
    options["str"] = + interaction.fields.getTextInputValue("str");
    options["dex"] = + interaction.fields.getTextInputValue("dex");
    options["int"] = + interaction.fields.getTextInputValue("int");
    await interaction.deferUpdate();
    const result = prebuiltEngine.calculate(options);
    await interaction.message?.edit({
      embeds:[
        fillResultToEmbed(result[0], new EmbedBuilder())      
      ],
      files:[
        {
          name: "test.png",
          attachment: await genTableImage(result[0])
        }
      ],
      components: createCommandComponents(options)
    });
  }
  // await interaction.followUp("ok"+Math.random());
  // await interaction.reply("ok")
}

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