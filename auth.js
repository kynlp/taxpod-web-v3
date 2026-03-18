(function () {
  const PASSWORD = 'taxpod2888';
  const SESSION_KEY = 'taxpod_auth';

  // Already authenticated — do nothing
  if (sessionStorage.getItem(SESSION_KEY) === 'true') return;

  // Hide page until authenticated to prevent flash of content
  document.documentElement.style.visibility = 'hidden';

  function showOverlay() {
    document.documentElement.style.visibility = '';

    var overlay = document.createElement('div');
    overlay.id = 'tp-auth-overlay';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:#231F20',
    ].join(';');

    overlay.innerHTML = [
      '<div style="',
        'background:#ffffff;',
        'border-radius:8px;',
        'padding:32px;',
        'width:100%;',
        'max-width:400px;',
        'margin:20px;',
        'box-shadow:0 24px 48px rgba(0,0,0,0.18);',
      '">',
        '<div style="text-align:center;margin-bottom:24px">',
          '<img src="assets/images/logo-dark.png" alt="YYC taxPOD"',
            ' onerror="this.style.display=\'none\'"',
            ' style="height:40px;margin-bottom:12px;display:block;margin-left:auto;margin-right:auto">',
          '<h2 style="',
            'font-family:Inter,sans-serif;',
            'font-size:24px;',
            'font-weight:700;',
            'color:#231F20;',
            'margin:0 0 6px;',
          '">YYC taxPOD</h2>',
          '<p style="',
            'font-family:Inter,sans-serif;',
            'font-size:13px;',
            'color:#83858A;',
            'margin:0;',
          '">Enter the password to continue</p>',
        '</div>',
        '<form id="tp-auth-form" autocomplete="off">',
          '<input id="tp-auth-input" type="password" placeholder="Password"',
            ' autocomplete="current-password"',
            ' style="',
              'width:100%;',
              'box-sizing:border-box;',
              'height:42px;',
              'border:1.5px solid #CFD9DD;',
              'border-radius:6px;',
              'padding:0 12px;',
              'font-size:14px;',
              'font-family:Inter,sans-serif;',
              'color:#231F20;',
              'background:#ffffff;',
              'outline:none;',
              'display:block;',
              'margin-bottom:8px;',
            '">',
          '<p id="tp-auth-error" style="',
            'color:#E73A3A;',
            'font-family:Inter,sans-serif;',
            'font-size:12px;',
            'margin:0 0 12px;',
            'min-height:16px;',
            'display:none;',
          '">Incorrect password. Please try again.</p>',
          '<button type="submit" style="',
            'width:100%;',
            'height:42px;',
            'background:#00AFED;',
            'color:#fff;',
            'border:none;',
            'border-radius:6px;',
            'font-size:14px;',
            'font-weight:600;',
            'font-family:Inter,sans-serif;',
            'cursor:pointer;',
            'transition:opacity 0.15s;',
          '" onmouseover="this.style.opacity=\'0.88\'" onmouseout="this.style.opacity=\'1\'">',
            'Continue',
          '</button>',
        '</form>',
      '</div>',
    ].join('');

    document.body.appendChild(overlay);

    setTimeout(function () {
      var input = document.getElementById('tp-auth-input');
      if (input) input.focus();
    }, 50);

    document.getElementById('tp-auth-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('tp-auth-input');
      var error = document.getElementById('tp-auth-error');

      if (input.value === PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        overlay.remove();
      } else {
        error.style.display = 'block';
        input.value = '';
        input.style.borderColor = '#E73A3A';
        input.focus();
      }
    });

    document.getElementById('tp-auth-input').addEventListener('input', function () {
      var error = document.getElementById('tp-auth-error');
      error.style.display = 'none';
      this.style.borderColor = '#CFD9DD';
    });
  }

  if (document.body) {
    showOverlay();
  } else {
    document.addEventListener('DOMContentLoaded', showOverlay);
  }
})();
