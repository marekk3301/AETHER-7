# AETHER-7 | PRZEWODNIK DLA PROWADZĄCEGO (Scenariusz Modułowy)

Ten dokument to szczegółowy scenariusz warsztatów, który pokazuje, jak budować system AETHER-7 krok po kroku. Każde zadanie to nowa warstwa kodu i elektroniki dodawana do poprzedniej.

https://marekk3301.github.io/AETHER-7/

---

## ZADANIE 1: Breach Protocol (Komunikacja Szeregowa)
**Cel:** Nawiązanie pierwszego kontaktu z komputerem stacji.

### 🔌 Elektronika:
*   Samo Arduino podłączone przez USB do laptopa.

### ✍️ Co dopisać:
Nauczyciel tłumaczy funkcję `Serial.begin()` oraz pętlę `loop()`.
```cpp
void setup() {
  Serial.begin(9600); // Inicjalizacja portu szeregowego
}

void loop() {
  Serial.println("LOGIN:42"); // Wysyłanie klucza autoryzacyjnego
  delay(1000); // Czekamy 1 sekundę
}
```

### 🧠 Koncepcje:
1.  **Serial (Port Szeregowy):** "Rura" do przesyłania danych. `9600` to prędkość (bitów na sekundę).
2.  **println:** Wysyła tekst i dodaje ukryty znak "nowej linii" (`\n`). Bez tego terminal webowy nie wie, gdzie kończy się wiadomość.
3.  **delay:** Arduino jest bardzo szybkie. Delay zapobiega "zalaniu" komputera milionami wiadomości na sekundę.

---

## ZADANIE 2: Status Panel (GPIO i Reakcja)
**Cel:** Sterowanie fizycznymi światłami na podstawie sygnału z komputera.

### 🔌 Elektronika:
*   Podłączamy **Czerwoną LED** do pinu 2 i **Zieloną LED** do pinu 3 (przez rezystory 220Ω).

### ✍️ Co dopisać:
1.  Zdefiniuj numery pinów na górze programu.
2.  Ustaw piny jako `OUTPUT` w `setup()`.
3.  Dodaj warunek `if (Serial.available())` w pętli `loop()`.

```cpp
const int LED_RED = 2;
const int LED_GREEN = 3;

void setup() {
  Serial.begin(9600);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_RED, HIGH); // Czerwona świeci od startu
}

void loop() {
  Serial.println("LOGIN:42");
  
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.toInt() == 1) { // Jeśli terminal wysłał "1"
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    }
  }
  delay(500);
}
```

Można też pokazać PWM i zapalać czerwoną diodę na połowę jasności:

```
analogWrite(LED_RED, 128);
```

### 🧠 Koncepcje:
1.  **GPIO (General Purpose Input/Output):** Piny, które mogą być włącznikiem (Output) lub sensorem (Input).
2.  **DigitalWrite:** Ustawia stan pinu. `HIGH` = 5V (włączone), `LOW` = 0V (wyłączone).
3.  **Serial.available():** Sprawdza, czy w "skrzynce pocztowej" Arduino czekają jakieś listy (dane) z komputera.
4.  **toInt():** Zamienia tekst "1" na liczbę 1, aby można było ją łatwo porównać.

---

## ZADANIE 3: Antenna Alignment (Przetwornik ADC)
**Cel:** Przesyłanie wartości analogowej do terminala.

### 🔌 Elektronika:
*   Podłączamy **Potencjometr** (lewa nóżka do GND, prawa do 5V, środkowa do pinu **A0**).

### ✍️ Co dopisać:
1.  Zdefiniuj pin `POT_PIN = A0`.
2.  W pętli `loop()` odczytaj wartość potencjometru i wyślij ją z etykietą `OFFSET:`.

```cpp
const int POT_PIN = A0;

void loop() {
  // ...

  int potVal = analogRead(POT_PIN);
  Serial.print("OFFSET:"); 
  Serial.println(potVal); // Przesyłamy np. OFFSET:512

  delay(500);
}
```

### 🧠 Koncepcje:
1.  **Potencjometr:** Rezystor nastawny. Działa jak kran – przekręcenie zmienia napięcie na środkowej nóżce.
2.  **ADC (Analog-to-Digital Converter):** Arduino nie rozumie prądu, rozumie tylko liczby. ADC zamienia napięcie (0-5V) na liczbę od **0 do 1023**.
3.  **analogRead:** Funkcja czytająca tę liczbę z pinu analogowego.

---

## ZADANIE 4: AURA Alarms (Dźwięki PWM)
**Cel:** Reakcja dźwiękowa na ostrzeżenia wysyłane przez terminal.

### 🔌 Elektronika:
*   Podłączamy **Buzzer Piezo** do pinu **11** i GND.

### ✍️ Co dopisać:
1.  Zdefiniuj `BUZZER_PIN = 11`.
2.  Rozbuduj instrukcję `if` o obsługę kodów `101`, `102`, `103`.

```cpp
const int BUZZER_PIN = 11;

void loop() {
  // ...
  if (Serial.available() > 0) {
    // ... (czytanie kodu) ...
    if (code == 1) { /* odblokuj LED */ }
    else if (code == 101) { tone(BUZZER_PIN, 440, 200); }
    else if (code == 102) { tone(BUZZER_PIN, 880, 200); }
    else if (code == 103) { tone(BUZZER_PIN, 1200, 500); }
    else if (code == 0)   { noTone(BUZZER_PIN); }
  }
}
```

### 🧠 Koncepcje:
1.  **Buzzer:** Głośnik, który drga, gdy prąd szybko się włącza i wyłącza.
2.  **tone(pin, freq, time):** Tworzy dźwięk o konkretnej częstotliwości (Hz). Większa liczba = wyższy pisk.
3.  **noTone:** Cisza.

---

## ZADANIE 5: Hephaestus (Magistrala I2C)
**Cel:** Odczyt profesjonalnego czujnika środowiskowego.

### 🔌 Elektronika:
*   Podłączamy **BME280** (VCC -> 3.3V/5V, GND -> GND, **SDA -> A4**, **SCL -> A5**).

### ✍️ Co dopisać:
1.  Zaimportuj biblioteki na samej górze.
2.  Zainicjalizuj czujnik w `setup()`.
3.  Wyślij temperaturę z etykietą `TEMP:`.

```cpp
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;

void setup() {
  // ...
  bme.begin(0x76); // Start czujnika (częsty adres to 0x76)
}

void loop() {
  // ...
  float temp = bme.readTemperature();
  Serial.print("TEMP:");
  Serial.println(temp, 1); // Wyślij z 1 miejscem po przecinku
}
```

### 🧠 Koncepcje:
1.  **I2C (Inter-Integrated Circuit):** Magistrala "inteligentna". Pozwala łączyć wiele czujników tylko 2 przewodami (SDA - dane, SCL - zegar). Każdy ma swój unikalny adres (np. 0x76).
2.  **Biblioteki:** Gotowe zestawy funkcji napisane przez innych. Dzięki nim nie musisz wiedzieć, jak dokładnie działa "wnętrze" czujnika, by go użyć.

---

## Co dalej
Jak zostanie czas to można dodać przycisk do wysyłania danych do komputera. System ma cały czas nasłuchiwać, ale wysyłać dane z loginu, potencjometra i termometru tylko po naciśnięciu przycisku. 

```cpp
int BUTTON_PIN = 7;

void setup() {
  // ...
  pinmode(BUTTON_PIN, INPUT_PULLUP);
}

void loop() {
  // ...
  if (digitalRead(BUTTON_PIN) == 1) {
    Serial.println("LOGIN:42");
  
    Serial.print("OFFSET:"); 
    Serial.println(potVal); // Przesyłamy np. OFFSET:512
  
    Serial.print("TEMP:");
    Serial.println(temp, 1); // Wyślij z 1 miejscem po przecinku
  }
}
```

## Potrzebny Sprzęt:
1.  Arduino Uno
2.  Breadboard
3.  2 diody LED (zielona i czerwona)
4.  2 rezystory 220ohm
5.  Potencjometr
6.  Brzęczyk
7.  Sensor temperatury BME280
8.  Przycisk na wszelki
9.  Przynajmniej 15 kabelków

---

## 🛠 FAQ dla Prowadzącego:
*   **Nie łączy się?** Sprawdź, czy Monitor Portu w Arduino IDE jest zamknięty. Tylko jedna aplikacja naraz może czytać Serial.
*   **Wartości skaczą?** Upewnij się, że potencjometr ma dobry kontakt z płytką stykową.
*   **Błąd BME280?** Sprawdź kable SDA/SCL. Jeśli są dobrze, zmień adres w kodzie z `0x76` na `0x77`.

*Scenariusz AETHER-7 przygotowany dla inżynierów ratunkowych.*
