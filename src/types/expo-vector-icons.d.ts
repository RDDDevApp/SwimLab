declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  type IconComponent = ComponentType<IconProps> & {
    glyphMap: Record<string, number>;
  };

  export const Ionicons: IconComponent;
  export const MaterialCommunityIcons: IconComponent;
  export const MaterialIcons: IconComponent;
  export const FontAwesome: IconComponent;
  export const Feather: IconComponent;
  export const AntDesign: IconComponent;
  export const Entypo: IconComponent;
}
