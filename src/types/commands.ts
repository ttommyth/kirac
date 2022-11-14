import { AutocompleteInteraction, CollectedInteraction, Interaction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
// import { AnyInteraction, ApplicationCommandStructure, CommandInteraction, ComponentInteraction } from "eris"

export type StructuredCommand = {
  (interaction: Exclude<Interaction, CollectedInteraction | AutocompleteInteraction>):unknown
  onComponentInteraction?: (interaction: CollectedInteraction )=>unknown
  structure: RESTPostAPIChatInputApplicationCommandsJSONBody
}