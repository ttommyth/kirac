import { Constants } from "eris";
import { StructuredCommand } from "../../types/commands";

export const itemCommand: StructuredCommand = async (interaction)=>{
  console.debug(interaction.data.options)
  await interaction.acknowledge();
  //TODO: 
}
itemCommand.onComponentInteraction=async(interaction)=>{
  console.debug(interaction.data)
  await interaction.acknowledge();
}

itemCommand.structure={
  name: 'item',
  description: 'item',
  type: 1,
  options:[
    {
      type:Constants["ApplicationCommandOptionTypes"]["STRING"],
      name:"itemname",
      description:"item"
    }
  ]
}