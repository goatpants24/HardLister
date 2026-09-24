import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import DynamicFormRouter from './src/components/DynamicFormRouter';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1117" />
      <DynamicFormRouter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1117',
  },
});
