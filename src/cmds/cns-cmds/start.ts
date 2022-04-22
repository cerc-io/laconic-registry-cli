import yargs, { Arguments } from 'yargs';

export const command = 'start';

export const desc = 'Start local CNS.';

exports.builder = {
  'log-file': {
    type: 'string'
  }
}

exports.handler = function (argv: Arguments) {
  const { logFile } = argv;

  console.log('option logFile', logFile)
}
