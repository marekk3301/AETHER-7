/**
 * AETHER-7 | BLOK 03: ANTENNA ALIGNMENT (Cumulative)
 * Zawiera logikę z Bloku 1 i 2 oraz odczyt potencjometru.
 */

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;

bool isUnlocked = false;

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);
}

void loop() {
  // 1. ZADANIE 1: LOGIN HEARTBEAT
  Serial.println("LOGIN:42");

  if (isUnlocked) {
    // 2. ZADANIE 3: OFFSET STREAMING
    int potVal = analogRead(POT_PIN);
    Serial.print("OFFSET:");
    Serial.println(potVal);
  }

  // 3. ZADANIE 2: OBSŁUGA KOMENDY ODBLOKOWANIA
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input == "1") {
      isUnlocked = true;
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    }
  }

  delay(500);
}