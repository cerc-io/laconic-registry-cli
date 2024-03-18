/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'assert';
import { Arguments } from 'yargs';

export const parseGasAndFees = (gas: string, fees = '') => {
  assert(gas, 'Invalid gas.');

  const [{ amount, denom }] = fees.trim().split(',')
    .map(fee => fee.trim().split(/(\d+)/))
    .filter(([_, amount, denom]) => (denom && amount))
    .map(([_, amount, denom]) => ({ denom, amount }));

  return {
    amount: [{ denom, amount }],
    gas
  };
};

export const getGasAndFees = (argv: Arguments, config: any = {}) => {
  return parseGasAndFees(
    String(argv.gas || config.gas),
    String(argv.fees || config.fees)
  );
};
