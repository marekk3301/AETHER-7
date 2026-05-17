// BLOCK 5: HEPHAESTUS LIFE SUPPORT
// Logic: Stream TEMP:VAL to Serial

void setup() {
  Serial.begin(9600);
}

void loop() {
  float reading = analogRead(A1);
  float celsius = (reading * 500.0) / 1024.0;
  
  Serial.print("TEMP:");
  Serial.println(celsius, 1);
  
  delay(1000);
}