// BLOCK 4: AURA DIAGNOSTIC
// Logic: Handle warning codes with tones. Use unified code "0" for clear.

const int BUZZER = 8;

void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() > 0) {
    int code = Serial.parseInt();
    switch(code) {
      case 101: tone(BUZZER, 440, 200); break; // Minor Fluid Leak
      case 102: tone(BUZZER, 880, 200); break; // Communications Lag
      case 103: tone(BUZZER, 1200, 500); break; // Thermal Fluctuation
      case 0:   noTone(BUZZER); break;
    }
  }
}