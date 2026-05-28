import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
  width = 156,
  items,
}: SidebarMenuProps) {
  const router = useRouter();

const menuItems: MenuItem[] = useMemo(
  () =>
    items ?? [
      {
        label: "추천",
        path: "/recommend/recommendation",
        icon: "sparkles-outline",
      },
      {
        label: "보고서",
        path: "/report",
        icon: "document-text-outline",
      },
      {
        label: "AI 챗봇",
        path: "/AI/chatAI",
        icon: "chatbubble-ellipses-outline",
      },
      {
        label: "마이페이지",
        path: "/my/mypage",
        icon: "person-circle-outline",
      },
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
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
        <Pressable
          key={item.label}
          onPress={() => {
            closeMenu();
            router.push(item.path);
          }}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuPressed,
          ]}
        >
          <View style={styles.menuRow}>
            <View style={styles.iconWrap}>
              <Ionicons
                name={item.icon as any}
                size={18}
                color="#D99197"
              />
            </View>

            <Text style={styles.menuText}>
              {item.label}
            </Text>
          </View>
</Pressable>
        ))}
      </View>
    </Animated.View>
  </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 999,
  },
sideMenu: {
  alignSelf: "flex-start",
  borderTopLeftRadius: 30,
  borderBottomLeftRadius: 30,
  overflow: "hidden",

},

menuContainer: {
  backgroundColor: "#fff",
  paddingHorizontal: 22,
  paddingTop: 10,
  paddingBottom: 14,

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: -2, height: 2 },
  elevation: 6,
},

menuItem: {
  paddingVertical: 15,
  paddingHorizontal: 5,
  borderRadius: 16,
  marginBottom: 8,
},

menuPressed: {
  backgroundColor: "#F7F7F7",
  transform: [{ scale: 0.98 }],
},

menuRow: {
  flexDirection: "row",
  alignItems: "center",
},

iconWrap: {
  alignItems: "flex-start",
  justifyContent: "flex-start",
  marginRight: 12,
},

menuText: {
  color: "#111",
  fontSize: 15,
  fontWeight: "700",
},
});
