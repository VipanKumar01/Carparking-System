/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACSiN0AmzcSllAEF-El8vBgcZpg5PIjDI",
  authDomain: "carparking-8c1d0.firebaseapp.com",
  projectId: "carparking-8c1d0",
  storageBucket: "carparking-8c1d0.firebasestorage.app",
  messagingSenderId: "338966398601",
  appId: "1:338966398601:web:0de856261b212ba71fa858"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: serverTimestamp(),
      role: 'user'
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Error logging in:", error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Parking slots functions
export const getParkingStatus = async () => {
  try {
    const docRef = doc(db, "parking_logs", "current_status");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return {
        success: false,
        error: "No parking status document found"
      };
    }
  } catch (error: any) {
    console.error("Error getting parking status:", error);
    return { success: false, error: error.message };
  }
};

export const bookParkingSlot = async (
  userId: string,
  slotNumber: number,
  vehicleNumber: string
) => {
  try {
    // Get current status
    const statusRef = doc(db, "parking_logs", "current_status");
    const statusSnap = await getDoc(statusRef);

    if (!statusSnap.exists()) {
      return { success: false, error: "Parking status not found" };
    }

    const statusData = statusSnap.data();
    const slotKey = `slot${slotNumber}_status`;

    // Check if slot is available
    if (statusData[slotKey] !== "Empty") {
      return { success: false, error: "Slot is already occupied" };
    }

    // Book the slot
    const bookingData = {
      userId,
      vehicleNumber,
      slotNumber,
      entryTime: Timestamp.now(),
      status: "active",
      paymentStatus: "pending"
    };

    // Add booking record
    const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

    // Update parking status
    const newAvailable = statusData.slot_available - 1;
    await updateDoc(statusRef, {
      [slotKey]: "Fill",
      slot_available: newAvailable,
      change_description: `Slot ${slotNumber}: Empty → Fill`,
      timestamp: Timestamp.now()
    });

    return {
      success: true,
      bookingId: bookingRef.id,
      data: { ...bookingData, bookingId: bookingRef.id }
    };
  } catch (error: any) {
    console.error("Error booking slot:", error);
    return { success: false, error: error.message };
  }
};

export const exitParkingSlot = async (bookingId: string) => {
  try {
    // Get booking info
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return { success: false, error: "Booking not found" };
    }

    const bookingData = bookingSnap.data();
    const slotNumber = bookingData.slotNumber;
    const slotKey = `slot${slotNumber}_status`;

    // Update booking status
    const exitTime = Timestamp.now();
    const durationMs = exitTime.toMillis() - bookingData.entryTime.toMillis();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    const amount = durationMinutes; // $1 per minute

    await updateDoc(bookingRef, {
      exitTime,
      status: "completed",
      durationMinutes,
      amount,
      paymentStatus: "pending"
    });

    // Update parking status
    const statusRef = doc(db, "parking_logs", "current_status");
    const statusSnap = await getDoc(statusRef);

    if (statusSnap.exists()) {
      const statusData = statusSnap.data();
      const newAvailable = statusData.slot_available + 1;

      await updateDoc(statusRef, {
        [slotKey]: "Empty",
        slot_available: newAvailable,
        change_description: `Slot ${slotNumber}: Fill → Empty`,
        timestamp: Timestamp.now()
      });
    }

    return {
      success: true,
      data: {
        bookingId,
        exitTime,
        durationMinutes,
        amount
      }
    };
  } catch (error: any) {
    console.error("Error exiting slot:", error);
    return { success: false, error: error.message };
  }
};

export const processPayment = async (bookingId: string, paymentMethod: string) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return { success: false, error: "Booking not found" };
    }

    // Create payment record
    const paymentData = {
      bookingId,
      amount: bookingSnap.data().amount,
      paymentMethod,
      status: "completed",
      timestamp: Timestamp.now()
    };

    const paymentRef = await addDoc(collection(db, "payments"), paymentData);

    // Update booking payment status
    await updateDoc(bookingRef, {
      paymentStatus: "completed",
      paymentId: paymentRef.id
    });

    return {
      success: true,
      data: {
        paymentId: paymentRef.id,
        ...paymentData
      }
    };
  } catch (error: any) {
    console.error("Error processing payment:", error);
    return { success: false, error: error.message };
  }
};

export const getUserBookings = async (userId: string) => {
  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(bookingsQuery);
    const bookings: any[] = [];

    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: bookings };
  } catch (error: any) {
    console.error("Error getting user bookings:", error);
    return { success: false, error: error.message };
  }
};

export const getActiveBooking = async (userId: string) => {
  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );

    const querySnapshot = await getDocs(bookingsQuery);

    if (querySnapshot.empty) {
      return { success: true, data: null };
    }

    const bookingDoc = querySnapshot.docs[0];
    const bookingData = { id: bookingDoc.id, ...bookingDoc.data() };


    return { success: true, data: bookingData };
  } catch (error: any) {
    console.error("Error getting active booking:", error);
    return { success: false, error: error.message };
  }
};

// Current user hook helpers
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };
