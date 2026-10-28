import type { CSSProperties } from "react";
import { HONEYPOT_FIELD_NAME } from "@/app/lib/honeypot";

/**
 * Hidden honeypot field shared by all public forms.
 *
 * Bots typically fill in every input they can find, so any value submitted
 * for this field marks the request as automated. It is hidden from humans
 * and assistive technology.
 */

const hiddenStyles: CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "-9999px",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  opacity: 0,
  pointerEvents: "none",
};

export default function HoneypotField() {
  return (
    <div aria-hidden="true" style={hiddenStyles}>
      <label>
        Leave this field empty
        <input
          type="text"
          name={HONEYPOT_FIELD_NAME}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
