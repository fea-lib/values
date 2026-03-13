#!/usr/bin/env bash
# Usage: ./install.sh <target-dir>
#
# Installs @fea-lib/values into <target-dir>/@fea-lib/values/
# and recursively installs declared peer libraries.
#
# Example:
#   ./install.sh ./src/libs
#
# After running, add to your tsconfig.json:
#   "paths": {
#     "@fea-lib/values": ["<target-dir>/@fea-lib/values/src/index.ts"]
#   }

set -euo pipefail

TARGET_DIR="${1:?Usage: ./install.sh <target-dir>}"

# Library name (hardcoded — script is designed to be fetched and run remotely)
NAME="@fea-lib/values"
INSTALL_PATH="$TARGET_DIR/$NAME"

echo "Installing $NAME into $INSTALL_PATH ..."

# Clone repo into target (shallow, no history)
REPO_URL="https://github.com/fea-lib/values"
TMP=$(mktemp -d)
git clone --depth=1 "$REPO_URL" "$TMP/repo" --quiet
mkdir -p "$INSTALL_PATH"
rsync -a --exclude="install.sh" --exclude=".git" "$TMP/repo/" "$INSTALL_PATH/"
rm -rf "$TMP"

# Recursively install peer libraries
DEPS_FILE="$INSTALL_PATH/dependencies.json"
if [ -f "$DEPS_FILE" ]; then
  PEER_COUNT=$(node -e "
    const d = require('$DEPS_FILE');
    process.stdout.write(String((d.peerLibraries || []).length));
  ")
  for i in $(seq 0 $((PEER_COUNT - 1))); do
    PEER_INSTALL_SH=$(node -e "
      const d = require('$DEPS_FILE');
      const p = d.peerLibraries[$i];
      process.stdout.write(p.repo + '/raw/main/install.sh');
    ")
    PEER_TMP=$(mktemp)
    curl -fsSL "$PEER_INSTALL_SH" -o "$PEER_TMP"
    bash "$PEER_TMP" "$TARGET_DIR"
    rm "$PEER_TMP"
  done
fi

echo ""
echo "Done. Add the following to your tsconfig.json compilerOptions.paths:"
echo "  \"$NAME\": [\"$INSTALL_PATH/src/index.ts\"]"
