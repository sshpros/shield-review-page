export default async function handler(req, res) {
const { token, tech, customer, google, photo } = req.query;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Try to fetch review request data from Supabase
let reviewData = null;
if (token && token !== "PREVIEW" && SUPABASE_URL) {
  try {
    const resp = await fetch(
      `${SUPABASE_URL}/functions/v1/get-review-request?token=${token}`,
      { headers: { "Authorization": `Bearer ${SUPABASE_ANON_KEY}` } }
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

const submitEndpoint = SUPABASE_URL
  ? `${SUPABASE_URL}/functions/v1/submit-review`
  : "";

res.setHeader("Content-Type", "text/html");
res.status(200).send(`<!DOCTYPE html>
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
.logo-icon {
  width:56px; height:56px; background:linear-gradient(135deg,#1a5fc7,#3b82f6);
  border-radius:14px; display:inline-flex; align-items:center; justify-content:center;
  margin-bottom:12px; font-size:24px; box-shadow:0 8px 24px rgba(59,130,246,0.3);
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
  background:rgba(59,130,246,0.2); border-color:#3b82f6;
  color:#fff;
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
.google-btn {
  display:flex; align-items:center; justify-content:center; gap:8px;
  width:100%; padding:14px; background:rgba(255,255,255,0.08);
  border:1px solid rgba(255,255,255,0.12); border-radius:14px;
  color:#fff; font-size:15px; font-weight:600; cursor:pointer;
  text-decoration:none; transition:all 0.2s;
}
.google-btn:hover { background:rgba(255,255,255,0.12); }
.google-note { text-align:center; font-size:11px; color:rgba(255,255,255,0.3); margin-top:8px; }
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
.success-sub { font-size:14px; color:rgba(255,255,255,0.6); }
.already-reviewed { text-align:center; padding:32px 24px; }
.already-icon { font-size:40px; margin-bottom:12px; }
.error-msg { color:#ef4444; font-size:13px; text-align:center; margin-top:8px; }
.checkbox-row {
  display:flex; align-items:center; gap:8px; margin-top:12px;
  font-size:13px; color:rgba(255,255,255,0.6); cursor:pointer;
}
.checkbox-row input { accent-color:#3b82f6; width:16px; height:16px; }
</style>
</head>
<body>
<div class="container">
<div class="logo-section">
  <div class="logo-icon">⚡</div>
  <div class="logo-title">Shield Low Voltage</div>
  <div class="logo-sub">Customer Review</div>
</div>

${alreadyReviewed ? \`
<div class="card already-reviewed">
  <div class="already-icon">✅</div>
  <div class="success-title">Already Reviewed</div>
  <div class="success-sub">Thank you! Your review has already been submitted.</div>
</div>
\` : \`
<div id="reviewForm">
  <div class="card tech-section">
    ${techPhoto
      ? \`<img src="\${techPhoto}" class="tech-photo" alt="\${techName}">\`
      : \`<div class="tech-placeholder">👤</div>\`}
    <div class="tech-label">Your Technician</div>
    <div class="tech-name">\${techName}</div>
    <div class="greeting">Thank you for your business, \${firstName}!</div>
  </div>

  <div class="card">
    <div class="section-title" style="text-align:center;">How was your experience?</div>
    <div class="stars" id="stars">
      <span class="star" data-v="1">★</span>
      <span class="star" data-v="2">★</span>
      <span class="star" data-v="3">★</span>
      <span class="star" data-v="4">★</span>
      <span class="star" data-v="5">★</span>
    </div>
    <div class="rating-label" id="ratingLabel"></div>
  </div>

  <div class="card">
    <div class="section-title">Leave a comment (optional)</div>
    <textarea id="feedback" placeholder="Tell us about your experience..."></textarea>
  </div>

  <div class="card tip-section">
    <div class="tip-header">
      <span class="tip-heart">❤️</span>
      <span class="section-title" style="margin:0;">Leave a tip for \${techFirst}?</span>
    </div>
    <div class="tip-info">
      We give our technicians a <strong>$5 bonus</strong> for every 5-star review.<br>
      Would you like to match our bonus — or tip even more?
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

  ${googleUrl ? \`
  <div class="card">
    <a href="\${googleUrl}" target="_blank" class="google-btn" id="googleBtn">
      ⭐ Leave a Google Review
    </a>
    <div class="google-note">Help us grow by leaving a review on Google</div>
    <label class="checkbox-row" id="googleCheckRow" style="display:none;">
      <input type="checkbox" id="googleConfirm">
      I left a Google review
    </label>
  </div>
  \` : ""}

  <button class="submit-btn" id="submitBtn" disabled>
    ✓ Submit Review
  </button>
  <div class="error-msg" id="errorMsg" style="display:none;"></div>
</div>

<div id="successView" style="display:none;">
  <div class="card success-card">
    <div class="success-icon">🎉</div>
    <div class="success-title">Thank You!</div>
    <div class="success-sub">Your review has been submitted. We truly appreciate your feedback!</div>
  </div>
  ${googleUrl ? \`
  <a href="\${googleUrl}" target="_blank" class="google-btn" style="margin-top:16px;">
    ⭐ Leave a Google Review Too
  </a>
  \` : ""}
</div>
\`}
</div>

<script>
(function() {
let rating = 0, tipAmount = 0, googleClicked = false;
const labels = {1:"We apologize for the experience",2:"We're sorry — we'll do better",3:"Good, thanks for letting us know",4:"Great experience!",5:"Excellent! Thank you!"};
const token = "${token || ""}";
const endpoint = "${submitEndpoint}";

const stars = document.querySelectorAll(".star");
const ratingLabel = document.getElementById("ratingLabel");
const submitBtn = document.getElementById("submitBtn");
const tipBtns = document.querySelectorAll(".tip-btn");
const customTipInput = document.getElementById("customTip");
const tipNote = document.getElementById("tipNote");
const googleBtn = document.getElementById("googleBtn");
const googleCheckRow = document.getElementById("googleCheckRow");

if (stars.length === 0) return;

stars.forEach(s => s.addEventListener("click", () => {
  rating = parseInt(s.dataset.v);
  stars.forEach(x => x.classList.toggle("active", parseInt(x.dataset.v) <= rating));
  if (ratingLabel) {
    ratingLabel.textContent = labels[rating] || "";
    ratingLabel.className = "rating-label" + (rating >= 4 ? " positive" : "");
  }
  if (submitBtn) submitBtn.disabled = false;
}));

tipBtns.forEach(btn => btn.addEventListener("click", () => {
  const val = btn.dataset.amount;
  tipBtns.forEach(b => b.classList.remove("active"));
  if (val === "custom") {
    btn.classList.add("active");
    if (customTipInput) customTipInput.classList.add("visible");
    tipAmount = parseFloat(customTipInput?.value) || 0;
  } else {
    btn.classList.add("active");
    if (customTipInput) customTipInput.classList.remove("visible");
    tipAmount = parseFloat(val);
  }
  if (tipNote) tipNote.style.display = tipAmount > 0 || val === "custom" ? "block" : "none";
}));

if (customTipInput) customTipInput.addEventListener("input", () => {
  tipAmount = parseFloat(customTipInput.value) || 0;
  if (tipNote) tipNote.style.display = tipAmount > 0 ? "block" : "none";
});

if (googleBtn) googleBtn.addEventListener("click", () => {
  googleClicked = true;
  if (googleCheckRow) googleCheckRow.style.display = "flex";
});

if (submitBtn) submitBtn.addEventListener("click", async () => {
  if (!rating || !token || !endpoint) return;
  submitBtn.disabled = true;
  submitBtn.textContent = "Submitting...";
  const errorMsg = document.getElementById("errorMsg");

  try {
    const googleConfirm = document.getElementById("googleConfirm");
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        rating,
        feedback: document.getElementById("feedback")?.value || "",
        tip_amount: tipAmount,
        google_review_confirmed: googleConfirm?.checked || false,
      }),
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById("reviewForm").style.display = "none";
      document.getElementById("successView").style.display = "block";
    } else {
      if (errorMsg) { errorMsg.textContent = data.error || "Something went wrong"; errorMsg.style.display = "block"; }
      submitBtn.disabled = false;
      submitBtn.textContent = "✓ Submit Review";
    }
  } catch (e) {
    if (errorMsg) { errorMsg.textContent = "Network error. Please try again."; errorMsg.style.display = "block"; }
    submitBtn.disabled = false;
    submitBtn.textContent = "✓ Submit Review";
  }
});
})();
</script>
</body>
</html>`);
}
