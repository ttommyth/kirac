
import crafting_bench_options from "@assets/repoe/crafting_bench_options.min.json";
export interface CraftingBenchOptions {
  actions:      Actions;
  bench_tier:   number;
  cost:         { [key: string]: number | undefined};
  item_classes: ItemClass[];
  master:       Master;
}

export interface Actions {
  change_socket_count?: number;
  link_sockets?:        number;
  color_sockets?:       string;
  add_explicit_mod?:    string;
  remove_crafted_mods?: boolean;
  add_enchant_mod?:     string;
  remove_enchantments?: boolean;
}

export enum ItemClass {
  Amulet = "Amulet",
  Belt = "Belt",
  BodyArmour = "Body Armour",
  Boots = "Boots",
  Bow = "Bow",
  Claw = "Claw",
  Dagger = "Dagger",
  Gloves = "Gloves",
  Helmet = "Helmet",
  HybridFlask = "HybridFlask",
  LifeFlask = "LifeFlask",
  ManaFlask = "ManaFlask",
  OneHandAxe = "One Hand Axe",
  OneHandMace = "One Hand Mace",
  OneHandSword = "One Hand Sword",
  Quiver = "Quiver",
  Ring = "Ring",
  RuneDagger = "Rune Dagger",
  Sceptre = "Sceptre",
  Shield = "Shield",
  Staff = "Staff",
  ThrustingOneHandSword = "Thrusting One Hand Sword",
  TwoHandAxe = "Two Hand Axe",
  TwoHandMace = "Two Hand Mace",
  TwoHandSword = "Two Hand Sword",
  UtilityFlask = "UtilityFlask",
  UtilityFlaskCritical = "UtilityFlaskCritical",
  Wand = "Wand",
  Warstaff = "Warstaff",
}

export enum Master {
  EinharBeastmaster = "Einhar, Beastmaster",
  JunVeiledMaster = "Jun, Veiled Master",
  NikoMasterOfTheDepths = "Niko, Master of the Depths",
  SisterCassia = "Sister Cassia",
}

export const craftingBenchModSet = Object.fromEntries((crafting_bench_options as CraftingBenchOptions[])
  .filter(it=>it.actions.add_explicit_mod)
  .map(it=>[it.actions.add_explicit_mod!, it.cost]))