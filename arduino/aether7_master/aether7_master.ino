/**
 * AETHER-7 | A.E.G.I.S. MASTER CONTROLLER
 * Refined Protocol: LABELED_MESSAGES
 */

// PIN DEFINITIONS
const int LED_RED = 2;
const int LED_GREEN = 3;
const int POT_PIN = A0;
const int TEMP_PIN = A1;
const int BUZZER_PIN = 8;

// STATE VARIABLES
bool isUnlocked = false;
unsigned long lastStreamTime = 0;
const int streamInterval = 500; 

void setup() {
  Serial.begin(9600);
  
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initial state: Locked
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);
}

void loop() {
  // 1. HANDLE INCOMING SERIAL COMMANDS
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();

    if (input == "1" || input == "STATUS:1") {
      isUnlocked = true;
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    }

    if (isUnlocked) {
      int code = input.toInt();
      handleAlarms(code);
    }
  }

  // 2. PERIODIC DATA STREAMING
  unsigned long currentTime = millis();
  if (currentTime - lastStreamTime >= streamInterval) {
    lastStreamTime = currentTime;

    if (!isUnlocked) {
      // NEW PROTOCOL: LOGIN:VAL
      Serial.println("LOGIN:42");
    } else {
      // NEW PROTOCOL: OFFSET:VAL
      int potVal = analogRead(POT_PIN);
      Serial.print("OFFSET:");
      Serial.println(potVal);

      // NEW PROTOCOL: TEMP:VAL
      float reading = analogRead(TEMP_PIN);
      float celsius = (reading * 500.0) / 1024.0;
      Serial.print("TEMP:");
      Serial.println(celsius, 1);
    }
  }
}

void handleAlarms(int code) {
  switch (code) {
    case 0: 
      noTone(BUZZER_PIN); 
      break;
    case 101: 
      tone(BUZZER_PIN, 440, 500); 
      break;
    case 102: 
      for(int f=800; f<1500; f+=10) { tone(BUZZER_PIN, f, 10); delay(5); } 
      break;
    case 103: 
      tone(BUZZER_PIN, 2500); 
      break;
  }
}