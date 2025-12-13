import { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default function useUserRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setRole(null);
      setLoading(false);
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const loadRole = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setRole(snap.data().role || "user");
      } else {
        setRole("user");
      }
      setLoading(false);
    };

    loadRole();
  }, []);

  return { role, loading };
}
