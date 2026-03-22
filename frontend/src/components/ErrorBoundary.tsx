import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--background))]">
          <div className="max-w-md w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              {this.state.error.message}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
