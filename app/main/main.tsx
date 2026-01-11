import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";

type ChartData = {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
};

export default function Main() {
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const moveRecord = (type: "bloodPressure" | "bloodSugar") => {
    router.push(`/record/${type}`);
  };


  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  type MenuItem = {
    label: string;
    path: Href;
  };

  const menuItems: MenuItem[] = [
    { label: "루틴 쓰기", path: "/" },
    { label: "기록하기", path: "/record/bloodSugar" },
    { label: "추천", path: "/" },
    { label: "보고서", path: "/mypage/report" },
    { label: "AI 챗봇", path: "/mypage/chatbot" },
    { label: "마이페이지", path: "/mypage/mypage" },
  ];

  // 더미데이터
  const data: ChartData = {
    labels: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    datasets: [
      {
        data: [110, 150, 120, 135, 150, 110, 120, 140, 120, 130, 100, 150],
        color: () => "#1f3cff",
        strokeWidth: 2,
      },
      {
        data: [80, 110, 90, 100, 110, 80, 110, 120, 90, 80, 90, 80],
        color: () => "#9bb0ff",
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>변화 차트</Text>
        <Pressable onPress={openMenu}>
          <Ionicons name="menu" size={24} color="#111" />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.legendRow}>
          <Text style={styles.year}>2025년</Text>
          <View style={styles.legend}>
            <View style={styles.dotBlue} />
            <Text style={styles.legendText}>혈당</Text>
            <View style={styles.dotLight} />
            <Text style={styles.legendText}>혈압</Text>
          </View>
        </View>

        <LineChart
          data={data}
          width={width - 72}
          height={220}
          withDots
          withShadow={false}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: () => "#ccc",
            labelColor: () => "#666",
            propsForDots: { r: "4" },
          }}
          style={{ marginTop: 10 }}
        />
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={styles.box}
          onPress={() => moveRecord("bloodPressure")}
        >
          <Ionicons name="add-circle" size={32} color="#1f3cff" />
          <Text style={styles.boxText}>혈압 기록하기</Text>
        </Pressable>

        <Pressable
          style={styles.box}
          onPress={() => moveRecord("bloodSugar")}
        >
          <Ionicons name="water" size={32} color="#1f3cff" />
          <Text style={styles.boxText}>혈당 기록하기</Text>
        </Pressable>
      </View>


      {menuOpen && (
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sideMenu,
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#a9d7f4ff", "#3f8ff1ff","#1541f5ff"]}
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }}   
              style={styles.gradient}
            >
              {menuItems.map((item) => (
                <Pressable
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => {
                    closeMenu();
                    router.push(item.path);
                  }}
                >
                  <View style={styles.menuRow}>
                    <Text style={styles.menuText}>{item.label}</Text>
                  </View>
                </Pressable>
              ))}
            </LinearGradient>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  year: { fontSize: 16, fontWeight: "600" },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText: { fontSize: 12, marginRight: 8 },
  dotBlue: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1f3cff" },
  dotLight: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#9bb0ff" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  box: {
    width: "48%",
    height: 180,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1f3cff",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  boxText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f3cff",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sideMenu: {
    height: "38%",
    width: 130,
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 30,
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
