# Registry Demo

## Setup

* Install laconic CLI globally:

  ```bash
  # In laconic-registry-cli repo root
  yarn && yarn build
  yarn global add file:$PWD
  ```

* Run the laconicd chain:

  ```bash
  # In laconci2d repo
  make install
  ./scripts/init.sh clean
  ```

* Create and populate `config.yml` following [config.example.yml](./config.example.yml):

  ```bash
  # In laconic-registry-cli repo root
  cp config.example.yml config.yml

  # Update the gas value in config.yml
  # gas: 500000

  # Get user private key
  laconicd keys export alice --unarmored-hex --unsafe --keyring-backend test --home ~/.laconicd

  # Set the output as 'userKey' in config.yml
  # userKey: <ALICE_PRIVATE_KEY>

  # Create a bond
  laconic --config config.yml registry bond create --type photon --quantity 100000000000

  # Get the bond id
  laconic --config config.yml registry bond list | jq -r '.[].id'

  # Set the output as 'bondId' in config.yml
  # bondId: <BOND_ID>
  ```

## Run

* Publish records:

  ```bash
  # Publishes records and corresponding 'deployment' records from given directory

  # In laconic-registry-cli repo root
  # Use records dir path for '--records' as required
  yarn ts-node demo/scripts/publish-records.ts --config config.yml --records <RECORDS_DIR>
  ```

### Example

* Query for `azimuth-watcher` deployment(s):

  * Find the `WatcherRecord` for `azimuth-watcher`:

    ```bash
    WATCHER_RECORD_ID=$(laconic registry record list --all --type WatcherRecord --name azimuth-watcher | jq -r '.[].id')
    ```

  * Find corresponding deployment(s):

    ```bash
    laconic registry record list --all --type WatcherDeploymentRecord watcher $WATCHER_RECORD_ID

    # Get the deployment URL(s)
    laconic registry record list --all --type WatcherDeploymentRecord watcher $WATCHER_RECORD_ID | jq -r '.[].attributes.url'

    # Expected output:
    https://azimuth-watcher-endpoint.example.com
    ```

* Query for `sushiswap-v3-subgraph` deployment(s):

  * Find the `SubgraphRecord` for `sushiswap-v3-subgraph`:

    ```bash
    SUBGRAPH_RECORD_ID=$(laconic registry record list --all --type SubgraphRecord --name sushiswap-v3-subgraph | jq -r '.[].id')
    ```

  * Find corresponding deployment(s):

    ```bash
    laconic registry record list --all --type SubgraphDeploymentRecord subgraph $SUBGRAPH_RECORD_ID

    # Get the deployment URL(s)
    laconic registry record list --all --type SubgraphDeploymentRecord subgraph $SUBGRAPH_RECORD_ID | jq -r '.[].attributes.url'

    # Expected output:
    # https://sushiswap-v3-subgraph-endpoint.example.com
    ```

* Query for `geth` service deployment(s):

  * Find the `ServiceRecord` for `geth`:

    ```bash
    SERVICE_RECORD_ID=$(laconic registry record list --all --type ServiceRecord --name geth | jq -r '.[].id')
    ```

  * Find corresponding deployment(s):

    ```bash
    laconic registry record list --all --type ServiceDeploymentRecord service $SERVICE_RECORD_ID

    # Get the deployment URL(s)
    laconic registry record list --all --type ServiceDeploymentRecord service $SERVICE_RECORD_ID | jq -r '.[].attributes.url'

    # Expected output:
    # https://geth-rpc-endpoint-1.example.com
    # https://geth-rpc-endpoint-2.example.com
    ```
