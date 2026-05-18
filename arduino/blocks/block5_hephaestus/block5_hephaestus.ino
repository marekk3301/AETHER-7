// BLOCK 5: HEPHAESTUS LIFE SUPPORT
// Logic: Stream TEMP:VAL using BME280

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(9600);
  if (!bme.begin(0x76)) {
    Serial.println("Error: BME280 sensor not found!");
  }
}

void loop() {
  float temp = bme.readTemperature();
  
  Serial.print("TEMP:");
  Serial.println(temp, 1);
  
  delay(1000);
}