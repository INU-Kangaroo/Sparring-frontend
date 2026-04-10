import { View, StyleSheet } from "react-native";

type Props = {
  step: number;      // 현재 단계 (1~4)
  total?: number;    // 전체 단계 (default 4)
};

export default function SignupProgress({ step, total = 4 }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx < step;

        return (
          <View
            key={idx}
            style={[
              styles.bar,
              isActive ? styles.activeBar : styles.inactiveBar,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
    width: "93%",
  },

  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  activeBar: {
    backgroundColor: "#E57373", // 핑크 느낌
  },

  inactiveBar: {
    backgroundColor: "#E5E5E5",
  },
});