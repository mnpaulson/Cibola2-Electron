import { settingsState } from '../store/settings'
import { logoBase64 } from './logo'

/**
 * Normalizes and formats date strings for the print layout (MM-DD-YYYY).
 */
function formatPrintDate(dateStr) {
  if (!dateStr) return ''
  const clean = dateStr.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const parts = clean.split('-')
    return `${parts[1]}-${parts[2]}-${parts[0]}`
  }
  try {
    let parseableStr = clean
    if (clean.includes(' ') && !clean.includes('T')) {
      parseableStr = clean.replace(' ', 'T') + 'Z'
    }
    const d = new Date(parseableStr)
    if (isNaN(d.getTime())) return dateStr
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${mm}-${dd}-${yyyy}`
  } catch {
    return dateStr
  }
}

/**
 * Resolves local and server image URLs for rendering inside the print window.
 */
function getImageUrl(imgStr) {
  if (!imgStr) return ''
  if (imgStr.startsWith('data:')) {
    return imgStr
  }
  const base = settingsState.serverURL.replace(/\/$/, '')
  const path = imgStr.startsWith('/') ? imgStr : `/${imgStr}`
  return `${base}${path}`
}

/**
 * Generates the complete print HTML layout for a Job in an A4 4-quadrant layout.
 * 
 * @param {Object} params
 * @param {Object} params.job - The job reactive/plain object
 * @param {Object} params.customer - The customer object associated with the job
 * @param {Array} params.activeEmployees - The list of active employees
 * @returns {string} The final HTML string
 */
export function generateJobPrintHTML({ job, customer, activeEmployees = [] }) {
  const emp = activeEmployees.find(e => e.id === job.employee_id)
  const empName = emp ? emp.name : 'Unassigned'
  const estVal = parseFloat(String(job.estimate).replace(/,/g, '')) || 0
  const depVal = parseFloat(String(job.deposit).replace(/,/g, '')) || 0

  const createdDateStr = formatPrintDate(job.created_at || new Date().toISOString())
  const dueDateStr = job.due_date ? formatPrintDate(job.due_date) : ''

  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const todayDateStr = formatPrintDate(`${year}-${month}-${day}`)

  // Get first 16 images
  const jobImages = job.job_images && Array.isArray(job.job_images) ? job.job_images.slice(0, 16) : []

  const allItems = []

  for (let i = 0; i < jobImages.length; i++) {
    const img = jobImages[i]
    const imgUrl = getImageUrl(img.image)
    const imgNote = (img.note || '').trim()

    // Add Image Card
    allItems.push(`
      <div class="image-card">
        <div class="img-cell">
          <img src="${imgUrl}" />
        </div>
      </div>
    `)

    // Add Note Card if present
    if (imgNote) {
      allItems.push(`
        <div class="image-card note-card">
          <div class="note-text">${imgNote}</div>
        </div>
      `)
    }
  }

  const q1ImagesHTML = allItems.slice(0, 6).join('')
  const q2ImagesHTML = allItems.slice(6, 16).join('')

  // Bottom Customer Copy (up to 12 images split evenly across Q3 and Q4)
  let q3ImagesHTML = ''
  let q4ImagesHTML = ''
  const limit = Math.min(jobImages.length, 12)
  const q3Count = Math.ceil(limit / 2)
  const isTwoCol = jobImages.length > 6

  for (let i = 0; i < limit; i++) {
    const img = jobImages[i]
    const fullUrl = getImageUrl(img.image)
    const imgHTML = `
      <div class="cust-image-row">
        <img src="${fullUrl}" />
      </div>
    `
    if (i < q3Count) {
      q3ImagesHTML += imgHTML
    } else {
      q4ImagesHTML += imgHTML
    }
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
    @font-face {
      font-family: 'Material Icons';
      font-style: normal;
      font-weight: 400;
      src: local('Material Icons'), local('MaterialIcons-Regular'), url(https://fonts.gstatic.com/s/materialicons/v41/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
    }
    .material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    body {
      margin: 0;
      padding: 0;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: white;
      color: black;
      font-family: Arial, sans-serif;
    }
    @page {
      size: A4;
      margin: 0mm;
    }
    .page-container {
      width: 210mm;
      height: 287mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 156.5mm 130.5mm;
      position: relative;
      overflow: hidden;
      box-sizing: border-box;
    }
    .quadrant {
      width: 105mm;
      height: 100%;
      padding: 4.5mm 5mm;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      background: white;
    }
    
    /* Folding/Tearing boundaries */
    .q-top-left {
      border-right: 1px solid #FFF;
      border-bottom: 1px solid #FFF;
      justify-content: flex-start !important;
      padding-right: 2.5mm;
    }
    .q-top-right {
      border-bottom: 1px solid #FFF;
      justify-content: flex-start !important;
      padding-left: 2.5mm;
    }
    .q-bottom-left {
      border-right: 1px solid #FFF;
      padding-right: 2.5mm;
    }
    .q-bottom-right {
      padding-left: 2.5mm;
    }

    /* Fixed Height Blocks styling */
    .block {
      width: 100%;
      box-sizing: border-box;
    }
    .text-details {
      height: 60mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 0mm;
    }
    .q1-combined-row {
      display: flex;
      width: 100%;
      height: 15mm;
      gap: 0.5mm;
      box-sizing: border-box;
    }
    .q1-combined-row .info-block {
      flex: 1;
      height: 100%;
    }
    .blanks-block {
      display: flex;
      width: 100%;
      height: 10mm;
      border: 1px solid #000;
      border-radius: 4px;
      overflow: hidden;
    }
    .blank-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1px 3px;
      position: relative;
      border-right: 1px solid #000;
    }
    .blank-box:last-child {
      border-right: none;
    }
    .blank-box.col-flags {
      flex: 1.3;
    }
    .blank-box.col-deposit {
      flex: 0.9;
    }
    .blank-box.col-credit {
      flex: 0.9;
    }
    .blank-box.col-total {
      flex: 0.9;
    }
    .blank-label {
      font-size: 10px;
      color: #333;
      text-transform: uppercase;
      font-weight: bold;
    }
    .deposit-val {
      position: absolute;
      top: 1px;
      left: 3px;
      font-size: 20px;
      font-weight: bold;
    }
    
    .meta-row {
      display: flex;
      width: 100%;
      height: 7mm;
      gap: 0.5mm;
    }
    .meta-item {
      border: 1px solid #000;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 6px;
      font-size: 10px;
    }
    .job-id-box {
      flex: 1;
      font-size: 25px;
      font-weight: bold;
      justify-content: center;
      background-color: #f5f5f5;
    }
    .employee-box {
      flex: 1.5;
      font-weight: bold;
      justify-content: center;
      font-size: 18px;
    }

    .info-block {
      border: 1px solid #000;
      border-radius: 4px;
      width: 100%;
      height: 13mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      justify-content: center;
    }
    .block-content {
      padding: 2px 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      height: 100%;
    }
    .info-line {
      display: flex;
      align-items: center;
      font-size: 14px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .info-icon {
      font-size: 11px !important;
      margin-right: 5px;
      color: #6e6e6e;
    }

    .dates-block {
      height: 8mm;
      justify-content: center;
    }
    .row-content {
      flex-direction: row !important;
      justify-content: space-between;
      align-items: center;
    }
    .date-col {
      display: flex;
      align-items: center;
      width: 48%;
    }
    .date-icon {
      font-size: 20px !important;
      margin-right: 6px;
      color: #6e6e6e;
    }
    .date-val {
      font-size: 20px;
      font-weight: bold;
    }

    .date-urgent {
      color: red;
    }

    .estimate-block {
      height: 13mm;
    }
    .est-amount {
      font-size: 12px;
      font-weight: bold;
    }
    .est-note {
      font-size: 10.5px;
      color: #333;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }

    .notes-block {
      height: 18mm;
      margin-bottom: 2px;
    }
    .notes-content {
      font-size: 13px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }

    /* Ruled Writing Lines Background */
    .ruled-lines {
      background-image: linear-gradient(#ccc 1px, transparent 1px);
      background-size: 100% 5mm; /* 5mm line spacing */
      line-height: 5mm;
      padding-top: 1px !important;
      box-sizing: border-box;
    }

    /* Q1 & Q2: 2-Column Grid Layout */
    .image-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5mm;
      width: 100%;
      box-sizing: border-box;
    }
    .q1-grid {
      margin-top: 1.5mm;
    }
    .image-card {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #fff;
      box-sizing: border-box;
      width: 100%;
      border: 1px dashed #bbb;
    }
    .q1-grid .image-card, .q2-grid .image-card {
      height: 30mm;
    }
    .img-cell {
      width: 100%;
      height: 100%;
      background: #f9f9f9;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
    }
    .img-cell img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .note-card {
      padding: 6px 8px;
      justify-content: center;
      align-items: center;
      background: #fafafa;
      border: 1px dashed #bbb;
    }
    .note-text {
      font-size: 9.5px;
      color: #333;
      line-height: 1.3;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
      word-break: break-word;
      max-width: 100%;
      -webkit-line-clamp: 6;
    }

    /* Bottom-Left Quadrant (Q3) */
    .q-logo-section {
      width: 100%;
      height: 15mm;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .store-logo {
      max-height: 100%;
      object-fit: contain;
    }
    .cust-name-row {
      font-size: 15px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      margin-top: 4mm;
    }
    .q3-image-area, .q4-image-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5mm;
      width: 100%;
      margin-top: 2mm;
      box-sizing: border-box;
      overflow: hidden;
    }
    .two-col-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: 1fr;
      gap: 1.5mm;
    }
    .cust-image-row {
      width: 100%;
      flex: 1;
      min-height: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f9f9f9;
      border-radius: 4px;
      overflow: hidden;
      box-sizing: border-box;
    }
    .cust-image-row img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
    }

    /* Bottom-Right Quadrant (Q4) */
    .q4-combined-row {
      display: flex;
      width: 100%;
      height: 25mm;
      gap: 0.5mm;
      box-sizing: border-box;
    }
    .q4-col {
      flex: 1;
      border: 1px solid #000;
      border-radius: 4px;
      padding: 4px 6px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 1.2mm;
      box-sizing: border-box;
    }
    .q4-title {
      font-size: 8px;
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid #eee;
      padding-bottom: 2px;
      margin-bottom: 0px;
      color: #555;
    }
    .warning-container {
      position: absolute;
      bottom: 6mm;
      left: 5mm;
      right: 5mm;
      text-align: center;
      pointer-events: none;
      z-index: 10;
    }
    .warning-text {
      font-size: 14px;
      width: 100%;
      font-weight: bold;
      color: #000;
      text-transform: uppercase;
      line-height: 1.2;
      text-shadow: 
        -1.5px -1.5px 0 #fff,  
         1.5px -1.5px 0 #fff,
        -1.5px  1.5px 0 #fff,
         1.5px  1.5px 0 #fff,
        -1px -1px 0 #fff,  
         1px -1px 0 #fff,
        -1px  1px 0 #fff,
         1px  1px 0 #fff;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <!-- Quadrant 1 (Top Left): Office/Store Copy -->
    <div class="quadrant q-top-left">
      <div class="text-details">
        <!-- Blanks Box -->
        <div class="block blanks-block">
          <div class="blank-box col-flags">
            <span class="blank-label">EM R NA LM Check</span>
          </div>
          <div class="blank-box col-deposit">
            <span class="deposit-val">${depVal > 0 ? '$' + depVal.toFixed(2) : ''}</span>
            <span class="blank-label">Deposit</span>
          </div>
          <div class="blank-box col-credit">
            <span class="blank-label">Gold Credit</span>
          </div>
          <div class="blank-box col-total">
            <span class="blank-label">Total</span>
          </div>
        </div>
        
        <!-- Meta Row -->
        <div class="block meta-row">
          <div class="meta-item job-id-box"># ${job.id || ''}</div>
          <div class="meta-item employee-box">${empName}</div>
        </div>

        <!-- Combined Customer Info & Estimate details row -->
        <div class="block q1-combined-row">
          <!-- Customer info -->
          <div class="info-block customer-block">
            <div class="block-content">
              <div class="info-line">
                <span class="material-icons info-icon">person</span>
                <strong>${customer?.fname || ''} ${customer?.lname || ''}</strong>
              </div>
              <div class="info-line">
                <span class="material-icons info-icon">phone</span>
                <span>${customer?.phone || '—'}</span>
              </div>
              <div class="info-line">
                <span class="material-icons info-icon">email</span>
                <span>${customer?.email || '—'}</span>
              </div>
            </div>
          </div>

          <!-- Estimate Details -->
          <div class="info-block estimate-block">
            <div class="block-content">
              <div class="est-amount">
                ${estVal > 0 ? `Est: $${estVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} + GST` : 'Estimate: —'}
              </div>
              <div class="est-note">${(job.est_note || '—').trim()}</div>
            </div>
          </div>
        </div>

        <!-- Dates Box -->
        <div class="block info-block dates-block">
          <div class="block-content row-content">
            <div class="date-col">
              <span class="material-icons date-icon">today</span>
              <span class="date-val">${createdDateStr}</span>
            </div>
            <div class="date-col">
              <span class="material-icons date-icon">event_available</span>
              <span class="date-val date-urgent">${dueDateStr}</span>
            </div>
          </div>
        </div>

        <!-- Job Notes -->
        <div class="block info-block notes-block">
          <div class="block-content notes-content">${(job.note || '—').trim()}</div>

          </div>
      </div>

      <!-- Q1 Images Section -->
      <div class="image-grid q1-grid">
        ${q1ImagesHTML}
      </div>
    </div>

    <!-- Quadrant 2 (Top Right): Job Images / Sketches -->
    <div class="quadrant q-top-right">
      <div class="image-grid q2-grid">
        ${q2ImagesHTML}
      </div>
    </div>

    <!-- Quadrant 3 (Bottom Left): Customer Receipt Copy -->
    <div class="quadrant q-bottom-left">
      <div>
        <div class="q-logo-section">
          <img class="store-logo" src="${logoBase64}" alt="Logo">
        </div>
        <div class="cust-name-row">
          <strong>Customer:</strong> ${customer?.fname || ''} ${customer?.lname || ''}
        </div>
      </div>
      
      <div class="q3-image-area ${isTwoCol ? 'two-col-grid' : ''}">
        ${q3ImagesHTML}
      </div>
    </div>

    <!-- Quadrant 4 (Bottom Right): Contact & Estimate -->
    <div class="quadrant q-bottom-right">
      <!-- Combined Contact & Estimate info Row -->
      <div class="block q4-combined-row">
        <!-- Store Contact info -->
        <div class="q4-col q4-contact">
          <div class="q4-title">The Goldworks</div>
          <div class="info-line"><strong>Date:</strong> ${todayDateStr}</div>
          <div class="info-line"><strong>Employee:</strong> ${empName}</div>
          <div class="info-line"><strong>Phone:</strong> 403-320-0846</div>
          <div class="info-line"><strong>Email:</strong> info@thegoldworks.com</div>
        </div>

        <!-- Customer Estimate -->
        <div class="q4-col q4-estimate">
          <div class="q4-title">Customer Estimate</div>
          <div class="est-amount">
            ${estVal > 0 ? `Est: $${estVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} + GST` : 'Estimate: —'}
          </div>
          <div class="est-note">${(job.est_note || '—').trim()}</div>
        </div>
      </div>

      <!-- Q4 Images Area -->
      <div class="q4-image-area ${isTwoCol ? 'two-col-grid' : ''}">
        ${q4ImagesHTML}
      </div>

      <!-- Warning -->
      <div class="block warning-container">
        <div class="warning-text">
          The Goldworks is not responsible for any items held for over 90 days.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `
}
