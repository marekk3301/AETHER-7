// BLOCK 2: STATUS PANEL
// Logic: Read serial, toggle LEDs

const int RED = 2;
const int GREEN = 3;

void setup() {
  Serial.begin(9600);
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  digitalWrite(RED, HIGH);
}

void loop() {
  if (Serial.available() > 0) {
    String msg = Serial.readStringUntil('\n');
    if (msg == "STATUS:1") {
      digitalWrite(RED, LOW);
      digitalWrite(GREEN, HIGH);
    }
  }
}