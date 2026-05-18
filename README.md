# AETHER-7 | PRZEWODNIK DLA PROWADZĄCEGO (Teacher's Guide)
Witaj w panelu instruktora systemu AETHER-7. Ten dokument zawiera szczegółową analizę kodu Arduino, wyjaśnienie koncepcji technicznych oraz wskazówki metodyczne do przeprowadzenia warsztatów.

---

## 1. Architektura Systemu
System opiera się na **komunikacji ramkowej** przez port szeregowy. Zamiast przesyłać surowe liczby, używamy formatu `ETYKIETA:WARTOŚĆ`. Pozwala to na:
*   Jednoczesne przesyłanie danych z wielu czujników.
*   Implementację mechanizmu **Watchdog** (aplikacja blokuje się, gdy przestanie otrzymywać ramkę `LOGIN`).
*   Łatwe debugowanie przez uczniów w Monitorze Portu Szeregowego.

---

## 2. Analiza kodu `aether7_master.ino` (Linia po Linii)

### Definicje i Zmienne
```cpp
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int TEMP_PIN = A1;
const int BUZZER_PIN = 8;
```
*   **Wyjaśnienie:** Definiujemy stałe dla pinów. Używamy `const`, aby oszczędzać pamięć i zapobiec przypadkowej zmianie numeru pinu w trakcie działania programu.

```cpp
bool isUnlocked = false;
unsigned long lastStreamTime = 0;
const int streamInterval = 500; 
```
*   **Koncepcja: Non-blocking Timing.** Zamiast funkcji `delay()`, która zatrzymuje cały procesor, używamy zmiennej `lastStreamTime` do odmierzania czasu za pomocą funkcji `millis()`. Dzięki temu procesor może jednocześnie obsługiwać dźwięk, czytać czujniki i odbierać dane z Seriala.

### Funkcja `setup()`
```cpp
void setup() {
  Serial.begin(9600);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_RED, HIGH); // Start w stanie zablokowanym
}
```
*   **Wyjaśnienie:** Inicjalizujemy port szeregowy (baudrate 9600 musi być zgodny z tym w `app.js`). Ustawiamy tryby pracy pinów. Dioda czerwona świeci się od startu, sygnalizując brak dostępu.

### Główna pętla `loop()` - Odbieranie danych
```cpp
if (Serial.available() > 0) {
  String input = Serial.readStringUntil('\n');
  input.trim();
```
*   **Koncepcja: Serial Buffer.** Sprawdzamy, czy w buforze wejściowym są dane. `readStringUntil('\n')` czyta całą linię aż do znaku nowej linii. `trim()` usuwa zbędne spacje i białe znaki.

```cpp
if (input == "1" || input == "STATUS:1") {
  isUnlocked = true;
  digitalWrite(LED_RED, LOW);
  digitalWrite(LED_GREEN, HIGH);
}
```
*   **Wyjaśnienie:** To jest reakcja na sygnał potwierdzający z przeglądarki. Gdy terminal webowy otrzyma poprawny klucz, wysyła "1", co fizycznie przełącza diody LED.

### Główna pętla `loop()` - Wysyłanie danych (Heartbeat)
```cpp
if (currentTime - lastStreamTime >= streamInterval) {
  Serial.println("LOGIN:42");
  if (isUnlocked) {
    int potVal = analogRead(POT_PIN);
    Serial.print("OFFSET:");
    Serial.println(potVal);
    // ... temperatura ...
  }
}
```
*   **Wyjaśnienie:** Co 500ms wysyłamy "puls" stacji. 
    *   `LOGIN:42` to ramka autoryzacyjna. Jeśli zniknie, webapp zablokuje interfejs.
    *   `OFFSET:` przesyła wartość z potencjometru do silnika graficznego wektorów.
    *   `TEMP:` przesyła dane klimatyczne.

### Przetwarzanie temperatury
```cpp
float reading = analogRead(TEMP_PIN);
float celsius = (reading * 500.0) / 1024.0;
```
*   **Koncepcja: ADC to Physics.** `analogRead` zwraca wartość 0-1023 (10-bit). Dla czujnika LM35: 10mV to 1°C. Wzór przelicza napięcie (0-5V) na realną temperaturę.

### Obsługa Alarmów `handleAlarms()`
```cpp
void handleAlarms(int code) {
  switch (code) {
    case 101: tone(BUZZER_PIN, 440, 200); break;
    case 102: tone(BUZZER_PIN, 880, 200); break;
    // ...
  }
}
```
*   **Koncepcja: PWM i Częstotliwość.** Funkcja `tone()` generuje sygnał prostokątny o zadanej częstotliwości (Hz). Case 101 to dźwięk A4 (440Hz). Uczeń może tu eksperymentować z własnymi melodiami ostrzegawczymi.

---

## 📋 Scenariusz Zadań (Instrukcje dla Uczniów)

1.  **Hacking (Serial Output):** Naucz Arduino "mówić" do terminala. Wyślij `LOGIN:42` i zobacz, jak ekran powitalny znika.
2.  **Visual Confirmation (Digital Input):** Odczytaj, co terminal mówi do Ciebie. Gdy zobaczysz `STATUS:1`, zapal zieloną diodę.
3.  **Tuning (Analog Input):** Podłącz potencjometr. Musisz "ustawić częstotliwość" na **705**, aby zsynchronizować wektor fazowy Phobos-Link.
4.  **Audio Alert (Events):** Włącz Master Feed w terminalu. Gdy nadejdzie błąd (np. 101), spraw, by buzzer wydał dźwięk ostrzegawczy.
5.  **Life Support (Closed-loop):** Podłącz czujnik temperatury. Wyślij `TEMP:XX.X`. W terminalu ustaw cel (np. 22°C) i zobacz, jak system decyduje o grzaniu lub chłodzeniu.

---

## 💡 Wskazówki Dydaktyczne
*   **Monitor Portu Szeregowego:** Jeśli coś nie działa, poproś uczniów o otwarcie Monitora w Arduino IDE. Powinni widzieć przewijające się napisy `LOGIN:42` i `OFFSET:xxx`. To najlepsza metoda nauki debugowania.
*   **Problemy z połączeniem:** Web Serial API działa tylko w **Chrome** lub **Edge**. Upewnij się, że Monitor Portu w Arduino IDE jest **zamknięty** przed kliknięciem "INITIALIZE LINK" w przeglądarce.

---
*Autor: System A.E.G.I.S. (AETHER-7 Workshop)*