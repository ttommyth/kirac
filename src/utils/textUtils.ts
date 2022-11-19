export const md5RegexExp =/^[a-f0-9]{32}$/i;
export const format =function (str: string, ...param: any[]){
  return str.replace(/{(\d+)}/g, function(match, number) { 
    return typeof param[number] != 'undefined'
      ? param[number]
      : match
    ;
  });
};