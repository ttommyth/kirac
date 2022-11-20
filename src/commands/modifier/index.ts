import { ActionRow, ActionRowBuilder, APIApplicationCommandOptionChoice, APIEmbedField, Attachment, BaseMessageOptions, ButtonBuilder, ButtonStyle, CommandInteractionOption, ComponentType, Embed, EmbedBuilder, InteractionCollector, MessageActionRowComponent, MessagePayload, ModalActionRowComponentBuilder, ModalBuilder, RawFile, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { Dictionary, filter, first, groupBy, last, max, minBy, remove } from "lodash";
import { StructuredCommand } from "../../types/commands";
import { ChromaticOptions, ChromaticResult, prebuiltEngine } from '@src/services/chromatic/engine';
import { genChromaticTableImage } from "@src/services/chromatic/tableImage";
import { availableItemTypes, availableModsHashMap, findModsWithStat, getModDescription, getModTable, itemTags, itemTypeMiniSearch, itemTypePrefix, itemTypeSuffix, Mod, modStatsToString, SearchModLocation, statMiniSearch, statToModHashMap } from "@src/services/modifier";
import { getTable, md5RegexExp } from "@src/utils/textUtils";
import { enc } from "crypto-js";
import { fillTextWithEmoji } from "@src/services/emoji/emojiDict";
import { currencyToName } from "@src/services/translator.ts/MetadataTranslator";

const modEmbed =(mods:Mod[]): {embeds: EmbedBuilder[], attachment: Attachment[]}=>{
  // const embeds = new EmbedBuilder().setAuthor({
  //   name: mods[0].stats
  // })
  const result = groupBy(getModTable(mods), it=>it.mod.domain);
  const outStr:string[] = [];
  Object.entries(result).forEach(group=>{
    const sortedMods = group[1].sort((a,b)=>a.requiredLevel-b.requiredLevel);
    const description= getModDescription(group[1].map(it=>it.mod));
    const header = [
      group[0],
      description.itemType.join(", "),
      // description?.limitedItemBase?.length>0?`(${description?.limitedItemBase?.join(", ")})`:"",
      // description?.influenceType?.join(", "),
      ...description.notes
    ]
    outStr.push(fillTextWithEmoji(header.filter(it=>it.trim().length).join(" | ")))
    // outStr.push(sortedMods?.map(it=>it.mod.key)?.join(", "))
    // console.debug(sortedMods.map(it=>JSON.stringify(it.mod)))
    outStr.push("```")
    const tableHeader = [
      `${"-=====NAME=====-".padEnd(15)}| LV`,
      "WEIGHT",
      description.notes.some(it=>it.startsWith("essence")) && "ESSENSE",
      mods.some(it=>it.matchedCrafting) && "CRAFT COST"
    ].filter(it=>it)
    outStr.push(tableHeader.join(" | "))
    const tableBody = sortedMods
      .map(it=>{
        const tableRow=[
          (it.name??"").padEnd(15).substring(0,14) + ((it.name??"").length>15?".":" "),
          it.requiredLevel.toString().padStart(2),
          (max(it.mod.spawn_weights.map(it=>it.weight)) ?? " - ").toString().padEnd(6),
          first(it.mod.matchedEssence?.name?.split("Essence")),
          it.mod.matchedCrafting && Object.entries(it.mod.matchedCrafting).map(it=>currencyToName[it[0]]+" * "+ it[1]).join("&")
        ].filter(it=>it)
        return tableRow.join(" | ")+`\r\n > ${it.message.replaceAll("\r\n","\r\n > ")}`
      })
    outStr.push( 
      tableBody.join("\r\n")
    )
    outStr.push("```")
  });
  return {
    embeds:[
      new EmbedBuilder().setDescription(outStr.join("\r\n"))
    ],
    attachment:[]
  };
}

const processModifierTilMatch=(statHash: string, options?: {modLocation?: SearchModLocation, itemType?: string, itemAttribute?: string, itemInfluence?: string}, followUpOptions?:{
  modType:string
}): BaseMessageOptions=>{

  const found = findModsWithStat(statHash,options);
  const filteredFound = followUpOptions?.modType?Object.fromEntries(Object.entries(found).filter(it=>it[0]===followUpOptions?.modType)):found;
  const modTypeActionRow =  new ActionRowBuilder<SelectMenuBuilder>().addComponents(
    new SelectMenuBuilder()
      .setCustomId("mod_type")
      .setMinValues(1).setMaxValues(1).setPlaceholder(followUpOptions?.modType??"Select the most suitable type")
      .setOptions(...Object.keys(found).map(it=>({label:it, value:it})))
  );
  const commandStorageEmbed = new EmbedBuilder().setAuthor({
    name: "stathash: "+statHash,          
  }).setFooter({  
    text:"query: "+enc.Base64.stringify(enc.Utf8.parse(JSON.stringify(options)))
  });
  if(Object.keys(found).length>1 && Object.keys(filteredFound).length!=1){
    return ({
      content:`found ${Object.keys(found).length} matches, please select ${""} to continue`,
      embeds:[
        commandStorageEmbed,
      ],
      components:[
        modTypeActionRow
      ]       
    })
  }else{
    const groupBygenerationType = groupBy(first(Object.values(filteredFound)), it=>it.spawn_weights);
    const mods = Object.entries(groupBygenerationType).map(it=>modEmbed(it[1]))?.filter(it=>it);
    const modEmbeds = mods?.flatMap(it=>it.embeds)?.filter(it=>it);
    const attachments = mods.flatMap(it=>it.attachment)?.filter(it=>it);
    return ({
      embeds:[
        ...modEmbeds,
        commandStorageEmbed,
      ],
      ...(attachments?.length>0?{files:[
        ...attachments
      ]}:{}),
      components:[
        modTypeActionRow
      ]
    })
  }
}


export const modifierCommand: StructuredCommand = async (interaction)=>{
  await interaction.deferReply();
  const statId = interaction.options.data.find(it=>it.name==="mod_stat")?.value?.toString();
  console.debug(statId?.trim())
  if(statId){
    //process with stat id lookup
    const isMd5=md5RegexExp.test(statId?.trim());
    if(isMd5){
      //is md5
      const itemType = interaction.options.data.find(it=>it.name=="item_type")?.value?.toString();
      const itemAttribute= interaction.options.data.find(it=>it.name=="item_attribute")?.value?.toString();
      const itemInfluence= interaction.options.data.find(it=>it.name=="item_influence")?.value?.toString();
      const modLocation= interaction.options.data.find(it=>it.name=="mod_loc")?.value?.toString() as SearchModLocation;
      const options= {itemType, itemAttribute, itemInfluence, modLocation: modLocation??"affix"};
   
      const response = processModifierTilMatch(statId, options);
      await interaction.editReply(response);
    }else{
      //is string
      await interaction.editReply(" - "+ statId+" - "+isMd5);
    }

  }else{

    await interaction.editReply("-")
  }
}
modifierCommand.onComponentInteraction=async(interaction)=>{
  if(interaction.customId==="mod_type" && interaction.componentType == ComponentType.StringSelect){
    await interaction.deferUpdate();
    const mod_type = interaction.values[0]
    const commandStorageEmbed = last(interaction.message.embeds);
    const options= JSON.parse(enc.Base64.parse(commandStorageEmbed?.footer?.text?.split(":")?.[1]?.trim()??"").toString(enc.Utf8))
    const statId= commandStorageEmbed?.author?.name?.split(":")?.[1]?.trim() ?? "";
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
              focusedOption.value.replaceAll(/[0-9]/g," "),
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
  .setName("mod")
  .setDescription("modifier look up")
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