import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";

export default function ShareDemo() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const pin = params.get("pin")?.toUpperCase() || "";

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (pin && copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied, pin]);

  const copyPin = () => {
    if (!pin) return;
    navigator.clipboard.writeText(pin);
    setCopied(true);
    toast.success("PIN copied to clipboard");
  };

  const joinUrl = pin ? `${typeof window !== "undefined" ? window.location.origin : ""}/quiz-library?pin=${pin}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Share this PIN</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Students enter this PIN on the Join Quiz page to join your session.
        </p>
        {pin ? (
          <>
            <div className="text-4xl font-mono font-bold tracking-widest mb-6 bg-slate-100 dark:bg-slate-800 py-4 px-6 rounded-xl">
              {pin}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={copyPin} variant="outline" size="lg" className="gap-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copied!" : "Copy PIN"}
              </Button>
              <Button
                onClick={() => window.open(joinUrl, "_blank")}
                className="btn-primary gap-2"
              >
                <ExternalLink className="w-5 h-5" /> Open Join page
              </Button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Or share this link so the PIN is pre-filled:
            </p>
            <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 break-all mb-8">
              {joinUrl}
            </p>
          </>
        ) : (
          <p className="text-slate-500 mb-6">No PIN in URL. Start from the dashboard.</p>
        )}
        <Button variant="ghost" onClick={() => navigate("/teacher-dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
