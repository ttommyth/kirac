
type ChromaticOptions ={
  r:number,
  g:number,
  b:number,
  str:number,
  dex:number,
  int:number,
  socket:number,
}
type ChromaticResult={
  recipeName:string,
  chance:string,
  avgTries:string,
  recipeCost:string,
  avgCost:string,
  stdDev:string,
  favg:number
}
type Engine = {
  calculate:(options:ChromaticOptions)=>[ChromaticResult[],options]
}
export function engine():Engine
export const prebuiltEngine: Engine