import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

LocaleConfig.locales['sr'] = {
  monthNames: [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
  dayNames: ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'],
  dayNamesShort: ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'],
  today: 'Danas',
};
LocaleConfig.defaultLocale = 'sr';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CalendarScreen({ navigation }) {
  const today = getTodayString();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const loadMarkedDates = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const dateKeys = keys.filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
      const marks = {};
      for (const key of dateKeys) {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          const hasAny =
            (data.blue && data.blue.some(Boolean)) ||
            (data.orange && data.orange.some(Boolean));
          if (hasAny) {
            marks[key] = {
              marked: true,
              dotColor: '#ff9800',
            };
          }
        }
      }
      setMarkedDates(marks);
    } catch (e) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMarkedDates();
    }, [loadMarkedDates])
  );

  const handleDayPress = (day) => {
    if (day.dateString > today) return;
    setSelectedDate(day.dateString);
    navigation.navigate('Day', { date: day.dateString });
  };

  const buildMarked = () => {
    const result = { ...markedDates };
    if (selectedDate) {
      result[selectedDate] = {
        ...(result[selectedDate] || {}),
        selected: true,
        selectedColor: '#1a237e',
      };
    }
    result[today] = {
      ...(result[today] || {}),
      marked: result[today]?.marked,
      dotColor: result[today]?.dotColor || '#ff9800',
      today: true,
    };
    return result;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Svetolik - Dnevnik</Text>
      </View>
      <Calendar
        maxDate={today}
        onDayPress={handleDayPress}
        markedDates={buildMarked()}
        style={styles.calendar}
        enableSwipeMonths={true}
        theme={{
          backgroundColor: '#f0f4ff',
          calendarBackground: '#f0f4ff',
          textSectionTitleColor: '#1a237e',
          selectedDayBackgroundColor: '#1a237e',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#1565c0',
          todayBackgroundColor: '#bbdefb',
          dayTextColor: '#212121',
          textDisabledColor: '#bdbdbd',
          dotColor: '#ff9800',
          selectedDotColor: '#ffffff',
          arrowColor: '#1a237e',
          monthTextColor: '#1a237e',
          indicatorColor: '#1a237e',
          textDayFontSize: 18,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          'stylesheet.calendar.main': {
            week: {
              marginTop: 6,
              marginBottom: 6,
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
          },
        }}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Ima upisano</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#bbdefb' }]} />
          <Text style={styles.legendText}>Danas</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  header: {
    backgroundColor: '#1a237e',
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  calendar: {
    flex: 1,
    paddingTop: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff9800',
  },
  legendText: {
    fontSize: 13,
    color: '#555',
  },
});
