// BLOCK 03: ANTENNA ALIGNMENT

// PIN DEFINITIONS
// const int LED_RED = 2;
// const int LED_GREEN = 3;
const int POT_PIN = A0;

void setup() {
  // Serial.begin(9600);
  
  // pinMode(LED_RED, OUTPUT);
  // pinMode(LED_GREEN, OUTPUT);
  
  // digitalWrite(LED_RED, HIGH);
  // digitalWrite(LED_GREEN, LOW);
}

void loop() {
  // Serial.println("LOGIN:42");

  // if (Serial.available() > 0) {
  //   String input = Serial.readStringUntil('\n');
  //   input.trim();
  //   int code = input.toInt();

  //   if (code == 1) {
  //     digitalWrite(LED_RED, LOW);
  //     digitalWrite(LED_GREEN, HIGH);
  //   } 
  // }

  int potVal = analogRead(POT_PIN);
  Serial.print("OFFSET:");
  Serial.println(potVal);


  // delay(500);
}