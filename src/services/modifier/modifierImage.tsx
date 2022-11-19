import { Resvg } from '@resvg/resvg-js';
import { minBy, result } from 'lodash';
import {readFileSync} from 'fs';
import React from 'react';
import satori from 'satori';
import { Mod } from "."
const font = readFileSync("./assets/fonts/NotoSansTC-Regular.otf");

export type ModifierTableRow = {
  name:string, requiredLevel:number, message:string, tags:string[], mod:Mod
}
export type ModiiferTableConfig={
  showTag?:boolean
}
export const genModifierTableImage= async (mods: ModifierTableRow[], config: ModiiferTableConfig)=>{
  return Buffer.from(new Resvg(await satori(
    <div tw="bg-[#202225] text-[#a3a69d] flex flex-col w-full h-full rounded-md p-4">
      <div tw="flex flex-row border-b-2 border-b-white font-bold text-white">
        <span tw='w-[100px] h-[20px] '>Recipe Name</span>
        <span tw='w-[100px] h-[20px] '>Chance</span>
        <span tw='w-[80px] h-[20px] '>Avg Tries</span>
        <span tw='w-[100px] h-[20px] '>Recipe Cost</span>
        <span tw='w-[100px] h-[20px] '>Average Cost</span>
        <span tw='w-[60px] h-[20px] '>StdDev</span>
      </div>
      {
        [].map((it,idx)=><div key={idx} tw="flex flex-row">
          <span tw='w-[100px] h-[20px] '>Recipe Name</span>
          <span tw='w-[100px] h-[20px] '>Chance</span>
          <span tw='w-[80px] h-[20px] '>Avg Tries</span>
          <span tw='w-[100px] h-[20px] '>Recipe Cost</span>
          <span tw='w-[100px] h-[20px] '>Average Cost</span>
          <span tw='w-[60px] h-[20px] '>StdDev</span>
        </div>)
      }
    </div>,{
      width: 600,
      height: 20*result.length + 20 + 16*2,
      fonts: [
        {
          name: 'Roboto',
          // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
          data: font,
          weight: 400,
          style: 'normal',
        },
      ],
    } )).render().asPng())
}