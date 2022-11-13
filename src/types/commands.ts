import { AnyInteraction, ApplicationCommandStructure, CommandInteraction, ComponentInteraction } from "eris"

export type StructuredCommand = {
  (interaction: CommandInteraction):unknown
  onComponentInteraction?: (interaction: ComponentInteraction)=>unknown
  structure: ApplicationCommandStructure
}