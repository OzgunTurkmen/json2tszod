"use client";

/**
 * Error Boundary component.
 * Catches rendering errors in child components and displays a fallback UI.
 */

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
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

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-warning" />
          <p className="text-sm text-muted">
            {this.props.fallbackMessage ?? "Something went wrong."}
          </p>
          {this.state.error && (
            <p className="text-xs text-muted/60 max-w-md truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-surface-hover transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
