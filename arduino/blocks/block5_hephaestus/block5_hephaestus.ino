/**
 * AETHER-7 | BLOK 05: FINAL CONTROL SYSTEM
 * Kompletny system operacyjny stacji. Zawiera logikę wszystkich poprzednich zadań.
 * Obsługuje czujnik BME280 (I2C).
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int BUZZER_PIN = 8;

Adafruit_BME280 bme; // I2C (SDA -> A4, SCL -> A5)

bool isUnlocked = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Stan początkowy: Zablokowany
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);

  // Inicjalizacja czujnika BME280
  if (!bme.begin(0x76)) {
    Serial.println("SYSTEM_ERROR: BME280_NOT_FOUND");
  }
}

void loop() {
  // 1. ZADANIE 1: LOGIN HEARTBEAT
  // Zawsze wysyłamy login, aby terminal wiedział, że jesteśmy połączeni.
  Serial.println("LOGIN:42");

  if (isUnlocked) {
    // 2. ZADANIE 3: OFFSET STREAMING (Antena)
    int potVal = analogRead(POT_PIN);
    Serial.print("OFFSET:");
    Serial.println(potVal);

    // 3. ZADANIE 5: TEMP STREAMING (Podtrzymywanie życia)
    float temp = bme.readTemperature();
    Serial.print("TEMP:");
    Serial.println(temp, 1);
  }

  // 4. ZADANIE 2 & 4: OBSŁUGA KOMEND (LED i Alarmy)
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    // Kod "1" odblokowuje sprzęt
    if (input == "1") {
      isUnlocked = true;
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    } 
    else if (isUnlocked) {
      // Obsługa kodów alarmowych AURA
      int code = input.toInt();
      if (code == 101) {
        tone(BUZZER_PIN, 440, 200); // Minor Fluid Leak
      } else if (code == 102) {
        tone(BUZZER_PIN, 880, 200); // Communications Lag
      } else if (code == 103) {
        tone(BUZZER_PIN, 1200, 500); // Thermal Fluctuation
      } else if (code == 0) {
        noTone(BUZZER_PIN);
      }
    }
  }

  delay(500); // Taktowanie systemu
}