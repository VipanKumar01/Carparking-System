import serial
import time
from datetime import datetime
import os
import sys
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore


class ParkingDataLogger:
    def __init__(self, service_account_path):
        # Configuration
        self.SERIAL_PORT = 'COM4'
        self.BAUD_RATE = 9600
        self.DATA_DIR = Path.home() / "ParkingData"
        self.current_date = datetime.now().strftime('%Y-%m-%d')
        self.log_file = self.DATA_DIR / f"parking_log_{self.current_date}.csv"

        # Firebase service account path
        self.service_account_path = service_account_path

        # State tracking
        self.previous_state = None
        self.state_change_time = None
        self.MIN_STATE_DURATION = 2  # Minimum seconds to consider a state change valid

        # Initialize
        self.setup_directory()
        self.setup_firebase()
        self.setup_serial()

    def setup_directory(self):
        """Create data directory if it doesn't exist"""
        try:
            self.DATA_DIR.mkdir(parents=True, exist_ok=True)
            if not self.log_file.exists():
                with open(self.log_file, 'w') as f:
                    f.write("Timestamp,Available_Slots,Slot1,Slot2,Slot3,Slot4,Slot5,Change_Type\n")
            print(f"Data will be saved to: {self.log_file}")
        except Exception as e:
            print(f"Error setting up directory: {e}")
            sys.exit(1)

    def setup_firebase(self):
        """Initialize Firebase connection with explicit service account path"""
        try:
            # Initialize Firebase with explicit credentials path
            cred = credentials.Certificate(self.service_account_path)
            firebase_admin.initialize_app(cred)

            # Initialize Firestore client
            self.db = firestore.client()
            print("Firebase connected and initialized")
        except Exception as e:
            print(f"Firebase error: {e}")
            print(f"Make sure your service account file exists at: {self.service_account_path}")
            sys.exit(1)

    def setup_serial(self):
        """Initialize serial connection"""
        try:
            self.ser = serial.Serial(self.SERIAL_PORT, self.BAUD_RATE)
            print(f"Connected to Arduino on {self.SERIAL_PORT}")
        except Exception as e:
            print(f"Serial connection error: {e}")
            sys.exit(1)

    def verify_checksum(self, data, received_checksum):
        """Verify data integrity using checksum"""
        calculated_checksum = sum(ord(c) for c in data)
        return str(calculated_checksum) == received_checksum

    def detect_changes(self, current_state):
        """
        Detect changes in parking slots and return change description
        Returns None if no changes or changes are too recent
        """
        if not self.previous_state:
            self.previous_state = current_state
            self.state_change_time = time.time()
            return "Initial state"

        # Convert states to lists for comparison
        prev_slots = self.previous_state[1:]  # Skip available slots count
        curr_slots = current_state[1:]

        # Check if there's any change
        if prev_slots == curr_slots:
            return None

        # Verify if enough time has passed since last change
        if self.state_change_time and (time.time() - self.state_change_time < self.MIN_STATE_DURATION):
            return None

        # Generate change description
        changes = []
        for i, (prev, curr) in enumerate(zip(prev_slots, curr_slots), 1):
            if prev != curr:
                changes.append(f"Slot {i}: {prev} → {curr}")

        # Update state tracking
        self.previous_state = current_state
        self.state_change_time = time.time()

        return ", ".join(changes)

    def save_to_file(self, data, change_description):
        """Save data to CSV file"""
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open(self.log_file, 'a') as file:
                file.write(f"{timestamp},{data},{change_description}\n")
            return True
        except Exception as e:
            print(f"File writing error: {e}")
            return False

    def save_to_firebase(self, values, change_description):
        """Save data to Firebase Firestore"""
        try:
            # Create data document
            timestamp = datetime.now()
            slot_available = int(values[0])
            slot1, slot2, slot3, slot4, slot5 = values[1:]  # Adjusted to 5 slots

            # Prepare data
            data = {
                'timestamp': timestamp,
                'slot_available': slot_available,
                'slot1_status': slot1,
                'slot2_status': slot2,
                'slot3_status': slot3,
                'slot4_status': slot4,
                'slot5_status': slot5,
                'change_description': change_description
            }

            # Save to Firestore collection
            self.db.collection('parking_logs').document('current_state').set(data)

            # Also update current state in a separate document
            current_state_ref = self.db.collection('parking_system').document('current_state')
            current_state_ref.set({
                'last_updated': timestamp,
                'slot_available': slot_available,
                'slot1_status': slot1,
                'slot2_status': slot2,
                'slot3_status': slot3,
                'slot4_status': slot4,
                'slot5_status': slot5,
                'last_change': change_description
            })

            return True
        except Exception as e:
            print(f"Firebase error: {e}")
            return False

    def run(self):
        """Main loop to read and process data"""
        print("Starting data collection... Press Ctrl+C to stop")

        try:
            while True:
                if self.ser.in_waiting:
                    try:
                        line = self.ser.readline().decode('utf-8').strip()

                        if line.startswith("DATA,"):
                            # Split data and checksum
                            data_parts = line.split(',')
                            if len(data_parts) == 8:  # 6 data fields + "DATA" + checksum
                                data = ','.join(data_parts[1:-1])  # Remove "DATA," prefix and checksum
                                checksum = data_parts[-1]

                                if self.verify_checksum(','.join(data_parts[:-1]), checksum):
                                    values = data.split(',')

                                    # Detect changes
                                    change_description = self.detect_changes(values)

                                    # Only save if there are changes
                                    if change_description:
                                        file_saved = self.save_to_file(data, change_description)
                                        firebase_saved = self.save_to_firebase(values, change_description)

                                        if file_saved and firebase_saved:
                                            print(f"State change detected and saved: {change_description}")
                                            print(f"Current state: Available slots = {values[0]}")
                                            for i, status in enumerate(values[1:], 1):
                                                print(f"Slot {i}: {status}")
                                        else:
                                            print("Error saving state change")
                                else:
                                    print("Checksum verification failed")
                            else:
                                print(f"Invalid data format: {line}")

                    except Exception as e:
                        print(f"Error processing data: {e}")

                time.sleep(0.1)

        except KeyboardInterrupt:
            print("\nStopping data collection...")
        finally:
            self.cleanup()

    def cleanup(self):
        """Clean up resources"""
        self.ser.close()
        print("Connections closed")


if __name__ == "__main__":
    # Path to your Firebase service account key JSON file
    # Replace this with the actual path to your downloaded service account key
    SERVICE_ACCOUNT_PATH = "./carparking.json"

    # Initialize and run the logger
    logger = ParkingDataLogger(SERVICE_ACCOUNT_PATH)
    logger.run()