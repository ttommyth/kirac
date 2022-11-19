import { Console } from 'node:console'
import { Transform } from 'node:stream'

const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
const logger = new Console({ stdout: ts })

export const md5RegexExp =/^[a-f0-9]{32}$/i;
export const format =function (str: string, ...param: any[]){
  return str.replace(/{(\d+)}/g, function(match, number) { 
    return typeof param[number] != 'undefined'
      ? param[number]
      : match
    ;
  });
};
export function getTable (data: any[]) {
  logger.table(data)
  return (ts.read() || '').toString()
}