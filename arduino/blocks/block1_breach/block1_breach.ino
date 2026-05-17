// BLOCK 1: BREACH PROTOCOL
// Logic: Send 'LOGIN:42' and wait for '1'

void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("LOGIN:42"); // Send labeled key
  
  if (Serial.available() > 0) {
    int response = Serial.parseInt();
    if (response == 1) {
      while(true); 
    }
  }
  delay(1000);
}