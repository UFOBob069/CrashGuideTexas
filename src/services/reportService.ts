// ============================================================
// CrashGuide Texas - Accident Report PDF Generator
// ============================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { AccidentReport, EvidenceItem } from '../types';

// ── Helpers ───────────────────────────────────────────────

function row(label: string, value: string | null | undefined) {
  if (!value) return '';
  return `
    <tr>
      <td class="label">${label}</td>
      <td class="value">${value}</td>
    </tr>`;
}

function section(title: string, content: string) {
  if (!content.trim()) return '';
  return `
    <div class="section">
      <h2>${title}</h2>
      <table>${content}</table>
    </div>`;
}

async function uriToBase64(uri: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // On web, fetch the file and convert to base64
      const resp = await fetch(uri);
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

const EVIDENCE_LABELS: Record<string, string> = {
  vehicle_damage: '🚗 Vehicle Damage',
  license_plate: '🔢 License Plates',
  scene: '📍 Accident Scene',
  injury: '🩹 Injuries',
  document: '📄 Documents',
  other: '📎 Other',
};

// ── Build HTML ─────────────────────────────────────────────

export function buildReportHtml(
  report: AccidentReport,
  photoDataUris: Map<string, string>,
): string {
  const d = report;

  const incidentRows =
    row('Date', d.incidentDate ? new Date(d.incidentDate).toLocaleDateString() : null) +
    row('City / State', d.incidentCity ? `${d.incidentCity}, ${d.incidentState}` : d.incidentState) +
    row('Type', d.incidentType?.replace(/_/g, ' ')) +
    row('Description', d.incidentDescription) +
    row('Location (GPS)', d.incidentLocation
      ? `${d.incidentLocation.latitude.toFixed(5)}, ${d.incidentLocation.longitude.toFixed(5)}`
      : null);

  const injuryRows =
    row('Severity', d.injurySeverity?.replace(/_/g, ' ')) +
    row('Description', d.injuryDescription) +
    row('Medical care received', d.medicalCareReceived === true ? 'Yes' : d.medicalCareReceived === false ? 'No' : null) +
    row('Intends to seek care', d.medicalCareIntent === true ? 'Yes' : d.medicalCareIntent === false ? 'No' : null);

  const liabilityRows =
    row('Fault assessment', d.liabilityClarity?.replace(/_/g, ' ')) +
    row('Details', d.faultDescription) +
    row('Police report filed', d.policeReportFiled === true ? 'Yes' : d.policeReportFiled === false ? 'No' : null) +
    row('Commercial vehicle', d.commercialVehicleInvolved ? 'Yes' : 'No') +
    row('Rideshare involved', d.rideshareInvolved ? 'Yes' : 'No');

  const od = d.otherDriverInfo;
  const otherDriverRows = od
    ? row('Name', od.name) +
      row('Phone', od.phone) +
      row("Driver's License", od.licenseNumber) +
      row('License Plate', od.licensePlate) +
      row('Vehicle', [od.vehicleYear, od.vehicleMake, od.vehicleModel].filter(Boolean).join(' ') || null) +
      row('Insurance Company', od.insuranceCompany) +
      row('Policy Number', od.insurancePolicyNumber)
    : '';

  const ci = d.contactInfo;
  const contactRows = ci
    ? row('Name', [ci.firstName, ci.lastName].filter(Boolean).join(' ')) +
      row('Phone', ci.phone) +
      row('Email', ci.email) +
      row('Preferred contact', ci.preferredContact)
    : '';

  // ── Photo sections grouped by type ──
  let photoSectionsHtml = '';
  if (d.evidence.length > 0) {
    const byType = new Map<string, EvidenceItem[]>();
    for (const item of d.evidence) {
      if (!byType.has(item.type)) byType.set(item.type, []);
      byType.get(item.type)!.push(item);
    }

    let allPhotoHtml = '';
    byType.forEach((items, type) => {
      const label = EVIDENCE_LABELS[type] ?? type.replace(/_/g, ' ');
      const thumbs = items.map((item) => {
        const src = photoDataUris.get(item.id);
        const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const gps = item.location
          ? `<span class="gps-tag">📍 GPS</span>`
          : '';
        if (src) {
          return `
            <div class="photo-card">
              <img src="${src}" alt="${label}" />
              <div class="photo-meta">${time} ${gps}</div>
            </div>`;
        }
        return `
          <div class="photo-card photo-card-missing">
            <div class="photo-placeholder">📷</div>
            <div class="photo-meta">${time} ${gps}</div>
          </div>`;
      }).join('');

      allPhotoHtml += `
        <div class="photo-group">
          <div class="photo-group-label">${label} (${items.length})</div>
          <div class="photo-grid">${thumbs}</div>
        </div>`;
    });

    photoSectionsHtml = `
      <div class="section">
        <h2>Evidence Photos (${d.evidence.length})</h2>
        ${allPhotoHtml}
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; color: #1a2942; background: #fff; padding: 32px; }
  .header { border-bottom: 3px solid #1B3A5C; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; color: #1B3A5C; }
  .header .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
  .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px;
           font-weight: bold; padding: 3px 10px; border-radius: 999px; margin-top: 8px; }
  .section { margin-bottom: 28px; }
  .section h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
                color: #1B3A5C; border-left: 3px solid #F5A623; padding-left: 10px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 7px 10px; font-size: 13px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
  td.label { width: 38%; color: #64748b; font-weight: 600; }
  td.value { color: #1a2942; }
  ul { padding-left: 20px; }
  li { font-size: 13px; margin-bottom: 4px; color: #1a2942; }

  /* Photo grid */
  .photo-group { margin-bottom: 16px; }
  .photo-group-label { font-size: 12px; font-weight: 700; color: #475569;
                       text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .photo-grid { display: flex; flex-wrap: wrap; gap: 10px; }
  .photo-card { width: 160px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
                background: #f8faff; }
  .photo-card img { width: 100%; height: 120px; object-fit: cover; display: block; }
  .photo-card-missing { display: flex; flex-direction: column; align-items: center;
                        justify-content: center; height: 150px; }
  .photo-placeholder { font-size: 32px; margin-bottom: 4px; }
  .photo-meta { font-size: 10px; color: #64748b; padding: 4px 6px;
                display: flex; align-items: center; gap: 4px; }
  .gps-tag { background: #EFF6FF; color: #1D4ED8; border-radius: 4px;
             padding: 1px 5px; font-size: 9px; font-weight: 600; }

  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0;
            font-size: 11px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
  <div class="header">
    <h1>CrashGuide Texas — Accident Report</h1>
    <div class="sub">Generated ${new Date().toLocaleString()}</div>
    <div class="badge">General information only — not legal advice</div>
  </div>

  ${section('Incident Details', incidentRows)}
  ${section('Injuries & Medical', injuryRows)}
  ${section('Liability & Fault', liabilityRows)}
  ${od ? section('Other Driver', otherDriverRows) : ''}
  ${photoSectionsHtml}
  ${ci ? section('Your Contact Info', contactRows) : ''}

  <div class="footer">
    This document was created with CrashGuide Texas.<br/>
    It is for personal reference only and does not constitute legal advice.
  </div>
</body>
</html>`;
}

// ── Export ─────────────────────────────────────────────────

export async function exportReportAsPdf(report: AccidentReport): Promise<void> {
  // Convert all evidence photos to base64 in parallel
  const photoDataUris = new Map<string, string>();
  if (report.evidence.length > 0) {
    await Promise.all(
      report.evidence.map(async (item) => {
        const dataUri = await uriToBase64(item.uri);
        if (dataUri) photoDataUris.set(item.id, dataUri);
      }),
    );
  }

  const html = buildReportHtml(report, photoDataUris);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Accident Report',
      UTI: 'com.adobe.pdf',
    });
  } else {
    await Print.printAsync({ uri });
  }
}
