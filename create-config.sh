#!/usr/bin/env bash

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <new-key>"
  exit 1
fi

# Assign the arguments to variables
new_key=$1
file_path=./config.yml

# Check if the file exists
if [[ ! -f "$file_path" ]]; then
  echo "Creating file: $file_path"
  # Create the YAML file
cat > $file_path <<EOF
services:
  cns:
    restEndpoint: 'http://localhost:1317'
    gqlEndpoint: 'http://localhost:9473/api'
    userKey: $new_key
    bondId:
    chainId: laconic_9000-1
    gas: 300000
    fees: 300000aphoton
EOF
else
  # Use yq to update the value in the file
  yq eval ".services.cns.userKey = \"$new_key\"" "$file_path" --inplace
fi
