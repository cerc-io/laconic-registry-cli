import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
  .commandDir('cmds')
  .demandCommand()
  .help()
  .argv;
