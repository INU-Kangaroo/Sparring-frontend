# 1. gradle.properties 수정
(Get-Content "android\gradle.properties" -Raw) -replace "android\.kotlinVersion=1\.5\.10", "android.kotlinVersion=1.9.25" | Set-Content "android\gradle.properties"
Add-Content "android\gradle.properties" "`nRNGH_kotlinVersion=1.9.25`nRNSAC_kotlinVersion=1.9.25`nKakao_kotlinVersion=1.9.25"

# 2. node_modules 수정
(Get-Content "node_modules\react-native-gesture-handler\android\build.gradle" -Raw) -replace "def kotlin_version = rootProject.*", "def kotlin_version = '1.9.25'" | Set-Content "node_modules\react-native-gesture-handler\android\build.gradle"

(Get-Content "node_modules\@react-native-kakao\core\android\build.gradle" -Raw) -replace 'rootProject\.ext\.has\("kotlinVersion"\) \? rootProject\.ext\.get\("kotlinVersion"\) : project\.properties\["Kakao_kotlinVersion"\]', '"1.9.25"' | Set-Content "node_modules\@react-native-kakao\core\android\build.gradle"

(Get-Content "node_modules\@react-native-kakao\user\android\build.gradle" -Raw) -replace 'rootProject\.ext\.has\("kotlinVersion"\) \? rootProject\.ext\.get\("kotlinVersion"\) : project\.properties\["Kakao_kotlinVersion"\]', '"1.9.25"' | Set-Content "node_modules\@react-native-kakao\user\android\build.gradle"

# 3. 빌드
npx expo run:android
