import type { ScanSession } from "@/lib/scanSession";
import type { FarmProfile } from "@/lib/profile";
import type { AppStrings } from "@/lib/i18n";
import { tpl } from "@/lib/i18n";
import { hasSafetyInfo } from "@/lib/diagnosis";
import type { ActionStep, FarmImpactEstimate, RiskProfile } from "@/lib/diagnosisReport";

interface PrintableReportProps {
  session: ScanSession;
  profile: FarmProfile;
  t: AppStrings;
  actionPlan: ActionStep[];
  risk: RiskProfile;
  untreatedPrognosis: string | null;
  farmImpact: FarmImpactEstimate | null;
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * A separate, print-only render of the diagnosis — the interactive dark
 * theme (sidebar, dark card fills, buttons) is deliberately not reused here
 * since it prints as near-solid ink and loses all its layout on paper. This
 * is plain, light-background, single-column, real content only.
 */
export default function PrintableReport({
  session,
  profile,
  t,
  actionPlan,
  risk,
  untreatedPrognosis,
  farmImpact,
}: PrintableReportProps) {
  const { result, imageDataUrl, crop, capturedAt, elapsedMs } = session;
  const capturedDate = new Date(capturedAt);
  const printedAt = new Date();
  const location = [profile.lga, profile.state, profile.country].filter(Boolean).join(", ");

  return (
    <div className="text-black" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "11px", lineHeight: 1.4 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: 6, breakAfter: "avoid" }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="" style={{ height: 28, width: 28, objectFit: "contain", display: "inline-block", verticalAlign: "middle", marginRight: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 16, verticalAlign: "middle" }}>AgroVision AI</span>
          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Crop Diagnosis Report</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 10.5, color: "#444" }}>
          <div>Printed {printedAt.toLocaleString()}</div>
          <div>Captured {capturedDate.toLocaleString()}</div>
        </div>
      </header>

      <section style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 20px", breakInside: "avoid" }}>
        <div>
          <strong>{t.farmer}:</strong> {profile.name}
        </div>
        <div>
          <strong>{t.location}:</strong> {location || "—"}
        </div>
        <div>
          <strong>{t.farmProfile}:</strong> {profile.farm}
        </div>
        <div>
          <strong>{t.farmSize}:</strong> {profile.size}
        </div>
        <div>
          <strong>{t.cropLabel} scanned:</strong> {crop}
        </div>
        <div>
          <strong>{t.growthStage}:</strong> {profile.stage}
        </div>
      </section>

      <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid #ccc" }} />

      <section style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 14, breakInside: "avoid" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageDataUrl}
          alt="Captured leaf"
          style={{ width: 150, height: 150, objectFit: "cover", border: "1px solid #000", borderRadius: 4 }}
        />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{result.label}</div>
          <div style={{ fontSize: 11.5, color: "#444", marginTop: 2 }}>
            {capitalize(result.type)}
            {result.crop !== "Unknown" && ` · ${result.crop}`}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11.5 }}>
            <div>
              <strong>{t.factConfidence}:</strong> {Math.round(result.confidence * 100)}%
            </div>
            <div>
              <strong>{t.factSeverity}:</strong> {capitalize(result.severity)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11.5 }}>
            <div>
              <strong>{t.risk}:</strong> {risk.riskLabel}
            </div>
            <div>
              <strong>{t.actWithin}:</strong> {risk.actWithin}
            </div>
            <div>
              <strong>{t.outlook}:</strong> {risk.outlook}
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 10.5, color: "#444" }}>
            {tpl(t.diagnosisCompleteTpl, { seconds: (elapsedMs / 1000).toFixed(1) })}
          </div>
        </div>
      </section>

      {(result.explanation || result.description) && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.gemmasReading}</h2>
          <p style={{ marginTop: 6 }}>{result.explanation || result.description}</p>
        </section>
      )}

      {actionPlan.length > 0 && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.actionPlan}</h2>
          <table style={{ width: "100%", marginTop: 6, borderCollapse: "collapse" }}>
            <tbody>
              {actionPlan.map((step) => (
                <tr key={step.stage} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "5px 8px 5px 0", verticalAlign: "top", whiteSpace: "nowrap", fontWeight: 700, fontSize: 10.5 }}>
                    {step.stage}
                    <div style={{ fontWeight: 400, color: "#666", fontSize: 10 }}>{step.dateLabel}</div>
                  </td>
                  <td style={{ padding: "5px 0" }}>
                    <div style={{ fontWeight: 700 }}>{step.title}</div>
                    {step.note && <div style={{ color: "#444", fontSize: 11 }}>{step.note}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {result.products.length > 0 ? (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.recommendedTreatments}</h2>
          <table style={{ width: "100%", marginTop: 6, borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000" }}>
                <th style={{ textAlign: "left", padding: "4px 8px 4px 0" }}>Product</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>{t.dose}</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>{t.reEntry}</th>
                <th style={{ textAlign: "left", padding: "4px 8px" }}>{t.preHarvest}</th>
                <th style={{ textAlign: "left", padding: "4px 0" }}>{t.relativeCost}</th>
              </tr>
            </thead>
            <tbody>
              {result.products.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "5px 8px 5px 0", fontWeight: 700 }}>
                    {p.name}
                    <div style={{ fontWeight: 400, color: "#666" }}>{p.category}</div>
                  </td>
                  <td style={{ padding: "5px 8px" }}>{p.dose || "—"}</td>
                  <td style={{ padding: "5px 8px" }}>{p.reEntryInterval}</td>
                  <td style={{ padding: "5px 8px" }}>{p.harvestWaitingPeriod}</td>
                  <td style={{ padding: "5px 0" }}>{capitalize(p.costTier)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : result.treatment.length > 0 ? (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.recommendedTreatments}</h2>
          <ol style={{ marginTop: 6, paddingLeft: 18 }}>
            {result.treatment.map((step, i) => (
              <li key={i} style={{ marginBottom: 3 }}>
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {hasSafetyInfo(result.safety) && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.safety}</h2>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {result.safety.protectiveEquipment.length > 0 && <li>{tpl(t.wearTpl, { items: result.safety.protectiveEquipment.join(", ") })}</li>}
            {result.safety.applicationTiming !== "Not applicable" && <li>{result.safety.applicationTiming}</li>}
            {result.safety.reEntryInterval !== "Not applicable" && <li>{tpl(t.reEntryTpl, { value: result.safety.reEntryInterval })}</li>}
            {result.safety.harvestWaitingPeriod !== "Not applicable" && (
              <li>{tpl(t.beforeHarvestTpl, { value: result.safety.harvestWaitingPeriod })}</li>
            )}
          </ul>
        </section>
      )}

      {result.prevention.length > 0 && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>Prevention</h2>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {result.prevention.map((p, i) => (
              <li key={i} style={{ marginBottom: 3 }}>
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

      {untreatedPrognosis && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.ifLeftUntreated}</h2>
          <p style={{ marginTop: 6 }}>{untreatedPrognosis}</p>
        </section>
      )}

      {farmImpact && (
        <section style={{ marginTop: 10, breakInside: "avoid" }}>
          <h2 style={{ fontSize: 12, borderBottom: "1px solid #000", paddingBottom: 2, marginBottom: 0 }}>{t.estimatedFarmImpact}</h2>
          <div style={{ display: "flex", gap: 24, marginTop: 6 }}>
            <div>
              <div style={{ color: "#666", fontSize: 10.5 }}>{t.expectedYieldTreated}</div>
              <div style={{ fontWeight: 700 }}>{farmImpact.expectedYieldTreatedTonnes} t</div>
            </div>
            <div>
              <div style={{ color: "#666", fontSize: 10.5 }}>{t.expectedYieldUntreated}</div>
              <div style={{ fontWeight: 700 }}>{farmImpact.expectedYieldUntreatedTonnes} t</div>
            </div>
            <div>
              <div style={{ color: "#666", fontSize: 10.5 }}>{t.incomeProtected}</div>
              <div style={{ fontWeight: 700 }}>≈ ₦{Math.round(farmImpact.incomeProtectedNaira).toLocaleString("en-NG")}</div>
            </div>
          </div>
          <p style={{ marginTop: 6, fontSize: 10, color: "#666" }}>
            {tpl(t.indicativeDisclaimerTpl, { area: farmImpact.areaHectares, crop: farmImpact.cropLabel.toLowerCase() })}
          </p>
        </section>
      )}

      <footer style={{ marginTop: 14, borderTop: "1px solid #000", paddingTop: 6, fontSize: 9, color: "#666" }}>
        Generated by AgroVision AI, powered by Gemma 4 — informational only, not a substitute for professional agronomic
        or extension advice. Stored on this device only.
      </footer>
    </div>
  );
}
