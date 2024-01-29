import yargs from 'yargs';

export const command = 'authority';

export const desc = 'Name authority operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('authority-cmds')
    .demandCommand();
};
