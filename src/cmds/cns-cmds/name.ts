import yargs from 'yargs';

export const command = 'name';

export const desc = 'Name operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('name-cmds')
    .demandCommand();
};
