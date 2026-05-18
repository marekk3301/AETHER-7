# AETHER-7 | PRZEWODNIK DLA PROWADZĄCEGO (Introductory Version)
Witaj w panelu instruktora systemu AETHER-7. Dokument ten został zaktualizowany o obsługę czujnika **BME280** oraz uproszczony kod (Blocking Code), idealny dla osób stawiających pierwsze kroki w świecie Arduino.

---

## 1. Zmiany w Metodyce
*   **Kod Blokujący:** Zrezygnowaliśmy z zaawansowanego `millis()` na rzecz prostego `delay()`. Pozwala to uczniom łatwiej prześledzić przepływ programu (najpierw wyślij, potem sprawdź, potem czekaj).
*   **Eksploracja (Hide & Seek):** W instrukcjach dla uczniów **nie podajemy wartości docelowej 705**. Uczniowie muszą sami odkryć "częstotliwość", obserwując stabilizujący się kształt wektora na ekranie.
*   **Czujnik BME280:** Wykorzystujemy interfejs I2C, co jest świetną okazją do wspomnienia o magistralach danych.

---

## 2. Analiza kodu `aether7_master.ino`

### Biblioteki i Inicjalizacja
```cpp
#include <Wire.h>
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;
```
*   **Wyjaśnienie:** BME280 wymaga bibliotek. Upewnij się, że uczniowie mają zainstalowaną bibliotekę "Adafruit BME280" w Library Managerze.

### Pętla Główna (Loop)
```cpp
void loop() {
  Serial.println("LOGIN:42"); // Heartbeat

  if (isUnlocked) {
    int potVal = analogRead(A0);
    Serial.print("OFFSET:");
    Serial.println(potVal);

    float temp = bme.readTemperature();
    Serial.print("TEMP:");
    Serial.println(temp, 1);
  }

  if (Serial.available() > 0) {
    // ... obsługa komend ...
  }

  delay(500); // Proste taktowanie pętli
}
```
*   **Koncepcja: Sequential Execution.** Program wykonuje się linia po linii. Co pół sekundy odświeżamy dane. Jest to wystarczająco szybkie dla interfejsu, a jednocześnie bardzo czytelne w kodzie.

---

## 📋 Scenariusz Zadań (Instrukcje dla Uczniów)

1.  **Hacking (Serial):** Wyślij `LOGIN:42`, aby przełamać zabezpieczenia terminala.
2.  **Status (LED):** Odczytaj komendę `STATUS:1` i zapal zieloną diodę na potwierdzenie.
3.  **Tuning (Vector):** Podłącz potencjometr. Kręć powoli, aż zakłócony wektor na ekranie zamieni się w stabilny, zielony kształt. **Musisz sam znaleźć właściwą pozycję!**
4.  **Alarms (Buzzer):** Zaprogramuj reakcję na kody błędów `101`, `102`, `103`, aby załoga słyszała zagrożenia.
5.  **Environment (BME280):** Podłącz czujnik BME280 (piny SDA/SCL). Wyślij temperaturę w formacie `TEMP:XX.X`, aby aktywować systemy podtrzymywania życia.

---

## 💡 Wskazówki Dydaktyczne
*   **Adres I2C:** Standardowo BME280 używa adresu `0x76` lub `0x77`. W kodzie używamy `bme.begin(0x76)`. Jeśli czujnik nie działa, warto sprawdzić drugi adres.
*   **Znak nowej linii:** Przypomnij uczniom, że aplikacja czeka na `\n`, dlatego zawsze używamy `Serial.println()`, a nie `Serial.print()` na końcu ramki.

---
*Autor: System A.E.G.I.S. (AETHER-7 Workshop)*