import yargs from 'yargs';

export const command = 'record';

export const desc = 'Record operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('record-cmds')
    .demandCommand()
}
