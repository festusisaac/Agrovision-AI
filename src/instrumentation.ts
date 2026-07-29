export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Some Windows networks (VPNs, certain adapters) stall on IPv6/AAAA DNS
    // resolution, surfacing as ENOTFOUND for hosts that resolve fine over
    // IPv4 (e.g. curl). Prefer IPv4 to avoid that for outbound Gemma calls.
    const dns = await import("node:dns");
    dns.setDefaultResultOrder("ipv4first");
  }
}
