// Review landing page — stepped flow, Google as the finish line.
//
// Redesigned 2026-09-14. The previous page converted internally (9/28
// submitted, all 4-5 stars, 6 tipped) but only 1 review reached Google:
// the ask came after a success screen, behind a copy/paste second job,
// with the tip closing the transaction first. This flow makes the
// customer write ONCE, fires the internal submit silently, auto-copies
// their text, and lands them in Google's review box in one tap. The tip
// moved to the thank-you screen, after the Google step.
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
  const techPhoto = reviewData?.tech_photo_url || photo || "";
  const firstName = customerName.split(" ")[0];
  const techFirst = techName.split(" ")[0];

  const logoUrl = SUPABASE_URL
    ? `${SUPABASE_URL}/storage/v1/object/public/public-assets/logo-3d.png?v=7`
    : "";
  const submitEndpoint = SUPABASE_URL
    ? `${SUPABASE_URL}/functions/v1/submit-review`
    : "";
  const anonKey = SUPABASE_ANON_KEY || "";

  const techPhotoHtml = techPhoto
    ? `<img src="${techPhoto}" class="tech-photo" alt="${techName}">`
    : `<div class="tech-placeholder">&#128100;</div>`;

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
  color:#fff; min-height:100vh; padding:20px 16px 48px;
}
.container { max-width:440px; margin:0 auto; }
.logo-section { text-align:center; margin-bottom:18px; }
.logo-img { width:84px; height:84px; object-fit:contain; filter:drop-shadow(0 8px 24px rgba(59,130,246,0.35)); }
.card {
  background:rgba(22,27,34,0.95); border-radius:20px;
  border:1px solid rgba(255,255,255,0.06); padding:24px 20px;
  margin-bottom:14px; box-shadow:0 12px 40px rgba(0,0,0,0.4);
}
.center { text-align:center; }
.tech-photo { width:88px; height:88px; border-radius:50%; border:2px solid rgba(59,130,246,0.4); object-fit:cover; margin-bottom:10px; }
.tech-placeholder {
  width:88px; height:88px; border-radius:50%; background:rgba(59,130,246,0.15);
  display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px;
  font-size:40px; color:rgba(59,130,246,0.5);
}
.tech-name { font-size:21px; font-weight:700; }
.greeting { font-size:15px; color:rgba(255,255,255,0.65); margin-top:6px; line-height:1.45; }
.ask { font-size:17px; font-weight:700; margin:18px 0 6px; }
.stars { display:flex; justify-content:center; gap:8px; margin:10px 0 2px; }
.star {
  font-size:44px; cursor:pointer; color:rgba(255,255,255,0.15);
  transition:all 0.15s ease; user-select:none; -webkit-tap-highlight-color:transparent;
  padding:2px 4px;
}
.star.active { color:#facc15; transform:scale(1.08); }
.rating-label { font-size:14px; font-weight:600; color:rgba(255,255,255,0.5); margin-top:8px; min-height:20px; }
.rating-label.positive { color:#22c55e; }
.section-title { font-size:16px; font-weight:700; margin-bottom:10px; }
textarea {
  width:100%; min-height:110px; background:rgba(10,14,26,0.7);
  border:1px solid rgba(255,255,255,0.1); border-radius:14px; color:#fff;
  font-size:16px; padding:14px; resize:vertical; font-family:inherit; line-height:1.5;
}
textarea:focus { outline:none; border-color:rgba(59,130,246,0.5); }
.chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.chip {
  font-size:13px; padding:7px 12px; border-radius:999px;
  background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.3);
  color:#93c5fd; cursor:pointer; user-select:none;
}
.chip:active { background:rgba(59,130,246,0.3); }
.bonus-banner {
  display:flex; align-items:center; gap:10px; background:rgba(250,204,21,0.08);
  border:1px solid rgba(250,204,21,0.25); border-radius:14px; padding:12px 14px;
  font-size:14px; line-height:1.45; margin-top:14px; text-align:left;
}
.bonus-banner .b-icon { font-size:22px; }
.primary-btn {
  display:block; width:100%; text-align:center; background:linear-gradient(135deg,#1a5fc7,#3b82f6);
  color:#fff; font-size:17px; font-weight:700; border:none; border-radius:16px;
  padding:16px; cursor:pointer; margin-top:16px; text-decoration:none;
  box-shadow:0 8px 24px rgba(59,130,246,0.35);
}
.primary-btn:disabled { opacity:0.45; box-shadow:none; }
.google-btn {
  display:block; width:100%; text-align:center; background:#fff; color:#1f2937;
  font-size:17px; font-weight:700; border:none; border-radius:16px;
  padding:16px; cursor:pointer; margin-top:16px; text-decoration:none;
  box-shadow:0 8px 24px rgba(255,255,255,0.15);
}
.ghost-btn {
  display:block; width:100%; text-align:center; background:none; color:rgba(255,255,255,0.45);
  font-size:14px; border:none; padding:12px; cursor:pointer; margin-top:6px; text-decoration:underline;
}
.helper { font-size:13px; color:rgba(255,255,255,0.45); text-align:center; margin-top:10px; line-height:1.5; }
.tip-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:14px; }
.tip-btn {
  text-align:center; padding:16px 8px; border-radius:14px; cursor:pointer;
  background:rgba(59,130,246,0.1); border:1.5px solid rgba(59,130,246,0.25);
  font-size:18px; font-weight:700; user-select:none;
}
.tip-btn small { display:block; font-size:11px; font-weight:500; color:rgba(255,255,255,0.5); margin-top:2px; }
.tip-btn.selected { background:rgba(59,130,246,0.35); border-color:#3b82f6; }
.custom-tip-input {
  display:none; width:100%; margin-top:10px; background:rgba(10,14,26,0.7);
  border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#fff;
  font-size:16px; padding:12px 14px;
}
.custom-tip-input.show { display:block; }
.success-icon { font-size:44px; margin-bottom:8px; }
.success-title { font-size:22px; font-weight:800; }
.success-sub { font-size:15px; color:rgba(255,255,255,0.65); margin-top:8px; line-height:1.5; }
.error-msg { color:#f87171; font-size:14px; text-align:center; margin-top:10px; }
.copied-flash {
  position:fixed; left:50%; bottom:36px; transform:translateX(-50%);
  background:#22c55e; color:#052e16; font-weight:700; font-size:14px;
  padding:10px 18px; border-radius:999px; opacity:0; transition:opacity 0.3s;
  pointer-events:none; z-index:50;
}
.copied-flash.show { opacity:1; }
.step { display:none; }
.step.active { display:block; animation:fadeUp 0.3s ease; }
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
</style>
</head>
<body>
<div class="container">
  <div class="logo-section">${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Shield Low Voltage">` : ""}</div>

  ${alreadyReviewed ? `
  <div class="card center">
    <div class="success-icon">&#9989;</div>
    <div class="success-title">Already Reviewed</div>
    <div class="success-sub">Thank you! Your review has already been submitted.</div>
  </div>` : `

  <!-- STEP 1: stars, nothing else -->
  <div class="step active" id="step1">
    <div class="card center">
      ${techPhotoHtml}
      <div class="tech-name">${techName}</div>
      <div class="greeting">was just at your home, ${firstName}.</div>
      <div class="ask">How did we do?</div>
      <div class="stars" id="stars">
        <span class="star" data-v="1">&#9733;</span>
        <span class="star" data-v="2">&#9733;</span>
        <span class="star" data-v="3">&#9733;</span>
        <span class="star" data-v="4">&#9733;</span>
        <span class="star" data-v="5">&#9733;</span>
      </div>
      <div class="rating-label" id="ratingLabel">Tap a star to begin</div>
    </div>
  </div>

  <!-- STEP 2 (4-5 stars): write once, then Google -->
  <div class="step" id="step2good">
    <div class="card">
      <div class="section-title">Tell us what went well</div>
      <textarea id="feedbackGood" placeholder="A sentence or two about your experience..."></textarea>
      <div class="chips" id="chips">
        <span class="chip">${techFirst} was on time</span>
        <span class="chip">Clean installation</span>
        <span class="chip">Explained everything clearly</span>
        <span class="chip">Would recommend</span>
      </div>
      <div class="bonus-banner">
        <span class="b-icon">&#11088;</span>
        <span>We pay ${techFirst} a <strong>$20 bonus</strong> for every 5-star review left on Google &mdash; your review goes straight to ${techFirst === "Your" ? "them" : techFirst}.</span>
      </div>
      <a class="google-btn" id="googleBtn">Finish on Google &mdash; we'll copy your review</a>
      <div class="helper">One tap: your text is copied and Google opens &mdash; paste, tap your stars, done.</div>
      <button class="ghost-btn" id="skipGoogle">Just submit without Google</button>
      <div class="error-msg" id="errorGood" style="display:none;"></div>
    </div>
  </div>

  <!-- STEP 2 (1-3 stars): private path -->
  <div class="step" id="step2bad">
    <div class="card">
      <div class="section-title">We want to make this right</div>
      <div class="greeting" style="margin-top:0;">Tell us what happened &mdash; this goes directly to the owner, and he'll personally follow up.</div>
      <textarea id="feedbackBad" placeholder="What could we have done better?" style="margin-top:12px;"></textarea>
      <button class="primary-btn" id="submitBad">Send to the Owner</button>
      <div class="error-msg" id="errorBad" style="display:none;"></div>
    </div>
  </div>

  <!-- STEP 4: thank you + tip -->
  <div class="step" id="step4">
    <div class="card center">
      <div class="success-icon">&#127881;</div>
      <div class="success-title">Thank You, ${firstName}!</div>
      <div class="success-sub" id="thanksSub">Your review means a lot to our small team.</div>
    </div>
    <div class="card" id="tipCard">
      <div class="section-title" style="text-align:center;">&#10084;&#65039; Want to tip ${techFirst} on top?</div>
      <div class="greeting" style="text-align:center; margin-top:0;">We're paying ${techFirst} a $20 bonus for your Google review.<br>Tips are extra &mdash; 100% goes to your technician.</div>
      <div class="tip-grid" id="tipGrid">
        <div class="tip-btn" data-amount="10">$10</div>
        <div class="tip-btn" data-amount="20">$20<small>Match our bonus</small></div>
        <div class="tip-btn" data-amount="custom">Custom</div>
      </div>
      <input type="number" id="customTip" class="custom-tip-input" placeholder="$ Enter amount" min="1" step="1">
      <button class="primary-btn" id="sendTip" disabled>Add Tip</button>
      <div class="helper">Tip will be added to your final invoice.</div>
      <button class="ghost-btn" id="skipTip">No tip today</button>
    </div>
    <div class="card center" id="allDone" style="display:none;">
      <div class="success-icon">&#129309;</div>
      <div class="success-title" id="doneTitle">All set!</div>
      <div class="success-sub" id="doneSub"></div>
    </div>
  </div>`}
</div>
<div class="copied-flash" id="copiedFlash">&#9989; Review copied</div>

<script>
(function() {
  var token = ${JSON.stringify(token || "")};
  var endpoint = ${JSON.stringify(submitEndpoint)};
  var anonKey = ${JSON.stringify(anonKey)};
  var googleUrl = ${JSON.stringify(googleUrl)};
  var rating = 0;
  var submitted = false;

  function api(body) {
    var headers = { "Content-Type": "application/json" };
    if (anonKey) headers["Authorization"] = "Bearer " + anonKey;
    return fetch(endpoint, { method: "POST", headers: headers, body: JSON.stringify(body) })
      .then(function(r) { return r.json(); });
  }
  function show(id) {
    document.querySelectorAll(".step").forEach(function(s) { s.classList.remove("active"); });
    var el = document.getElementById(id);
    if (el) el.classList.add("active");
    window.scrollTo(0, 0);
  }
  function reviewText() {
    var good = document.getElementById("feedbackGood");
    var bad = document.getElementById("feedbackBad");
    if (rating >= 4) return good ? good.value.trim() : "";
    return bad ? bad.value.trim() : "";
  }
  function fullSubmit() {
    if (submitted) return Promise.resolve({ success: true });
    submitted = true;
    return api({ token: token, rating: rating, feedback: reviewText(), tip_amount: 0, google_review_confirmed: false })
      .catch(function() { submitted = false; return { success: false }; });
  }

  // STEP 1 — stars advance automatically
  var labels = { 1: "We're sorry to hear that", 2: "We can do better", 3: "Room to improve", 4: "Glad it went well!", 5: "Fantastic!" };
  document.querySelectorAll(".star").forEach(function(st) {
    st.addEventListener("click", function() {
      rating = parseInt(st.getAttribute("data-v"), 10);
      document.querySelectorAll(".star").forEach(function(s2) {
        s2.classList.toggle("active", parseInt(s2.getAttribute("data-v"), 10) <= rating);
      });
      var lbl = document.getElementById("ratingLabel");
      lbl.textContent = labels[rating] || "";
      lbl.classList.toggle("positive", rating >= 4);
      // Capture the rating immediately — a mid-page bail still counts.
      if (token) api({ token: token, rating: rating, partial: true }).catch(function() {});
      setTimeout(function() { show(rating >= 4 ? "step2good" : "step2bad"); }, 450);
    });
  });

  // STEP 2 good — chips build the review
  document.querySelectorAll(".chip").forEach(function(c) {
    c.addEventListener("click", function() {
      var ta = document.getElementById("feedbackGood");
      var txt = c.textContent.trim();
      ta.value = ta.value.trim() ? ta.value.trim() + ". " + txt : txt;
      ta.focus();
    });
  });
  // STEP 2 bad — private submit
  var subBad = document.getElementById("submitBad");
  if (subBad) subBad.addEventListener("click", function() {
    subBad.disabled = true; subBad.textContent = "Sending...";
    fullSubmit().then(function(d) {
      if (d.success) {
        document.getElementById("tipCard").style.display = "none";
        document.getElementById("thanksSub").textContent = "Thank you for being honest with us. The owner will reach out personally.";
        show("step4");
      } else {
        var e = document.getElementById("errorBad");
        e.textContent = "Something went wrong — please try again."; e.style.display = "block";
        subBad.disabled = false; subBad.textContent = "Send to the Owner";
      }
    });
  });

  // The Google finish line — right under the composer, one tap:
  // submit silently, copy the text, open Google.
  var googleBtn = document.getElementById("googleBtn");
  if (googleBtn && !googleUrl) {
    // No Google URL configured for this request — degrade to a plain submit.
    googleBtn.style.display = "none";
    document.querySelector("#step2good .helper").style.display = "none";
    var sk = document.getElementById("skipGoogle");
    if (sk) { sk.className = "primary-btn"; sk.textContent = "Submit Review"; }
  }
  if (googleBtn) googleBtn.addEventListener("click", function() {
    var text = reviewText();
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function() {});
      var f = document.getElementById("copiedFlash");
      f.classList.add("show");
      setTimeout(function() { f.classList.remove("show"); }, 2200);
    }
    fullSubmit();
    if (token) api({ token: token, google_clicked: true }).catch(function() {});
    finishThanks(true);
    // Open Google after a beat so the clipboard write and pings land.
    setTimeout(function() { window.open(googleUrl, "_blank"); show("step4"); }, 350);
  });
  var skipG = document.getElementById("skipGoogle");
  if (skipG) skipG.addEventListener("click", function() {
    fullSubmit().then(function(d) {
      if (d.success) { finishThanks(false); show("step4"); }
      else {
        var e = document.getElementById("errorGood");
        e.textContent = "Something went wrong — please try again."; e.style.display = "block";
        submitted = false;
      }
    });
  });

  function finishThanks(wentToGoogle) {
    var sub = document.getElementById("thanksSub");
    if (sub) sub.textContent = wentToGoogle
      ? "Your Google review earns " + ${JSON.stringify(techFirst)} + " a $20 bonus from us. Thank you!"
      : "Your review means a lot to our small team.";
  }

  // STEP 4 — tip
  var tipAmount = 0;
  var sendTip = document.getElementById("sendTip");
  document.querySelectorAll(".tip-btn").forEach(function(b) {
    b.addEventListener("click", function() {
      document.querySelectorAll(".tip-btn").forEach(function(x) { x.classList.remove("selected"); });
      b.classList.add("selected");
      var v = b.getAttribute("data-amount");
      var custom = document.getElementById("customTip");
      if (v === "custom") {
        custom.classList.add("show"); custom.focus();
        tipAmount = parseFloat(custom.value) || 0;
      } else {
        custom.classList.remove("show");
        tipAmount = parseFloat(v);
      }
      sendTip.disabled = tipAmount <= 0 && v !== "custom";
    });
  });
  var customTip = document.getElementById("customTip");
  if (customTip) customTip.addEventListener("input", function() {
    tipAmount = parseFloat(customTip.value) || 0;
    sendTip.disabled = tipAmount <= 0;
  });
  if (sendTip) sendTip.addEventListener("click", function() {
    if (tipAmount <= 0) return;
    sendTip.disabled = true; sendTip.textContent = "Adding...";
    api({ token: token, tip_update: true, tip_amount: tipAmount }).then(function(d) {
      document.getElementById("tipCard").style.display = "none";
      var done = document.getElementById("allDone");
      document.getElementById("doneSub").textContent = d.success
        ? "$" + tipAmount.toFixed(0) + " tip added — " + ${JSON.stringify(techFirst)} + " gets every penny. It'll appear on your final invoice."
        : "We couldn't add the tip just now, but your review went through!";
      done.style.display = "block";
    });
  });
  var skipTip = document.getElementById("skipTip");
  if (skipTip) skipTip.addEventListener("click", function() {
    document.getElementById("tipCard").style.display = "none";
    var done = document.getElementById("allDone");
    document.getElementById("doneSub").textContent = "Thanks again for your business!";
    done.style.display = "block";
  });
})();
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(page);
}
