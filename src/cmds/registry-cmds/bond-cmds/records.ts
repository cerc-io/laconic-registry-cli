import yargs from 'yargs';

export const command = 'records';

export const desc = 'Bond records operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('records-cmds')
    .demandCommand();
};
