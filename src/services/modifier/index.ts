import item_classes from "@assets/repoe/item_classes.min.json";
import mods from "@assets/repoe/mods.min.json";
import stat_translations from "@assets/repoe/stat_translations.min.json";
import tags from "@assets/repoe/tags.json";
import MiniSearch from "minisearch";
import { first, groupBy, last, truncate } from "lodash";
import { MD5 } from "crypto-js";
import { format } from "@src/utils/textUtils";
import { SlashCommandSubcommandBuilder } from "discord.js";
import { ModifierTableRow } from "./modifierImage";
import { Essence, essenceModToEssence } from "./essence";
import { craftingBenchModSet } from "./craftingBench";

export type StatCondition={
  min?:number,
  max?:number
}
export type StatTranslationDetail={
  "condition": StatCondition[],
  "format": string[], //["#"],
  "index_handlers": Array<string[]>,
  "string": string
}
export type StatTranslation={
  "English": StatTranslationDetail[],
  "ids": string[]
}

export type Mod = {
    adds_tags: [];
    domain: string;
    generation_type: string,
    generation_weights: [],
    grants_effects: [],
    groups: string[],
    implicit_tags: string[],
    is_essence_only: boolean,
    name?: string,
    required_level: 1,
    spawn_weights: {
      tag: string,
      weight:number
    }[  ],
    stats: ModStat[],
    type: string,
    key: string,
    matchedEssence?: Essence
    matchedCrafting?: { [key: string]: number | undefined}
}
export type ModStat=
{
  id: string,
  max: number,
  min: number
}
export type TagSearcher={
 containTags:string[],
 notContainTags:string[],
 typeFilter?:(type:string)=>boolean
}

export type SearchModLocation= "affix"|"prefix"|"suffix"|"other"

export const itemTypePrefix = [
  "str_dex_int",
  "str_int",
  "dex_int",
  "str_dex",
  "int",
  "dex",
  "str",
]
export const itemTypeSuffix = [
  "shaper",
  "elder",
  "crusader",
  "adjudicator",
  "eyrie",
  "basilisk"
]
export const conditionalFix:{name:string, type:"full_wild"|"prefix_wild"|"suffix_wild"}[] = [
  {
    name: "abyss_jewel",
    type: "full_wild"
  }, 
  {
    name: "leaguestone",
    type: "prefix_wild"
  }, 
  {
    name: "expansion_jewel",
    type: "suffix_wild"
  },
  {
    name: "affliction",
    type: "suffix_wild"
  },
  {
    name: "sentinel",
    type: "suffix_wild"
  },
  {
    name: "expedition",
    type: "suffix_wild"
  },
  {
    name: "heist_equipment",
    type: "suffix_wild"
  },
  {
    name: "memory_line",
    type: "suffix_wild"
  },
  {
    name: "eldritch_implicit",
    type: "prefix_wild"
  }, 
  {
    name: "bestiary",
    type: "suffix_wild"
  }, 
  {
    name: "map",
    type: "prefix_wild"
  },  
  {
    name: "flask",
    type: "prefix_wild"
  }, 
]

export const JewelTypeMapToTagSearcher:{[key:string]:TagSearcher}={
  "Crimson Jewel":{
    containTags:[],
    notContainTags:["not_str"],
    typeFilter:str=>str.endsWith("ForJewel")
  },
  "Viridian Jewel":{
    containTags:[],
    notContainTags:["not_dex"],
    typeFilter:str=>str.endsWith("ForJewel")
  },
  "Cobalt Jewel":{
    containTags:[],
    notContainTags:["not_int"],
    typeFilter:str=>str.endsWith("ForJewel")
  },
  "Prismatic Jewel":{
    containTags:["default"],
    notContainTags:[],
    typeFilter:str=>str.endsWith("ForJewel")
  },
  "Murderous Eye Jewel":{
    containTags:["abyss_jewel_melee"],
    notContainTags:[""],
    typeFilter:str=>str.startsWith("AbyssJewel")
  },
  "Searching Eye Jewel":{
    containTags:["abyss_jewel_ranged"],
    notContainTags:[""],
    typeFilter:str=>str.startsWith("AbyssJewel")
  },
  "Hypnotic Eye Jewel":{
    containTags:["abyss_jewel_caster"],
    notContainTags:[""],
    typeFilter:str=>str.startsWith("AbyssJewel")
  },
  "Ghastly Eye Jewel":{
    containTags:["abyss_jewel_summoner"],
    notContainTags:[""],
    typeFilter:str=>str.startsWith("AbyssJewel")
  },
  "Timeless Jewel":{
    containTags:["default"],
    notContainTags:[],
    typeFilter:str=>str.endsWith("ForJewel")
  },
  "Large Cluster Jewel":{
    containTags:["expansion_jewel_large"],
    notContainTags:[],
    typeFilter:str=>str.startsWith("Affliction")
  },
  "Medium Cluster Jewel":{
    containTags:["expansion_jewel_medium"],
    notContainTags:[],
    typeFilter:str=>str.startsWith("Affliction")
  },
  "Small Cluster Jewel":{
    containTags:["expansion_jewel_small"],
    notContainTags:[],
    typeFilter:str=>str.startsWith("Affliction")
  },
}

const tagTranslator:{[key:string]:string}={
  "weapon_can_roll_minion_modifiers": "covoking_wand",
  "focus_can_roll_minion_modifiers": "covoking_wand",
  "ring_can_roll_minion_modifiers": "minion_ring",
  "not_str": "except_crimson_jewel",
  "not_dex": "except_viridian_jewel",
  "not_int": "except_cobalt_jewel",
}
const translatorTagToOpposite=(tag:string)=>{
  const matchedNegativeWord = ["except","not"].find(it=>tag.includes(it));
  if(matchedNegativeWord){
    return trimUnderscore(tag.replace(matchedNegativeWord,""));
  }
  return "not_"+tag
}
const trimUnderscore=(text:string)=>{
  return text.replaceAll("_"," ").trim().replaceAll(" ","_")
  let startOffset = 0;
  let endOffset = 0;
  if(text.startsWith("_")){
    startOffset++;
  }
  if(text.endsWith("_")){
    endOffset--;
  }
  return text.substring(0+startOffset, text.length-1+endOffset);
}

const oldMasterCraft = ['StrMaster', 'StrDexMaster', 'StrIntMaster', 'DexMaster','DexIntMaster', 'IntMaster','StrDexIntMaster']

const enrichStatString = (id: string[], detail: StatTranslationDetail)=>{
  let outStr = detail.string;
  outStr = format(outStr,...detail.format)
  return id.some(it=>it.startsWith("local_"))? outStr+" (local)": outStr
}

// {[key: MD5(mod.key)]: Mods}
export const availableModsHashMap:{[key:string]:Mod} = Object.fromEntries((Object.entries(mods) as [string, Mod][])
  .filter(it=>it[1].generation_type.endsWith("fix") || it[1].generation_type.endsWith("implicit") || it[1].type.endsWith("ForJewel")  )
  .filter(it=>!["monster", "heist_npc"].some(ban=>it[1].domain===ban)) //domain banning
  .filter(it=>it[1].domain!="crafted"|| !it[0].startsWith("JunMaster") || it[0].startsWith("JunMaster2")) // banning old jun crafted modifier
  .filter(it=>it[1].domain!="crafted"|| !oldMasterCraft.some(c=>it[0].startsWith(c)) ) // banning old master crafted modifier
  .filter(it=>( //ignore if no spawn weights, unless it is exception
    it[0].includes("Delve") || //delve
     it[1].domain=="crafted" || //crafted     
      it[1].domain=="unveiled" || // unveiled
       it[0].includes("EnhancedLevel50Mod") || //incursion
       it[1].name?.includes("Elevated") || //elevated
       it[1].is_essence_only //essence
  )?true
    :it[1].spawn_weights.some(s=>s.weight>0)
  )
  .map(it=>[MD5(it[0]), {
    ...it[1],
    key: it[0],
    matchedEssence: essenceModToEssence[it[0]],
    matchedCrafting: craftingBenchModSet[it[0]]
  }])
);
console.debug("do mods have diff weight in spawn_weights?: ", Object.values(availableModsHashMap).find(it=>new Set(it.spawn_weights.map(s=>s.weight).filter(s=>s>0)).values.length>1))
console.debug("do mods crafting cost?: ", Object.values(availableModsHashMap).some(it=>it.matchedCrafting))

const invokedStatIds = Object.fromEntries(Object.values(availableModsHashMap).flatMap(it=>it.stats).map(it=>[it.id,true]));
// {[key: MD5(stat.id)]: StatTranslationDetailPerId[]}
export const invokedStatHashMap:{[key:string]:(StatTranslationDetail& {enrichedString:string, ids:string[]})[]} = Object.fromEntries(
  (stat_translations as StatTranslation[]).filter(it=>it.ids.find(id=>invokedStatIds[id]))
    .map(stat=>[MD5(stat.ids[0]), stat.English.map(it=>({
      string: it.string,
      enrichedString: enrichStatString(stat.ids, it),
      index_handlers: it.index_handlers,
      format: it.format,
      condition: it.condition,
      ids: stat.ids
    } as StatTranslationDetail & {enrichedString:string, ids: string[]}))])
);
// {[key: MD5(stat.id)]: mod.key[]}
export const statToModHashMap = Object.entries(availableModsHashMap).flatMap(it=>{
  return it[1].stats.map(stat=>[stat.id, it[0]])
}).reduce((cur,it)=>(cur[""+MD5(it[0])]= [...(cur[""+MD5(it[0])]??[]), it[1]], cur),{} as {[key:string]: string[]})

const getTagAffix = (tag:string):{prefix?:string, suffix?:string}=>{
  let matchedPrefix  =itemTypePrefix.find(pre=>tag.startsWith(pre));
  let matchedSuffix  =itemTypeSuffix.find(suf=>tag.endsWith(suf));
  if(!matchedPrefix && !matchedSuffix){
    const matchedConditionalFix  =conditionalFix.find(fix=>tag.includes(fix.name));
    if(matchedConditionalFix){
      const slices = tag.split(matchedConditionalFix.name)
      switch(matchedConditionalFix.type){
      case "full_wild":
        matchedPrefix = first(slices)?.trim() ?? undefined;
        matchedSuffix = last(slices)?.trim() ?? undefined;
        break;
      case "prefix_wild":
        matchedPrefix = first(slices)?.trim() ?? undefined;
        break;
      case "suffix_wild":
        matchedSuffix = last(slices)?.trim() ?? undefined;
        break;
      }
    }
  }
  return {
    prefix: matchedPrefix&& trimUnderscore(matchedPrefix),
    suffix: matchedSuffix&& trimUnderscore(matchedSuffix)
  };
}

const cleanTags = (tag:string):string=>{
  if(tagTranslator[tag])
    return tagTranslator[tag]
  let outStr = tag;
  const affix = getTagAffix(tag);
  if(affix.prefix){
    outStr = outStr.replace(affix.prefix, "");
  }
  if(affix.suffix){
    outStr = outStr.replace(affix.suffix, "");
  }
  outStr= trimUnderscore(outStr);
  return outStr;
}

// {[key: MD5(stat.id)]: mod.key[]}
const tagsUsedInMods = Object.values(availableModsHashMap).reduce((cur, mod)=>(mod.spawn_weights?.forEach(it=>cur[it.tag]=true), cur), {} as {[key:string]:boolean})
export const itemTags = groupBy(tags, (it)=>{
  if(!tagsUsedInMods[it])
    return 0;
  return cleanTags(it);
})
delete itemTags[0] //remove the tags not used in filtered mod list

export const availableItemTypes=Object.keys(itemTags).map((it,idx)=>({id: idx,label:it}));
const availableItemTypeLabels = availableItemTypes.map(it=>it.label)

export const findModsWithStat = 
(statHash: string, options?: {modLocation?: SearchModLocation, itemType?: string, itemAttribute?: string, itemInfluence?: string} )
: {[key:string]: Mod[]}=>{
  let mod = statToModHashMap[statHash].map(it=>availableModsHashMap[it]).filter(it=>!!it);
  if(!mod)
    throw new Error("mod not found with statHash "+statHash);
  if(options){
    if(options.itemAttribute){
      mod = mod.filter(it=>it.spawn_weights.some(spawn=>spawn.tag.startsWith(options.itemAttribute!)))
    }
    if(options.itemType){
      mod = mod.filter(it=>it.spawn_weights.some(spawn=>spawn.tag.includes(options.itemType!)))
    }
    if(options.itemInfluence){
      mod = mod.filter(it=>it.spawn_weights.some(spawn=>spawn.tag.endsWith(options.itemInfluence!)))
    }
    if(options.modLocation){
      switch (options.modLocation) {
      case "affix":
        mod = mod.filter(it=>it.generation_type==="prefix" || it.generation_type=="suffix")
        break;
      case "prefix":
      case "suffix":
        mod = mod.filter(it=>it.generation_type===options.modLocation)
        break;
      case "other":
        mod = mod.filter(it=>!["prefix","suffix"].some(gt =>it.generation_type==gt))
        break;
      
      }
    }
  }
  return groupBy(mod,it=>it.type);
}
const getNumberString=(numbers:(number|undefined)[]):string|undefined=>{
  const distNumbers =Array.from(new Set(numbers)).filter(it=>it!=undefined);
  return distNumbers.map(it=>(it??0)>0?`+${it}`:it).join("-");
}
export const modStatsToString=(stats: ModStat[]):string[]=>{
  const consumed:string[]= [];
  const result:string[] = [];
  stats.forEach(stat=>{
    if(consumed.includes(stat.id))
      return;
    consumed.push(stat.id);
    const statTranslation = invokedStatHashMap[MD5(stat.id).toString()];
    consumed.push(...Array.from(new Set(statTranslation?.flatMap(it=>it.ids))));
    const matchedStatTranslation = statTranslation?.find(st=>{
      const unmatchedCondition = st.condition.some(condition=>(condition.max&& condition.max<stat.max)||(condition.min&& condition.min>stat.min))
      return !unmatchedCondition;
    });
    const invokedStat = matchedStatTranslation?.ids?.map(id=>stats.find(s=>s.id==id))??[stat];
    const formattedString = format(matchedStatTranslation?.string??stat.id.replace("+","{0}")?.replace("-","-{0}"),
      ...invokedStat.map(it=>`(${getNumberString([it?.min, it?.max])})`))
    result.push(formattedString);
  })
  return result
}

export const getModTable=(mods: Mod[]): ModifierTableRow[]=>{
  const output = mods.map<ModifierTableRow>(it=>{
    return ({name: it.name??"", requiredLevel:it.required_level , message: modStatsToString(it.stats).join("\r\n"), tags: it.adds_tags, mod: it});
  });
  return output;
}

export const getModDescription=(mods:Mod[]):{
  itemType: string[],
  influenceType: string[],
  limitedItemBase: string[],
  notes: string[]
}=>{
  const considerWeight = mods.some(m=>m.spawn_weights.some(s=>s.weight>0))
  const weights = mods.flatMap(it=>{
    if(considerWeight){
      return it.spawn_weights.filter(it=>it.weight>0 || it.tag.startsWith("not_"))
    }
    else
      return it.spawn_weights;
  });
  const tags = weights.map(s=>s.tag).filter(it=>it!=="default")
  const normalizedTags = weights.flatMap(s=>{
    const affix=getTagAffix(s.tag);
    return [affix.prefix, affix.suffix, cleanTags(s.tag)].map(tag=>tag && (s.weight<=0?translatorTagToOpposite(tag):tag)) as string[]
  }).filter(it=>it).filter(it=>it!=="default")
  const itemType = weights.map(s=>(s.weight<=0?translatorTagToOpposite(s.tag):s.tag)).filter(it=>it!=="default")
    .map(it=>availableItemTypeLabels.find(label=>label===cleanTags(it))?cleanTags(it):undefined ).filter(it=>it) as string[];
  const influenceType = tags.map(it=>itemTypeSuffix.find(label=>it.includes(label))).filter(it=>it) as string[];
  const limitedItemBase = tags.map(it=>itemTypePrefix.find(label=>it.includes(label))).filter(it=>it) as string[];
  const notes =new Set<string>();
  notes.add("**"+mods[0].generation_type+"**");
  if(mods[0].key.includes("Delve") && mods[0].domain!="delve"){
    notes.add("delve");
  }
  if(mods[0].key.includes("EnhancedLevel50Mod")){
    notes.add("incursion");
  }
  if(mods[0].type.includes("ForJewel")){
    if(normalizedTags.includes("abyss_jewel")){
      if(normalizedTags.includes("melee"))
        notes.add("murderous_eye");
      if(normalizedTags.includes("ranged"))
        notes.add("searching_eye");
      if(normalizedTags.includes("caster"))
        notes.add("hypnotic_eye");
      if(normalizedTags.includes("summoner"))
        notes.add("ghastly_eye");
      notes.add("abyss_jewel");
    }else{
      if(normalizedTags.includes("str") || normalizedTags.includes("crimson_jewel"))
        notes.add("crimson_jewel");
      if(normalizedTags.includes("dex") || normalizedTags.includes("viridian_jewel"))
        notes.add("viridian_jewel");
      if(normalizedTags.includes("int") || normalizedTags.includes("cobalt_jewel"))
        notes.add("cobalt_jewel");
      notes.add("jewel");
    }
  }
  if(mods[0].name?.includes("Elevated")){
    notes.add("elevated");
  }
  const essenceMod = mods.find(it=>it.matchedEssence)
  if(essenceMod){
    notes.add(`essence (${last(essenceMod?.matchedEssence?.name?.split("Essence"))})`);
  }
  // const importantAffix = Object.fromEntries(tags.map(it=>[it, getTagAffix(it)]));
  if(normalizedTags.length>0){
    Object.values(normalizedTags).forEach(it=>
      it&&notes.add(cleanTags(it))
    );
  }
  return ({
    // itemType:Array.from(new Set(itemType)),
    itemType:[],
    influenceType: Array.from(new Set(influenceType)),
    limitedItemBase: Array.from(new Set(limitedItemBase)),
    notes: Array.from(new Set([...notes,...itemType])),
  });
}

export const statMiniSearch = new MiniSearch({fields:["enrichedString","indexField"],storeFields:["enrichedString", "id"] })
statMiniSearch.addAll(Object.entries(invokedStatHashMap)
  .flatMap(p=>p[1]
    .map(c=>({
      string: c.string,
      enrichedString: c.enrichedString,
      id:p[0],
      indexField: statToModHashMap[p[0]]
        ?.map(modId=>[availableModsHashMap[modId].type,availableModsHashMap[modId].spawn_weights.map(it=>it.tag).join(',')])
    }))))

export const itemTypeMiniSearch = new MiniSearch({fields:["label"],storeFields:["label"] })
itemTypeMiniSearch.addAll(availableItemTypes);