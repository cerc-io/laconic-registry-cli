const { execSync } = require("child_process");

export const cliTest = (args: any) => {
  return execSync(`./bin/laconic cns ${args}`).toString();
};
