# AETHER-7 | Protokół A.E.G.I.S.
Wersja PoC (Proof of Concept) dla warsztatów elektronicznych.

## 🚀 O Projekcie
AETHER-7 to interaktywna platforma edukacyjna symulująca sytuację awaryjną na stacji kosmicznej. Projekt łączy programowanie mikrokontrolerów Arduino z nowoczesnymi technologiami webowymi (Web Serial API).

---

## 🛠 Konfiguracja Sprzętowa
Aby ukończyć wszystkie zadania, potrzebujesz:
1. **Arduino** (Uno/Nano/Leonardo).
2. **2x LED** (Czerwona, Zielona) + rezystory 220Ω.
3. **Potencjometr 10kΩ**.
4. **Buzzer Piezo**.
5. **Czujnik Temperatury** (LM35 lub termistor).

**Piny (Domyślne):**
* `Pin 2`: LED Czerwona
* `Pin 3`: LED Zielona
* `Pin 8`: Buzzer
* `Pin A0`: Potencjometr
* `Pin A1`: Czujnik Temperatury

---

## 📋 Zadania Warsztatowe

### Zadanie 1: Przełamanie Protokołu (Breach Protocol)
*   **Cel:** Uzyskanie dostępu do terminala.
*   **Logika:** Arduino musi wysyłać ramkę `LOGIN:42\n` co 500-1000ms.
*   **Tutorial:**
    1. Uruchom `Serial.begin(9600)`.
    2. W pętli `loop()` użyj `Serial.println("LOGIN:42")`.
    3. Dodaj `delay(500)`.
*   **Koncepcja:** Komunikacja szeregowa jako metoda autoryzacji sprzętowej.

### Zadanie 2: Sprzętowy Mirror Statusu
*   **Cel:** Odzwierciedlenie stanu blokady na diodach LED.
*   **Logika:** Aplikacja wysyła `STATUS:1`, gdy dostęp jest przyznany.
*   **Tutorial:**
    1. Odczytaj dane za pomocą `Serial.readStringUntil('\n')`.
    2. Jeśli odebrano `1` lub `STATUS:1`, ustaw `digitalWrite(LED_GREEN, HIGH)`.
*   **Koncepcja:** Obsługa wyjść cyfrowych (GPIO) na podstawie komend z zewnątrz.

### Zadanie 3: Synchronizacja Wektora Fazy
*   **Cel:** Zsynchronizowanie łącza Phobos-Link.
*   **Logika:** Wysyłaj `OFFSET:WARTOŚĆ` (0-1023). Celuj w wartość **705**.
*   **Tutorial:**
    1. Użyj `analogRead(A0)` do pobrania wartości z potencjometru.
    2. Wyślij ją jako `Serial.print("OFFSET:")` i `Serial.println(val)`.
*   **Koncepcja:** Przetwarzanie sygnałów analogowych (ADC) i wizualizacja parametrów radiowych.

### Zadanie 4: Diagnostyka AURA
*   **Cel:** Powiadomienia dźwiękowe o awariach.
*   **Logika:** Aplikacja wysyła kody `101`, `102`, `103`.
*   **Tutorial:**
    1. Użyj instrukcji `switch` lub `if`, aby sprawdzić kod błędu.
    2. Wygeneruj dźwięk funkcją `tone(8, częstotliwość, czas)`.
*   **Koncepcja:** Przetwarzanie zdarzeń i generowanie sygnałów PWM/Audio.

### Zadanie 5: Termostat HEPHAESTUS
*   **Cel:** Stabilizacja temperatury modułu mieszkalnego.
*   **Logika:** Wysyłaj `TEMP:XX.X`. Aplikacja wyliczy histerezę.
*   **Tutorial:**
    1. Odczytaj `analogRead(A1)`.
    2. Przelicz na stopnie Celsjusza i wyślij: `Serial.println(celsius, 1)`.
*   **Koncepcja:** Pętla zamknięta i kontrola parametrów środowiskowych.

---

## 🔍 Wyjaśnienie Kodu (Podstawy)

### Komunikacja "Heartbeat" (Bicie Serca)
W systemie AETHER-7 zastosowano protokół ramkowy. Każda wiadomość musi zawierać etykietę, np. `LABEL:VALUE`.
```cpp
Serial.println("LOGIN:42"); // Ramka identyfikacyjna
```
**Dlaczego?** Dzięki temu aplikacja wie, co dokładnie przesyła Arduino i może wykryć "zgubienie" ramki (Watchdog), co skutkuje ponownym zablokowaniem terminala dla bezpieczeństwa.

### Przetwarzanie w JS (`app.js`)
```javascript
const [label, val] = data.split(":"); // Rozdzielenie etykiety od wartości
```
Aplikacja dzieli odebrany tekst na dwie części. Jeśli etykieta to `OFFSET`, wartość trafia do silnika renderującego wektor Lissajous na elemencie Canvas.

---

## 🚀 Jak uruchomić?
1. Podłącz Arduino.
2. Wgraj kod z folderu `arduino/aether7_master`.
3. Otwórz `index.html` w Chrome/Edge.
4. Kliknij **INITIALIZE LINK** i wybierz port COM.

**POWODZENIA, INŻYNIERZE!**