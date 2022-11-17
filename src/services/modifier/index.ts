import item_classes from "@assets/repoe/item_classes.min.json";
import mods from "@assets/repoe/mods.min.json";
import stat_translations from "@assets/repoe/stat_translations.min.json";
import tags from "@assets/repoe/tags.json";
import MiniSearch from "minisearch";

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
export const availableMods:{[key:string]:Mods} = Object.entries(mods).filter(it=>it[1].generation_type.endsWith("fix")) as any
export const availableItemType=tags.map((it,idx)=>({id: idx,label:it}));
export const itemTypeMiniSearch = new MiniSearch({fields:["label"],storeFields:["label"] })
itemTypeMiniSearch.addAll(availableItemType);