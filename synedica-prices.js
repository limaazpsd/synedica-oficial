(function () {
    var CACHE_KEY = 'sndy_usd_brl_v2';
    var TTL = 3600 * 1000;
    var FALLBACK_RATE = 0.175; // 1 BRL ≈ US$ 0.175

    function fmt(n) {
        return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function render(rate) {
        document.querySelectorAll('[data-brl]').forEach(function (el) {
            var brl = parseFloat(el.getAttribute('data-brl'));
            if (!brl) return;
            var usd = brl * rate;

            /* carousel block */
            var valEl = el.querySelector('.sndy-usd-val');
            if (valEl) {
                valEl.textContent = 'US$ ' + fmt(usd);
                var wrap = el.querySelector('.sndy-usd-wrap');
                if (wrap) wrap.style.display = 'flex';
            }

            /* product page block */
            var prodVal = el.querySelector('.sndy-usd-block-val');
            if (prodVal) {
                prodVal.textContent = 'US$ ' + fmt(usd);
                var block = el.querySelector('.sndy-usd-block');
                if (block) block.classList.add('sndy-loaded');
                var note = el.querySelector('.sndy-rate-note');
                if (note) note.style.display = '';
            }
        });
    }

    function load() {
        try {
            var cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
            if (cached && Date.now() - cached.ts < TTL) { render(cached.v); return; }
        } catch (e) {}

        render(FALLBACK_RATE);

        fetch('https://api.frankfurter.app/latest?from=BRL&to=USD')
            .then(function (r) { return r.json(); })
            .then(function (d) {
                var rate = d.rates && d.rates.USD;
                if (!rate) return;
                try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ v: rate, ts: Date.now() })); } catch (e) {}
                render(rate);
            })
            .catch(function () {
                /* API indisponível — usando cotação de fallback */
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
