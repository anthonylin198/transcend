import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigation } from "expo-router";
import { View } from "react-native";

const tabBarStyle = {
  borderTopWidth: 1,
  borderTopColor: "#1F2937",
  backgroundColor: "black",
  height: 84,
  paddingTop: 10,
} as const;

type OverlayControls = {
  mount: (node: ReactNode) => void;
  unmount: () => void;
};

const LogOverlayContext = createContext<OverlayControls | null>(null);

export function LogOverlayHost({ children }: { children: ReactNode }) {
  const navigation = useNavigation();
  const [overlay, setOverlay] = useState<ReactNode>(null);
  const controls = useMemo<OverlayControls>(
    () => ({
      mount: (node) => setOverlay(node),
      unmount: () => setOverlay(null),
    }),
    [],
  );

  useLayoutEffect(() => {
    if (!overlay) return;
    navigation.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      navigation.setOptions({ tabBarStyle });
    };
  }, [navigation, overlay]);

  return (
    <LogOverlayContext.Provider value={controls}>
      <View style={{ flex: 1 }}>
        {children}
        {overlay}
      </View>
    </LogOverlayContext.Provider>
  );
}

export function LogOverlaySlot({ children }: { children: ReactNode }) {
  const controls = useContext(LogOverlayContext);
  const mount = controls?.mount;
  const unmount = controls?.unmount;

  useLayoutEffect(() => {
    if (!mount || !unmount) return;
    mount(children);
    return () => unmount();
    // The form stays mounted for the whole time it is open. Re-running this
    // when the parent renders would wipe calories the user already typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mount, unmount]);

  if (!controls) return children;
  return null;
}
