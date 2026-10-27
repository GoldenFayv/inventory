import { ImageResponse } from "next/og";

export const alt = "TallyHouse — Inventory and Sales Tracker";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#F4F7F8",
          color: "#1A2B3C",
        }}
      >
        <div
          style={{
            fontSize: 30,
            color: "#268F79",
            marginBottom: 30,
          }}
        >
          TallyHouse
        </div>

        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 950,
          }}
        >
          Keep track of your stock and sales.
        </div>

        <div
          style={{
            fontSize: 28,
            color: "#64748B",
            marginTop: 28,
          }}
        >
          Inventory, sales and customer credit in one place.
        </div>
      </div>
    ),
    size
  );
}