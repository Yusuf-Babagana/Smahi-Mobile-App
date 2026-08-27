import * as React from "react";
import { createContext, useCallback, useContext, useMemo } from "react";
import { ExtensionStorage } from "@bacons/apple-targets";

// Initialize storage with your group ID
const storage = new ExtensionStorage(
  "group.com.<user_name>.<app_name>"
);

type WidgetContextType = {
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  // Update widget state whenever what we want to show changes
  React.useEffect(() => {
    // set widget_state to null if we want to reset the widget
    // storage.set("widget_state", null);

    // Refresh widget
    ExtensionStorage.reloadWidget();
  }, []);

  const refreshWidget = useCallback(() => {
    ExtensionStorage.reloadWidget();
  }, []);

  // refreshWidget is already stable, but the object literal itself wasn't
  // — every re-render of this provider (it wraps the entire app in
  // app/_layout.tsx) was still handing consumers of useWidget() a brand
  // new object, which is enough on its own to force a re-render even
  // though nothing inside it had actually changed.
  const value = useMemo(() => ({ refreshWidget }), [refreshWidget]);

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidget = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidget must be used within a WidgetProvider");
  }
  return context;
};
