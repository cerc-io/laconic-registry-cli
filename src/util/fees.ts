/* eslint-disable @typescript-eslint/no-unused-vars */
import assert from 'assert';
import { Arguments } from 'yargs';

import { StdFee, GasPrice, parseCoins } from '@cosmjs/stargate';

export const parseGasAndFees = (gas?: string, fees?: string): StdFee | number | undefined => {
  // If fees is not given or a number, treat it as a gas estimation multiplier
  if (fees === null || fees === undefined) {
    return undefined;
  }

  const isFeesANumber = !isNaN(Number(fees));
  if (isFeesANumber) {
    return Number(fees);
  }

  // If fees is not a gas estimation multiplier, gas is required
  assert(gas, 'Invalid gas.');

  return {
    amount: parseCoins(String(fees)),
    gas: String(gas)
  };
};

export const getGasAndFees = (argv: Arguments, config: any = {}): StdFee | number | undefined => {
  return parseGasAndFees(
    argv.gas || config.gas,
    argv.fees || config.fees
  );
};

export const getGasPrice = (argv: Arguments, config: any = {}): GasPrice | undefined => {
  const gasPriceString = argv.gasPrice || config.gasPrice;
  return gasPriceString != null ? GasPrice.fromString(String(gasPriceString)) : undefined;
};
