import React from 'react';
import satori from 'satori'
import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';
import { ChromaticResult } from './engine';
import { min, minBy } from 'lodash';

export const genTableImage=async (result: ChromaticResult[]): Promise<Buffer>=>{
  const bestCost = minBy(result , it=>((+it.avgCost.replace(",",""))<1)?999999:+it.avgCost.replace(",",""));
  const bestTry = minBy(result , it=>(+it.avgTries.replace(",","")));
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
        result.map((it,idx)=><div key={idx} tw="flex flex-row">
          <span tw={`w-[100px] h-[20px] ${bestCost===it?"bg-yellow-500 text-black rounded-md":""} ${bestTry===it?"bg-green-500 text-black rounded-md":""}`}>{it.recipeName}</span>
          <span tw='w-[100px] h-[20px]'>{it.chance}</span>
          <span tw={`w-[80px] h-[20px] ${bestTry===it?"bg-green-500 text-black rounded-md":""}`}>{it.avgTries}</span>
          <span tw='w-[100px] h-[20px]'>{it.recipeCost}</span>
          <span tw={`w-[100px] h-[20px] ${bestCost===it?"bg-yellow-500 text-black rounded-md":""}`}>{it.avgCost}</span>
          <span tw='w-[60px] h-[20px]'>{it.stdDev}</span>
        </div>)
      }
    </div>,{
      width: 600,
      height: 20*result.length + 20 + 16*2,
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
}