"use client";

import { EyeClosed, EyeIcon, Loader2, Lock, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
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
  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error: loginError } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (loginError) {
        toast.error("Login Failed", {
          description: loginError.message,
        });
      }
    } finally {
      setLoginLoading(false);
    }
  }

  function togglePassword() {
    setPasswordShow(prev => !prev);
  }

  // Use effects
  useEffect(() => {
    if (error) {
      toast.error("Session Failed", {
        description: error,
      });
    }

    if (!loading && user) {
      return redirect("/admin");
    }
  }, [loading, user, error]);

  return (
    <>
      <CardContent className="pt-2 pb-4">
        <form onSubmit={handleFormSubmit} id="admin-login-form" className="space-y-4">
          <FieldSet>
            <FieldGroup className="space-y-4">
              <Field className="space-y-1.5">
                <FieldLabel htmlFor="emailAddress" className="text-xs font-medium text-foreground">
                  Email
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="emailAddress"
                    type="email"
                    name="emailAddress"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="admin@estambay.com"
                    required
                  />
                </InputGroup>
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel htmlFor="password" className="text-xs font-medium text-foreground">
                  Password
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Lock className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type={passwordShow ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      onClick={togglePassword}
                      title={passwordShow ? "Hide password" : "Show password"}
                    >
                      {passwordShow ? <EyeIcon className="size-4" /> : <EyeClosed className="size-4" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </CardContent>

      <CardFooter className="pb-6 pt-2">
        <Button
          type="submit"
          form="admin-login-form"
          className="w-full font-medium"
          disabled={loginLoading}
        >
          {loginLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </CardFooter>
    </>
  );
}