// BLOCK 04: ALERT NOTIFICATION SYSTEM

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int BUZZER_PIN = 11;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);
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

  delay(500);
}