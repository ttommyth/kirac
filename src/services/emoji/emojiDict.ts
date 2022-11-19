export const emojiDict:{[key:string]:string}={
  "ex": "<:ex:1043390406517329941>",
  "shaper": "<:shaper:1043390689951621120>",
  "elder": "<:elder:1043390681646903366>",
  "warlord":"<:warlord:1043390693567103026>", 
  "adjudicator":"<:warlord:1043390693567103026>", 
  "hunter": "<:hunter:1043390684780052610>",
  "basilisk": "<:hunter:1043390684780052610>",
  "crusader": "<:crusader:1043390677737816197>",
  "redeemer": "<:redeemer:1043390688131297311>" ,
  "eyrie": "<:redeemer:1043390688131297311>" ,
  "delve": "<:delve:1043390679990157382>",
  "incursion": "<:incursion:1043390686457774130>",
  "veiled": "<:veiled:1043390691625160835>",
  "craft": "<:craft:1043530197389033492>",
  "essence": "<:essence:1043390683244929024> ",
  "bestiary": "<:bestiary:1043390675967823943>",
  "elevated": "<:mavenorb:1043534575185448960>",
}

export const fillTextWithEmoji=(text:string):string=>{
  return  text.split(" ").map(it=>{
    const matched = Object.keys(emojiDict).find(k=>it.includes(k));
    if(matched)
      return emojiDict[matched]+it
    return it
  }).join(" ")
}