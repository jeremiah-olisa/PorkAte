#!/bin/bash

# Exit on error
set -e

# Ensure required tools are installed
if ! command -v jq &> /dev/null; then
  echo "Error: jq is required. Please install it (e.g., 'sudo apt install jq' or 'brew install jq')."
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "Error: pnpm is required. Please install it (e.g., 'npm install -g pnpm')."
  exit 1
fi

if ! command -v lerna &> /dev/null; then
  echo "Error: lerna is required. Please install it (e.g., 'pnpm add -g lerna')."
  exit 1
fi

# Step 1: Run pnpm outdated to find deprecated packages
echo "Checking for deprecated packages across the monorepo..."
OUTDATED=$(pnpm -r outdated --json || echo "[]")

# Step 2: Parse JSON to extract deprecated packages
DEPRECATED=$(echo "$OUTDATED" | jq -r '.[] | select(.deprecated != null) | "\(.package) \(.current) \(.latest) \(.deprecated)"')

if [ -z "$DEPRECATED" ]; then
  echo "No deprecated packages found."
  exit 0
fi

# Step 3: Process each deprecated package
echo "Found deprecated packages:"
echo "$DEPRECATED" | while IFS= read -r line; do
  # Extract package name, current version, latest version, and deprecation message
  PACKAGE=$(echo "$line" | awk '{print $1}')
  CURRENT=$(echo "$line" | awk '{print $2}')
  LATEST=$(echo "$line" | awk '{print $3}')
  
  echo "Package: $PACKAGE, Current: $CURRENT, Latest: $LATEST"
  
  # Step 4: Check for LTS or stable version using npm view
  LTS_VERSION=$(npm view "$PACKAGE" --json | jq -r '.["dist-tags"].lts // .["dist-tags"].latest')
  
  if [ -z "$LTS_VERSION" ]; then
    echo "No LTS or latest version found for $PACKAGE. Skipping..."
    continue
  fi
  
  echo "Recommended LTS/stable version for $PACKAGE: $LTS_VERSION"
  
  # Step 5: Update the package to LTS/stable version
  echo "Updating $PACKAGE to $LTS_VERSION..."
  pnpm -r update "$PACKAGE@$LTS_VERSION"
done

# Step 6: Run tests to verify updates
echo "Running tests to verify updates..."
pnpm -r test || {
  echo "Tests failed. Please review changes and fix issues."
  exit 1
}

# Step 7: Use Lerna to version packages
echo "Updating package versions with Lerna..."
lerna version --conventional-commits --yes || {
  echo "Lerna versioning failed. Please review changes."
  exit 1
}

echo "Deprecated packages updated successfully!"