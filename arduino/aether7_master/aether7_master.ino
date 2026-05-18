/**
 * AETHER-7 | A.E.G.I.S. MASTER CONTROLLER
 * Frame-based Heartbeat Protocol
 */

const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int TEMP_PIN = A1;
const int BUZZER_PIN = 8;

bool isUnlocked = false;
unsigned long lastStreamTime = 0;
const int streamInterval = 500; 

void setup() {
  Serial.begin(9600);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(LED_RED, HIGH);
}

void loop() {
  // 1. INPUT HANDLING
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input == "1" || input == "STATUS:1") {
      isUnlocked = true;
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    } else if (isUnlocked) {
      handleAlarms(input.toInt());
    }
  }

  // 2. HEARTBEAT DATA STREAMING
  unsigned long currentTime = millis();
  if (currentTime - lastStreamTime >= streamInterval) {
    lastStreamTime = currentTime;

    // ALWAYS SEND LOGIN (Heartbeat for Block 1)
    Serial.println("LOGIN:42");

    if (isUnlocked) {
      // ALWAYS SEND OFFSET (Heartbeat for Block 3/4)
      int potVal = analogRead(POT_PIN);
      Serial.print("OFFSET:");
      Serial.println(potVal);

      // ALWAYS SEND TEMP (Block 5)
      float reading = analogRead(TEMP_PIN);
      float celsius = (reading * 500.0) / 1024.0;
      Serial.print("TEMP:");
      Serial.println(celsius, 1);
    }
  }
}

void handleAlarms(int code) {
  switch (code) {
    case 0: noTone(BUZZER_PIN); break;
    case 101: tone(BUZZER_PIN, 440, 200); break;
    case 102: tone(BUZZER_PIN, 880, 200); break;
    case 103: tone(BUZZER_PIN, 1200, 500); break;
  }
}