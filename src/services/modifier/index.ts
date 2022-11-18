import item_classes from "@assets/repoe/item_classes.min.json";
import mods from "@assets/repoe/mods.min.json";
import stat_translations from "@assets/repoe/stat_translations.min.json";
import tags from "@assets/repoe/tags.json";
import MiniSearch from "minisearch";
import { groupBy, truncate } from "lodash";
import { MD5 } from "crypto-js";

export type StatCondition={
  min?:number,
  max?:number
}
export type StatTranslationDetailPerId={
  "condition": StatCondition,
  "format": string, 
  "index_handlers": string[],
  "string": string
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
export type Mods = {
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
    stats: 
      {
        id: string,
        max: number,
        min: number
      }[],
    type: string
}
export type TagSearcher={
 containTags:string[],
 notContainTags:string[],
 typeFilter?:(type:string)=>boolean
}

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

// {[key: MD5(mod.key)]: Mods}
export const availableModsHashMap:{[key:string]:Mods} = Object.fromEntries(Object.entries(mods)
  .filter(it=>it[1].generation_type.endsWith("fix") ||it[1].implicit_tags.length>0 || it[1].generation_type.endsWith("implicit") || it[1].type.endsWith("ForJewel")  )
  .map(it=>[MD5(it[0]), it[1]]));


const invokedStatIds = Object.fromEntries(Object.values(availableModsHashMap).flatMap(it=>it.stats).map(it=>[it.id,true]));
// {[key: MD5(stat.id)]: StatTranslationDetailPerId[]}
export const invokedStatHashMap:{[key:string]:StatTranslationDetailPerId[]} = Object.fromEntries(
  (stat_translations as StatTranslation[]).filter(it=>it.ids.find(id=>invokedStatIds[id]))
    .flatMap(it=>it.ids.map((id,idx)=>[MD5(id), it.English.map(it=>({
      string: it.string,
      index_handlers: it.index_handlers[idx],
      format: it.format[idx],
      condition: it.condition[idx],
    } as StatTranslationDetailPerId))]))
);
// {[key: MD5(stat.id)]: mod.key[]}
export const statToModHashMap = Object.entries(availableModsHashMap).flatMap(it=>{
  return it[1].stats.map(stat=>[stat.id, it[0]])
}).reduce((cur,it)=>(cur[""+MD5(it[0])]= [...(cur[""+MD5(it[0])]??[]), it[1]], cur),{} as {[key:string]: string[]})

// {[key: MD5(stat.id)]: mod.key[]}
const tagsUsedInMods = Object.values(availableModsHashMap).reduce((cur, mod)=>(mod.spawn_weights?.forEach(it=>cur[it.tag]=true), cur), {} as {[key:string]:boolean})
export const itemTags = groupBy(tags, (it)=>{
  if(!tagsUsedInMods[it])
    return 0;
  let outStr = it;
  const matchedPrefix  =itemTypePrefix.find(pre=>it.startsWith(pre));
  const matchedSuffix  =itemTypeSuffix.find(suf=>it.endsWith(suf));
  if(matchedPrefix)
    outStr = outStr.replace(matchedPrefix+"_","");
  if(matchedSuffix)
    outStr = outStr.replace("_"+matchedSuffix,"");
  if(!matchedPrefix && !matchedSuffix){
    const matchedConditionalFix  =conditionalFix.find(fix=>outStr.includes(fix.name));
    if(matchedConditionalFix){
      const slices = outStr.split(matchedConditionalFix.name)
      switch(matchedConditionalFix.type){
      case "full_wild":
        outStr = matchedConditionalFix.name;
        break;
      case "prefix_wild":
        outStr = matchedConditionalFix.name+(slices.length>2?slices[1]:"");
        break;
      case "suffix_wild":
        outStr = (slices.length>2?slices[0]:"")+matchedConditionalFix.name;
        break;
      }
    }
  }
  return outStr;
})
delete itemTags[0] //remove the tags not used in filtered mod list

export const availableItemType=Object.keys(itemTags).map((it,idx)=>({id: idx,label:it}));


export const statMiniSearch = new MiniSearch({fields:["string","indexField"],storeFields:["string", "id"] })
statMiniSearch.addAll(Object.entries(invokedStatHashMap)
  .flatMap(p=>p[1]
    .map(c=>({
      string: c.string,
      id:p[0],
      indexField: statToModHashMap[p[0]]?.map(modId=>[availableModsHashMap[modId].type,availableModsHashMap[modId].spawn_weights.filter(it=>it.weight>0).map(it=>it.tag).join(',')])
    }))))


export const itemTypeMiniSearch = new MiniSearch({fields:["label"],storeFields:["label"] })
itemTypeMiniSearch.addAll(availableItemType);