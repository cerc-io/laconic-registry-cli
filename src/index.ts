import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// eslint-disable-next-line no-unused-expressions
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
    },
    output: {
      alias: 'o',
      describe: 'Gives output in json format when specified.',
      type: 'string'
    }
  })
  .commandDir('cmds')
  .demandCommand()
  .help()
  .alias('h', 'help')
  .argv;
