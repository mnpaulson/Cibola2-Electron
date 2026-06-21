import { settingsState } from '../store/settings'
import { logoBase64 } from './logo'
import { formatLocalDate } from './dates'
import { calculateCustomSheetPricePer, calculateCustomSheetItemTotal } from './pricing'

function calculatePricePer(val) {
  return calculateCustomSheetPricePer(val.basePrice, val.priceModifier, val.markup)
}

function calculateItemTotal(val) {
  return calculateCustomSheetItemTotal(val.amt, val.basePrice, val.priceModifier, val.markup)
}

function calculateEstimateTotal(est) {
  if (!est || !est.estValues) return 0
  const total = est.estValues.reduce((sum, val) => sum + calculateItemTotal(val), 0)
  return Math.round(total * 100) / 100
}

/**
 * Generates the complete print HTML layout for a Custom Design Sheet.
 * 
 * @param {Object} params
 * @param {Object} params.sheet - The custom design sheet reactive/plain object
 * @param {Object} params.customer - The customer object associated with the sheet
 * @returns {string} The final HTML string
 */
export function generateCustomSheetPrintHTML({ sheet, customer }) {
  const customerName = customer ? `${customer.fname} ${customer.lname}` : '—'
  const customerPhone = customer?.phone || ''
  const customerEmail = customer?.email || ''
  const sheetDate = sheet.created_at ? formatLocalDate(sheet.created_at, 'long') : formatLocalDate(new Date().toISOString(), 'long')

  // Generate Estimate Columns
  let estimatesHTML = ''
  if (sheet.estimates && Array.isArray(sheet.estimates)) {
    sheet.estimates.forEach(est => {
      let itemsHTML = ''
      if (est.estValues && Array.isArray(est.estValues)) {
        est.estValues.forEach(val => {
          const amtVal = parseFloat(val.amt) || 0
          const priceVal = calculatePricePer(val)
          const totalVal = amtVal * priceVal
          
          itemsHTML += `
            <tr>
              <td class="item-name">${val.name || 'Unknown'}</td>
              <td class="item-type">${val.type || ''}</td>
              <td class="right">${amtVal.toFixed(2)}</td>
              <td class="right">$${priceVal.toFixed(2)}</td>
              <td class="right font-weight-bold">$${totalVal.toFixed(2)}</td>
            </tr>
          `
        })
      }

      const estTotal = calculateEstimateTotal(est)
      const primaryBadge = est.isPrimary ? '<span class="primary-badge">PRIMARY OPTION</span>' : ''

      estimatesHTML += `
        <div class="estimate-section">
          <div class="estimate-header">
            <h3>${est.name} ${primaryBadge}</h3>
            <p class="estimate-note">${est.note || ''}</p>
          </div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 35%;">Item / Description</th>
                <th style="width: 20%;">Category</th>
                <th style="width: 15%;" class="right">Amt / Weight(g)</th>
                <th style="width: 15%;" class="right">Price Per</th>
                <th style="width: 15%;" class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML || '<tr><td colspan="5" class="center italic">No items configured</td></tr>'}
            </tbody>
          </table>
          <div class="estimate-footer">
            Total Estimate Payout Value: <span class="total-amount">$${estTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      `
    })
  }

  // Format attached images
  let imagesHTML = ''
  if (sheet.custom_images && Array.isArray(sheet.custom_images)) {
    sheet.custom_images.forEach(img => {
      let fullUrl = ''
      if (img.image) {
        if (img.image.startsWith('data:')) {
          fullUrl = img.image
        } else {
          const base = settingsState.serverURL.replace(/\/$/, '')
          const path = img.image.startsWith('/') ? img.image : `/${img.image}`
          fullUrl = `${base}${path}`
        }
      }
      imagesHTML += `
        <div class="image-card">
          <img src="${fullUrl}" />
          <p>${img.note || ''}</p>
        </div>
      `
    })
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 0.4in;
      margin: 0;
      background: white;
      color: black;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .store-logo {
      height: 60px;
    }
    .store-info {
      text-align: right;
      font-size: 11px;
      line-height: 1.4;
    }
    .sheet-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      margin: 15px 0 5px 0;
    }
    .metadata-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
    }
    .metadata-table td {
      padding: 10px;
      font-size: 13px;
      border: 1px solid #ddd;
    }
    .estimate-section {
      margin-bottom: 30px;
      border: 1px solid #ccc;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .estimate-header {
      background-color: #f1f1f1;
      padding: 12px 15px;
      border-bottom: 1px solid #ccc;
    }
    .estimate-header h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .primary-badge {
      background-color: #4caf50;
      color: white;
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 10px;
      font-weight: bold;
    }
    .estimate-note {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th {
      background-color: #fafafa;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
      padding: 8px 15px;
      border-bottom: 1px solid #eee;
    }
    .items-table td {
      padding: 8px 15px;
      font-size: 12px;
      border-bottom: 1px solid #eee;
    }
    .right {
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .italic {
      font-style: italic;
    }
    .estimate-footer {
      background-color: #fafafa;
      padding: 12px 15px;
      text-align: right;
      font-size: 14px;
      font-weight: bold;
      border-top: 1px solid #eee;
    }
    .total-amount {
      color: #2e7d32;
      font-size: 18px;
      margin-left: 5px;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 30px;
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .image-card {
      border: 1px solid #ccc;
      padding: 4px;
      display: flex;
      flex-direction: column;
    }
    .image-card img {
      width: 100%;
      height: 1.2in;
      object-fit: cover;
    }
    .image-card p {
      font-size: 0.8em;
      margin: 4px 0 0 0;
      text-align: center;
      color: #666;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
    .signature-container {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .signature-box {
      width: 45%;
      border-top: 1px solid #999;
      text-align: center;
      padding-top: 5px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td>
        <img src="${logoBase64}" class="store-logo" />
      </td>
      <td class="store-info">
        <strong>Cibola II Admin Terminal</strong><br/>
        Jewelry Custom Design & Estimates<br/>
        Phone: (123) 456-7890 | Email: support@cibola.com
      </td>
    </tr>
  </table>

  <div class="sheet-title">Custom Design Sheet Estimate</div>
  
  <table class="metadata-table">
    <tr>
      <td style="width: 15%;"><strong>Sheet ID:</strong></td>
      <td style="width: 35%;">#${sheet.id || 'Draft'}</td>
      <td style="width: 15%;"><strong>Date:</strong></td>
      <td style="width: 35%;">${sheetDate}</td>
    </tr>
    <tr>
      <td><strong>Customer:</strong></td>
      <td>${customerName}</td>
      <td><strong>Contact:</strong></td>
      <td>${customerPhone} ${customerPhone && customerEmail ? '|' : ''} ${customerEmail}</td>
    </tr>
    <tr>
      <td><strong>Description:</strong></td>
      <td colspan="3">${sheet.name} ${sheet.note ? `<br/><small>${sheet.note}</small>` : ''}</td>
    </tr>
  </table>

  ${estimatesHTML}

  ${imagesHTML ? `
  <div style="font-weight:bold; margin-top:20px; margin-bottom:5px;">Attached Design Photos:</div>
  <div class="images-grid">${imagesHTML}</div>
  ` : ''}

  <div class="signature-container">
    <div class="signature-box" style="margin-top: 30px;">
      Consultant Signature
    </div>
    <div class="signature-box" style="margin-top: 30px;">
      Customer Authorization
    </div>
  </div>

  <div class="footer">
    <p>This document is a design estimation sheet. Final jewelry purchase and processing prices may vary based on market changes. Thank you for your business!</p>
  </div>
</body>
</html>
  `
}
