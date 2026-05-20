// BLOCK 05: TEMP SENSOR REPLACEMENT

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int BUZZER_PIN = 8;

Adafruit_BME280 bme; // I2C (SDA -> A4, SCL -> A5)

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);

  // Inicjalizacja czujnika BME280
  if (!bme.begin(0x76)) {
    Serial.println("SYSTEM_ERROR: BME280_NOT_FOUND");
  }
}

void loop() {
  // ACCESS TO THE COMPUTER
  Serial.println("LOGIN:42");

  // STATUS CHECK & ALERT MONITORING
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    int code = input.toInt();

    if (code == 1) {
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    } 
    else if (code == 101) {
      tone(BUZZER_PIN, 440, 200); // Minor Fluid Leak
    } 
    else if (code == 102) {
      tone(BUZZER_PIN, 880, 200); // Communications Lag
    } 
    else if (code == 103) {
      tone(BUZZER_PIN, 1200, 500); // Thermal Fluctuation
    } 
    else if (code == 0) {
      noTone(BUZZER_PIN);
    }
  }

  // OFFSET STREAMING
  int potVal = analogRead(POT_PIN);
  Serial.print("OFFSET:");
  Serial.println(potVal);

  // LIFE_SUPPORT
  float temp = bme.readTemperature();
  Serial.print("TEMP:");
  Serial.println(temp, 1);

  delay(500);
}