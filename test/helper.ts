const { execSync } = require("child_process");

export const cliTest = (args: any) => {
  try{
    return JSON.parse(execSync(`./bin/laconic cns ${args}`));
  }catch(err){
    return(err)
  }
};

export function createBond(type: string, quantity: string):string{
  const resp=cliTest("bond create --type aphoton --quantity 1000000000");
  expect(resp.bondId).toBeDefined();
  return resp.bondId
};

export function createRecord(filepath: string, bondId: string):string{
  const resp=cliTest("record publish --filename "+filepath+" --bond-id "+bondId);
  expect(resp.id).toBeDefined();
  return resp.id
}

export function createAuthority(name:string):string{
  const resp=cliTest("authority reserve "+name);
  expect(resp).toBeDefined;

  const jsonResp = JSON.parse(cliTest("authority whois "+name))
  expect(jsonResp).toBeDefined;

  return jsonResp[0].auction.id
}