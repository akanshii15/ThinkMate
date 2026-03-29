import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Zap, MessageSquare, Lightbulb } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ThinkMate</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/chat")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg"
                >
                  Open Chat
                </Button>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Make Better Decisions with AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            ThinkMate helps you think through complex problems systematically.
            Get structured analysis, pros/cons evaluation, and thoughtful recommendations.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg px-8 py-6 text-lg"
            >
              Start Thinking
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg px-8 py-6 text-lg"
            >
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-card">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "Structured Thinking",
                description: "Break down problems into clear, actionable steps",
              },
              {
                icon: Zap,
                title: "AI-Powered Analysis",
                description: "Get intelligent insights powered by advanced AI",
              },
              {
                icon: MessageSquare,
                title: "Conversational",
                description: "Chat naturally about your decisions and concerns",
              },
              {
                icon: Lightbulb,
                title: "Smart Recommendations",
                description: "Receive thoughtful, reasoned recommendations",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-lg border border-border hover:border-accent transition-all duration-300 ease-out bg-background"
                >
                  <Icon className="w-8 h-8 text-accent mb-3" />
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to think better?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start a conversation with ThinkMate today and transform how you approach decisions.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg px-8 py-6 text-lg"
            >
              Open Chat
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg px-8 py-6 text-lg"
            >
              Sign In to Start
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-muted-foreground">
        <p>&copy; 2026 ThinkMate. All rights reserved.</p>
      </footer>
    </div>
  );
}
