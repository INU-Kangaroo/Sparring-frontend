import "react-native-gesture-handler";
import "expo-router/entry";

// Web에서 requestAnimationFrame 정의
if (typeof global.requestAnimationFrame === "undefined") {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}

import 'react-native-gesture-handler';
import 'react-native-reanimated';
