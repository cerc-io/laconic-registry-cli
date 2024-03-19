import yargs from 'yargs';

export const command = 'registry';

export const desc = 'Registry tools';

exports.builder = (yargs: yargs.Argv) => {
  return yargs
    .options({
      'user-key': { type: 'string' },
      'tx-key': { type: 'string' },
      'bond-id': { type: 'string' },
      'chain-id': { type: 'string' },
      filename: { alias: 'f' },
      id: { type: 'string' },
      address: { type: 'string' },
      gas: { type: 'string' },
      fees: { type: 'string' }
    })
    .commandDir('registry-cmds')
    .demandCommand()
    .help();
};
