import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            InsightFlow AI
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Transform your raw data into actionable insights instantly using advanced autonomous AI agents.
          </Typography>
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <View style={styles.iconInner} />
            </View>
            <Typography variant="h2" style={styles.cardTitle}>
              Ready to Analyze
            </Typography>
            <Typography variant="body" style={styles.cardSubtitle}>
              Upload documents, datasets, or link your workspace to begin analysis.
            </Typography>
            
            <Button 
              title="Start Analysis" 
              onPress={() => router.push('/upload')} 
              style={styles.button}
            />
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#8A8D98',
    lineHeight: 28,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 32,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    marginBottom: 12,
  },
  cardSubtitle: {
    color: '#8A8D98',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  }
});
