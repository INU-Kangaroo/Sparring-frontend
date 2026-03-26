import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const dates = [
  { day: "08", week: "Mon" },
  { day: "09", week: "Tue" },
  { day: "10", week: "Wed" },
  { day: "11", week: "Thu" },
  { day: "12", week: "Fri" },
  { day: "13", week: "Sat" },
  { day: "14", week: "Sun" },
];

const routineData = [
  { time: "1 PM", title: "눈 뜨자마자", description: "공복혈당 측정하기" },
  { time: "2 PM", title: "점심 식사", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
  { time: "4 PM", title: "눈 뜨자마자", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
  { time: "5 PM", title: "눈 뜨자마자", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
  { time: "6 PM", title: "눈 뜨자마자", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
  { time: "9 PM", title: "눈 뜨자마자", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
  { time: "10 PM", title: "눈 뜨자마자", description: "사과 한 개, 바나나 한쪽, 아이스 아메리카노" },
];

export default function RoutineScreen() {
  const [activeTab, setActiveTab] = useState<"루틴" | "회고">("루틴");
  const [selectedDate, setSelectedDate] = useState(dates[0].day);

  const renderDateItem = ({ item }: { item: { day: string; week: string } }) => (
    <Pressable
      onPress={() => setSelectedDate(item.day)}
      style={[styles.dateItem, selectedDate === item.day && styles.activeDate]}
    >
      <Text style={[styles.weekText, selectedDate === item.day && styles.activeWeekText]}>{item.week}</Text>
      <Text style={[styles.dayText, selectedDate === item.day && styles.activeDayText]}>{item.day}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* 달력 */}
      <View style={styles.calendarContainer}>
        <Ionicons name="chevron-back" size={20} color="#000" />
        <Text style={styles.monthText}>2025년 11월</Text>
        <Ionicons name="chevron-forward" size={20} color="#000" />
      </View>
      <FlatList
        horizontal
        data={dates}
        keyExtractor={(item) => item.day}
        renderItem={renderDateItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <Pressable onPress={() => setActiveTab("루틴")} style={[styles.tab, activeTab === "루틴" && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === "루틴" && styles.activeTabText]}>루틴</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("회고")} style={[styles.tab, activeTab === "회고" && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === "회고" && styles.activeTabText]}>회고</Text>
        </Pressable>
      </View>

      {/* 루틴 리스트 */}
      {activeTab === "루틴" && (
        <ScrollView style={styles.scrollView}>
          {routineData.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.time}>{item.time}</Text>
              <View style={styles.detail}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* 회고 탭은 나중에 activeTab === "회고"일 때 구현 */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  calendarContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 8 },
  monthText: { fontSize: 16, fontWeight: "500", marginHorizontal: 8 },
  dateItem: { alignItems: "center", marginHorizontal: 8, paddingVertical: 8 },
  activeDate: { backgroundColor: "#E6F0FF", borderRadius: 8 },
  weekText: { fontSize: 14, color: "#888" },
  activeWeekText: { color: "#007AFF", fontWeight: "600" },
  dayText: { fontSize: 16, fontWeight: "500" },
  activeDayText: { color: "#007AFF" },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 16 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#007AFF" },
  tabText: { fontSize: 16, color: "#888" },
  activeTabText: { color: "#007AFF", fontWeight: "600" },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  item: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  time: { width: 60, fontWeight: "500", color: "#007AFF" },
  detail: { flex: 1 },
  title: { fontWeight: "600", marginBottom: 4 },
  description: { color: "#555" },
});
