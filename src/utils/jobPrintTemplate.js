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
 * Generates the complete print HTML layout for a Job.
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

  // Process images
  let imagesHTML = ''
  let customerImagesHTML = ''

  if (job.job_images && Array.isArray(job.job_images)) {
    job.job_images.forEach(img => {
      const fullUrl = getImageUrl(img.image)
      imagesHTML += `
        <div class="cb-print-element cb-print-image-cont">
          <img src="${fullUrl}" class="cb-print-image cb-print-element" />
          <div class="cb-print-element cb-print-image-note">${img.note || ''}</div>
        </div>
      `
      customerImagesHTML += `
        <div class="cb-print-element cb-print-cus-img-cont">
          <img src="${fullUrl}" class="cb-print-cust-img cb-print-element" />
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
      height: 11in;
      width: 8.5in;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      overflow: hidden;
      background: white;
      color: black;
    }
    @page {
      margin: 0mm;
    }
    .cb-print {
      position: absolute !important;        
      top: 0px;
      left: 0px;
      width: 8in;
      height: 10.5in;
      margin: 0.2in;
      margin-left: 0.2325in;        
    }
    .cb-print-element {
      position: absolute !important;
      overflow: hidden;
    }
    .cb-print-nowrap {
      white-space: nowrap;
    }
    .cb-print-blanks {
      height: 0.45in;
      width: 3.95in;
      left: 0;
    }
    .cb-print-top-box {
      display: inline-block;
      height: 100%;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
    }
    .cb-print-top-text {
      position: relative;
      bottom: -0.275in;
      font-size: 0.75em;
      color: grey;
    }
    .cb-print-top-flags {
      width: 1.34in;
    }
    .cb-print-top-deposit {
      width: 0.75in;
    }
    .cb-print-deposit-value {
      position: absolute;
      left: 1.38in;
      top: 0.05in;
      font-size: 1.4em;
    }
    .cb-print-top-gold-credit {
      width: 0.75in;
    }
    .cb-print-total {
      width: 0.986in;
    }
    .cb-print-customer-info {
      height: 0.85in;
      top: 0.5in;
      left: 0;
      width: 2.45in;        
      font-size: 1.3em;
      padding-left: 30px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      overflow: hidden;
    }
    .cb-print-customer-icon {
      left: 0px;
    }
    .cb-print-note {
      top: 2in;
      left: 0;
      height: 0.99in;
      width: 3.95in;        
      padding: 5px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
    }
    .cb-print-job-num {
      top: 1.4in;
      width: 1.05in;
      height: 0.55in;
      left: 1.4in;
      font-size: 1.75em;
      line-height: 2.25em;
      text-align: center;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
    }
    .cb-employee {
      top: 0.5in;
      width: 1.45in;
      height: 0.4in;
      left: 2.5in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
      padding: 3px;
      line-height: 1.5em;
      font-size: 1.5em;
      text-align: center;
    }
    .cb-print-estimate {
      height: 1in;
      top: 0.95in;
      left: 2.5in;
      width: 1.45in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
      padding: 3px;
      line-height: 1.1em;
    }
    .cb-print-est-amt {
      font-size: 1.2em;
      font-weight: bold;
      text-align: center;
      margin-top: 3px;
    }
    .cb-print-est-note {
      font-size: 0.9em;
      line-height: 0.9em;
    }
    .cb-print-due {
      top: 1.4in;
      left: 0;
      width: 1.35in;
      height: 0.55in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      font-size: 1.25em;
    }
    .cb-print-jobicon {
      padding-right: 5px;
    }
    .cb-print-dates {
      padding-left: 0.3in;
    }
    .cbPrintRed {
      color: red !important;        
    }
    .cb-print-images {
      top: 0in;
      left: 0;
      width: 100%;
      height: 6in;
      column-count: 2;
      column-fill: auto;
      column-gap: 0.1in;
    }
    .cb-print-image-spacer {
      height: 3in;
      position: static !important;
    }
    .cb-print-image-cont {
      position: static !important;
      height: 0.99in;
      margin-bottom: 0.01in;
      width: 100%;
      padding: 1px;
    }
    .cb-print-image {
      position: static !important;
      float: left;
      height: 100%;
      border-top-left-radius: 3%;
      border-bottom-left-radius: 3%;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
    }
    .cb-print-image-note {
      position: static !important;
      height: 0.97in;
      max-height: 0.97in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
      overflow: hidden;
      padding-left: 5px;
      padding-right: 5px;
      padding-top: 3px;
      line-height: 1.1em;
    }
    .cb-print-logo {
      width: 3.4in;
      top: 6.2in;
      left: 0.25in;
    }
    .cb-print-customer-name {
      top: 7.4in;
      font-weight: bold;
      margin-left: 0.25in;
    }
    .cb-print-cus-images {
      top: 7.6in;
      left: 0;
      width: 100%;
      height: 3in;
      column-count: 2;
      column-fill: auto;
      column-gap: 0.1in;
      text-align: center;
      line-height: 0em;
    }
    .cb-print-cus-img-cont {
      position: static !important;
      height: 1.49in;
      padding: 1px;
      display: inline-block;
    }
    .cb-print-cust-img {
      position: static !important;
      height: 100%;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
    }
    .cb-print-cus-job-info {
      left: 4.05in;
      width: 2.45in;
      height: 1.3in;
      top: 6.25in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);        
    }
    .cb-print-cus-estimate {
      top: 6.25in;
      width: 1.45in;
      height: 1.3in;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      left: 6.55in;       
    }
    .cb-print-cus-warning {
      top: 10in;
      font-size: 1.25em;
      left: 4.25in;
      font-weight: bold;
      -webkit-text-stroke: 1px white;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="cb-print">
    <!-- Blanks Box -->
    <div class="cb-print-element cb-print-blanks">
      <div class="cb-print-top-box cb-print-top-flags"><span class="cb-print-top-text">EMR NA LM Check</span></div>
      <div class="cb-print-top-box cb-print-top-deposit"><span class="cb-print-top-text">Deposit</span></div>
      <div class="cb-print-top-box cb-print-top-gold-credit"><span class="cb-print-top-text">Gold Credit</span></div>
      <div class="cb-print-top-box cb-print-total"><span class="cb-print-top-text">Total</span></div>
    </div>
    
    <!-- Deposit Value -->
    <div class="cb-print-element cb-print-deposit-value">
      ${depVal > 0 ? '$' + depVal.toFixed(2) : ''}
    </div>

    <!-- Customer info -->
    <div class="cb-print-element cb-print-customer-info">
      <span class="material-icons cb-print-element cb-print-customer-icon">person</span><span class="cb-print-element cb-print-nowrap">${customer?.fname || ''} ${customer?.lname || ''}</span><br>
      <span class="material-icons cb-print-element cb-print-customer-icon">phone</span><span class="cb-print-element cb-print-nowrap">${customer?.phone || ''}</span> <br>
      <span class="material-icons cb-print-element cb-print-customer-icon">email</span><span class="cb-print-element cb-print-nowrap">${customer?.email || ''}</span>
    </div>

    <!-- Job Notes -->
    <div class="cb-print-element cb-print-note">
      ${job.note || ''}
    </div>

    <!-- Job ID -->
    <div class="cb-print-element cb-print-job-num">
      # ${job.id || ''}
    </div>

    <!-- Employee -->
    <div class="cb-print-element cb-employee">
      ${empName}
    </div>

    <!-- Estimate Details -->
    <div class="cb-print-element cb-print-estimate">
      <div class="cb-print-est-amt">
        ${estVal > 0 ? `Est: $${estVal.toLocaleString(undefined, {minimumFractionDigits: 2})} + GST` : ''}
      </div>
      <div class="cb-print-est-note">${job.est_note || ''}</div>
    </div>

    <!-- Due Dates -->
    <div class="cb-print-element cb-print-due">
      <span class="material-icons cb-print-element cb-print-jobicon">today</span>
      <span class="cb-print-element cb-print-dates">${createdDateStr}</span><br />
      <span class="material-icons cb-print-element cb-print-jobicon">event_available</span>
      <span class="cb-print-element cb-print-dates ${job.vital_date ? 'cbPrintRed' : ''}">${dueDateStr}</span>
    </div>

    <!-- Top Images section -->
    <div class="cb-print-element cb-print-images">
      <div class="cb-print-element cb-print-image-spacer"></div>
      ${imagesHTML}
    </div>

    <!-- Bottom Customer Section Logo -->
    <img class="cb-print-logo cb-print-element" src="${logoBase64}" alt="">

    <!-- Bottom Customer Name -->
    <div class="cb-print-element cb-print-customer-name">
      Name: ${customer?.fname || ''} ${customer?.lname || ''}
    </div>

    <!-- Bottom Customer Images -->
    <div class="cb-print-element cb-print-cus-images">
      ${customerImagesHTML}
    </div>

    <!-- Bottom Store Contact info -->
    <div class="cb-print-element cb-print-cus-job-info">
      Date: ${todayDateStr}<br>
      Employee: ${empName}<br>
      Phone: 403-320-0846<br>
      E-mail: info@thegoldworks.com<br>
    </div>

    <!-- Bottom Customer Estimate -->
    <div class="cb-print-element cb-print-cus-estimate">
      <div class="cb-print-est-amt">
        ${estVal > 0 ? `Estimate: $${estVal.toLocaleString(undefined, {minimumFractionDigits: 2})} + GST` : ''}
      </div>
      <div class="cb-print-est-note">${job.est_note || ''}</div>
    </div>

    <!-- Bottom Warning -->
    <div class="cb-print-element cb-print-cus-warning">
      The Goldworks is not responsible for any items held for over 90 days.
    </div>
  </div>
</body>
</html>
  `
}
