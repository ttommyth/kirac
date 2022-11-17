import { AutocompleteInteraction, CollectedInteraction, Interaction, ModalSubmitInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js"
// import { AnyInteraction, ApplicationCommandStructure, CommandInteraction, ComponentInteraction } from "eris"

export type StructuredCommand = {
  (interaction: Exclude<Interaction, CollectedInteraction | AutocompleteInteraction>):unknown
  onComponentInteraction?: (interaction: Exclude<CollectedInteraction, ModalSubmitInteraction> )=>unknown
  onModalSubmit?: (interaction: ModalSubmitInteraction )=>unknown
  onAutoComplete?: (interaction: AutocompleteInteraction)=>unknown
  structure: RESTPostAPIChatInputApplicationCommandsJSONBody
}