import yargs from 'yargs';

export const command = 'tokens';

export const desc = 'Tokens operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('tokens-cmds')
    .demandCommand();
};
