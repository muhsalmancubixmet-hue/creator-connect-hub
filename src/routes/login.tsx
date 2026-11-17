import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Building2, CheckCircle2, Lock, Mail, Sparkles, User, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessType, setBusinessType] = useState("Hospitality & Dining");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await register({
          email,
          password,
          company_name: companyName,
          contact_name: contactName,
          business_type: businessType,
        });
        toast.success("Business registered successfully!");
      }

      const destination = search?.redirect || "/";
      navigate({ to: destination as any });
    } catch (err: any) {
      let errorMsg = err.response?.data?.detail || err.response?.data?.message;

      // Extract granular field-level validation errors from Django REST framework
      if (!errorMsg && err.response?.data && typeof err.response.data === "object") {
        const fieldErrors = Object.entries(err.response.data).map(([field, msgs]) => {
          const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
          const msgText = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
          return `${fieldName}: ${msgText}`;
        });
        if (fieldErrors.length > 0) {
          errorMsg = fieldErrors.join(" | ");
        }
      }

      toast.error(errorMsg || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-soft">
            <Sparkles className="size-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            Influencers<span className="text-primary">.com</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Business Suite — Brand Management Workspace
          </p>
        </div>

        {/* Main Card */}
        <div className="card-elevated mt-6 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {mode === "login" ? "Sign In to Workspace" : "Register Brand Account"}
            </h2>
            <div className="flex rounded-lg bg-secondary/80 p-0.5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  mode === "login"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  mode === "signup"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="companyName" className="text-xs font-medium">
                    Company Trade Name
                  </Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="companyName"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Malabar Spice Co."
                      className="rounded-xl pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactName" className="text-xs font-medium">
                    Contact Representative
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contactName"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Varma"
                      className="rounded-xl pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessType" className="text-xs font-medium">
                    Industry Domain
                  </Label>
                  <Input
                    id="businessType"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. Food & Beverage, Fashion, Tech"
                    className="mt-1 rounded-xl"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-xs font-medium">
                Official Business Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="rounded-xl pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={mode === "signup" ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-xl pl-9"
                />
              </div>
              {mode === "signup" && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Must be at least 8 characters (letters, numbers & symbols).
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="mt-2 w-full rounded-xl" size="lg">
              {loading ? (
                "Processing..."
              ) : mode === "login" ? (
                <>
                  Sign In to Workspace <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  Create Business Workspace <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by enterprise JWT authentication. Need assistance? Contact{" "}
          <a href="mailto:support@influencers.com" className="text-primary underline">
            support@influencers.com
          </a>
        </p>
      </div>
    </div>
  );
}
