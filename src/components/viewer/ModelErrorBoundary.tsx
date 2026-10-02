import React from "react";
import { Html } from "@react-three/drei";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export default class ModelErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: undefined,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorMessage: error.message || String(error),
    };
  }

  componentDidCatch(error: Error) {
    console.error(`[PIPELINE_FAILURE]\nstage=MODEL_VIEWER\nurl=threejs_canvas\nerrorMessage=${error.message}`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="rounded-xl bg-slate-900/95 border border-rose-500/50 p-4 text-white shadow-2xl max-w-sm text-center space-y-2">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              3D Viewport Notice
            </p>
            <p className="text-xs font-semibold text-slate-200">
              3D model generated successfully, but the viewer encountered a rendering issue.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] text-slate-400 font-mono bg-black/40 p-2 rounded-lg border border-slate-700 break-all">
                {this.state.errorMessage}
              </p>
            )}
          </div>
        </Html>
      );
    }

    return this.props.children;
  }
}