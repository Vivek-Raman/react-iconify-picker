import React from "react";

export interface IconifyPickerProps {
  inputProps?: {
    style?: React.CSSProperties;
    size?: "small" | "medium";
    [key: string]: unknown;
  };
  popoverProps?: {
    style?: React.CSSProperties;
    [key: string]: unknown;
  };
  value?: string | null;
  onChange?: (value: string | null, e: React.MouseEvent<HTMLElement>) => void;
  placeholderText?: string;
  slots?: {
    loading?: React.ComponentType<{count?: number}>;
    error?: React.ComponentType;
  };
  apiBaseUrl?: string | URL;
  initIcons?: string[];
  prefixes?: string;
  prefix?: string;
  category?: string;
  limit?: number;
  variant?: "standard" | "filled" | "outlined";
}

declare const IconifyPicker: React.FunctionComponent<IconifyPickerProps>;

export default IconifyPicker;
