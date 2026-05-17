// BLOCK 3: ANTENNA ALIGNMENT
// Logic: Stream OFFSET:VAL to Serial

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("LOGIN:42"); // Send labeled key
  int val = analogRead(A0);
  Serial.print("OFFSET:");
  Serial.println(val);
  delay(100); 
}