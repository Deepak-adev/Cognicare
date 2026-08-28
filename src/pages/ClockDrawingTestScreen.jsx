import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { globalStyles, colors, Button } from '../components/common';
import { useStore } from '../store/useStore';
import { ChevronLeft, PenTool, CheckCircle } from 'lucide-react-native';

export const ClockDrawingTestScreen = () => {
  const navigation = useNavigation();
  const { patient, saveClinicalTest } = useStore();
  
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const currentPathRef = useRef(''); // Ref to track currentPath inside PanResponder closure
  const [isTestComplete, setIsTestComplete] = useState(false);
  
  const metricsRef = useRef({
    startTime: null,
    endTime: null,
    strokes: 0,
    pauses: [],
    lastStrokeEndTime: null
  });

  const viewRef = useRef(null);
  const canvasOffset = useRef({ x: 0, y: 0 });

  const updateLayout = () => {
    if (viewRef.current) {
      viewRef.current.measureInWindow((x, y) => {
        canvasOffset.current = { x: x || 0, y: y || 0 };
      });
    }
  };

  const getCoordinates = (evt) => {
    const { nativeEvent } = evt;
    
    // First try the native locationX/locationY
    let x = nativeEvent.locationX;
    let y = nativeEvent.locationY;

    // If undefined (which happens on Web with mice), manually calculate local coordinates
    // by taking the global pointer position and subtracting the canvas's global position.
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
      const globalX = nativeEvent.pageX ?? nativeEvent.touches?.[0]?.pageX ?? nativeEvent.clientX;
      const globalY = nativeEvent.pageY ?? nativeEvent.touches?.[0]?.pageY ?? nativeEvent.clientY;
      
      if (globalX !== undefined && globalY !== undefined) {
        x = globalX - canvasOffset.current.x;
        y = globalY - canvasOffset.current.y;
      }
    }
    
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
      return null;
    }
    
    return { x, y };
  };

  const handleTouchStart = (evt) => {
    const coords = getCoordinates(evt);
    if (!coords) return;
    
    const { x, y } = coords;
    const now = Date.now();
    
    if (!metricsRef.current.startTime) {
      metricsRef.current.startTime = now;
    }

    if (metricsRef.current.lastStrokeEndTime) {
      const pauseDuration = now - metricsRef.current.lastStrokeEndTime;
      if (pauseDuration > 1000) {
        metricsRef.current.pauses.push(pauseDuration);
      }
    }

    currentPathRef.current = `M${x},${y}`;
    setCurrentPath(currentPathRef.current);
  };

  const handleTouchMove = (evt) => {
    const coords = getCoordinates(evt);
    if (!coords) return;
    
    const { x, y } = coords;
    currentPathRef.current += ` L${x},${y}`;
    setCurrentPath(currentPathRef.current);
  };

  const handleTouchEnd = () => {
    const finalPath = currentPathRef.current;
    if (finalPath) {
      setPaths(prev => [...prev, finalPath]);
    }
    currentPathRef.current = '';
    setCurrentPath(null);
    
    metricsRef.current.strokes += 1;
    metricsRef.current.lastStrokeEndTime = Date.now();
  };

  const handleFinishTest = () => {
    metricsRef.current.endTime = Date.now();
    
    const totalTimeTaken = Math.round((metricsRef.current.endTime - metricsRef.current.startTime) / 1000) || 0;
    const totalHesitation = metricsRef.current.pauses.length;
    
    // Save clinical biomarker data
    saveClinicalTest(patient?.patient_id, 'Clock Drawing', {
      timeTaken: totalTimeTaken,
      hesitationPauses: totalHesitation,
      strokes: metricsRef.current.strokes,
      interpretation: 'Data captured for caregiver analysis.'
    });

    setIsTestComplete(true);
  };

  const handleClear = () => {
    setPaths([]);
    currentPathRef.current = '';
    setCurrentPath(null);
    metricsRef.current = {
      startTime: null,
      endTime: null,
      strokes: 0,
      pauses: [],
      lastStrokeEndTime: null
    };
  };

  if (isTestComplete) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <CheckCircle color={colors.success} size={80} style={{ marginBottom: 20 }} />
        <Text style={[globalStyles.headerText, { textAlign: 'center', marginBottom: 12 }]}>Test Completed</Text>
        <Text style={{ fontSize: 18, color: colors.textMuted, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
          Your drawing and digital biomarkers have been securely saved for clinical review.
        </Text>
        <Button onPress={() => navigation.goBack()} style={{ width: '100%' }}>
          <Text style={styles.btnText}>Return to Activities</Text>
        </Button>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={colors.textMain} size={32} />
        </TouchableOpacity>
        <Text style={[globalStyles.headerText, { flex: 1, textAlign: 'center', marginRight: 48 }]}>
          Clock Test
        </Text>
      </View>

      <Text style={styles.instruction}>
        Please draw a clock face, put in all the numbers, and set the time to 11:10.
      </Text>

      <View 
        ref={viewRef}
        onLayout={updateLayout}
        style={styles.canvasContainer} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Svg width="100%" height="100%" style={styles.svg} pointerEvents="none">
          {paths.map((p, i) => (
            <Path key={i} d={p} stroke={colors.primary} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {currentPath && (
            <Path d={currentPath} stroke={colors.primary} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </Svg>
        {paths.length === 0 && !currentPath && (
          <View style={styles.placeholder}>
            <PenTool color={colors.textMuted} size={40} style={{ opacity: 0.5, marginBottom: 8 }} />
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>Draw here using your finger</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleClear} style={[styles.actionBtn, { backgroundColor: colors.bgSubtle }]}>
          <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 18 }}>Clear</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleFinishTest} 
          style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 2, marginLeft: 16 }]}
          disabled={paths.length === 0}
        >
          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 18 }}>I'm Finished</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  instruction: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 30
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    position: 'relative',
    touchAction: 'none' // Prevent browser scroll hijacking on web
  },
  svg: {
    flex: 1
  },
  placeholder: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 40
  },
  actionBtn: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase'
  }
});
