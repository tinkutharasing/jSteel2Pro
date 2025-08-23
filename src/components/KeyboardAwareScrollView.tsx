import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView,
  Keyboard,
  Platform,
  KeyboardEvent,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardOffset?: number;
}

const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardOffset = 100,
  ...scrollViewProps
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleScrollToFocusedInput = (event: any) => {
    if (!isKeyboardVisible || !scrollViewRef.current) return;

    const { target } = event;
    if (target && target.measure) {
      target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const scrollToY = pageY - keyboardOffset;
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollToY),
          animated: true,
        });
      });
    }
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={style}
      contentContainerStyle={[
        contentContainerStyle,
        {
          paddingBottom: isKeyboardVisible ? keyboardHeight + 20 : 20,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        if (isKeyboardVisible && scrollViewRef.current) {
          // Auto-scroll to bottom when content changes and keyboard is visible
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }}
      {...scrollViewProps}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === 'TextInput') {
          return React.cloneElement(child, {
            onFocus: (event: any) => {
              // Call original onFocus if it exists
              if (child.props.onFocus) {
                child.props.onFocus(event);
              }
              // Handle scrolling to focused input
              handleScrollToFocusedInput(event);
            },
          });
        }
        return child;
      })}
    </ScrollView>
  );
};

export default KeyboardAwareScrollView;
