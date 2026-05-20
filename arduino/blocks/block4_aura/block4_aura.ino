/**
 * AETHER-7 | BLOK 04: AURA DIAGNOSTIC (Cumulative)
 * Zawiera logikę z Bloku 1, 2 i 3 oraz obsługę alarmów.
 */

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int BUZZER_PIN = 8;

bool isUnlocked = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Stan początkowy: Zablokowany
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);
}

void loop() {
  // 1. ZADANIE 1: LOGIN HEARTBEAT
  Serial.println("LOGIN:42");

  if (isUnlocked) {
    // 2. ZADANIE 3: OFFSET STREAMING (Antena)
    int potVal = analogRead(POT_PIN);
    Serial.print("OFFSET:");
    Serial.println(potVal);
  }

  // 3. OBSŁUGA KOMEND (Zadania 2 & 4)
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();

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

  delay(500);
}