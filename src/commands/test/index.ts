import { Constants, Interaction } from "eris";
import { StructuredCommand } from "../../types/commands";
import { db } from '@src/db';

export const testCommand: StructuredCommand = async (interaction)=>{
  const msg = await interaction.createMessage({
    content: `ping random number: ${Math.random()}, db test size: ${await db.test.count()}`,
    components:[
      {
        components: [
          {
            type:Constants["ComponentTypes"]["BUTTON"],
            style:Constants["ButtonStyles"]["PRIMARY"],
            label:"test",
            custom_id: "test"
          },{
            type:Constants["ComponentTypes"]["BUTTON"],
            style:Constants["ButtonStyles"]["PRIMARY"],
            label:"test2",
            custom_id: "test2",
          }
        ],
        type: Constants["ComponentTypes"]["ACTION_ROW"]
      }
    ]
  })
}
testCommand.onComponentInteraction=async(interaction)=>{
  console.debug(interaction.data)
  await interaction.acknowledge();
  await interaction.editOriginalMessage({
    content: `ping random number: ${Math.random()}`,
    components:[
      {
        components: [
          {
            type:Constants["ComponentTypes"]["BUTTON"],
            style:Constants["ButtonStyles"]["PRIMARY"],
            label:"test",
            custom_id: "test"
          },{
            type:Constants["ComponentTypes"]["BUTTON"],
            style:Constants["ButtonStyles"]["PRIMARY"],
            label:"test2",
            custom_id: "test2",
          }
        ],
        type: Constants["ComponentTypes"]["ACTION_ROW"]
      }
    ]
  })
}

testCommand.structure={
  name: 'test',
  description: 'test',
  type: 1,
  options:[
    {
      type:Constants["ApplicationCommandOptionTypes"]["STRING"],
      name:"itemname",
      description:"test",
      options:[
        {
          type:Constants["ApplicationCommandOptionTypes"]["STRING"],
          name:"itemname2",
          description:"test"
        }
      ]
    }
  ]
}