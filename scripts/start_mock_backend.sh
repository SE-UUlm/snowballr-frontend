#!/bin/bash
# Script to start (multiple) mock backend(s)

# Exit script on non-zero exit code
set -e

# Image for the mock backend
IMAGE="ghcr.io/se-uulm/snowballr-mock-backend-temp:0.2.0"
# Name prefix for the mock backend container
CONTAINER_PREFIX="snowballr-mock-backend"

help() {
  echo -e "usage: bash $(basename "$0") [-c] port1 [port2 ... portN] \n"
  echo -e "Start a single or multiple mock backends. \n"
  echo    "Options:"
  echo    "  port               The port on which the web proxy of the mock backend should listen (must be 3000-3999)."
  echo    "  -c                 Whether to delete all currently running mock backend containers (where names start with $CONTAINER_PREFIX)."
  exit 1
}

# Check, whether the port is "valid", so between 3000 and 4000
validate_port() {
    if [[ $1 -lt 3000 || $1 -gt 3999 ]]; then
        echo "Error: Port $1 is out of the allowed range (3000-3999)"
        help
    fi
}

cleanup_running_mock_backends() {
    echo "Stopping and removing all containers with the prefix '$CONTAINER_PREFIX' ..."
    running_container=$(docker container ls -qa --filter "name=$CONTAINER_PREFIX")
    if [ -n "$running_container" ]; then
        docker stop $running_container
        docker rm $running_container
    else
        echo "Warn: No container with the prefix '$CONTAINER_PREFIX' are running!"
    fi
}

do_cleanup=false
while getopts ":hc" option; do
    case ${option} in
        c) do_cleanup=true ;;
        h | *)
            help
        ;;
    esac
done
shift $((OPTIND - 1)) # go to next command line argument

# Check for ports
ports=("$@")
if [ ${#ports[@]} -lt 1 ]; then
  echo "Error: Please provide at least one port to start a mock backend."
  help
fi

docker pull $IMAGE || { echo "Error: Failed to pull image $IMAGE"; exit 1; }

if $do_cleanup; then
    cleanup_running_mock_backends
fi

index=1
for WEB_PROXY_PORT in "${ports[@]}"; do
    validate_port "$WEB_PROXY_PORT"
    NATIVE_SERVER_PORT=$((WEB_PROXY_PORT + 1000))
    CONTAINER_NAME="$CONTAINER_PREFIX-$index"

    echo "Starting mock backend $CONTAINER_NAME on ports $WEB_PROXY_PORT (web proxy) and $NATIVE_SERVER_PORT (native server) ..."
    docker run -d -q \
        -e EXAMPLE_DATA_FILE=standardData.ts \
        -e ENABLE_DUMMY_ADMIN=true \
        -e GRPC_PORT="$NATIVE_SERVER_PORT" \
        -e GRPC_WEB_PORT="$WEB_PROXY_PORT" \
        --name "$CONTAINER_NAME" \
        -p "$WEB_PROXY_PORT:$WEB_PROXY_PORT" -p "$NATIVE_SERVER_PORT:$NATIVE_SERVER_PORT"  \
        "$IMAGE" || {
            echo "Error: Failed to start mock backend for port $WEB_PROXY_PORT"
            help
        }

    ((index++))
done
