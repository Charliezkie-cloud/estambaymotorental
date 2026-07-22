"use client";

import { EyeClosed, EyeIcon } from "lucide-react";
import React, { useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginForm() {
  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);

  // Handlers
  function handleFormSubmit(e: React.ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  function togglePassword() {
    setPasswordShow(prev => !prev);
  }

  return (
    <form onSubmit={handleFormSubmit}>
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

          <Field orientation="horizontal">
            <Button type="submit" className="ms-auto">Login</Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}