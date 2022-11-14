import { ActionRowComponents, ApplicationCommandOptionChoice, ApplicationCommandOptions, ApplicationCommandOptionWithChoices, Constants, InteractionDataOptions } from "eris";
import { range } from "lodash";
import { StructuredCommand } from "../../types/commands";

type ChromaticOptions ={
  r:number,
  g:number,
  b:number,
  str:number,
  dex:number,
  int:number,
  socket:number,
}
const socketComponentSelectProps =(prefix:string)=> ({
  options:[...new Array(6)].map((_,idx)=>({
    label:prefix+(+idx+1),
    value:prefix+(+idx+1)
  }))
});
const warpWithActionRow=(model:ActionRowComponents|ActionRowComponents[])=>{
  return (
    {
      type: Constants["ComponentTypes"]["ACTION_ROW"],
      components:Array.isArray(model)?model:[model]
    }
  )
}
const toChromaticOptions = (options: InteractionDataOptions[]):ChromaticOptions=>{
  return ({
    "r":0,
    "g":0,
    "b":0,
    "str":0,
    "dex":0,
    "int":0,
    "socket":6,
    ...(options.filter(it=>(it as any).value)
      .reduce((cur,it:any)=>(cur[it.name]=it.value,cur), {} as any))
  })
}

export const colorCommand: StructuredCommand = async (interaction)=>{
  console.debug(interaction.data.options)
  await interaction.acknowledge();
  const options = toChromaticOptions(interaction.data.options||[]);
  await interaction.createMessage( {
    components: [
      warpWithActionRow(
        {
          type: Constants["ComponentTypes"]["SELECT_MENU"],
          custom_id:"socket",
          max_values:1,
          min_values:1,
          placeholder: "SOCKET: "+options["socket"],
          ...socketComponentSelectProps("SOCKET: ")
        }),
      warpWithActionRow(
        {
          type: Constants["ComponentTypes"]["SELECT_MENU"],
          custom_id:"r",
          max_values:1,
          min_values:1,
          placeholder: "R: "+options["r"],
          ...socketComponentSelectProps("R: ")
        }),
      warpWithActionRow(
        {
          type: Constants["ComponentTypes"]["SELECT_MENU"],
          custom_id:"g",
          max_values:1,
          min_values:1,
          placeholder: "G: "+options["g"],
          ...socketComponentSelectProps("G: ")
        }),
      warpWithActionRow(
        {
          type: Constants["ComponentTypes"]["SELECT_MENU"],
          custom_id:"b",
          max_values:1,
          min_values:1,
          placeholder: "B: "+options["b"],
          ...socketComponentSelectProps("B: ")
        }),
      warpWithActionRow([
        {
          type: Constants["ComponentTypes"]["BUTTON"],
          custom_id:"str",
          label:"STR",
          style:Constants["ButtonStyles"]["DANGER"]
        },{
          type: Constants["ComponentTypes"]["BUTTON"],
          custom_id:"dex",
          label:"DEX",
          style:Constants["ButtonStyles"]["SUCCESS"]
        },{
          type: Constants["ComponentTypes"]["BUTTON"],
          custom_id:"int",
          label:"INT",
          style:Constants["ButtonStyles"]["PRIMARY"]
        }]),
    ],
    content: "ok"
  })
  //TODO: 
}
colorCommand.onComponentInteraction=async(interaction)=>{
  console.debug("interaction", interaction.data)
  if(interaction.data.custom_id=="str"){
    // await interaction.
  }
  await interaction.acknowledge();
}

const socketChoiceProps = {
  choices:[...new Array(6)].map((_,idx)=>({
    name:""+(+idx+1),
    value:(+idx+1)
  }))
};

colorCommand.structure={
  name: 'color',
  description: 'color',
  type: 1,
  options:[
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"str",
      description:"Item STR requirement",
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"dex",
      description:"Item DEX requirement"
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"int",
      description:"Item INT requirement"
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"r",
      description:"Desired Red Socket",
      ...socketChoiceProps
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"g",
      description:"Desired Green Socket",
      ...socketChoiceProps
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"b",
      description:"Desired Blue Socket",
      ...socketChoiceProps
    },
    {
      type:Constants["ApplicationCommandOptionTypes"]["INTEGER"],
      name:"socket",
      description:"Total Sockets of item",
      ...socketChoiceProps
    }
  ] as ApplicationCommandOptions[]
}