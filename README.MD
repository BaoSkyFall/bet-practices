Here is a step-by-step guide to building a simple "Betting Tracker" application using React.js and Firebase.

> **Important Disclaimer:** This guide is for **educational purposes only**. Real-money gambling applications require strict legal compliance, secure payment gateways, and robust backend security (server-side validation) which are not covered in this basic tutorial.

---

### **Phase 1: Firebase Setup**

Before writing code, we need a place to store the data.

1. Go to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Click **Add project** and give it a name (e.g., `simple-bet-app`).
3. Disable Google Analytics (not needed for this demo) and create the project.
4. **Create the Database:**
* On the left sidebar, click **Build** -> **Firestore Database**.
* Click **Create Database**.
* Choose **Start in Test Mode** (allows read/write without authentication for development).
* Select a location close to you (e.g., `asia-southeast1`) and click **Enable**.


5. **Get Configuration:**
* Click the **Project Overview** (gear icon) -> **Project settings**.
* Scroll down to "Your apps" and click the web icon (`</>`).
* Register the app (nickname: `BetWeb`).
* Copy the `firebaseConfig` object provided.



---

### **Phase 2: React Project Setup**

Open your terminal and run these commands to set up the project and install Firebase.

```bash
# 1. Create the React app
npx create-react-app simple-bet-app
cd simple-bet-app

# 2. Install Firebase SDK
npm install firebase

```

---

### **Phase 3: The Code**

We will create two main files: one to connect to Firebase and one for your betting logic.

#### **1. Firebase Configuration (`src/firebase.js`)**

Create a new file inside your `src` folder named `firebase.js`. Paste the config you copied earlier here.

```javascript
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// REPLACE THIS WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

```

#### **2. The Betting Interface (`src/App.js`)**

Replace the contents of `src/App.js` with the code below. This handles the match display, the odds, user input, and saving to the database.

```javascript
// src/App.js
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './App.css'; // You can keep the default CSS or clear it

function App() {
  // 1. Define the Match and Odds
  const matchDetails = {
    home: "Viet Nam",
    away: "China",
    odds: {
      vietnam: 2.31,
      draw: 2.59,
      china: 4.09
    }
  };

  // 2. State for User Input
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [selection, setSelection] = useState('vietnam'); // default selection
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success or error message

  // 3. Calculate Potential Win (Visual helper)
  const currentRate = matchDetails.odds[selection];
  const potentialWin = amount ? (parseFloat(amount) * currentRate).toFixed(2) : 0;

  // 4. Handle Form Submission
  const handleBet = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    if (!name || !amount || parseFloat(amount) <= 0) {
        setStatus({ type: 'error', msg: 'Please enter a valid name and amount.' });
        setLoading(false);
        return;
    }

    try {
      // Add data to Firestore "bets" collection
      await addDoc(collection(db, "bets"), {
        user_name: name,
        bet_amount: parseFloat(amount),
        selected_team: selection,
        odds_at_time: currentRate,
        potential_win: parseFloat(potentialWin),
        timestamp: serverTimestamp(),
        match: `${matchDetails.home} vs ${matchDetails.away}`
      });

      setStatus({ type: 'success', msg: 'Bet placed successfully!' });
      // Reset form
      setName('');
      setAmount('');
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus({ type: 'error', msg: 'Error connecting to server.' });
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1>⚽ Match Day: {matchDetails.home} vs {matchDetails.away}</h1>

      {/* Odds Display */}
      <div style={styles.oddsContainer}>
        <div style={selection === 'vietnam' ? styles.cardActive : styles.card} onClick={() => setSelection('vietnam')}>
          <h3>{matchDetails.home}</h3>
          <p>Rate: <strong>{matchDetails.odds.vietnam}</strong></p>
        </div>
        
        <div style={selection === 'draw' ? styles.cardActive : styles.card} onClick={() => setSelection('draw')}>
          <h3>Draw</h3>
          <p>Rate: <strong>{matchDetails.odds.draw}</strong></p>
        </div>

        <div style={selection === 'china' ? styles.cardActive : styles.card} onClick={() => setSelection('china')}>
          <h3>{matchDetails.away}</h3>
          <p>Rate: <strong>{matchDetails.odds.china}</strong></p>
        </div>
      </div>

      {/* Betting Form */}
      <form onSubmit={handleBet} style={styles.form}>
        <h2>Place Your Bet</h2>
        
        <div style={styles.inputGroup}>
            <label>Your Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter your name"
              style={styles.input}
            />
        </div>

        <div style={styles.inputGroup}>
            <label>Bet Amount (VND):</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="e.g. 100"
              style={styles.input}
            />
        </div>

        <div style={styles.summary}>
            <p>You are betting on: <strong>{selection.toUpperCase()}</strong></p>
            <p>Potential Return: <strong>${potentialWin}</strong></p>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Saving..." : "Confirm Bet"}
        </button>

        {status && (
            <p style={status.type === 'error' ? styles.error : styles.success}>
                {status.msg}
            </p>
        )}
      </form>
    </div>
  );
}

// Simple internal styles for quick layout
const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' },
  oddsContainer: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  card: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '30%', cursor: 'pointer', transition: '0.3s' },
  cardActive: { border: '2px solid #28a745', backgroundColor: '#e9f7ef', padding: '15px', borderRadius: '8px', width: '30%', cursor: 'pointer' },
  form: { border: '1px solid #eee', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  inputGroup: { marginBottom: '15px', textAlign: 'left' },
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' },
  button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' },
  summary: { backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', marginBottom: '15px' },
  error: { color: 'red', marginTop: '10px' },
  success: { color: 'green', marginTop: '10px' }
};

export default App;

```

---

### **How it Works**

1. **Selection Logic:** I created three "cards" for the outcomes (Vietnam, Draw, China). When a user clicks a card, the `selection` state updates.
2. **Calculation:** The app automatically calculates `amount * rate` and displays the "Potential Return" before the user clicks submit.
3. **Database Save (`addDoc`):** When the user clicks Confirm, the app sends a JSON object to a Firestore collection named `bets`. It saves:
* Who bet (`user_name`)
* How much (`bet_amount`)
* What they picked (`selected_team`)
* The timestamp


4. **User Feedback:** It shows a "Saving..." text while uploading and a success message once the data is in Firebase.

### **Next Step**

Would you like me to write a **"Admin Dashboard" component** so you can see a list of everyone who has bet and calculate the total money in the pool?