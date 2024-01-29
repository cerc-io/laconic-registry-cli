import yargs from 'yargs';

export const command = 'account';

export const desc = 'Account operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('account-cmds')
    .demandCommand();
};
