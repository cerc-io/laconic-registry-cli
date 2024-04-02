#!/usr/bin/env bash

# Get the key from laconicd
laconicd_key=$(yes | docker compose exec laconicd laconicd keys export alice --keyring-backend test --unarmored-hex --unsafe)

# Get the fixturenet account address
laconicd_account_address=$(docker compose exec laconicd laconicd keys list --keyring-backend test | awk '/- address:/ {print $3}')

# Set parameters for the test suite
cosmos_chain_id=laconic_9000-1
laconicd_rpc_endpoint=http://127.0.0.1:26657
laconicd_gql_endpoint=http://127.0.0.1:9473/api

# Create the required config
config_file="config.yml"
config=$(cat <<EOL
services:
  registry:
    rpcEndpoint: $laconicd_rpc_endpoint
    gqlEndpoint: $laconicd_gql_endpoint
    userKey: $laconicd_key
    bondId:
    chainId: $cosmos_chain_id
    gas: 200000
    fees: 200000photon
EOL
)
echo "$config" > "$config_file"

# Wait for the laconid endpoint to come up
docker compose exec laconicd sh -c "curl --retry 10 --retry-delay 3 --retry-connrefused http://127.0.0.1:9473/api"

# Run tests
TEST_ACCOUNT=$laconicd_account_address yarn test
