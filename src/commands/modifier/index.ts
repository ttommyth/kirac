import { ActionRow, ActionRowBuilder, APIApplicationCommandOptionChoice, APIEmbedField, ButtonBuilder, ButtonStyle, CommandInteractionOption, ComponentType, EmbedBuilder, InteractionCollector, MessageActionRowComponent, ModalActionRowComponentBuilder, ModalBuilder, SelectMenuBuilder, SlashCommandBuilder, SlashCommandIntegerOption, TextInputBuilder, TextInputStyle } from "discord.js";
import { last, minBy } from "lodash";
import { StructuredCommand } from "../../types/commands";
import { ChromaticOptions, ChromaticResult, prebuiltEngine } from '@src/services/chromatic/engine';
import { genTableImage } from "@src/services/chromatic/tableImage";
import { availableItemType, availableMods, itemTypeMiniSearch } from "@src/services/modifier";


export const modifierCommand: StructuredCommand = async (interaction)=>{
  console.debug(interaction.options)
  console.debug(availableItemType)
  console.debug(availableMods.length)
  await interaction.reply("-")
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
      await interaction.respond(
        itemTypeMiniSearch.search(focusedOption.value, {fuzzy:0.2}).slice(0,25).map(it=>({name:it.label, value:""+it.id}))
      )
    }
    break;
  }
}

modifierCommand.structure = new SlashCommandBuilder()
  .setName("modifier")
  .setDescription("modifier")
  .addStringOption((opt)=>(opt.setName("item_type").setDescription("Item Type")).setAutocomplete(true))
  .toJSON()