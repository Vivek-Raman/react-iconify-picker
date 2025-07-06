import {
  ChangeEvent,
  ComponentType,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  Fragment,
  MouseEvent,
  useMemo,
  useState,
} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDebouncedCallback } from "use-debounce";
import arrowDropIcon from "./assets/arrow_drop_down_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import loadingLoopIcon from "./assets/line-md--loading-alt-loop.svg";
import warningIcon from "./assets/mdi--warning-outline.svg";
import questionMarkIcon from "./assets/question_mark_24dp_E8EAED_FILL0_wght400_GRAD0_opsz24.svg";
import { search } from "./IconifyApiClient";
import IconifyIcon from "./IconifyIcon";

const API_BASE_URL = "https://api.iconify.design";
const DEFAULT_LIMIT = 48;

export interface LoadingComponentProps {
  count?: number;
}

const LoadingComponent = (props: LoadingComponentProps) => {
  const buttonStyle = {
    border: "none",
    background: "transparent",
    cursor: "not-allowed",
    padding: "4px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "32px",
    minHeight: "32px",
    opacity: 0.6,
  };

  return (
    <div>
      {Array(props.count || 20)
        .fill(0)
        .map((_, index) => (
          <button disabled key={index} style={buttonStyle}>
            <img
              src={loadingLoopIcon}
              alt="Loading"
              style={{ width: "24px", height: "24px" }}
            />
          </button>
        ))}
    </div>
  );
};

const ErrorComponent = () => (
  <div style={{ textAlign: "center", padding: "16px" }}>
    <img
      src={warningIcon}
      alt="Warning"
      style={{ width: "24px", height: "24px", marginBottom: "8px" }}
    />
    <div style={{ color: "#f57c00", fontSize: "14px" }}>
      Something went wrong when fetching the icons. Make sure your internet
      connection is working or try again later.
    </div>
  </div>
);

const initIconsDefault = [
  "mdi:airplane",
  "mdi:block-helper",
  "mdi:calendar-month",
  "mdi:camera-plus",
  "mdi:car-sports",
  "mdi:city",
  "mdi:cloud-arrow-down",
  "mdi:cog",
  "mdi:credit-card",
  "mdi:database",
  "mdi:delete",
  "mdi:dog",
  "mdi:earth",
  "mdi:eiffel-tower",
  "mdi:exit-run",
  "mdi:ferry",
  "mdi:fruit-pear",
  "mdi:gauge",
  "mdi:gas-station-in-use",
  "mdi:golf-cart",
  "mdi:hail",
  "mdi:home",
  "mdi:image-edit",
  "mdi:invoice-multiple",
  "mdi:karate",
  "mdi:leaf-maple",
  "mdi:lightbulb-on",
  "mdi:lock",
  "mdi:map",
  "mdi:map-marker",
  "mdi:meditation",
  "mdi:message-plus",
  "mdi:microphone-plus",
  "mdi:moped",
  "mdi:mower",
  "mdi:muffin",
  "mdi:music-circle",
  "mdi:paw",
  "mdi:penguin",
  "mdi:phone-classic",
  "mdi:phone-in-talk",
  "mdi:pine-tree",
  "mdi:play",
  "mdi:pliers",
  "mdi:puzzle",
  "mdi:radio",
  "mdi:receipt-text",
  "mdi:recycle",
];

interface InputBaseComponentProps {
  value?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  "data-size"?: string;
  "data-api-base-url"?: string;
  [key: string]: unknown;
}

const InputInputComponent = forwardRef(
  (props: InputBaseComponentProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const size = props["data-size"] === "small" ? "16" : "24";
    const value = useMemo(() => {
      let value = questionMarkIcon;
      if (props.value) {
        const baseUrl = props["data-api-base-url"];
        const splitted = props.value.split(":");
        const url = new URL(
          `/${splitted[0]}/${splitted[1]}.svg?height=24`,
          baseUrl,
        );
        value = url.toString();
      }
      return value;
    }, [props.value, props["data-api-base-url"]]);

    const buttonStyle = {
      ...props?.style,
      alignItems: "center",
      display: "flex",
      cursor: "pointer",
      border: "1px solid #ccc",
      borderRadius: "4px",
      padding: "8px 12px",
      backgroundColor: "#fff",
      minHeight: "40px",
      gap: "8px",
      transition: "border-color 0.2s ease",
    };

    const restProps = { ...props };
    delete restProps.style;
    delete restProps.onClick;
    delete restProps["data-size"];
    delete restProps["data-api-base-url"];
    delete restProps.value;

    return (
      <button
        ref={ref}
        {...restProps}
        style={buttonStyle}
        onClick={props.onClick}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "#1976d2";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "#ccc";
        }}>
        <img
          width={size + "px"}
          height={size + "px"}
          src={value}
          alt="Selected icon"
        />
        <img
          width={size + "px"}
          height={size + "px"}
          src={arrowDropIcon}
          alt="Dropdown arrow"
        />
      </button>
    );
  },
);

export interface IconifyPickerProps {
  inputProps?: {
    style?: CSSProperties;
    size?: "small" | "medium";
    [key: string]: unknown;
  };
  popoverProps?: {
    style?: CSSProperties;
    [key: string]: unknown;
  };
  value?: string | null;
  onChange?: (value: string | null, e: MouseEvent<HTMLElement>) => void;
  placeholderText?: string;
  slots?: {
    loading?: ComponentType<LoadingComponentProps>;
    error?: ComponentType;
  };
  apiBaseUrl?: string | URL;
  initIcons?: string[];
  prefixes?: string;
  prefix?: string;
  category?: string;
  limit?: number;
  variant?: "standard" | "filled" | "outlined";
}

const IconifyPicker = (props?: IconifyPickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [keyword, setKeyword] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [resultHasMore, setResultHasMore] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [internalValue, setInternalValue] = useState<string | null>(null);

  const Loading = props?.slots?.loading || LoadingComponent;
  const Error = props?.slots?.error || ErrorComponent;
  const size = props?.inputProps?.size || "medium";
  const apiBaseUrl = props?.apiBaseUrl || API_BASE_URL;
  const initIcons = props?.initIcons || initIconsDefault;
  const limit = props?.limit || DEFAULT_LIMIT;

  const value =
    typeof props?.value === "undefined" ? internalValue : props?.value;

  const debouncedSearch = useDebouncedCallback(
    // function
    (value: string) => {
      if (value.trim().length) {
        setLoading(true);
        search(
          apiBaseUrl,
          value,
          limit,
          results.length,
          props?.prefixes,
          props?.category,
          props?.prefix,
        )
          .then(data => {
            setLoading(false);
            setResults(data.icons);
            setResultHasMore(
              data.total === data.icons.length && data.total === limit,
            );
          })
          .catch(() => {
            setError(true);
            setLoading(false);
          });
      }
    },
    // delay in ms
    1000,
  );

  const handleClickPickerButton = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setKeyword("");
    setResults([]);
    setLoading(false);
    setError(false);
    setResultHasMore(false);
  };

  const handleNextInfiniteScroll = () => {
    search(
      apiBaseUrl,
      keyword,
      limit + results.length,
      results.length,
      props?.prefixes,
      props?.category,
      props?.prefix,
    )
      .then(data => {
        setResults(results.concat(data.icons));
        setResultHasMore(data.total === data.icons.length);
      })
      .catch(() => {
        setResultHasMore(false);
      });
  };

  const handleChangeSearchPhrase = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    setResults([]);
    setResultHasMore(false);
    setError(false);
    setLoading(true);
    debouncedSearch(value);
  };

  const handleClickIconButton =
    (iconName: string) => (e: MouseEvent<HTMLElement>) => {
      if (props?.onChange) {
        props.onChange(iconName, e);
      }
      setInternalValue(iconName);

      setAnchorEl(null);
      setKeyword("");
      setResults([]);
      setLoading(false);
      setError(false);
      setResultHasMore(false);
    };

  const popoverStyle: CSSProperties = {
    position: "absolute",
    top: anchorEl
      ? anchorEl.getBoundingClientRect().bottom + window.scrollY + 4
      : 0,
    left: anchorEl ? anchorEl.getBoundingClientRect().left + window.scrollX : 0,
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    zIndex: 1000,
    padding: "12px",
    display: anchorEl ? "block" : "none",
  };

  const searchInputStyle: CSSProperties = {
    width: "calc(100% - 32px)",
    padding: "8px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "8px",
    outline: "none",
  };

  const dividerStyle: CSSProperties = {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "8px 0",
    border: "none",
  };

  const scrollableBoxStyle: CSSProperties = {
    width: "240px",
    maxWidth: "100vw",
  };

  return (
    <Fragment>
      <InputInputComponent
        {...props?.inputProps}
        onClick={handleClickPickerButton}
        data-size={size}
        data-api-base-url={apiBaseUrl.toString()}
        value={value}
      />
      {anchorEl && (
        <div style={popoverStyle}>
          <div style={scrollableBoxStyle}>
            <InfiniteScroll
              dataLength={
                keyword.trim().length === 0 ? initIcons.length : results.length
              }
              hasMore={resultHasMore}
              height={"200px"}
              next={handleNextInfiniteScroll}
              loader={<Loading count={limit} />}>
              <input
                type="text"
                value={keyword}
                onChange={handleChangeSearchPhrase}
                style={searchInputStyle}
                placeholder={
                  props?.placeholderText || "Type anything to search..."
                }
              />
              <hr style={dividerStyle} />
              {error && <Error />}
              {keyword.trim().length === 0 &&
                !error &&
                initIcons.map((iconName, index) => (
                  <IconifyIcon
                    onClick={handleClickIconButton(iconName)}
                    baseUrl={apiBaseUrl}
                    icon={iconName}
                    key={index}
                  />
                ))}
              {keyword.trim().length > 0 &&
                !error &&
                results.length > 0 &&
                results.map((iconName, index) => (
                  <IconifyIcon
                    onClick={handleClickIconButton(iconName)}
                    baseUrl={apiBaseUrl}
                    icon={iconName}
                    key={index}
                  />
                ))}
              {keyword.trim().length > 0 &&
                loading &&
                !error &&
                results.length === 0 && <Loading count={limit} />}
            </InfiniteScroll>
          </div>
        </div>
      )}
      {anchorEl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={handleClosePopover}
        />
      )}
    </Fragment>
  );
};

export default IconifyPicker;
