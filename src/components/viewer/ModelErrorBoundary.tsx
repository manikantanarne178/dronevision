import React from "react";
import { Html } from "@react-three/drei";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ModelErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error) {
    console.error("Model loading error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="rounded-lg bg-red-600 px-5 py-3 text-white shadow-xl">
            Failed to load 3D model
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}