import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .options({
    verbose: {
      description: 'Verbose output',
      demand: false,
      default: false,
      type: 'boolean',
      alias: 'v'
    },
    config: {
      alias: 'c',
      default: 'config.yml',
      describe: 'Config file path.',
      type: 'string'
    }
  })
  .commandDir('cmds')
  .demandCommand()
  .help()
  .argv;
