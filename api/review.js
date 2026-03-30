export default async function handler(req, res) {
const { token, tech, customer, google, photo } = req.query;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let reviewData = null;
if (token && token !== "PREVIEW" && SUPABASE_URL) {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/get-review-request?token=${token}`,
      { headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const json = await resp.json();
    if (json.success) reviewData = json.data;
  } catch (e) {}
}

const techName = reviewData?.technician_name || tech || "Your Technician";
const customerName = reviewData?.customer_name || customer || "Valued Customer";
const googleUrl = reviewData?.google_review_url || google || "";
const alreadyReviewed = reviewData?.review_completed || false;
const techPhoto = photo || "";
const firstName = customerName.split(" ")[0];
const techFirst = techName.split(" ")[0];

const logoUrl = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/public-assets/logo.jpg`
  : "";
const submitEndpoint = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/submit-review`
  : "";
const anonKey = SUPABASE_ANON_KEY || "";

const logoHtml = logoUrl
  ? `<img src="${logoUrl}" class="logo-img" alt="Shield Low Voltage">`
  : `<div style="width:56px;height:56px;background:linear-gradient(135deg,#1a5fc7,#3b82f6);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:24px;box-shadow:0 8px 24px rgba(59,130,246,0.3);">&#9889;</div>`;

const techPhotoHtml = techPhoto
  ? `<img src="${techPhoto}" class="tech-photo" alt="${techName}">`
  : `<div class="tech-placeholder">&#128100;</div>`;

let alreadyBlock = "";
if (alreadyReviewed) {
  alreadyBlock = `
  <div class="card already-reviewed">
    <div class="already-icon">&#9989;</div>
    <div class="success-title">Already Reviewed</div>
    <div class="success-sub">Thank you! Your review has already been submitted.</div>
  </div>`;
}

let formBlock = "";
if (!alreadyReviewed) {
  formBlock = `
  <div id="reviewForm">
    <div class="card tech-section">
      ${techPhotoHtml}
      <div class="tech-label">Your Technician</div>
      <div class="tech-name">${techName}</div>
      <div class="greeting">Thank you for your business, ${firstName}!</div>
    </div>

    <div class="card">
      <div class="section-title" style="text-align:center;">How was your experience?</div>
      <div class="stars" id="stars">
        <span class="star" data-v="1">&#9733;</span>
        <span class="star" data-v="2">&#9733;</span>
        <span class="star" data-v="3">&#9733;</span>
        <span class="star" data-v="4">&#9733;</span>
        <span class="star" data-v="5">&#9733;</span>
      </div>
      <div class="rating-label" id="ratingLabel"></div>
    </div>

    <div class="card">
      <div class="section-title">Leave a comment (optional)</div>
      <textarea id="feedback" placeholder="Tell us about your experience..."></textarea>
    </div>

    <div class="card tip-section">
      <div class="tip-header">
        <span class="tip-heart">&#10084;</span>
        <span class="section-title" style="margin:0;">Leave a tip for ${techFirst}?</span>
      </div>
      <div class="tip-info">
        We give our technicians a <strong>$5 bonus</strong> for every 5-star review.<br>
        Would you like to match our bonus -- or tip even more?
      </div>
      <div class="tip-grid" id="tipGrid">
        <div class="tip-btn" data-amount="5">$5<small>Match us</small></div>
        <div class="tip-btn" data-amount="10">$10</div>
        <div class="tip-btn" data-amount="20">$20</div>
        <div class="tip-btn" data-amount="custom">Custom</div>
      </div>
      <input type="number" id="customTip" class="custom-tip-input" placeholder="$ Enter amount" min="1" step="1">
      <div class="tip-note" id="tipNote" style="display:none;">100% of tips go directly to your technician. Tip will be added to your final invoice.</div>
    </div>

    <button class="submit-btn" id="submitBtn" disabled>Submit Review</button>
    <div class="error-msg" id="errorMsg" style="display:none;"></div>
  </div>

  <div id="successView" style="display:none;"></div>`;
}

const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Review - Shield Low Voltage</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Helvetica,Arial,sans-serif;
background:linear-gradient(180deg,#0a0e1a 0%,#111827 100%);
color:#fff; min-height:100vh; padding:24px 16px 48px;
}
.container { max-width:480px; margin:0 auto; }
.logo-section { text-align:center; margin-bottom:28px; }
.logo-img {
width:80px; height:80px; border-radius:16px; object-fit:contain;
margin-bottom:12px; box-shadow:0 8px 24px rgba(59,130,246,0.3);
}
.logo-title { font-size:20px; font-weight:700; letter-spacing:-0.3px; }
.logo-sub { font-size:13px; color:#6b7280; margin-top:4px; }
.card {
background:rgba(22,27,34,0.95); border-radius:20px;
border:1px solid rgba(255,255,255,0.06); padding:24px;
margin-bottom:16px; box-shadow:0 12px 40px rgba(0,0,0,0.4);
}
.tech-section { text-align:center; }
.tech-photo {
width:80px; height:80px; border-radius:50%;
border:2px solid rgba(59,130,246,0.4); object-fit:cover;
margin-bottom:12px;
}
.tech-placeholder {
width:80px; height:80px; border-radius:50%;
background:rgba(59,130,246,0.15); display:inline-flex;
align-items:center; justify-content:center; margin-bottom:12px;
font-size:36px; color:rgba(59,130,246,0.5);
}
.tech-label { font-size:12px; color:rgba(255,255,255,0.5); }
.tech-name { font-size:22px; font-weight:700; margin-top:2px; }
.greeting { font-size:14px; color:rgba(255,255,255,0.6); margin-top:8px; }
.section-title { font-size:16px; font-weight:700; margin-bottom:14px; }
.stars { display:flex; justify-content:center; gap:12px; margin:8px 0; }
.star {
font-size:36px; cursor:pointer; color:rgba(255,255,255,0.15);
transition:all 0.2s ease; user-select:none;
}
.star.active { color:#facc15; transform:scale(1.1); }
.star:hover { transform:scale(1.15); }
.rating-label {
text-align:center; font-size:14px; font-weight:500;
color:rgba(255,255,255,0.5); margin-top:6px; min-height:20px;
transition:color 0.2s;
}
.rating-label.positive { color:#22c55e; }
textarea {
width:100%; padding:14px; background:rgba(255,255,255,0.06);
border:1px solid rgba(255,255,255,0.08); border-radius:12px;
color:#fff; font-family:inherit; font-size:14px; resize:vertical;
min-height:80px; outline:none; transition:border-color 0.2s;
}
textarea:focus { border-color:rgba(59,130,246,0.5); }
textarea::placeholder { color:rgba(255,255,255,0.25); }
.tip-section { text-align:center; }
.tip-header { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:8px; }
.tip-heart { color:#ec4899; }
.tip-info { font-size:12px; color:rgba(255,255,255,0.45); margin-bottom:14px; line-height:1.4; }
.tip-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
.tip-btn {
padding:14px 0; background:rgba(255,255,255,0.06);
border:1px solid rgba(255,255,255,0.1); border-radius:12px;
color:rgba(255,255,255,0.6); font-size:15px; font-weight:600;
cursor:pointer; transition:all 0.2s; text-align:center;
}
.tip-btn:hover { background:rgba(255,255,255,0.1); }
.tip-btn.active {
background:rgba(59,130,246,0.2); border-color:#3b82f6; color:#fff;
}
.tip-btn small { display:block; font-size:9px; font-weight:500; color:rgba(255,255,255,0.35); margin-top:2px; }
.tip-note { font-size:11px; color:rgba(255,255,255,0.3); margin-top:10px; }
.custom-tip-input {
display:none; margin-top:12px; padding:12px; background:rgba(255,255,255,0.06);
border:1px solid rgba(255,255,255,0.08); border-radius:12px;
color:#fff; font-size:16px; font-weight:600; text-align:center;
width:100%; outline:none;
}
.custom-tip-input.visible { display:block; }
.custom-tip-input:focus { border-color:rgba(59,130,246,0.5); }
.submit-btn {
display:flex; align-items:center; justify-content:center; gap:8px;
width:100%; padding:16px; border:none; border-radius:14px;
font-size:17px; font-weight:700; cursor:pointer; transition:all 0.2s;
background:linear-gradient(135deg,#1a5fc7,#3b82f6); color:#fff;
box-shadow:0 8px 24px rgba(59,130,246,0.3);
}
.submit-btn:hover { transform:translateY(-1px); box-shadow:0 12px 32px rgba(59,130,246,0.4); }
.submit-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
.success-card { text-align:center; padding:40px 24px; }
.success-icon { font-size:48px; margin-bottom:16px; }
.success-title { font-size:22px; font-weight:700; margin-bottom:8px; }
.success-sub { font-size:14px; color:rgba(255,255,255,0.6); line-height:1.5; }
.already-reviewed { text-align:center; padding:32px 24px; }
.already-icon { font-size:40px; margin-bottom:12px; }
.error-msg { color:#ef4444; font-size:13px; text-align:center; margin-top:8px; }
.copy-box {
background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
border-radius:12px; padding:14px; margin:16px 0 12px; text-align:left;
font-size:14px; color:rgba(255,255,255,0.8); line-height:1.5;
max-height:120px; overflow-y:auto; word-wrap:break-word;
}
.copy-btn {
display:inline-flex; align-items:center; gap:6px; padding:10px 20px;
background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15);
border-radius:10px; color:#fff; font-size:14px; font-weight:600;
cursor:pointer; transition:all 0.2s; margin-bottom:16px;
}
.copy-btn:hover { background:rgba(255,255,255,0.15); }
.copy-btn.copied { background:rgba(34,197,94,0.2); border-color:#22c55e; color:#22c55e; }
.google-btn {
display:flex; align-items:center; justify-content:center; gap:8px;
width:100%; padding:16px; background:linear-gradient(135deg,#ea4335,#fbbc04);
border:none; border-radius:14px;
color:#fff; font-size:16px; font-weight:700; cursor:pointer;
text-decoration:none; transition:all 0.2s;
box-shadow:0 8px 24px rgba(234,67,53,0.3);
}
.google-btn:hover { transform:translateY(-1px); box-shadow:0 12px 32px rgba(234,67,53,0.4); }
.google-helper { text-align:center; font-size:12px; color:rgba(255,255,255,0.4); margin-top:10px; line-height:1.4; }
.divider { height:1px; background:rgba(255,255,255,0.08); margin:20px 0; }
.step-number {
display:inline-flex; align-items:center; justify-content:center;
width:24px; height:24px; border-radius:50%; background:rgba(59,130,246,0.2);
color:#3b82f6; font-size:13px; font-weight:700; margin-right:8px;
}
.step-row { display:flex; align-items:center; font-size:14px; color:rgba(255,255,255,0.7); margin-bottom:10px; }
</style>
</head>
<body>
<div class="container">
<div class="logo-section">
${logoHtml}
<div class="logo-title">Shield Low Voltage</div>
<div class="logo-sub">Customer Review</div>
</div>
${alreadyBlock}
${formBlock}
</div>

<script>
(function() {
var rating = 0, tipAmount = 0;
var labels = {1:"We apologize for the experience",2:"We are sorry -- we will do better",3:"Good, thanks for letting us know",4:"Great experience!",5:"Excellent! Thank you!"};
var token = "${token || ""}";
var endpoint = "${submitEndpoint}";
var anonKey = "${anonKey}";
var googleUrl = "${googleUrl}";
var stars = document.querySelectorAll(".star");
var ratingLabel = document.getElementById("ratingLabel");
var submitBtn = document.getElementById("submitBtn");
var tipBtns = document.querySelectorAll(".tip-btn");
var customTipInput = document.getElementById("customTip");
var tipNote = document.getElementById("tipNote");
if (stars.length === 0) return;

stars.forEach(function(s) { s.addEventListener("click", function() {
rating = parseInt(s.dataset.v);
stars.forEach(function(x) { x.classList.toggle("active", parseInt(x.dataset.v) <= rating); });
if (ratingLabel) {
  ratingLabel.textContent = labels[rating] || "";
  ratingLabel.className = "rating-label" + (rating >= 4 ? " positive" : "");
}
if (submitBtn) submitBtn.disabled = false;
}); });

tipBtns.forEach(function(btn) { btn.addEventListener("click", function() {
var val = btn.dataset.amount;
tipBtns.forEach(function(b) { b.classList.remove("active"); });
if (val === "custom") {
  btn.classList.add("active");
  if (customTipInput) customTipInput.classList.add("visible");
  tipAmount = parseFloat(customTipInput ? customTipInput.value : 0) || 0;
} else {
  btn.classList.add("active");
  if (customTipInput) customTipInput.classList.remove("visible");
  tipAmount = parseFloat(val);
}
if (tipNote) tipNote.style.display = (tipAmount > 0 || val === "custom") ? "block" : "none";
}); });

if (customTipInput) customTipInput.addEventListener("input", function() {
tipAmount = parseFloat(customTipInput.value) || 0;
if (tipNote) tipNote.style.display = tipAmount > 0 ? "block" : "none";
});

if (submitBtn) submitBtn.addEventListener("click", async function() {
var errorMsg = document.getElementById("errorMsg");
if (!rating) {
  if (errorMsg) { errorMsg.textContent = "Please select a star rating"; errorMsg.style.display = "block"; }
  return;
}
if (!token) {
  if (errorMsg) { errorMsg.textContent = "Missing review token"; errorMsg.style.display = "block"; }
  return;
}
if (!endpoint) {
  if (errorMsg) { errorMsg.textContent = "Configuration error — missing endpoint"; errorMsg.style.display = "block"; }
  return;
}
submitBtn.disabled = true;
submitBtn.textContent = "Submitting...";
if (errorMsg) errorMsg.style.display = "none";
var feedbackText = document.getElementById("feedback") ? document.getElementById("feedback").value : "";
try {
  var headers = { "Content-Type": "application/json" };
  if (anonKey) {
    headers["Authorization"] = "Bearer " + anonKey;
  }
  var resp = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      token: token,
      rating: rating,
      feedback: feedbackText,
      tip_amount: tipAmount,
      google_review_confirmed: false
    })
  });
  var data = await resp.json();
  if (data.success) {
    document.getElementById("reviewForm").style.display = "none";
    var sv = document.getElementById("successView");
    var h = "";
    if (rating >= 4 && googleUrl) {
      h += '<div class="card success-card">';
      h += '<div class="success-icon">&#127881;</div>';
      h += '<div class="success-title">Thank You!</div>';
      h += '<div class="success-sub">We are so glad you had a great experience! Would you mind sharing your review on Google too? It really helps us grow.</div>';
      h += '<div class="divider"></div>';
      h += '<div class="step-row"><span class="step-number">1</span> Copy your review</div>';
      if (feedbackText) {
        h += '<div class="copy-box" id="reviewText">' + feedbackText.replace(/</g,"&lt;").replace(/>/g,"&gt;") + '</div>';
        h += '<button class="copy-btn" id="copyBtn" onclick="copyReview()">&#128203; Copy to Clipboard</button>';
      } else {
        h += '<div style="font-size:13px;color:rgba(255,255,255,0.4);margin:8px 0 16px;">No written review to copy -- just leave your star rating on Google!</div>';
      }
      h += '<div class="step-row"><span class="step-number">2</span> Paste it on Google</div>';
      h += '<a href="' + googleUrl + '" target="_blank" class="google-btn">&#11088; Open Google Reviews</a>';
      h += '<div class="google-helper">The Google review page will open in a new tab.<br>Just paste your review and select your star rating!</div>';
      h += '</div>';
    } else {
      h += '<div class="card success-card">';
      h += '<div class="success-icon">&#127881;</div>';
      h += '<div class="success-title">Thank You!</div>';
      h += '<div class="success-sub">Your review has been submitted. We truly appreciate your feedback!</div>';
      h += '</div>';
    }
    sv.innerHTML = h;
    sv.style.display = "block";
  } else {
    if (errorMsg) { errorMsg.textContent = data.error || "Something went wrong"; errorMsg.style.display = "block"; }
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Review";
  }
} catch (e) {
  if (errorMsg) { errorMsg.textContent = "Network error. Please try again."; errorMsg.style.display = "block"; }
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit Review";
}
});
})();

function copyReview() {
var el = document.getElementById("reviewText");
var btn = document.getElementById("copyBtn");
if (!el) return;
var text = el.innerText;
if (navigator.clipboard) {
navigator.clipboard.writeText(text).then(function() {
  btn.innerHTML = "&#9989; Copied!";
  btn.classList.add("copied");
  setTimeout(function() { btn.innerHTML = "&#128203; Copy to Clipboard"; btn.classList.remove("copied"); }, 3000);
});
} else {
var range = document.createRange();
range.selectNode(el);
window.getSelection().removeAllRanges();
window.getSelection().addRange(range);
document.execCommand("copy");
window.getSelection().removeAllRanges();
btn.innerHTML = "&#9989; Copied!";
btn.classList.add("copied");
setTimeout(function() { btn.innerHTML = "&#128203; Copy to Clipboard"; btn.classList.remove("copied"); }, 3000);
}
}
</script>
</body>
</html>`;

res.setHeader("Content-Type", "text/html");
res.status(200).send(page);
}
