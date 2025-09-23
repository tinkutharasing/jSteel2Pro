module.exports = {
  dependencies: {
    'react-native-sqlite-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-sqlite-storage/platforms/android',
          packageImportPath: 'import io.pgsqlite.ProjectPackage;',
        },
        ios: {
          // disable iOS platform, other platforms will still autolink if provided
          project: null,
        },
      },
    },
  },
};
