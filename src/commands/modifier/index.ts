import { ActionRow, ActionRowBuilder, APIApplicationCommandOptionChoice, APIEmbedField, ButtonBuilder, ButtonStyle, CommandInteractionOption, ComponentType, EmbedBuilder, InteractionCollector, MessageActionRowComponent, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { filter, last, minBy, remove } from "lodash";
import { StructuredCommand } from "../../types/commands";
import { ChromaticOptions, ChromaticResult, prebuiltEngine } from '@src/services/chromatic/engine';
import { genTableImage } from "@src/services/chromatic/tableImage";
import { availableItemType, availableModsHashMap, findModsWithStat, itemTags, itemTypeMiniSearch, itemTypePrefix, itemTypeSuffix, SearchModLocation, statMiniSearch, statToModHashMap } from "@src/services/modifier";
import { md5RegexExp } from "@src/utils/textUtils";
import { enc } from "crypto-js";

const processModifierTilMatch=(statHash: string, options?: {modLocation?: SearchModLocation, itemType?: string, itemAttribute?: string, itemInfluence?: string}, followUpOptions?:{
  modType:string
})=>{

  const found = findModsWithStat(statHash,options);
  const filteredFound = followUpOptions?.modType?Object.fromEntries(Object.entries(found).filter(it=>it[0]===followUpOptions?.modType)):found;
  console.debug(found);
  if(Object.keys(found).length>1 && Object.keys(filteredFound).length!=1){
    return ({
      content:`found ${Object.keys(found).length} matches, please select ${""} to continue`,
      embeds:[
        new EmbedBuilder().setAuthor({
          name: "stathash: "+statHash,          
        }).setFooter({  
          text:"query: "+enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(options)))
        })
      ],
      components:[
        new ActionRowBuilder<SelectMenuBuilder>().addComponents(
          new SelectMenuBuilder()
            .setCustomId("mod_type")
            .setMinValues(1).setMaxValues(1).setPlaceholder(followUpOptions?.modType??"Select the most suitable type")
            .setOptions(...Object.keys(found).map(it=>({label:it, value:it})))
        )]
    })
  }else{
    return ({
      content:`${Object.values(filteredFound)[0].map(it=>it.required_level).join(",")}`,
      embeds:[
        new EmbedBuilder().setAuthor({
          name: "stathash: "+statHash,          
        }).setFooter({  
          text:"query: "+enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(options)))
        })
      ],
      components:[
        new ActionRowBuilder<SelectMenuBuilder>().addComponents(
          new SelectMenuBuilder()
            .setCustomId("mod_type")
            .setMinValues(1).setMaxValues(1).setPlaceholder(followUpOptions?.modType??"Select the most suitable type")
            .setOptions(...Object.keys(found).map(it=>({label:it, value:it})))
        )]
    })
  }
}


export const modifierCommand: StructuredCommand = async (interaction)=>{
  const statId = interaction.options.data.find(it=>it.name==="mod_stat")?.value?.toString();
  console.debug(statId?.trim())
  if(statId){
    //process with stat id lookup
    const isMd5=md5RegexExp.test(statId?.trim());
    if(isMd5){
      //is md5
      console.debug("stat: ", statId);
      const itemType = interaction.options.data.find(it=>it.name=="item_type")?.value?.toString();
      const itemAttribute= interaction.options.data.find(it=>it.name=="item_attribute")?.value?.toString();
      const itemInfluence= interaction.options.data.find(it=>it.name=="item_influence")?.value?.toString();
      const modLocation= interaction.options.data.find(it=>it.name=="mod_loc")?.value?.toString() as SearchModLocation;
      const options= {itemType, itemAttribute, itemInfluence, modLocation: modLocation??"affix"};
   
      const response = processModifierTilMatch(statId, options);
      await interaction.reply(response);
    }else{
      //is string
      await interaction.reply(" - "+ statId+" - "+isMd5);
    }

  }else{

    await interaction.reply("-")
  }
}
modifierCommand.onComponentInteraction=async(interaction)=>{
  if(interaction.customId==="mod_type" && interaction.componentType == ComponentType.StringSelect){
    await interaction.deferUpdate();
    const mod_type = interaction.values[0]
    const options= JSON.parse(enc.Base64.parse(interaction.message.embeds[0]?.footer?.text?.split(":")?.[1]?.trim()??"").toString(enc.Utf8))
    const statId= interaction.message.embeds[0]?.author?.name?.split(":")?.[1]?.trim() ?? "";
    const response = processModifierTilMatch(statId, options, {modType: mod_type});
    await interaction.message?.edit(response);
  }
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
      if(focusedOption.value?.length<2){
        await interaction.respond(
          []
        )
      }else{
        const searchResult =statMiniSearch.search(
          {
            combineWith: 'AND',
            fields:["enrichedString"],
            fuzzy:0.2,
            prefix:true,
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
        ).slice(0,25).map(it=>({name:it.enrichedString, value:it.id}));
        await interaction.respond(
          searchResult?.map(it=>(it.name=it.name.substring(0,100), it))??[]
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
    {name:"prefix/suffix", value:"affix"},
    {name:"prefix", value:"prefix"},
    {name:"suffix", value:"suffix"},
    // {name:"implicit", value:"implicit"},
    // {name:"synthesis", value:"synthesis"},
    // {name:"corrupted", value:"corrupted"},
    {name:"other", value:"other"}
  ]))
  .addStringOption((opt)=>(opt.setName("mod_stat").setDescription("Mod Stat (e.g. Adds (56–87) to (105–160) Chaos Damage)")).setAutocomplete(true))
  .toJSON()