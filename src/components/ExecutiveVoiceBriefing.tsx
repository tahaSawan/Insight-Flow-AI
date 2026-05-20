import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

/** ~150 wpm at rate 1.1 → keep copy under ~70 words for a sub-30s brief. */
const MAX_BRIEF_WORDS = 70;

function trimForSpeech(text: string, maxWords: number): string {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}.`;
}

function buildExecutiveBriefScript(results: AnalysisResult): string {
  const headline =
    results.urgencyHeadline ||
    results.executiveSummary.slice(0, 120) ||
    'Leadership briefing ready.';

  const primaryRisk =
    results.riskAssessment[0] ||
    results.estimatedImpact ||
    'Key operational risks need attention.';

  const selectedAction =
    results.autonomousDecision?.primaryDecision ||
    results.recommendedActions[0] ||
    'Execute the top recommended next step.';

  const expectedOutcome =
    results.autonomousDecision?.expectedOutcome ||
    results.doActionOutlook ||
    'Improve metrics toward the projected target.';

  const raw = `Executive briefing. Alert: ${headline}. Primary risk: ${primaryRisk}. Selected action: ${selectedAction}. Expected outcome: ${expectedOutcome}.`;
  return trimForSpeech(raw, MAX_BRIEF_WORDS);
}

const supportsPause = Platform.OS === 'ios' || Platform.OS === 'web';

interface ExecutiveVoiceBriefingProps {
  results: AnalysisResult;
}

export function ExecutiveVoiceBriefing({ results }: ExecutiveVoiceBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCheckingVoice, setIsCheckingVoice] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isSpeakingRef = useRef(false);
  const checkedVoiceRef = useRef(false);

  useEffect(() => {
    return () => {
      if (isSpeakingRef.current) {
        Speech.stop();
      }
    };
  }, []);

  const ensureVoiceAvailable = async (): Promise<boolean> => {
    if (checkedVoiceRef.current && voiceAvailable === false) return false;
    if (checkedVoiceRef.current && voiceAvailable === true) return true;

    setIsCheckingVoice(true);
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const ok = voices.length > 0;
      checkedVoiceRef.current = true;
      setVoiceAvailable(ok);
      if (!ok) {
        setErrorMsg('Voice briefing is not available on this device.');
      }
      return ok;
    } catch {
      checkedVoiceRef.current = true;
      setVoiceAvailable(false);
      setErrorMsg('Could not check text-to-speech on this device.');
      return false;
    } finally {
      setIsCheckingVoice(false);
    }
  };

  const stopBrief = async () => {
    await Speech.stop();
    setIsPlaying(false);
    setIsPaused(false);
    isSpeakingRef.current = false;
  };

  const handlePauseResume = async () => {
    if (!isPlaying) return;
    try {
      if (isPaused) {
        await Speech.resume();
        setIsPaused(false);
      } else {
        await Speech.pause();
        setIsPaused(true);
      }
    } catch {
      setErrorMsg('Pause is not supported here. Use Stop.');
    }
  };

  const handlePlayBrief = async () => {
    try {
      setErrorMsg('');

      if (isPlaying) {
        await stopBrief();
        return;
      }

      const ok = await ensureVoiceAvailable();
      if (!ok) return;

      const briefText = buildExecutiveBriefScript(results);

      isSpeakingRef.current = true;
      setIsPlaying(true);
      setIsPaused(false);

      Speech.speak(briefText, {
        language: 'en-US',
        pitch: 1.05,
        rate: 1.08,
        onDone: () => {
          setIsPlaying(false);
          setIsPaused(false);
          isSpeakingRef.current = false;
        },
        onStopped: () => {
          setIsPlaying(false);
          setIsPaused(false);
          isSpeakingRef.current = false;
        },
        onError: () => {
          setErrorMsg('Voice briefing unavailable on this device.');
          setIsPlaying(false);
          setIsPaused(false);
          isSpeakingRef.current = false;
        },
      });
    } catch (err) {
      console.warn('Speech playback failed:', err);
      setErrorMsg('Could not play voice brief.');
      setIsPlaying(false);
      setIsPaused(false);
      isSpeakingRef.current = false;
    }
  };

  return (
    <Card style={featureSection}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Volume2 size={18} color={colors.accent} />
          <Typography variant="h3" style={styles.title}>
            {UI.results.voiceBriefTitle}
          </Typography>
        </View>

        {isPlaying ? (
          <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
            <Typography style={styles.pulseText}>{UI.results.voicePlaying}</Typography>
          </View>
        ) : null}
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.voiceBriefHint}
      </Typography>

      <View style={styles.controlRow}>
        <Pressable
          onPress={handlePlayBrief}
          disabled={isCheckingVoice}
          style={({ pressed }) => [
            styles.playBtn,
            isPlaying ? styles.btnPlaying : styles.btnIdle,
            pressed && styles.btnPressed,
            isCheckingVoice && styles.btnDisabled,
          ]}
        >
          {isPlaying ? (
            <VolumeX size={16} color="#FFFFFF" style={styles.btnIcon} />
          ) : (
            <Play size={14} color="#FFFFFF" style={styles.btnIcon} fill="#FFFFFF" />
          )}

          <Typography style={styles.btnText}>
            {isCheckingVoice
              ? 'Checking voice...'
              : isPlaying
                ? 'Stop Briefing'
                : 'Play Executive Brief'}
          </Typography>
        </Pressable>

        {supportsPause && isPlaying ? (
          <Pressable
            onPress={handlePauseResume}
            style={({ pressed }) => [styles.pauseBtn, pressed && styles.btnPressed]}
          >
            <Pause size={14} color="#E9D5FF" style={styles.btnIcon} />
            <Typography style={styles.pauseBtnText}>{isPaused ? 'Resume' : 'Pause'}</Typography>
          </Pressable>
        ) : null}
      </View>

      {errorMsg ? (
        <Typography style={styles.errorText}>{errorMsg}</Typography>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#F3E8FF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
    fontSize: 12,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
    backgroundColor: 'rgba(30, 20, 60, 0.6)',
  },
  pauseBtnText: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '700',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnIdle: {
    backgroundColor: '#8B5CF6',
    borderColor: '#A78BFA',
  },
  btnPlaying: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
  },
  btnPressed: {
    opacity: 0.85,
  },
  btnDisabled: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    opacity: 0.7,
  },
  btnIcon: {
    marginRight: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  pulseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  pulseText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  errorText: {
    color: '#F87171',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
});
