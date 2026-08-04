import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = Math.floor((width - 80) / 5);

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)}.${parseInt(month)}.${year}`;
}

export default function DayScreen({ route, navigation }) {
  const { date } = route.params;
  const [blue, setBlue] = useState(Array(20).fill(false));
  const [orange, setOrange] = useState(Array(5).fill(false));

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(date);
        if (raw) {
          const data = JSON.parse(raw);
          setBlue(data.blue || Array(20).fill(false));
          setOrange(data.orange || Array(5).fill(false));
        }
      } catch (e) {}
    })();
  }, [date]);

  const save = async (newBlue, newOrange) => {
    try {
      await AsyncStorage.setItem(
        date,
        JSON.stringify({ blue: newBlue, orange: newOrange })
      );
    } catch (e) {}
  };

  const toggleBlue = (i) => {
    const updated = blue.map((v, idx) => (idx === i ? !v : v));
    setBlue(updated);
    save(updated, orange);
  };

  const toggleOrange = (i) => {
    const updated = orange.map((v, idx) => (idx === i ? !v : v));
    setOrange(updated);
    save(blue, updated);
  };

  const renderBlueRows = () => {
    const rows = [];
    for (let row = 0; row < 4; row++) {
      const circles = [];
      for (let col = 0; col < 5; col++) {
        const i = row * 5 + col;
        circles.push(
          <TouchableOpacity
            key={i}
            onPress={() => toggleBlue(i)}
            style={[
              styles.circle,
              { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 },
              blue[i] ? styles.blueActive : styles.blueInactive,
            ]}
            activeOpacity={0.7}
          />
        );
      }
      rows.push(
        <View key={row} style={styles.row}>
          {circles}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />

      <View style={styles.topBar}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.circlesBlock}>
          {renderBlueRows()}
          <View style={[styles.row, styles.orangeRow]}>
            {orange.map((active, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => toggleOrange(i)}
                style={[
                  styles.circle,
                  { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 },
                  active ? styles.orangeActive : styles.orangeInactive,
                ]}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Text style={styles.backButtonText}>VRATI SE NA KALENDAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eaf6',
  },
  topBar: {
    backgroundColor: '#1a237e',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  circlesBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  orangeRow: {
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#9fa8da',
    paddingTop: 16,
  },
  circle: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  blueInactive: {
    backgroundColor: '#42a5f5',
    borderWidth: 2,
    borderColor: '#1565c0',
  },
  blueActive: {
    backgroundColor: '#0d47a1',
    borderWidth: 2,
    borderColor: '#082e73',
  },
  orangeInactive: {
    backgroundColor: '#ffa726',
    borderWidth: 2,
    borderColor: '#e65100',
  },
  orangeActive: {
    backgroundColor: '#fdd835',
    borderWidth: 2,
    borderColor: '#f9a825',
  },
  backButton: {
    backgroundColor: '#1a237e',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
