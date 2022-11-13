import React from 'react';
import { Constants, Interaction } from "eris";
import { StructuredCommand } from "../../types/commands";
import { db } from '@src/db';
import satori from 'satori'
import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';

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
  if(interaction.data.custom_id=="test"){
    
    await interaction.editOriginalMessage({
      content: `ping random number: ${Math.random()}`
    }, {
      // name:"test.png",
      // file:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABRSURBVDhPzc7LCkAhCEVR//+nDaMG2fGFg9oQl4q7krjZhwBRzQwB2XtoaoIW0J7A+1nyb0F6ogOIXpOuCdd3pnWUC0gWsPEUYC0UPi30GmAe9nilhTwBABYAAAAASUVORK5CYII=", "base64")
      name: "test.png",
      file:Buffer.from(new Resvg(await satori(<div style={{ color: 'black' }}>hello, world</div>,{
        width: 600,
        height: 400,
        fonts: [
          {
            name: 'Roboto',
            // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
            data: fs.readFileSync("./fonts/NotoSansTC-Regular.otf"),
            weight: 400,
            style: 'normal',
          },
        ],
      } )).render().asPng())
    })
  }else{
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