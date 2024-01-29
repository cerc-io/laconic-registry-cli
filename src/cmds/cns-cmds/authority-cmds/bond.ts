import yargs from 'yargs';

export const command = 'bond';

export const desc = 'Authority bond operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('bond-cmds')
    .demandCommand();
};
