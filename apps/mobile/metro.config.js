// Monorepo'da Metro'nun workspace paketlerini (packages/*) görebilmesi için
// kök dizini izlemesi ve her iki node_modules dizinini de çözümlemesi gerekir.
const path = require('node:path');

const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Hiyerarşik arama açık kalmalı: npm workspaces bazı bağımlılıkları (ör. reanimated'in
// semver@7'si) paketin kendi node_modules dizinine yerleştirir, kökte farklı bir sürüm durur.

module.exports = config;
