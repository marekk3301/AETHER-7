# SCENARIUSZ WARSZTATÓW: PROTOKÓŁ AETHER-7
**System A.E.G.I.S. (Advanced Ecological & Geostationary Intelligence System)**

Ten dokument to kompletny plan warsztatów dla prowadzącego. Zawiera instrukcje dla uczniów oraz "ściągę" z pełnym wyjaśnieniem kodu i koncepcji elektronicznych.

---

## WSTĘP FABULARNY (Dla uczniów)
*„Jest rok 2026. Stacja badawcza AETHER-7 dryfuje na niskiej orbicie okołoziemskiej. Po uderzeniu mikrometeoroidu, główny komputer A.E.G.I.S. przeszedł w tryb awaryjny i zablokował dostęp do systemów podtrzymywania życia. Jesteście zespołem inżynierów ratunkowych. Komputer wyświetla panel sterowania, jednak by się do niego dostać i odzyskać kontrolę nad stacją musicie stworzyć system komunikacji z systemem używając mikrokontrolera Arduino. Powodzenia.”*

---

## ZADANIE 1: Breach Protocol (Przełamanie portu)

### 📝 Instrukcja dla ucznia:
Stacja jest zablokowana. Musisz wysłać sygnał autoryzacyjny bezpośrednio do procesora. Zaprogramuj Arduino tak, aby co pół sekundy wysyłało kod autoryzacji `LOGIN:XX` do komputera. (Podpowiedź: Komputer szuka konkretnej liczby).

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
*   **Port Szeregowy (Serial):** To rura, przez którą płyną dane bit po bicie między Arduino a komputerem.
*   **`Serial.begin(9600)`:** Ustawia prędkość "rozmowy" na 9600 bodów (bitów na sekundę).
*   **`Serial.println()`:** Wysyła tekst i dodaje znak nowej linii (`\n`).

---

## ZADANIE 2: Hardware Mirror (Status LED)

### 📝 Instrukcja dla ucznia:
Terminal odpowiedział! Jeśli klucz był poprawny, aplikacja wysyła teraz sygnał potwierdzenia `1`. Podłącz diody LED (Czerwoną pod Pin 2, Zieloną pod Pin 3). Spraw, by zielona zapaliła się dopiero, gdy otrzymasz kod `1`.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
void loop() {
  Serial.println("LOGIN:42"); 
  if (Serial.available() > 0) {
    String msg = Serial.readStringUntil('\n');
    msg.trim();
    if (msg == "1") {
      digitalWrite(2, LOW);    // Czerwona OFF
      digitalWrite(3, HIGH);   // Zielona ON
    }
  }
  delay(500);
}
```
*   **Piny GPIO:** Cyfrowe wyjścia procesora. `HIGH` to 5V (włączone), `LOW` to 0V (wyłączone).
*   **Ujednolicony Protokół:** Używamy kodu `1` zarówno do odblokowania sprzętu, jak i jako bazę dla przyszłych kodów diagnostycznych.

---

## ZADANIE 3: Vector Phase Sync (Potencjometr)

### 📝 Instrukcja dla ucznia:
Łącze radiowe jest rozstrojone. Na ekranie widzisz chaotyczny kształt wektora. Podłącz potencjometr pod pin analogowy. Wysyłaj jego wartość w formacie `OFFSET:WARTOŚĆ`. Musisz sam znaleźć "częstotliwość", przy której kształt stanie się stabilny i zielony.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
void loop() {
  int potVal = analogRead(A0); 
  Serial.print("OFFSET:"); 
  Serial.println(potVal);      
  delay(100); 
}
```
*   **ADC (Analog-to-Digital Converter):** Zamienia napięcie (0-5V) na liczbę (0-1023).
*   **Hide & Seek:** Uczeń musi manualnie dopasować wartość, obserwując stabilność grafiki na ekranie.

---

## ZADANIE 4: AURA Alarms (Buzzer)

### 📝 Instrukcja dla ucznia:
Antena działa! System AURA wykrywa drobne nieprawidłowości. Gdy włączysz "Master Feed", aplikacja zacznie wysyłać kody ostrzeżeń (`101`, `102`, `103`). Podłącz buzzer pod pin 8 i zaprogramuj dźwięki ostrzegawcze.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
void loop() {
  if (Serial.available() > 0) {
    int code = Serial.parseInt(); 
    if (code == 101) tone(8, 440, 200);
    else if (code == 102) tone(8, 880, 200);
    else if (code == 103) tone(8, 1200, 500);
    else if (code == 0) noTone(8);
  }
}
```
*   **Narracja:** Alarmy to teraz "Ostrzeżenia" (np. Opóźnienie komunikacji, drobny wyciek płynu), a nie katastrofy.
*   **`tone()`:** Generuje sygnał dźwiękowy o określonej częstotliwości (Hz).

---

## ZADANIE 5: Hephaestus Life Support (BME280)

### 📝 Instrukcja dla ucznia:
Ostatni krok. Monitorujemy parametry stacji za pomocą czujnika BME280 (SDA do A4, SCL do A5). Użyj biblioteki, aby odczytać temperaturę i wyślij ją jako `TEMP:XX.X`. W terminalu ustaw temperaturę docelową.

### 🔑 Rozwiązanie i wyjaśnienie (Dla prowadzącego):
```cpp
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
void setup() { bme.begin(0x76); }
void loop() {
  float t = bme.readTemperature();
  Serial.print("TEMP:");
  Serial.println(t, 1);
  delay(1000);
}
```
*   **I2C:** Magistrala danych wykorzystująca tylko dwa przewody do komunikacji z czujnikiem.
*   **Histereza:** Zapobiega zbyt częstemu przełączaniu się systemów przy minimalnych zmianach temperatury.

---

## 🛠 Wskazówki techniczne dla prowadzącego:
1.  **Monitor Portu:** Pamiętaj, aby zamknąć Monitor Portu w Arduino IDE przed kliknięciem **INITIALIZE LINK**.
2.  **Heartbeat:** Aplikacja co 3 sekundy wysyła kod `1`, aby upewnić się, że diody LED na Arduino są w poprawnym stanie, nawet jeśli sprzęt został zresetowany.

*Autor: System A.E.G.I.S. | AETHER-7 Workshop*
