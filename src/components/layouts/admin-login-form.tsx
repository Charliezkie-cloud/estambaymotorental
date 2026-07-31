"use client";

import { EyeClosed, EyeIcon, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabaseClient } from "@/lib/supabase/supabase-client";
import { CardContent, CardFooter } from "@/components/ui/card";

export default function AdminLoginForm() {
  // Hooks
  const { loading, user, error } = useAuth();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Handlers
  async function handleFormSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (loginError)
        toast.error("Login Failed", {
          description: loginError.message
        });
    } finally {
      setLoginLoading(false);
    }
  }

  function togglePassword() {
    setPasswordShow(prev => !prev);
  }

  // Use effects
  useEffect(() => {
    if (error)
      toast.error("Session Failed", {
        description: error
      });

    if (!loading && user)
      return redirect("/admin");
  }, [loading, user, error]);

  return (
    <>
      <CardContent>
        <form onSubmit={handleFormSubmit} id="admin-login-form">
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="emailAddress">Email</FieldLabel>
                <Input type="email" name="emailAddress" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" placeholder="e.g. example@email.com" required />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput type={passwordShow ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" required />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton onClick={togglePassword}>
                      {passwordShow ? <EyeIcon /> : <EyeClosed />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>

      <CardFooter>
        <Button type="submit" form="admin-login-form" className="ms-auto" disabled={loginLoading}>
          Login{" "}
          {loginLoading && <Loader2 className="animate-spin" />}
        </Button>
      </CardFooter>
    </>
  );
}