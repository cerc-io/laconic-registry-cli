import yargs from 'yargs';

export const command = 'cns';

export const desc = 'CNS tools';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('cns-cmds')
}
