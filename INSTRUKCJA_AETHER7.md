# PROTOKÓŁ AETHER-7: INSTRUKCJA WARSZTATOWA
**System A.E.G.I.S. (Advanced Ecological & Geostationary Intelligence System)**

Witajcie na pokładzie stacji AETHER-7. System operacyjny stacji uległ awarii po przejściu przez pas asteroid. Jesteście zespołem inżynierów ratunkowych. Komputer wyświetla panel sterowania, jednak by się do niego dostać i odzyskać kontrolę nad stacją musicie stworzyć system komunikacji z systemem używając mikrokontrolera Arduino. Powodzenia.

---

## BLOK 1: Protokół Przełamania Zabezpieczeń (Serial IN)
**Historia:** Stacja jest zablokowana. Musisz wysłać sygnał autoryzacyjny bezpośrednio do procesora.
*   **Cel:** Nawiązanie połączenia szeregowego (Serial) i autoryzacja.
*   **Zadanie:** Zaprogramuj Arduino tak, aby co pół sekundy wysyłało kod autoryzacji `LOGIN:XX` do komputera. (Podpowiedź: Komputer szuka konkretnej liczby).
*   **Logika:** Jeśli terminal otrzyma poprawny klucz, odblokuje pozostałe moduły na ekranie.

## BLOK 2: Panel Statusu Sprzętowego (GPIO OUT)
**Historia:** Terminal odpowiedział! Załoga potrzebuje fizycznego potwierdzenia statusu zabezpieczeń na wypadek awarii monitorów.
*   **Cel:** Sterowanie wyjściami cyfrowymi na podstawie danych z terminala.
*   **Zadanie:** Podłącz dwie diody LED (Czerwoną pod Pin 2, Zieloną pod Pin 3).
*   **Logika:** 
    *   Domyślnie powinna świecić się dioda Czerwona.
    *   Gdy Arduino otrzyma z terminala komunikat `STATUS:1` (Dostęp Przyznany), wyłącz diodę Czerwoną i włącz Zieloną.

## BLOK 3: Synchronizacja Wektora Fazy (ADC Input)
**Historia:** Łącze radiowe jest rozstrojone. Na ekranie widzisz chaotyczny, poruszający się kształt wektora. Musicie ręcznie dopasować fazę sygnału.
*   **Cel:** Odczyt wartości analogowych i wizualizacja danych.
*   **Zadanie:** Podłącz potencjometr pod pin analogowy. Zaprogramuj Arduino, aby wysyłało odczyt w formacie `OFFSET:WARTOŚĆ` (gdzie wartość to 0-1023).
*   **Logika:** Kręć potencjometrem powoli i obserwuj ekran. Musisz znaleźć "częstotliwość", przy której kształt stanie się stabilny i zielony. Dopiero wtedy system AURA zostanie aktywowany.

## BLOK 4: Podsystem Diagnostyczny AURA (PWM Out / Event Handling)
**Historia:** Antena działa! System AURA wykrywa krytyczne błędy w różnych sekcjach stacji. Załoga musi słyszeć alarmy dźwiękowe, aby zareagować na czas.
*   **Cel:** Obsługa zdarzeń przychodzących i generowanie sygnałów dźwiękowych.
*   **Zadanie:** Podłącz głośnik piezo (buzzer) do pinu 8.
*   **Logika:** Gdy włączysz "Master Feed" w aplikacji, zacznie ona wysyłać kody błędów (`101`, `102`, `103`). Zaprogramuj Arduino, aby generowało różne dźwięki dla każdego kodu.

## BLOK 5: System Podtrzymywania Życia HEPHAESTUS (BME280)
**Historia:** Ostatni krok. Przy wypadku nastąpiło zwarcie na czujniku temperatury przez co się przepalił, a musimy monitorować temperaturę stacji.
*   **Cel:** Stworzenie układu sterowania w pętli zamkniętej.
*   **Zadanie:** Podłącz czujnik temperatury BME280 (SDA do A4, SCL do A5). Użyj odpowiedniej biblioteki, aby odczytać temperaturę i wyślij ją jako `TEMP:XX.X`.
*   **Logika:** W terminalu ustaw suwak docelowy. Aplikacja porówna Twoją temperaturę z celem i pokaże, czy system grzeje, chłodzi, czy jest stabilny.

---
**POWODZENIA, INŻYNIERZE. LOS AETHER-7 JEST W TWOICH RĘKACH.**
