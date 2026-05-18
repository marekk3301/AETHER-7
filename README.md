# SCENARIUSZ WARSZTATÓW: PROTOKÓŁ AETHER-7
**System A.E.G.I.S. (Advanced Ecological & Geostationary Intelligence System)**

Ten dokument to kompletny plan warsztatów dla prowadzącego. Zawiera instrukcje dla uczniów oraz "ściągę" z pełnym wyjaśnieniem kodu i koncepcji elektronicznych.

---

## WSTĘP FABULARNY (Dla uczniów)
*„Jest rok 2026. Stacja badawcza AETHER-7 dryfuje na niskiej orbicie okołoziemskiej. Po uderzeniu mikrometeoroidu, główny komputer A.E.G.I.S. przeszedł w tryb awaryjny i zablokował dostęp do systemów podtrzymywania życia. Jesteście zespołem inżynierów ratunkowych. Wasz laptop to terminal komunikacyjny, a Arduino to klucz do przejęcia kontroli nad stacją. Powodzenia.”*

---

## ZADANIE 1: Breach Protocol (Przełamanie portu)

### 📝 Instrukcja dla ucznia:
Stacja jest zablokowana. Musisz wysłać sygnał autoryzacyjny bezpośrednio do procesora. Zaprogramuj Arduino tak, aby co pół sekundy wysyłało napis `LOGIN:42` do komputera.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
void setup() {
  Serial.begin(9600); // Otwieramy kanał komunikacji
}

void loop() {
  Serial.println("LOGIN:42"); // Wysyłamy klucz z końcem linii
  delay(500); // Czekamy 500ms
}
```
*   **Koncepcja: Port Szeregowy (Serial).** To rura, przez którą płyną dane bit po bicie między Arduino a komputerem.
*   **`Serial.begin(9600)`:** Ustawia prędkość "rozmowy" na 9600 bodów (bitów na sekundę). Oba urządzenia muszą mieć tę samą prędkość.
*   **`Serial.println()`:** Wysyła tekst i dodaje ukryty znak "nowej linii" (`\n`). To kluczowe, bo aplikacja webowa wie dzięki temu, gdzie kończy się jedna wiadomość, a zaczyna druga.
*   **`delay(500)`:** Wstrzymuje program. Bez tego Arduino wysyłałoby dane tak szybko, że mogłoby zapchać bufor komputera.

---

## ZADANIE 2: Hardware Mirror (Status LED)

### 📝 Instrukcja dla ucznia:
Terminal odpowiedział! Jeśli klucz był poprawny, aplikacja wysyła teraz komunikat `STATUS:1`. Podłącz diody LED (Czerwoną pod Pin 2, Zieloną pod Pin 3). Spraw, by zielona zapaliła się dopiero, gdy otrzymasz sygnał potwierdzenia.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
const int RED = 2; 
const int GREEN = 3;

void setup() {
  Serial.begin(9600);
  pinMode(RED, OUTPUT);   // Ustawiamy piny jako wyjścia
  pinMode(GREEN, OUTPUT);
  digitalWrite(RED, HIGH); // Na starcie świeci czerwona
}

void loop() {
  Serial.println("LOGIN:42"); // Ciągle wysyłamy login

  if (Serial.available() > 0) { // Czy coś do nas przyszło?
    String msg = Serial.readStringUntil('\n'); // Czytamy wiadomość
    if (msg == "1" || msg == "STATUS:1") {
      digitalWrite(RED, LOW);    // Wyłącz czerwoną
      digitalWrite(GREEN, HIGH); // Włącz zieloną
    }
  }
  delay(500);
}
```
*   **Koncepcja: Piny GPIO (General Purpose Input/Output).** To "nóżki" procesora, które mogą być albo przełącznikiem (Output), albo czujnikiem (Input).
*   **`pinMode(pin, OUTPUT)`:** Mówimy Arduino: "Będziemy wysyłać prąd przez tę nóżkę".
*   **`digitalWrite(pin, HIGH/LOW)`:** `HIGH` to włączenie napięcia (5V), `LOW` to wyłączenie (0V).
*   **`Serial.available()`:** Sprawdza, czy w "skrzynce pocztowej" Arduino czekają jakieś dane z komputera.

---

## ZADANIE 3: Vector Phase Sync (Potencjometr)

### 📝 Instrukcja dla ucznia:
Łącze radiowe jest rozstrojone. Na ekranie widzisz chaotyczny, poruszający się kształt wektora. Podłącz potencjometr pod pin `A0`. Wysyłaj jego wartość w formacie `OFFSET:WARTOŚĆ`. Kręć potencjometrem powoli i obserwuj ekran. Musisz znaleźć "częstotliwość", przy której kształt stanie się stabilny i zielony.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
void loop() {
  // ... (kod z poprzednich zadań) ...
  int potVal = analogRead(A0); // Czytamy wartość (0-1023)
  Serial.print("OFFSET:"); 
  Serial.println(potVal);      // Wysyłamy np. OFFSET:705
  delay(100); // Częstsze odświeżanie dla płynności grafiki
}
```
*   **Koncepcja: ADC (Analog-to-Digital Converter).** Potencjometr zmienia napięcie (0-5V). Arduino nie rozumie płynnego napięcia, więc zamienia je na liczbę od 0 do 1023. To właśnie robi ADC.
*   **`analogRead(A0)`:** Funkcja, która pobiera tę liczbę.
*   **Zasada "Hide & Seek":** W aplikacji ukryty jest cel (wartość 705). Im bliżej niej jest uczeń, tym funkcja matematyczna w JS (Gauss) bardziej "wygładza" rysowaną na ekranie linię.

---

## ZADANIE 4: AURA Alarms (Buzzer)

### 📝 Instrukcja dla ucznia:
Antena działa! System AURA wykrywa błędy. Gdy włączysz "Master Feed" w aplikacji, zacznie ona wysyłać kody błędów (`101`, `102`, `103`). Podłącz buzzer pod pin 8 i zaprogramuj dźwięki ostrzegawcze.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
const int BUZZER = 8;

void loop() {
  if (Serial.available() > 0) {
    int code = Serial.parseInt(); // Zamieniamy tekst na liczbę
    if (code == 101) {
      tone(BUZZER, 440, 200); // Dźwięk A4 przez 200ms
    } else if (code == 102) {
      tone(BUZZER, 880, 200); // Dźwięk A5 (wyższy)
    }
  }
}
```
*   **Koncepcja: PWM (Pulse Width Modulation).** Buzzer wydaje dźwięk, bo Arduino bardzo szybko włącza i wyłącza prąd, powodując drgania blaszki wewnątrz buzzera.
*   **`tone(pin, częstotliwość, czas)`:** Generuje falę o konkretnej częstotliwości (Hz). Wyższa liczba = wyższy pisk.
*   **`Serial.parseInt()`:** Bardzo pomocna funkcja, która wyłapuje liczby z tekstu płynącego przez Serial.

---

## ZADANIE 5: Hephaestus Life Support (BME280)

### 📝 Instrukcja dla ucznia:
Ostatni krok. Musimy monitorować temperaturę stacji. Podłącz czujnik BME280 (SDA do A4, SCL do A5). Użyj biblioteki, aby odczytać temperaturę i wyślij ją jako `TEMP:XX.X`. W terminalu ustaw suwak docelowy i sprawdź, czy system przejdzie w stan STABILIZED.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;

void setup() {
  bme.begin(0x76); // Inicjalizacja czujnika
}

void loop() {
  float t = bme.readTemperature(); // Odczytujemy stopnie Celsjusza
  Serial.print("TEMP:");
  Serial.println(t, 1); // Wysłanie z 1 miejscem po przecinku
  delay(1000);
}
```
*   **Koncepcja: Magistrala I2C.** To inteligentny sposób łączenia wielu czujników za pomocą tylko 2 przewodów (SDA - dane, SCL - zegar). Każdy czujnik ma swój "adres" (np. 0x76).
*   **Biblioteki:** Początkujący nie muszą pisać kodu do obsługi skomplikowanych protokołów czujnika – używamy gotowych funkcji od `Adafruit`.
*   **Histereza (W aplikacji):** Wyjaśnij uczniom, że termostat nie włącza się i nie wyłącza idealnie na granicy (np. 22.0°C), bo by "wariował". Aplikacja czeka, aż temperatura spadnie/wrośnie o 1 stopień (martwa strefa), zanim zmieni stan.

---

## 🛠 Wskazówki techniczne dla prowadzącego:
1.  **Kolejność otwierania:** Najpierw wgraj kod w Arduino IDE, **zamknij** Monitor Portu Szeregowego, a dopiero potem kliknij **INITIALIZE LINK** w przeglądarce.
2.  **Błąd BME280:** Jeśli czujnik nie odpowiada, najczęstszym błędem jest zamiana kabli SDA/SCL lub zły adres (zmień 0x76 na 0x77).
3.  **Monitoruj logi:** Na dole strony webowej jest czarny pasek z logami. Tam zobaczysz każdą ramkę odebraną z Arduino – to najszybszy sposób, by pokazać uczniowi, czy jego kod działa poprawnie.

*Autor: System A.E.G.I.S. | AETHER-7 Workshop*