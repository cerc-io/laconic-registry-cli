import yargs from 'yargs';

export const command = 'bid';

export const desc = 'Auction bid operations.';

exports.builder = (yargs: yargs.Argv) => {
  return yargs.options({
    'auction-id': { type: 'string' },
    type: { type: 'string' },
    quantity: { type: 'string' },
    'file-path': { type: 'string' }
  }).commandDir('bid-cmds')
    .demandCommand();
};
