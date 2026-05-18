/**
 * AETHER-7 | A.E.G.I.S. MASTER CONTROLLER
 * Wersja uproszczona (Blocking Code) dla początkujących.
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

Adafruit_BME280 bme; // I2C

bool isUnlocked = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Start state
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);

  // Initialize BME280
  if (!bme.begin(0x76)) {
    Serial.println("SYSTEM_ERROR: BME280_NOT_FOUND");
  }
}

void loop() {
  // 1. SEND HEARTBEAT (Always send Login, send data if unlocked)
  Serial.println("LOGIN:42");

  if (isUnlocked) {
    // Stream Potentiometer
    int potVal = analogRead(POT_PIN);
    Serial.print("OFFSET:");
    Serial.println(potVal);

    // Stream BME280 Temperature
    float temp = bme.readTemperature();
    Serial.print("TEMP:");
    Serial.println(temp, 1);
  }

  // 2. CHECK FOR INCOMING COMMANDS
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input == "1" || input == "STATUS:1") {
      isUnlocked = true;
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    } 
    else if (isUnlocked) {
      // Handle Alarms (Buzzer)
      int code = input.toInt();
      if (code == 101) {
        tone(BUZZER_PIN, 440, 200);
      } else if (code == 102) {
        tone(BUZZER_PIN, 880, 200);
      } else if (code == 103) {
        tone(BUZZER_PIN, 1200, 500);
      } else if (code == 0) {
        noTone(BUZZER_PIN);
      }
    }
  }

  // 3. WAIT (Introductory simple timing)
  delay(500); 
}