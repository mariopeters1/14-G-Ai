// Clean all messages from ai-careers-chat/public-chat/messages
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl9JSHN0bmpjHBWzDLB5LR_P3CeGGf35c",
  authDomain: "gastronomic-ai-landing.firebaseapp.com",
  projectId: "gastronomic-ai-landing",
  storageBucket: "gastronomic-ai-landing.firebasestorage.app",
  messagingSenderId: "579498745024",
  appId: "1:579498745024:web:8e28c7b1e6c23c8f73b5a4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanChat() {
  const messagesRef = collection(db, "ai-careers-chat", "public-chat", "messages");
  const snap = await getDocs(messagesRef);
  console.log(`Found ${snap.size} messages to delete...`);
  
  let deleted = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, "ai-careers-chat", "public-chat", "messages", d.id));
    deleted++;
    process.stdout.write(`\rDeleted ${deleted}/${snap.size}`);
  }
  console.log("\n✅ All messages cleaned!");
  process.exit(0);
}

cleanChat().catch(console.error);
