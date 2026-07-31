import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

import { supabaseClient } from "@/lib/supabase/supabase-client";

export function useAuth() {
  // States
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  // Use effects
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);

      try {
        const { data, error } = await supabaseClient.auth.getUser();

        if (error) return setError(error.message);
        if (!data) return setUser(null);

        setUser(data.user);
      } finally {
        setLoading(false);
      }
    }

    if (loading) checkAuth();
  }, [loading]);

  useEffect(() => {
    function listenAuthChange() {
      supabaseClient.auth.onAuthStateChange((event, session) => {
        setLoading(true);

        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }

        setLoading(false);
      });
    }

    if (!loading) listenAuthChange();
  }, [loading]);

  return { loading, user, error };
}