// BLOCK 3: ANTENNA ALIGNMENT
// Logic: Stream OFFSET:VAL to Serial

const int RED = 2;
const int GREEN = 3;

void setup() {
  Serial.begin(9600);
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  digitalWrite(RED, HIGH);
}

void loop() {
  // ACCESS TO THE COMPUTER
  Serial.println("LOGIN:42"); // Send labeled key

  // STATUS LIGHT
  if (Serial.available() > 0) {
    String msg = Serial.readStringUntil('\n');
    if (msg == "STATUS:1") {
      digitalWrite(RED, LOW);
      digitalWrite(GREEN, HIGH);
    }
  }
  
  // SIGNAL SYNC
  int val = analogRead(A0);
  Serial.print("OFFSET:");
  Serial.println(val);

  delay(100); 
}