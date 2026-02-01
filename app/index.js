// app/index.js
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // 0ms 지연으로 RootLayout 마운트 후 navigation
    const timeout = setTimeout(() => {
      router.replace("/login");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
