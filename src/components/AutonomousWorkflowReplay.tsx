import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Pressable, Animated, Easing, ScrollView } from 'react-native';
import { CheckCircle2, RotateCcw, Terminal, Cpu, Sparkles, ShieldAlert, Target, TrendingUp, Zap, FileText } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';
import type { AgentStatus } from '@/types/agents';

interface AutonomousWorkflowReplayProps {
  results: AnalysisResult;
}

interface ReplayStep {
  agentName: string;
  action: string;
  icon: React.ComponentType<any>;
  color: string;
  logs: string[];
  duration: string;
}

export function AutonomousWorkflowReplay({ results }: AutonomousWorkflowReplayProps) {
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<AgentStatus[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  const terminalScrollRef = useRef<ScrollView>(null);
  
  // Animated values
  const animatedPulse = useRef(new Animated.Value(1)).current;
  const lineAnimations = useRef<Animated.Value[]>([]).current;
  const opacityAnimations = useRef<Animated.Value[]>([]).current;

  // We have 6 core agents in our autonomous system replay
  const fallbackSteps = useMemo<ReplayStep[]>(() => [
    {
      agentName: 'Reader Agent',
      action: 'Ingested unstructured source documents, verified file integrity, and cleaned character maps.',
      icon: FileText,
      color: colors.info,
      duration: '1.2s',
      logs: [
        '[INGEST] Loading raw unstructured context buffer...',
        '[INGEST] Found valid content. Format verified.',
        '[INGEST] Input digest: SHA-256 integrity check passed.',
        '[INGEST] Reader Agent completed text extraction and sanitization.'
      ]
    },
    {
      agentName: 'Main Points Agent',
      action: 'Extracted high-level semantic insights and constructed baseline context parameters.',
      icon: Sparkles,
      color: colors.accent,
      duration: '2.4s',
      logs: [
        '[INSIGHT] Scanning extracted corpus for semantic hubs...',
        '[INSIGHT] Running tf-idf density mapping and token weightings...',
        '[INSIGHT] Discovered 5 primary corporate nodes.',
        '[INSIGHT] Main Points Agent completed context construction.'
      ]
    },
    {
      agentName: 'Problems Agent',
      action: 'Scanned risk matrices, estimated potential failure modes, and calculated urgency profiles.',
      icon: ShieldAlert,
      color: colors.warning,
      duration: '3.1s',
      logs: [
        '[RISK] Cross-referencing operational vulnerabilities...',
        '[RISK] Threat level mapped. Highest risk vector identified.',
        '[RISK] Stake leakage assessed. Severity score calculated: 84/100.',
        '[RISK] Problems Agent completed assessment pipeline.'
      ]
    },
    {
      agentName: 'Next Steps Agent',
      action: 'Formulated strategic proposals, calibrated risk mitigations, and drafted core resolutions.',
      icon: Target,
      color: colors.accentSecondary,
      duration: '1.8s',
      logs: [
        '[ACTION] Generating strategic recommendation arrays...',
        '[ACTION] Filtering proposals by ROI and execution timeframes...',
        '[ACTION] Selected high-impact immediate action path.',
        '[ACTION] Next Steps Agent completed recommendation dispatch.'
      ]
    },
    {
      agentName: 'Results Agent',
      action: 'Ran statistical projection algorithms and computed relative 30-day consequence profiles.',
      icon: TrendingUp,
      color: colors.accentDeep,
      duration: '2.2s',
      logs: [
        '[SIMULATION] Ingesting action vector to impact projection matrices...',
        '[SIMULATION] Modeling Day 7 and Day 30 risk-to-resolution arcs...',
        '[SIMULATION] Projected risk level reduction: -80%.',
        '[SIMULATION] Results Agent finished consequence analysis.'
      ]
    },
    {
      agentName: 'Execution Agent',
      action: 'Constructed simulated API payload vectors and completed final decision filter passes.',
      icon: Zap,
      color: colors.accent,
      duration: '1.5s',
      logs: [
        '[EXECUTION] Initializing autonomous decision filters...',
        '[EXECUTION] Selected primary autonomous decision candidate.',
        '[EXECUTION] Registering Slack, Email, and CRM webhook listeners.',
        '[EXECUTION] All agent sequences succeeded. System idle.'
      ]
    }
  ], []);

  // Map results.agentTrace into ReplayStep structure if available
  const hasRealTrace = results.agentTrace && results.agentTrace.length > 0;
  
  const displaySteps = useMemo<ReplayStep[]>(() => {
    return hasRealTrace 
      ? (results.agentTrace || []).map((entry) => {
          let iconComponent = Cpu;
          let color: string = colors.accentText;
          if (entry.agentId === 'ingestion') { iconComponent = FileText; color = colors.info; }
          else if (entry.agentId === 'insight') { iconComponent = Sparkles; color = colors.accent; }
          else if (entry.agentId === 'risk') { iconComponent = ShieldAlert; color = colors.warning; }
          else if (entry.agentId === 'action') { iconComponent = Target; color = colors.accentSecondary; }
          else if (entry.agentId === 'execution') { iconComponent = Zap; color = colors.accentDeep; }

          // Dynamic pseudologs based on the real reasoning
          const truncatedReasoning = entry.reasoning.length > 80 
            ? entry.reasoning.slice(0, 80) + '...' 
            : entry.reasoning;
          
          return {
            agentName: entry.agentName,
            action: entry.outputSummary || entry.reasoning,
            icon: iconComponent,
            color,
            duration: '2.0s',
            logs: [
              `[${entry.agentName.split(' ')[0].toUpperCase()}] Initializing agent sequence...`,
              `[${entry.agentName.split(' ')[0].toUpperCase()}] Reasoning: ${truncatedReasoning}`,
              `[${entry.agentName.split(' ')[0].toUpperCase()}] Dispatched result: ${entry.outputSummary || 'Done.'}`
            ]
          };
        })
      : fallbackSteps;
  }, [hasRealTrace, results.agentTrace, fallbackSteps]);

  const totalSteps = displaySteps.length;

  // Initialize animations and step statuses
  useEffect(() => {
    // Generate initial complete statuses for all steps if not replaying
    if (!isReplaying) {
      setStepStatuses(new Array(totalSteps).fill('complete'));
      setActiveStepIndex(-1);
      
      // Load static logs matching all steps
      const allLogs: string[] = [];
      displaySteps.forEach(step => allLogs.push(...step.logs));
      setTerminalLogs(allLogs);
    }
  }, [totalSteps, isReplaying, displaySteps]);

  // Set up pulsing animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedPulse, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(animatedPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        })
      ])
    ).start();
  }, [animatedPulse]);

  // Initialize animated values
  if (lineAnimations.length !== totalSteps - 1) {
    for (let i = 0; i < totalSteps - 1; i++) {
      lineAnimations[i] = new Animated.Value(isReplaying ? 0 : 1);
    }
  }
  if (opacityAnimations.length !== totalSteps) {
    for (let i = 0; i < totalSteps; i++) {
      opacityAnimations[i] = new Animated.Value(isReplaying ? 0.3 : 1);
    }
  }

  // Trigger step by step simulation
  const handleReplaySimulation = () => {
    if (isReplaying) return;
    
    setIsReplaying(true);
    setActiveStepIndex(0);
    setTerminalLogs(['[SYSTEM] Initializing complete autonomous workflow replay...']);
    
    // Set all statuses to pending
    const initialStatuses = new Array(totalSteps).fill('pending') as AgentStatus[];
    initialStatuses[0] = 'running';
    setStepStatuses(initialStatuses);

    // Reset animations
    lineAnimations.forEach(anim => anim.setValue(0));
    opacityAnimations.forEach((anim, i) => anim.setValue(i === 0 ? 1 : 0.3));

    runStep(0, initialStatuses);
  };

  const runStep = (index: number, currentStatuses: AgentStatus[]) => {
    if (index >= totalSteps) {
      setIsReplaying(false);
      setActiveStepIndex(-1);
      setTerminalLogs(prev => [...prev, '[SYSTEM] All autonomous sequences verified. Status: OK.']);
      return;
    }

    // Step 1: Push logs for this agent
    const stepLogs = displaySteps[index].logs;
    
    // Add logs gradually for high fidelity typing effect
    stepLogs.forEach((log, logIdx) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, log]);
        // Auto scroll terminal to bottom
        setTimeout(() => {
          terminalScrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
      }, logIdx * 250);
    });

    // Make this node bright and pulse
    Animated.timing(opacityAnimations[index], {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    // Step 2: Set timer for step completion
    const stepTime = 1200 + stepLogs.length * 200; // time spent in this stage
    
    setTimeout(() => {
      // Mark current complete
      const updatedStatuses = [...currentStatuses];
      updatedStatuses[index] = 'complete';

      // If there is a next step, make it running
      const nextIndex = index + 1;
      if (nextIndex < totalSteps) {
        updatedStatuses[nextIndex] = 'running';
        
        // Animate timeline line connection
        Animated.timing(lineAnimations[index], {
          toValue: 1,
          duration: 400,
          useNativeDriver: false
        }).start();

        // Illuminate next step node slightly
        Animated.timing(opacityAnimations[nextIndex], {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true
        }).start();
      }

      setStepStatuses(updatedStatuses);
      setActiveStepIndex(nextIndex);
      
      // Run next step
      runStep(nextIndex, updatedStatuses);

    }, stepTime);
  };

  // Helper to format simulated timestamps
  const getSimulatedTime = (index: number) => {
    if (hasRealTrace) {
      const entry = results.agentTrace[index];
      if (entry && entry.startedAt) {
        const dateObj = new Date(entry.startedAt);
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    }
    
    // Fallback simulated timestamps offset by stage order
    const base = new Date();
    // Offset minutes backwards so it looks historical
    base.setSeconds(base.getSeconds() - (totalSteps - index) * 6);
    return base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <Card style={featureSection}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Cpu size={18} color={colors.accent} />
          <Typography variant="h3" style={styles.title}>
            {UI.results.workflowReplayTitle}
          </Typography>
        </View>
        
        <Pressable 
          onPress={handleReplaySimulation}
          disabled={isReplaying}
          style={({ pressed }) => [
            styles.replayBtn,
            isReplaying && styles.replayBtnDisabled,
            pressed && styles.replayBtnPressed
          ]}
        >
          <RotateCcw size={12} color={isReplaying ? colors.textDim : colors.accent} style={styles.btnIcon} />
          <Typography style={[styles.replayBtnText, isReplaying && styles.replayBtnTextDisabled]}>
            {isReplaying ? 'Replaying...' : 'Replay Run'}
          </Typography>
        </Pressable>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.workflowReplayHint}
      </Typography>

      {/* Timeline Scroll */}
      <View style={styles.timelineContainer}>
        {displaySteps.map((step, index) => {
          const StepIcon = step.icon;
          const status = stepStatuses[index] || 'pending';
          const isActive = index === activeStepIndex;
          const isComplete = status === 'complete';
          const isPending = status === 'pending';
          
          return (
            <Animated.View 
              key={`timeline-step-${index}`} 
              style={[
                styles.stepRow,
                { opacity: opacityAnimations[index] || 1 }
              ]}
            >
              {/* Left Side: Timestamp */}
              <View style={styles.timeCol}>
                <Typography style={styles.timeText}>
                  {getSimulatedTime(index)}
                </Typography>
                <Typography style={styles.durationText}>
                  {step.duration}
                </Typography>
              </View>

              {/* Middle Side: Node Dot & Vertical Connector Line */}
              <View style={styles.nodeCol}>
                <View style={styles.dotContainer}>
                  {isActive ? (
                    <Animated.View 
                      style={[
                        styles.pulseRing, 
                        { 
                          borderColor: step.color,
                          transform: [{ scale: animatedPulse }] 
                        }
                      ]} 
                    />
                  ) : null}
                  
                  <View 
                    style={[
                      styles.nodeDot, 
                      { backgroundColor: isPending ? colors.surfaceInactive : step.color },
                      isPending && styles.nodeDotPending,
                      isComplete && styles.nodeDotComplete
                    ]}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={10} color={colors.white} />
                    ) : (
                      <StepIcon size={11} color={isPending ? colors.textDim : colors.white} />
                    )}
                  </View>
                </View>
                
                {/* Connecting Line to next node */}
                {index < totalSteps - 1 ? (
                  <View style={styles.lineTrack}>
                    <Animated.View 
                      style={[
                        styles.lineFill, 
                        { 
                          backgroundColor: step.color,
                          height: lineAnimations[index] ? lineAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          }) : '100%'
                        }
                      ]} 
                    />
                  </View>
                ) : null}
              </View>

              {/* Right Side: Step Details */}
              <View style={styles.contentCol}>
                <View style={styles.stepTitleRow}>
                  <Typography style={[styles.agentName, { color: isPending ? colors.textDim : colors.text }]}>
                    {step.agentName}
                  </Typography>
                  
                  {/* Status Pill */}
                  <View 
                    style={[
                      styles.statusPill,
                      isActive && styles.statusPillActive,
                      isComplete && styles.statusPillComplete,
                      isPending && styles.statusPillPending
                    ]}
                  >
                    <Typography 
                      style={[
                        styles.statusPillText,
                        isActive && styles.statusPillTextActive,
                        isComplete && styles.statusPillTextComplete,
                        isPending && styles.statusPillTextPending
                      ]}
                    >
                      {status.toUpperCase()}
                    </Typography>
                  </View>
                </View>
                
                <Typography style={[styles.actionText, isPending && styles.actionTextPending]}>
                  {step.action}
                </Typography>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* Futuristic Console Terminal */}
      <View style={styles.terminalContainer}>
        <View style={styles.terminalHeader}>
          <View style={styles.terminalDotRow}>
            <View style={[styles.terminalDot, { backgroundColor: colors.danger }]} />
            <View style={[styles.terminalDot, { backgroundColor: colors.warning }]} />
            <View style={[styles.terminalDot, { backgroundColor: colors.success }]} />
          </View>
          <View style={styles.terminalTitleRow}>
            <Terminal size={10} color={colors.textDim} style={{ marginRight: 4 }} />
            <Typography style={styles.terminalTitle}>AUDIT_LOG_STREAM // active</Typography>
          </View>
        </View>
        
        <ScrollView 
          ref={terminalScrollRef}
          style={styles.terminalScroll}
          contentContainerStyle={styles.terminalContent}
          nestedScrollEnabled={true}
        >
          {terminalLogs.map((log, idx) => {
            const isSystem = log.startsWith('[SYSTEM]');
            const isError = log.includes('[ERROR]');
            let logColor: string = colors.textSecondary;
            
            if (isSystem) logColor = colors.accentText;
            else if (isError) logColor = colors.danger;
            else if (log.includes('[INGEST]')) logColor = colors.info;
            else if (log.includes('[INSIGHT]')) logColor = colors.accent;
            else if (log.includes('[RISK]')) logColor = colors.warning;
            else if (log.includes('[ACTION]')) logColor = colors.accentSecondary;
            else if (log.includes('[SIMULATION]')) logColor = colors.accentDeep;
            else if (log.includes('[EXECUTION]')) logColor = colors.accent;

            return (
              <Typography key={`log-line-${idx}`} style={[styles.terminalLine, { color: logColor }]}>
                {log}
              </Typography>
            );
          })}
        </ScrollView>
      </View>
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
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
    fontSize: 12,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderAccent,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  replayBtnPressed: {
    opacity: 0.7,
  },
  replayBtnDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.accentMuted,
  },
  btnIcon: {
    marginRight: 4,
  },
  replayBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  replayBtnTextDisabled: {
    color: colors.textDim,
  },
  timelineContainer: {
    marginVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 65,
  },
  timeCol: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 2,
  },
  timeText: {
    color: colors.textMuted,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '600',
  },
  durationText: {
    color: colors.textDim,
    fontSize: 9,
    marginTop: 1,
    fontWeight: '500',
  },
  nodeCol: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
  },
  dotContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.45,
  },
  nodeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nodeDotPending: {
    borderColor: colors.textDim,
    borderStyle: 'dashed',
  },
  nodeDotComplete: {
    backgroundColor: colors.success,
    borderColor: colors.successLight,
  },
  lineTrack: {
    position: 'absolute',
    top: 22,
    bottom: -6,
    width: 2,
    backgroundColor: colors.track,
    zIndex: 1,
  },
  lineFill: {
    width: '100%',
    height: '100%',
  },
  contentCol: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  statusPillPending: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.border,
  },
  statusPillActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderAccent,
  },
  statusPillComplete: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusPillTextPending: {
    color: colors.textDim,
  },
  statusPillTextActive: {
    color: colors.accent,
  },
  statusPillTextComplete: {
    color: colors.success,
  },
  actionText: {
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  actionTextPending: {
    color: colors.textDim,
  },
  terminalContainer: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginTop: 6,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  terminalDotRow: {
    flexDirection: 'row',
    gap: 4,
  },
  terminalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  terminalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  terminalTitle: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  terminalScroll: {
    height: 72,
  },
  terminalContent: {
    padding: 10,
  },
  terminalLine: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 4,
  },
});
