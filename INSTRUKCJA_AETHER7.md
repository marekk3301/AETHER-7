# AETHER-7: INSTRUKCJA WARSZTATOWA
**System A.E.G.I.S. (Advanced Ecological & Geostationary Intelligence System)**

Witajcie na pokładzie stacji AETHER-7. System operacyjny stacji uległ awarii po uderzeniu meteorytu. Waszym zadaniem jest ręczne przywrócenie systemów krytycznych przy użyciu mikrokontrolerów Arduino i terminala webowego.

---

## BLOK 1: Protokół Przełamania Zabezpieczeń (Serial IN)
**Historia:** Terminal stacji jest zablokowany. Musicie wysłać poprawny klucz nadpisujący bezpośrednio do procesora głównego, aby uzyskać dostęp do interfejsu.
*   **Cel:** Nawiązanie połączenia szeregowego (Serial) i autoryzacja.
*   **Zadanie:** Zaprogramuj Arduino tak, aby co sekundę wysyłało komunikat `LOGIN:42` przez port szeregowy.
*   **Logika:** Jeśli terminal otrzyma poprawny klucz, odpowie cyfrą `1`, co odblokuje pozostałe moduły na ekranie.

## BLOK 2: Panel Statusu Sprzętowego (GPIO OUT)
**Historia:** Interfejs cyfrowy to nie wszystko. Załoga potrzebuje fizycznego potwierdzenia statusu zabezpieczeń na wypadek awarii monitorów.
*   **Cel:** Sterowanie wyjściami cyfrowymi na podstawie danych z terminala.
*   **Zadanie:** Podłącz dwie diody LED (Czerwoną i Zieloną) do pinów cyfrowych (np. 2 i 3).
*   **Logika:** 
    *   Domyślnie świeci się dioda Czerwona.
    *   Gdy Arduino otrzyma z terminala kod komunikatu `1`, wyłącz diodę Czerwoną i włącz Zieloną.

## BLOK 3: Strojenie Anteny Phobos-Link (ADC Input)
**Historia:** Łącze komunikacyjne z Ziemią zostało rozstrojone. Musicie ręcznie dopasować fazę sygnału, aby pobrać logi diagnostyczne.
*   **Cel:** Odczyt wartości analogowych i wizualizacja danych.
*   **Zadanie:** Podłącz potencjometr 10k do pinu analogowego `A0`. Zaprogramuj Arduino, aby wysyłało odczyt w formacie `OFFSET:X` (gdzie X to wartość z zakresu 0-1023).
*   **Logika:** Terminal wyświetli wykres siły sygnału który trzeba odpowiednio dostroić. Dopiero gdy pasek siły sygnału osiągnie 100%, system AURA zostanie aktywowany.

## BLOK 4: Podsystem Diagnostyczny AURA (PWM Out / Event Handling)
**Historia:** Antena działa! System AURA wykrywa krytyczne błędy w różnych sekcjach stacji. Załoga musi słyszeć alarmy dźwiękowe, aby zareagować na czas.
*   **Cel:** Obsługa zdarzeń przychodzących i generowanie sygnałów dźwiękowych.
*   **Zadanie:** Podłącz buzzer (głośnik piezo) do pinu cyfrowego (np. 8).
*   **Logika:** Terminal będzie losowo wysyłał kody błędów, gdy włączysz przełącznik "MASTER FEED". Zaprogramuj obsługę kodów:
    *   `101` (Wyciek w Hydroponice): Wolne, niskie pikanie.
    *   `102` (Dekompresja Kadłuba): Szybka, narastająca syrena.
    *   `103` (Przeciążenie Rdzenia): Ciągły, wysoki pisk.
    *   `0`: Cisza.

## BLOK 5: System Podtrzymywania Życia HEPHAESTUS
**Historia:** Główny czujnik temperatury stacji spłonął. Musicie stworzyć własny termostat, który utrzyma stabilne warunki w części mieszkalnej.
*   **Cel:** Stworzenie układu sterowania w pętli zamkniętej z histerezą.
*   **Zadanie:** Podłącz czujnik temperatury do pinu `A1`. Arduino ma wysyłać do systemu dane w formacie `TEMP:XX.X`.
*   **Logika:** W terminalu ustaw suwak "TARGET TEMP". Aplikacja porówna temperaturę z Arduino z Twoim celem:
    *   Jeśli Temp > Cel + 1°C -> Włącz tryb CHŁODZENIA (Wizualizacja w aplikacji).
    *   Jeśli Temp < Cel - 1°C -> Włącz tryb OGRZEWANIA.
    *   W przedziale +/- 1°C -> Status STABILNY.

---
**POWODZENIA!**