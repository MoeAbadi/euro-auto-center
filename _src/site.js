/* Euro Auto Center — shared site script */
(function () {
  'use strict';

  /* ===== Social media profiles =====
     Paste each profile link between the quotes once the account exists.
     Icons with an empty link show as "soon" and are not clickable. */
  var SOCIAL = {
    linkedin: '',
    facebook: 'https://www.facebook.com/eacsarl',
    instagram: ''
  };

  var SALES_EMAIL = 'sales@euro-auto-center.com';
  var WHATSAPP = '96170153623';

  document.documentElement.classList.remove('no-js');

  /* Header + mobile menu */
  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  if (toggle && nav) {
    var iconOpen = toggle.querySelector('.icon-open');
    var iconClose = toggle.querySelector('.icon-close');
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      iconOpen.hidden = open; iconClose.hidden = !open;
    };
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); } });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }

  /* Social links */
  document.querySelectorAll('[data-social]').forEach(function (a) {
    var url = SOCIAL[a.getAttribute('data-social')];
    if (url) {
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
      a.removeAttribute('aria-disabled'); a.removeAttribute('title');
    }
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var params = new URLSearchParams(location.search);

  /* ===== Brands hub: search + system filter ===== */
  var grid = document.getElementById('brandGrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.brand-card'));
    var input = document.getElementById('brandSearch');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-system]'));
    var count = document.getElementById('resultCount');
    var empty = document.getElementById('emptyState');
    var system = params.get('system') || 'all';
    if (params.get('q')) input.value = params.get('q');

    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var okSys = system === 'all' || (' ' + c.dataset.systems + ' ').indexOf(' ' + system + ' ') > -1;
        var okQ = !q || c.dataset.search.indexOf(q) > -1;
        var show = okSys && okQ;
        c.hidden = !show;
        if (show) shown++;
      });
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.dataset.system === system)); });
      count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' brands';
      empty.hidden = shown !== 0;
    };
    input.addEventListener('input', apply);
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { system = ch.dataset.system; apply(); });
    });
    var reset = document.getElementById('resetFilters');
    if (reset) reset.addEventListener('click', function () { system = 'all'; input.value = ''; apply(); input.focus(); });
    apply();
  }

  /* ===== Request a Quote ===== */
  var form = document.getElementById('quoteForm');
  if (form) {
    var lines = document.getElementById('lines');
    var tpl = document.getElementById('lineTpl');
    var msg = document.getElementById('formMsg');
    var copyBtn = document.getElementById('copyBtn');

    var renumber = function () {
      lines.querySelectorAll('.line').forEach(function (row, i) {
        row.querySelectorAll('[data-n]').forEach(function (el) {
          var base = el.getAttribute('data-n');
          if (el.tagName === 'LABEL') el.setAttribute('for', base + i);
          else el.id = base + i;
        });
        var rm = row.querySelector('.icon-btn');
        rm.hidden = lines.children.length === 1;
        rm.setAttribute('aria-label', 'Remove line ' + (i + 1));
      });
    };
    var addLine = function () {
      lines.appendChild(tpl.content.cloneNode(true));
      renumber();
    };
    lines.addEventListener('click', function (e) {
      var btn = e.target.closest('.icon-btn');
      if (btn) { btn.closest('.line').remove(); renumber(); }
    });
    document.getElementById('addLine').addEventListener('click', function () {
      addLine();
      var last = lines.lastElementChild.querySelector('input');
      if (last) last.focus();
    });
    addLine();

    var pre = params.get('brand');
    if (pre) {
      var sel = lines.querySelector('select');
      if (sel && sel.querySelector('option[value="' + pre + '"]')) sel.value = pre;
    }

    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

    var buildText = function () {
      var out = [];
      out.push('PARTS QUOTATION REQUEST');
      out.push('');
      out.push('Name: ' + val('qName'));
      if (val('qCompany')) out.push('Company: ' + val('qCompany'));
      if (val('qCountry')) out.push('Country: ' + val('qCountry'));
      out.push('Email: ' + val('qEmail'));
      if (val('qPhone')) out.push('Phone / WhatsApp: ' + val('qPhone'));
      var veh = [val('qMake'), val('qModel'), val('qYear')].filter(Boolean).join(' ');
      if (veh || val('qVin')) {
        out.push('');
        out.push('VEHICLE');
        if (veh) out.push('Vehicle: ' + veh);
        if (val('qVin')) out.push('VIN: ' + val('qVin'));
      }
      var items = [];
      lines.querySelectorAll('.line').forEach(function (row) {
        var f = row.querySelectorAll('input, select');
        var oe = f[0].value.trim(), pn = f[1].value.trim();
        var brand = f[2].options[f[2].selectedIndex].text;
        var qty = f[3].value.trim();
        if (oe || pn) {
          items.push((items.length + 1) + '. ' +
            (oe ? 'OE: ' + oe : '') + (oe && pn ? ' | ' : '') + (pn ? 'Part No: ' + pn : '') +
            ' | Brand: ' + (f[2].value ? brand : 'Any / best offer') +
            ' | Qty: ' + (qty || '1'));
        }
      });
      if (items.length) { out.push(''); out.push('PARTS'); out = out.concat(items); }
      if (document.getElementById('qAttach').checked) {
        out.push('');
        out.push('>> Full parts list attached (Excel / CSV).');
      }
      if (val('qNotes')) { out.push(''); out.push('NOTES'); out.push(val('qNotes')); }
      out.push('');
      out.push('Sent from www.euroautocenterllc.com');
      return out.join('\n');
    };

    var validate = function () {
      var ok = true, first = null;
      ['qName', 'qEmail'].forEach(function (id) {
        var el = document.getElementById(id);
        var bad = !el.value.trim() || (el.type === 'email' && !el.checkValidity());
        el.setAttribute('aria-invalid', String(bad));
        if (bad) { ok = false; first = first || el; }
      });
      if (!ok) { msg.className = 'form-msg'; msg.textContent = 'Please enter your name and a valid email address.'; first.focus(); return false; }
      var hasItem = Array.prototype.some.call(lines.querySelectorAll('.line'), function (row) {
        var f = row.querySelectorAll('input');
        return f[0].value.trim() || f[1].value.trim();
      });
      if (!hasItem && !document.getElementById('qAttach').checked && !val('qNotes')) {
        msg.className = 'form-msg';
        msg.textContent = 'Add at least one OE or part number, tick "I will attach a parts list", or describe what you need in the notes.';
        lines.querySelector('input').focus();
        return false;
      }
      return true;
    };

    var subject = function () {
      var who = val('qCompany') || val('qName');
      return 'Quotation request' + (who ? ' – ' + who : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;
      var body = buildText();
      window.location.href = 'mailto:' + SALES_EMAIL + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(body);
      msg.className = 'form-msg ok';
      msg.textContent = document.getElementById('qAttach').checked
        ? 'Your email app is opening with the request filled in. Remember to attach your Excel / CSV list, then press Send.'
        : 'Your email app is opening with the request filled in. Just press Send. If nothing opened, use "Copy request" and email it to ' + SALES_EMAIL + '.';
      copyBtn.hidden = false;
    });

    document.getElementById('waBtn').addEventListener('click', function () {
      if (!validate()) return;
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(buildText()), '_blank', 'noopener');
      msg.className = 'form-msg ok';
      msg.textContent = 'WhatsApp is opening with your request. If you have a parts list file, send it in the same chat.';
    });

    copyBtn.addEventListener('click', function () {
      var text = 'To: ' + SALES_EMAIL + '\nSubject: ' + subject() + '\n\n' + buildText();
      var done = function () { msg.className = 'form-msg ok'; msg.textContent = 'Request copied. Paste it into an email to ' + SALES_EMAIL + '.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  }
})();
