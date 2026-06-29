#!/usr/bin/env node

/**
 * Sync version from git tag to package.json
 *
 * Usage: node scripts/sync-version.js
 *
 * - If on a tag (v2.1.0): version = 2.1.0
 * - If local/no tag: version = 0.0.0
 * - If CI/CD with tag: version = tag without 'v' prefix
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getVersionFromGit() {
  try {
    // Try to get the current tag
    const tag = execSync('git describe --tags --exact-match 2>/dev/null', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (tag) {
      // Remove 'v' prefix if present (v2.1.0 -> 2.1.0)
      return tag.replace(/^v/, '');
    }
  } catch (error) {
    // No tag found or git command failed
  }

  // Try to get version from GITHUB_REF environment variable (GitHub Actions)
  if (process.env.GITHUB_REF) {
    const match = process.env.GITHUB_REF.match(/refs\/tags\/v?([\d.]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fall back to 0.0.0 for local builds
  return '0.0.0';
}

function updatePackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const version = getVersionFromGit();

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.version !== version) {
      packageJson.version = version;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✓ Updated version to ${version}`);
    } else {
      console.log(`✓ Version already ${version}`);
    }
  } catch (error) {
    console.error(`✗ Failed to update version: ${error.message}`);
    process.exit(1);
  }
}

// Run
updatePackageJson();
