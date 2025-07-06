import {Fragment, MouseEvent, useMemo, useState} from "react";
import loadingLoopIcon from "./assets/line-md--loading-alt-loop.svg";

export interface IconifyIconProps {
  baseUrl: string | URL;
  icon: string;
  onClick: (e: MouseEvent<HTMLElement>) => void;
}

const IconifyIcon = (props: IconifyIconProps) => {
  const [loading, setLoading] = useState<boolean>(true);

  const url = useMemo(() => {
    const iconSplitted = props.icon.split(":");
    const url = new URL(
      `/${iconSplitted[0]}/${iconSplitted[1]}.svg?height=24`,
      props.baseUrl,
    );
    return url.toString();
  }, [props.icon, props.baseUrl]);

  const handleLoadIcon = () => setLoading(false);

  const buttonStyle = {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "32px",
    minHeight: "32px",
    transition: "background-color 0.2s ease",
  };

  const buttonHoverStyle = {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    cursor: "not-allowed",
    opacity: 0.6,
  };

  return (
    <Fragment>
      {loading && (
        <button
          disabled
          style={disabledButtonStyle}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.backgroundColor =
                buttonHoverStyle.backgroundColor;
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}>
          <img
            src={loadingLoopIcon}
            alt="Loading"
            style={{width: "24px", height: "24px"}}
          />
        </button>
      )}
      <button
        onClick={props.onClick}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor =
            buttonHoverStyle.backgroundColor;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}>
        <img
          onLoad={handleLoadIcon}
          src={url}
          alt="Icon"
          style={{
            width: "24px",
            height: "24px",
            display: loading ? "none" : "block",
          }}
        />
      </button>
    </Fragment>
  );
};

export default IconifyIcon;
