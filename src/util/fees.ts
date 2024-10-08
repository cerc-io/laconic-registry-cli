/* eslint-disable @typescript-eslint/no-unused-vars */
import { Arguments } from 'yargs';

import { parseGasAndFees, getGasPrice as registryGetGasPrice } from '@cerc-io/registry-sdk';
import { StdFee, GasPrice } from '@cosmjs/stargate';

export const getGasAndFees = (argv: Arguments, config: any = {}): StdFee | number | undefined => {
  return parseGasAndFees(
    argv.gas || config.gas,
    argv.fees || config.fees
  );
};

export const getGasPrice = (argv: Arguments, config: any = {}): GasPrice | undefined => {
  const gasPriceString = argv.gasPrice || config.gasPrice;
  return registryGetGasPrice(gasPriceString);
};
