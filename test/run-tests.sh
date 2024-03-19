#!/usr/bin/env bash

# Get the key from laconic2d
laconic2d_key=$(yes | docker compose exec laconic2d laconic2d keys export alice --keyring-backend test --unarmored-hex --unsafe)

# Get the fixturenet account address
laconic2d_account_address=$(docker compose exec laconic2d laconic2d keys list --keyring-backend test | awk '/- address:/ {print $3}')

# Set parameters for the test suite
cosmos_chain_id=laconic_9000-1
laconic2d_rpc_endpoint=http://127.0.0.1:26657
laconic2d_gql_endpoint=http://127.0.0.1:9473/api

# Create the required config
config_file="config.yml"
config=$(cat <<EOL
services:
  registry:
    restEndpoint: $laconic2d_rpc_endpoint
    gqlEndpoint: $laconic2d_gql_endpoint
    userKey: $laconic2d_key
    bondId:
    chainId: $cosmos_chain_id
    gas: 200000
    fees: 200000photon
EOL
)
echo "$config" > "$config_file"

# Wait for the laconid endpoint to come up
docker compose exec laconic2d sh -c "curl --retry 10 --retry-delay 3 --retry-connrefused http://127.0.0.1:9473/api"

# Run tests
TEST_ACCOUNT=$laconic2d_account_address yarn test
