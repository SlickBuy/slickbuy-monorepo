"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/lib/schemas/auth";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errs[name]) setErrs((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const parsed = registerSchema.safeParse(form);
    if (parsed.success) {
      setErrs({});
      return true;
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      // keep the first error per field for simplicity
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrs(fieldErrors);
    return false;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload = {
      email: form.email,
      password: form.password,
      username: form.username,
      firstName: form.firstName,
      lastName: form.lastName,
    };
    const res = await register(
      payload as {
        email: string;
        password: string;
        username: string;
        firstName: string;
        lastName: string;
      }
    );
    setLoading(false);
    if (res.success) router.push("/");
    else setErrs({ submit: res.message || "Registration failed" });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={onChange}
          error={errs.firstName}
          placeholder="John"
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={onChange}
          error={errs.lastName}
          placeholder="Doe"
          required
        />
      </div>
      <Input
        label="Username"
        name="username"
        value={form.username}
        onChange={onChange}
        error={errs.username}
        placeholder="johndoe"
        helperText="This will be visible to other users"
        required
      />
      <Input
        label="Email Address"
        type="email"
        name="email"
        value={form.email}
        onChange={onChange}
        error={errs.email}
        placeholder="john@example.com"
        required
      />
      <Input
        label="Password"
        type="password"
        name="password"
        value={form.password}
        onChange={onChange}
        error={errs.password}
        placeholder="Create a strong password"
        helperText="Must be at least 6 characters"
        required
      />
      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={onChange}
        error={errs.confirmPassword}
        placeholder="Confirm your password"
        required
      />
      {errs.submit && (
        <div className="text-red-500 text-sm text-center">{errs.submit}</div>
      )}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
