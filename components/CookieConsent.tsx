"use client";

import { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";

export default function CookieConsentBanner() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept"
            declineButtonText="Decline"
            enableDeclineButton
            cookieName="yemeni-market-cookie-consent"
            style={{
                background: "rgba(0, 0, 0, 0.95)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                alignItems: "center",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
            }}
            buttonStyle={{
                background: "var(--honey-gold)",
                color: "#000",
                fontSize: "14px",
                fontWeight: "bold",
                padding: "12px 32px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "1px"
            }}
            declineButtonStyle={{
                background: "transparent",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "normal",
                padding: "12px 32px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "1px"
            }}
            expires={365}
            onAccept={() => {
                console.log("Cookies accepted");
                // Enable analytics or other tracking here
            }}
            onDecline={() => {
                console.log("Cookies declined");
                // Disable analytics or other tracking here
            }}
        >
            <span style={{ fontSize: "14px", lineHeight: "1.6" }}>
                We use cookies to enhance your browsing experience and analyze site traffic.
                By clicking "Accept", you consent to our use of cookies.
                Read our{" "}
                <a
                    href="/privacy"
                    style={{
                        color: "var(--honey-gold)",
                        textDecoration: "underline"
                    }}
                >
                    Privacy Policy
                </a>{" "}
                for more information.
            </span>
        </CookieConsent>
    );
}
