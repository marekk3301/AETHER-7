// BLOCK 02: STATUS PANEL

// PIN DEFINITIONS
const int RED = 2;
const int GREEN = 3;

void setup() {
  Serial.begin(9600);

  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  
  digitalWrite(RED, HIGH);
  digitalWrite(LED_GREEN, LOW);
}

void loop() {
  // ACCESS TO THE COMPUTER
  Serial.println("LOGIN:42");
  
  // STATUS CHECK
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    int code = input.toInt();

    if (code == 1) {
      digitalWrite(LED_RED, LOW);
      digitalWrite(LED_GREEN, HIGH);
    } 
  }

  delay(500);
}