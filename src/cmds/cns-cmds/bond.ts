import yargs from 'yargs';

export const command = 'bond';

export const desc = 'Bonds operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('bond-cmds')
    .demandCommand();
};
