import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";

type MenuItem = {
  label: string;
  path: Href;
};

type SidebarMenuProps = {
  exposeOpen?: (open: () => void) => void;
  width?: number; // ✅ 원하면 너비 조절 가능 (기본 130)
  items?: MenuItem[];
};

export default function SidebarMenu({
  exposeOpen,
  width = 130, // ✅ 너가 원래 쓰던 width 기본값
  items,
}: SidebarMenuProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = useMemo(
    () =>
      items ?? [
        { label: "루틴 쓰기", path: "/routine/write" },
        { label: "기록하기", path: "/main/main" },
        { label: "추천", path: "/recommend/recommendation" },
        { label: "보고서", path: "/mypage/report" },
        { label: "AI 챗봇", path: "/AI/chatAI" },
        { label: "마이페이지", path: "/mypage/mypage" },
      ],
    [items]
  );

  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * ✅ 오른쪽에서 등장:
   * - 처음엔 화면 밖(= width)로 밀어두고
   * - open 시 0으로
   */
  const slideAnim = useRef(new Animated.Value(width)).current;

  const openMenu = () => {
    setMenuOpen(true);
    slideAnim.setValue(width); // ✅ 매번 확실히 초기 위치로
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  useEffect(() => {
    exposeOpen?.(openMenu);
  }, [exposeOpen]);

  if (!menuOpen) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={closeMenu}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sideMenu,
          { width }, // ✅ 너비 반영
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={["#a9d7f4ff", "#3f8ff1ff", "#1541f5ff"]}
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 999,
  },

  // ✅ 너가 준 스타일 그대로 사용 (핵심: height가 있어야 gradient flex:1이 먹음)
  sideMenu: {
    height: "38%",
    // width는 props로 주입
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