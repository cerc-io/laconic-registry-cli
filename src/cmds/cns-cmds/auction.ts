import yargs from 'yargs';

export const command = 'auction';

export const desc = 'Auction operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.commandDir('auction-cmds')
    .demandCommand();
};
