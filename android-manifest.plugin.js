const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androidManifestPlugin(config) {
  return withAndroidManifest(config, async config => {
    let androidManifest = config.modResults.manifest;

    // Add the tools namespace to the root element if it doesn't already exist
    if (!androidManifest.$) {
      androidManifest.$ = {};
    }

    androidManifest.$ = {
      ...androidManifest.$,
      "xmlns:tools": "http://schemas.android.com/tools",
    };

    // Ensure uses-permission array exists
    if (!androidManifest["uses-permission"]) {
      androidManifest["uses-permission"] = [];
    }

    // Add INTERNET permission if it doesn't already exist
    if (!androidManifest["uses-permission"].some(perm => perm.$["android:name"] === "android.permission.INTERNET")) {
      androidManifest["uses-permission"].push({
        $: { "android:name": "android.permission.INTERNET" }
      });
    }

    // Add ACCESS_FINE_LOCATION and ACCESS_COARSE_LOCATION permissions for Google Maps
    if (!androidManifest["uses-permission"].some(perm => perm.$["android:name"] === "android.permission.ACCESS_FINE_LOCATION")) {
      androidManifest["uses-permission"].push({
        $: { "android:name": "android.permission.ACCESS_FINE_LOCATION" }
      });
    }

    if (!androidManifest["uses-permission"].some(perm => perm.$["android:name"] === "android.permission.ACCESS_COARSE_LOCATION")) {
      androidManifest["uses-permission"].push({
        $: { "android:name": "android.permission.ACCESS_COARSE_LOCATION" }
      });
    }

    return config;
  });
};
