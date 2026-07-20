"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error | null; info?: string | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, info: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ info: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-red-600">Client error</h2>
          <div className="mt-4 bg-gray-100 p-4 rounded">
            <pre className="text-sm text-red-800">
              {String(this.state.error)}
            </pre>
            <pre className="text-xs text-gray-700 mt-2">{this.state.info}</pre>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
