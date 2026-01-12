import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-gray-900 text-white min-h-screen">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Something went wrong.
          </h1>
          <div className="bg-gray-800 p-4 rounded overflow-auto">
            <h2 className="text-xl mb-2">Error:</h2>
            <pre className="text-red-300 mb-4 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
            <h2 className="text-xl mb-2">Stack Trace:</h2>
            <pre className="text-gray-400 text-xs whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
