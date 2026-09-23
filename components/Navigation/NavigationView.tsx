"use client";

import type {
  NavigationInstructionType,
} from '@/services/navigation/instructions';

interface NavigationViewProps {
  instructionType: NavigationInstructionType | null;
  distanceToInstruction: number;
  remainingDistance: number;
  destinationName: string | null;
  arrived: boolean;
  offRoute: boolean;
}

const instructionText: Record<NavigationInstructionType, string> = {
  straight: "مستقیم ادامه دهید",
  left: "به چپ بپیچید",
  right: "به راست بپیچید",
  arrive: "به مقصد رسیدید",
};

const instructionIcon: Record<NavigationInstructionType, string> = {
  straight: "↑",
  left: "←",
  right: "→",
  arrive: "✓",
};

export const NavigationView = ({
  instructionType,
  distanceToInstruction,
  remainingDistance,
  destinationName,
  arrived,
  offRoute,
}: NavigationViewProps) => {
  if (arrived) {
    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: "#dcfce7",
          color: "#166534",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          ✓
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          به مقصد رسیدید
        </div>

        {destinationName && (
          <div
            style={{
              textAlign: "center",
              marginTop: "6px",
            }}
          >
            {destinationName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: "16px",
      }}
    >
      {offRoute && (
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            background: "#fef3c7",
            color: "#92400e",
            marginBottom: "10px",
            fontWeight: 600,
          }}
        >
          از مسیر خارج شده‌اید
        </div>
      )}

      <div
        style={{
          padding: "16px",
          borderRadius: "14px",
          background: "#111827",
          color: "#ffffff",
        }}
      >
        {instructionType ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {instructionIcon[instructionType]}
              </div>

              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {instructionText[instructionType]}
                </div>

                {instructionType !== "arrive" && (
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "14px",
                      opacity: 0.75,
                    }}
                  >
                    {distanceToInstruction.toFixed(1)} واحد تا دستور بعدی
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            در حال محاسبه مسیر...
          </div>
        )}

        <div
          style={{
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span>مقصد</span>

          <strong>{destinationName ?? "نامشخص"}</strong>
        </div>

        <div
          style={{
            marginTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
          }}
        >
          <span>فاصله باقی‌مانده</span>

          <strong>{remainingDistance.toFixed(1)} واحد</strong>
        </div>
      </div>
    </div>
  );
};
