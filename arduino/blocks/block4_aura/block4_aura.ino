// BLOCK 4: AURA DIAGNOSTIC
// Logic: Handle emergency codes with tones

const int BUZZER = 8;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int code = Serial.parseInt();
    switch(code) {
      case 101: tone(BUZZER, 440, 200); break;
      case 102: tone(BUZZER, 880, 200); break;
      case 103: tone(BUZZER, 1200, 500); break;
      case 0:   noTone(BUZZER); break;
    }
  }
}