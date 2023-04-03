import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import semver from 'semver';

const { execSync } = require("child_process");

export const updateRecord = (filePath: string) => {
  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  const file = fs.readFileSync(resolvedFilePath, 'utf-8')
  const data = yaml.load(file) as any;
  
  data.record.version=semver.inc(data.record.version, 'patch');

  fs.writeFileSync(resolvedFilePath, yaml.dump(data));
};

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

export function createAuthority(name:string):any{
  const resp=cliTest("authority reserve "+name);
  expect(resp).toBeDefined;
  expect(resp.success).toBeTruthy();
  return resp
}

export function getAuctionId(name:string):string{
  const jsonResp = cliTest("authority whois "+name)
  expect(jsonResp).toBeDefined;
  return jsonResp[0].auction.id
}