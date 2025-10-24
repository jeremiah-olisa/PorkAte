#!/usr/bin/env bash

# Setup NPM Publishing for PorkAte Monorepo
# This script helps configure everything needed for NPM publishing

set -e

echo "🚀 PorkAte NPM Publishing Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is logged in
check_npm_login() {
    echo "📦 Checking NPM authentication..."
    if npm whoami &>/dev/null; then
        NPM_USER=$(npm whoami)
        echo -e "${GREEN}✓ Logged in to NPM as: $NPM_USER${NC}"
        return 0
    else
        echo -e "${RED}✗ Not logged in to NPM${NC}"
        return 1
    fi
}

# Login to NPM
npm_login() {
    echo ""
    echo "🔐 NPM Login Required"
    echo "Please log in to your NPM account:"
    npm login
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully logged in to NPM${NC}"
    else
        echo -e "${RED}✗ NPM login failed${NC}"
        exit 1
    fi
}

# Check package.json files for publishConfig
check_package_configs() {
    echo ""
    echo "📋 Checking package configurations..."
    
    # Find all package.json files (excluding node_modules)
    PACKAGES=$(find packages -name "package.json" -not -path "*/node_modules/*")
    
    MISSING_CONFIG=0
    for pkg in $PACKAGES; do
        if ! grep -q '"publishConfig"' "$pkg"; then
            echo -e "${YELLOW}⚠ Missing publishConfig in: $pkg${NC}"
            MISSING_CONFIG=1
        fi
    done
    
    if [ $MISSING_CONFIG -eq 0 ]; then
        echo -e "${GREEN}✓ All packages have publishConfig${NC}"
    else
        echo ""
        echo "Would you like to add publishConfig to packages? (y/n)"
        read -r RESPONSE
        if [[ "$RESPONSE" =~ ^[Yy]$ ]]; then
            add_publish_config
        fi
    fi
}

# Add publishConfig to packages
add_publish_config() {
    echo "Adding publishConfig to packages..."
    
    PACKAGES=$(find packages -name "package.json" -not -path "*/node_modules/*")
    
    for pkg in $PACKAGES; do
        if ! grep -q '"publishConfig"' "$pkg"; then
            # Add publishConfig before devDependencies or at the end
            if grep -q '"devDependencies"' "$pkg"; then
                sed -i '/"devDependencies"/i\  "publishConfig": {\n    "access": "public"\n  },' "$pkg"
            elif grep -q '"dependencies"' "$pkg"; then
                sed -i '/"dependencies"/i\  "publishConfig": {\n    "access": "public"\n  },' "$pkg"
            else
                # Add before closing brace
                sed -i '$d' "$pkg"
                echo '  "publishConfig": {' >> "$pkg"
                echo '    "access": "public"' >> "$pkg"
                echo '  }' >> "$pkg"
                echo '}' >> "$pkg"
            fi
            echo -e "${GREEN}✓ Added publishConfig to: $pkg${NC}"
        fi
    done
}

# Generate NPM token instructions
show_npm_token_instructions() {
    echo ""
    echo "🔑 GitHub Secrets Setup"
    echo "======================="
    echo ""
    echo "To enable automatic publishing with GitHub Actions:"
    echo ""
    echo "1. Create an NPM Automation Token:"
    echo "   - Go to: https://www.npmjs.com/settings/$(npm whoami 2>/dev/null || echo 'YOUR_USERNAME')/tokens"
    echo "   - Click 'Generate New Token' → 'Classic Token'"
    echo "   - Select 'Automation' type"
    echo "   - Copy the token"
    echo ""
    echo "2. Add token to GitHub:"
    echo "   - Go to: https://github.com/jeremiah-olisa/porkate/settings/secrets/actions"
    echo "   - Click 'New repository secret'"
    echo "   - Name: NPM_TOKEN"
    echo "   - Value: (paste your token)"
    echo "   - Click 'Add secret'"
    echo ""
    echo -e "${YELLOW}⚠ Keep your token secret! Don't commit it to git.${NC}"
}

# Test publishing setup (dry run)
test_publish() {
    echo ""
    echo "🧪 Testing publish setup (dry run)..."
    
    # Build packages
    echo "Building packages..."
    pnpm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Build failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Build successful${NC}"
    
    # Check what would be published
    echo ""
    echo "Packages that would be published:"
    pnpm lerna changed || echo "No changed packages (this is normal for first run)"
    
    echo ""
    echo "All packages in monorepo:"
    pnpm lerna ls
}

# Main setup flow
main() {
    # Check if in correct directory
    if [ ! -f "lerna.json" ]; then
        echo -e "${RED}✗ Error: lerna.json not found${NC}"
        echo "Please run this script from the root of the porkate monorepo"
        exit 1
    fi
    
    # Check NPM login
    if ! check_npm_login; then
        npm_login
    fi
    
    # Check package configs
    check_package_configs
    
    # Test build
    test_publish
    
    # Show GitHub setup instructions
    show_npm_token_instructions
    
    echo ""
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up NPM_TOKEN in GitHub secrets (see instructions above)"
    echo "2. Try a test publish: pnpm run publish:canary"
    echo "3. Or create a release: pnpm run release:patch"
    echo ""
    echo "📚 See PUBLISHING.md for detailed publishing guide"
}

# Run main function
main
