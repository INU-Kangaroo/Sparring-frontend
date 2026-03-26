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
  width?: number;
  items?: MenuItem[];
};

export default function SidebarMenu({
  exposeOpen,
  width = 130, 
  items,
}: SidebarMenuProps) {
  const router = useRouter();

  const menuItems: MenuItem[] = useMemo(
    () =>
      items ?? [
        { label: "기록하기", path: "/main/main" },
        { label: "추천", path: "/recommend/recommendation" },
        { label: "보고서", path: "/report" },
        { label: "AI 챗봇", path: "/AI/chatAI" },
        { label: "마이페이지", path: "/my/mypage" },
      ],
    [items]
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const slideAnim = useRef(new Animated.Value(width)).current;

  const openMenu = () => {
    setMenuOpen(true);
    slideAnim.setValue(width);
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
          { width }, 
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

  sideMenu: {
    height: "30%",
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
