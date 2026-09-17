import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

const DRAG_PRESS_GUARD_MS = 120;
const TOP_DISMISS_OVERSCROLL = 48;

const FormDraggingContext = createContext(false);

type KeyboardAwareFormScrollProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function KeyboardAwareFormScroll({
  children,
  contentContainerStyle,
}: KeyboardAwareFormScrollProps) {
  const restoreAfterDrag = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const beginDrag = useCallback(() => {
    if (restoreAfterDrag.current) {
      clearTimeout(restoreAfterDrag.current);
      restoreAfterDrag.current = null;
    }
    draggingRef.current = true;
    setIsDragging(true);
  }, []);

  const endDragSoon = useCallback(() => {
    if (restoreAfterDrag.current) {
      clearTimeout(restoreAfterDrag.current);
    }
    restoreAfterDrag.current = setTimeout(() => {
      draggingRef.current = false;
      setIsDragging(false);
      restoreAfterDrag.current = null;
    }, DRAG_PRESS_GUARD_MS);
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
      if (restoreAfterDrag.current) {
        clearTimeout(restoreAfterDrag.current);
      }
    };
  }, []);

  return (
    <FormDraggingContext.Provider value={isDragging}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={false}
        alwaysBounceVertical
        scrollEventThrottle={16}
        onScroll={(event) => {
          if (
            draggingRef.current &&
            event.nativeEvent.contentOffset.y < -TOP_DISMISS_OVERSCROLL
          ) {
            Keyboard.dismiss();
          }
        }}
        onScrollBeginDrag={beginDrag}
        onScrollEndDrag={endDragSoon}
        onMomentumScrollBegin={beginDrag}
        onMomentumScrollEnd={endDragSoon}
      >
        <View
          pointerEvents={isDragging && !keyboardVisible ? "none" : "auto"}
          style={{ gap: 18, flexGrow: 1 }}
        >
          {children}
        </View>
      </ScrollView>
    </FormDraggingContext.Provider>
  );
}

export function DescriptionTextInput({
  style,
  onFocus,
  onBlur,
  onSelectionChange,
  ...rest
}: TextInputProps) {
  const isDragging = useContext(FormDraggingContext);
  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      onPress={() => {
        inputRef.current?.focus();
      }}
      style={{ flexGrow: 1 }}
    >
      <TextInput
        ref={inputRef}
        {...rest}
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        pointerEvents={focused ? "auto" : "none"}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onSelectionChange={(event) => {
          if (isDragging) {
            const previous = selectionRef.current;
            requestAnimationFrame(() => {
              inputRef.current?.setNativeProps({ selection: previous });
            });
            return;
          }
          selectionRef.current = event.nativeEvent.selection;
          onSelectionChange?.(event);
        }}
        style={[
          {
            minHeight: 120,
            flexGrow: 1,
            paddingTop: 2,
            paddingBottom: 48,
          },
          style,
        ]}
      />
    </Pressable>
  );
}
