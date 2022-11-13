import { League } from "@prisma/client";
import axios from "axios";
import { last } from "lodash";

export const fetchLeague: ()=>Promise<League[]> = async ()=>{
  return await (await axios.get<{leagues:League[]}>("https://api.pathofexile.com/league")).data.leagues
    .map(league=>(league.shortName= decodeURIComponent(last(league.url.split("/"))??""), league));
}