import os from "node:os";
import type { NextConfig } from "next";

const lanOrigins = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactCompiler: true,
  allowedDevOrigins: lanOrigins,
};

export default nextConfig;
