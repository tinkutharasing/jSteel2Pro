module.exports = {
  dependencies: {
    'react-native-sqlite-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-sqlite-storage/platforms/android',
          packageImportPath: 'import org.pgsqlite.SQLitePluginPackage;',
        },
      },
    },
    'react-native-fs': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-fs/android',
          packageImportPath: 'import com.rnfs.RNFSPackage;',
        },
      },
    },
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-gesture-handler/android',
          packageImportPath: 'import com.swmansion.gesturehandler.RNGestureHandlerPackage;',
        },
      },
    },
    'react-native-image-picker': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-image-picker/android',
          packageImportPath: 'import com.imagepicker.ImagePickerPackage;',
        },
      },
    },
    'react-native-print': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-print/android',
          packageImportPath: 'import com.christopherdro.RNPrint.RNPrintPackage;',
        },
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-safe-area-context/android',
          packageImportPath: 'import com.th3rdwave.safeareacontext.SafeAreaContextPackage;',
        },
      },
    },
    'react-native-screens': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-screens/android',
          packageImportPath: 'import com.swmansion.rnscreens.RNScreensPackage;',
        },
      },
    },
    'react-native-share': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-share/android',
          packageImportPath: 'import cl.json.RNSharePackage;',
        },
      },
    },
    'react-native-vector-icons': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-vector-icons/android',
          packageImportPath: 'import com.oblador.vectoricons.VectorIconsPackage;',
        },
      },
    },
    'react-native-view-shot': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-view-shot/android',
          packageImportPath: 'import fr.greweb.reactnativeviewshot.RNViewShotPackage;',
        },
      },
    },
    'react-native-webview': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-webview/android',
          packageImportPath: 'import com.reactnativecommunity.webview.RNCWebViewPackage;',
        },
      },
    },
  },
};
