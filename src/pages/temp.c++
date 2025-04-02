#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD Configuration
LiquidCrystal_I2C lcd(0x27, 20, 4);

// Servo Configuration
Servo entry_servo;  // Entry Gate Servo
Servo exit_servo;   // Exit Gate Servo

#define ENTRY_SERVO_PIN 2
#define EXIT_SERVO_PIN 12  // New Exit Gate Servo

// IR Sensor Pins
#define ir_enter 3
#define ir_back  4
#define ir_exit_1 11  // New Exit Gate Sensor
#define ir_car1 6
#define ir_car2 7
#define ir_car3 8
#define ir_car4 9
#define ir_car5 10

// Variables
int S1, S2, S3, S4, S5;
int slot = 5;
bool entry_gate_open = false;
bool exit_gate_open = false;
unsigned long lastDataSent = 0;
const unsigned long DATA_INTERVAL = 1000; // Send data every 1 second

void setup() {
    Serial.begin(9600);
    
    // IR Sensor Setup
    pinMode(ir_car1, INPUT);
    pinMode(ir_car2, INPUT);
    pinMode(ir_car3, INPUT);
    pinMode(ir_car4, INPUT);
    pinMode(ir_car5, INPUT);
    pinMode(ir_enter, INPUT);
    pinMode(ir_back, INPUT);
    pinMode(ir_exit_1, INPUT); // New Exit Sensor

    // Servo Setup
    entry_servo.attach(ENTRY_SERVO_PIN);
    entry_servo.write(90); // Default closed position

    exit_servo.attach(EXIT_SERVO_PIN);  // New Exit Servo
    exit_servo.write(90); // Default closed position

    // LCD Setup
    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 1);
    lcd.print("    Car Parking  ");
    lcd.setCursor(0, 2);
    lcd.print("       System    ");
    delay(2000);
    lcd.clear();
}

void loop() {
    Read_Sensor();
    Update_Slot_Display();
    Handle_Entry_Gate();
    Handle_Exit_Gate();
    
    // Send data at regular intervals
    if (millis() - lastDataSent >= DATA_INTERVAL) {
        Send_Data_Serial();
        lastDataSent = millis();
    }
}

void Read_Sensor() {
    S1 = digitalRead(ir_car1) == LOW ? 1 : 0;
    S2 = digitalRead(ir_car2) == LOW ? 1 : 0;
    S3 = digitalRead(ir_car3) == LOW ? 1 : 0;
    S4 = digitalRead(ir_car4) == LOW ? 1 : 0;
    S5 = digitalRead(ir_car5) == LOW ? 1 : 0;
}

void Update_Slot_Display() {
    slot = 5 - (S1 + S2 + S3 + S4 + S5);
    
    lcd.setCursor(0, 0);
    lcd.print("   Slots Left: ");
    lcd.print(slot);
    lcd.print("    ");
    
    lcd.setCursor(0, 1);
    lcd.print(S1 ? "S1:Fill " : "S1:Empty");
    lcd.setCursor(10, 1);
    lcd.print(S2 ? "S2:Fill " : "S2:Empty");
    
    lcd.setCursor(0, 2);
    lcd.print(S3 ? "S3:Fill " : "S3:Empty");
    lcd.setCursor(10, 2);
    lcd.print(S4 ? "S4:Fill " : "S4:Empty");
    
    lcd.setCursor(0, 3);
    lcd.print(S5 ? "S5:Fill " : "S5:Empty");
}

// Handle Entry Gate Logic
void Handle_Entry_Gate() {
    if (digitalRead(ir_enter) == LOW && !entry_gate_open) {
        if (slot > 0) { // Open only if there are free slots
            entry_servo.write(180);
            delay(2000);
            entry_gate_open = true;
        } else {
            lcd.setCursor(0, 0);
            lcd.print(" Parking Full! ");
        }
    }
    
    if (digitalRead(ir_back) == LOW && entry_gate_open) {
        entry_servo.write(90);
        delay(2000);
        entry_gate_open = false;
    }
}

// Handle Exit Gate Logic
void Handle_Exit_Gate() {
    if (digitalRead(ir_exit_1) == LOW && !exit_gate_open) {
        exit_servo.write(180);  // Open the exit gate
        delay(5000);            // Keep it open for 5 seconds
        exit_servo.write(90);   // Close the exit gate
        exit_gate_open = false; 
    }
}

void Send_Data_Serial() {
    // Send data in a consistent CSV format with checksum
    String data = "DATA,";
    data += String(slot) + ",";
    data += String(S1 ? "Fill" : "Empty") + ",";
    data += String(S2 ? "Fill" : "Empty") + ",";
    data += String(S3 ? "Fill" : "Empty") + ",";
    data += String(S4 ? "Fill" : "Empty") + ",";
    data += String(S5 ? "Fill" : "Empty");
    
    // Calculate simple checksum
    int checksum = 0;
    for (int i = 0; i < data.length(); i++) {
        checksum += data[i];
    }
    data += "," + String(checksum);
    
    Serial.println(data);
}
