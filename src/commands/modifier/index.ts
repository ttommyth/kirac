import { ActionRow, ActionRowBuilder, APIApplicationCommandOptionChoice, APIEmbedField, ButtonBuilder, ButtonStyle, CommandInteractionOption, ComponentType, EmbedBuilder, InteractionCollector, MessageActionRowComponent, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { filter, last, minBy, remove } from "lodash";
import { StructuredCommand } from "../../types/commands";
import { ChromaticOptions, ChromaticResult, prebuiltEngine } from '@src/services/chromatic/engine';
import { genTableImage } from "@src/services/chromatic/tableImage";
import { availableItemType, availableMods, itemTags, itemTypeMiniSearch, itemTypePrefix, itemTypeSuffix, statMiniSearch, statToMod } from "@src/services/modifier";


export const modifierCommand: StructuredCommand = async (interaction)=>{
  const statId = interaction.options.data.find(it=>it.name==="mod_stat")?.value?.toString();
  if(statId){
    //process with stat id lookup

    await interaction.reply(JSON.stringify(statToMod[statId]))
  }else{

    await interaction.reply("-")
  }
}

modifierCommand.onComponentInteraction=async(interaction)=>{
  console.debug("interaction", interaction.customId)
}
modifierCommand.onModalSubmit = async(interaction)=>{
  console.log("modal submit", interaction);
}

modifierCommand.onAutoComplete= async(interaction)=>{
  const focusedOption  = interaction.options.getFocused(true);
  switch(focusedOption.name){
  case "item_type":
    {
      if(focusedOption.value?.length<2){
        await interaction.respond(
          Object.entries(itemTags).filter(it=>it[1].length>4).sort(it=>it[1].length).map(it=>it[0]).slice(0,25).map(it=>({name:it, value:""+it}))
        )
      }else{
        
        await interaction.respond(
          itemTypeMiniSearch.search(focusedOption.value, {fuzzy:0.2 }).slice(0,25).map(it=>({name:it.label, value:it.label}))
        )
      }
    }
    break;
  case "mod_stat":
    {
      const itemType = interaction.options.data.find(it=>it.name=="item_type")?.value?.toString();
      const itemAttribute= interaction.options.data.find(it=>it.name=="item_attribute")?.value?.toString();
      const itemInfluence= interaction.options.data.find(it=>it.name=="item_influence")?.value?.toString();
      if(focusedOption.value?.length<2){
        await interaction.respond(
          []
        )
      }else{
        
        await interaction.respond(
          statMiniSearch.search(
            {
              combineWith: 'AND',
              fields:["string"],
              fuzzy:0.2,
              queries:[
                focusedOption.value,
              // ...(itemType?[{
              //   combineWith:"AND",
              //   fuzzy:1,
              //   fields:["indexField"],
              //   queries: [itemType]
              // }]:[]),
              // ...(itemAttribute?[{
              //   combineWith:"AND",
              //   fuzzy:1,
              //   fields:["indexField"],
              //   queries: [itemAttribute]
              // }]:[]),
              // ...(itemInfluence?[{
              //   combineWith:"AND_NOT",
              //   fuzzy:1,
              //   fields:["indexField"],
              //   queries:  remove(itemTypeSuffix,(it)=>it===itemInfluence)
              // }]:[]),
              ] 
            }
          ).slice(0,25).map(it=>({name:it.string, value:it.id}))
        )
      }
    }
    break;
  }
}

modifierCommand.structure = new SlashCommandBuilder()
  .setName("modifier")
  .setDescription("modifier")
  .addStringOption((opt)=>(opt.setName("item_type").setDescription("Item Type")).setAutocomplete(true))
  .addStringOption((opt)=>(opt.setName("item_attribute").setDescription("Item Attribute Type (e.g. str, str/dex)")).setChoices(...itemTypePrefix.map(it=>(
    {name:it, value:it}
  ))
  ))
  .addStringOption((opt)=>(opt.setName("item_influence").setDescription("Item Influence Type (e.g. shaper, elder)")).setChoices(...itemTypeSuffix.map(it=>(
    {name:it, value:it}
  ))
  ))
  .addStringOption((opt)=>(opt.setName("mod_loc").setDescription("Mod Location")).setChoices(...[
    {name:"prefix", value:"prefix"},
    {name:"suffix", value:"suffix"},
    // {name:"implicit", value:"implicit"},
    // {name:"synthesis", value:"synthesis"},
    {name:"corrupted", value:"corrupted"},
  ]))
  .addStringOption((opt)=>(opt.setName("mod_stat").setDescription("Mod Stat (e.g. Adds (56–87) to (105–160) Chaos Damage)")).setAutocomplete(true))
  .toJSON()