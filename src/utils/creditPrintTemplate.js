import { settingsState } from '../store/settings'
import { logoBase64 } from './logo'
import { formatLocalDate } from './dates'

/**
 * Generates the complete print HTML layout for a Gold Credit transaction.
 * 
 * @param {Object} params
 * @param {Object} params.credit - The credit transaction reactive/plain object
 * @param {Object} params.customer - The customer object associated with the credit
 * @param {Array} params.itemList - The list of items in the credit transaction
 * @param {Array} params.activeEmployees - The list of active employees
 * @returns {string} The final HTML string
 */
export function generateCreditPrintHTML({ credit, customer, itemList = [], activeEmployees = [] }) {
  const emp = activeEmployees.find(e => e.id === credit.employee_id)
  const employeeName = emp ? emp.name : 'Unassigned'
  const customerName = customer ? `${customer.fname} ${customer.lname}` : '—'
  const creditDate = credit.created_at ? formatLocalDate(credit.created_at, 'long') : formatLocalDate(new Date().toISOString(), 'long')
  const finalPayout = `$${(credit.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // Format breakdown rows
  let itemsHTML = ''
  itemList.forEach(item => {
    const itemName = item.itemObj ? item.itemObj.name : 'Unknown Item'
    const unitText = item.itemObj?.value3 === 'Other' ? 'units' : 'g'
    const formattedPrice = item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const formattedValue = item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    itemsHTML += `
      <tr>
        <td>${itemName}</td>
        <td class="right">${item.weight} ${unitText}</td>
        <td class="right">$${formattedPrice}/${unitText}</td>
        <td class="right font-weight-bold">$${formattedValue}</td>
      </tr>
    `
  })

  // Format attached images
  let imagesHTML = ''
  if (credit.credit_images && Array.isArray(credit.credit_images)) {
    credit.credit_images.forEach(img => {
      // Resolve full URL
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
          ${img.note ? `<p>${img.note.trim()}</p>` : ''}
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
      width: 8.5in;
      height: 11in;
      margin: 0;
      padding: 0.5in;
      font-family: Arial, sans-serif;
      color: black;
      background: white;
    }
    @page {
      size: letter;
      margin: 0mm;
    }
    .print-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .logo {
      max-height: 0.9in;
      max-width: 100%;
      object-fit: contain;
    }
    .title {
      font-size: 1.8em;
      font-weight: bold;
      text-transform: uppercase;
      text-align: right;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .meta-table td {
      padding: 6px;
      font-size: 1.1em;
    }
    .meta-label {
      font-weight: bold;
      color: #555;
      width: 15%;
    }
    .meta-value {
      border-bottom: 1px solid #ccc;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th, .items-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .items-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .items-table td.right, .items-table th.right {
      text-align: right;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.2em;
      background-color: #dff1d0ff;
    }
    .warning-box {
      border: 2px solid red;
      color: red;
      font-weight: bold;
      text-align: center;
      padding: 10px;
      font-size: 1.2em;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    .notes-box {
      border: 1px solid #ccc;
      padding: 15px;
      min-height: 100px;
      margin-bottom: 30px;
      font-size: 1em;
      background-color: #fafafa;
      white-space: pre-wrap;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 40px;
    }
    .image-card {
      border: 1px solid #ccc;
      padding: 4px;
      display: flex;
      flex-direction: column;
    }
    .image-card img {
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }
    .image-card p {
      font-size: 0.8em;
      margin: 4px 0 0 0;
      text-align: center;
      color: #666;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: auto;
      padding-top: 20px;
    }
    .sig-line {
      width: 45%;
      border-top: 1.5px solid black;
      text-align: center;
      padding-top: 6px;
      font-weight: bold;
      font-size: 1em;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div>
      <table class="header-table">
        <tr>
          <td style="width: 30%;"><img class="logo" src="${logoBase64}" alt="Logo"></td>
          <td class="title" style="width: 70%;">Scrap Gold Credit Record</td>
        </tr>
      </table>

      <table class="meta-table">
        <tr>
          <td class="meta-label">Customer:</td>
          <td class="meta-value" colspan="3">${customerName}</td>
        </tr>
        <tr>
          <td class="meta-label">Date:</td>
          <td class="meta-value">${creditDate}</td>
          <td class="meta-label" style="padding-left:20px;">Employee:</td>
          <td class="meta-value">${employeeName}</td>
        </tr>
      </table>

      <div class="warning-box">
        ALL PURCHASES ARE FINAL - NO EXCEPTIONS
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item / Karat</th>
            <th class="right">Weight (g) / Qty</th>
            <th class="right">Unit Price</th>
            <th class="right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
          <tr class="total-row">
            <td colspan="3" class="right">Grand Total:</td>
            <td class="right">${finalPayout}</td>
          </tr>
        </tbody>
      </table>

      ${credit.note ? `
      <div style="font-weight:bold; margin-bottom:5px;">Credit Notes:</div>
      <div class="notes-box">${credit.note.trim()}</div>
      ` : ''}

      ${imagesHTML ? `
      <div style="font-weight:bold; margin-bottom:5px;">Attached Photos:</div>
      <div class="images-grid">${imagesHTML}</div>
      ` : ''}
    </div>

    <div class="signatures">
      <div class="sig-line">Customer Signature</div>
      <div class="sig-line">Cheque/Invoice #</div>
    </div>
  </div>
</body>
</html>
  `
}
