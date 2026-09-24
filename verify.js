/* SUPABASE_URL e SUPABASE_KEY carregados via synedica-config.js */

var SVG_CHECK = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.29 5.29a1 1 0 00-1.41 0L9 14.17l-3.88-3.88a1 1 0 00-1.41 1.42l4.59 4.59a1 1 0 001.41 0l10.59-10.6a1 1 0 000-1.41z"/></svg>';
var SVG_WARN  = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 2a8 8 0 110 16A8 8 0 0112 4zm-1 4v5h2V8h-2zm0 7v2h2v-2h-2z"/></svg>';
var SVG_INFO  = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm-1 7h2v2h-2V9zm0 4h2v5h-2v-5z"/></svg>';
var SVG_SEARCH= '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 2a7 7 0 100 14A7 7 0 009 2zm0 2a5 5 0 110 10A5 5 0 019 4zm9.293 11.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414-1.414l-3-3z"/></svg>';
var SVG_SPIN  = '<svg viewBox="0 0 24 24" style="animation:sv-spin 0.8s linear infinite" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="none" stroke="#3aaa85" stroke-width="2.5" stroke-dasharray="28 56" stroke-linecap="round"/></svg>';

var BTN_DEFAULT = SVG_SEARCH + ' Verificar';
var BTN_LOADING = SVG_SPIN + ' Verificando...';

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

var _verifyLastTs = 0;
var _resellerLastTs = 0;

function synedicaVerify() {
    var now = Date.now();
    if (now - _verifyLastTs < 3000) return;
    _verifyLastTs = now;

    var input  = document.getElementById('synedica-code-input');
    var btn    = document.getElementById('synedica-verify-btn');
    var result = document.getElementById('synedica-verify-result');
    var code   = input.value.trim().toUpperCase();

    if (!code) {
        result.className = 'synedica-verify-result show';
        result.innerHTML = '<div class="synedica-result-empty">' + SVG_INFO + 'Por favor, insira o codigo do produto antes de verificar.</div>';
        return;
    }

    if (!/^[A-Z]{2}[0-9]{5}$/.test(code)) {
        result.className = 'synedica-verify-result show';
        result.innerHTML = '<div class="synedica-result-empty">' + SVG_INFO + 'Formato invalido. O codigo deve conter 2 letras seguidas de 5 numeros (ex: AB12345).</div>';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = BTN_LOADING;
    result.className = 'synedica-verify-result';
    result.innerHTML = '';

    fetch(SUPABASE_URL + '/rest/v1/rpc/verificar_codigo', {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_codigo: code })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        btn.disabled = false;
        btn.innerHTML = BTN_DEFAULT;

        if (!data || data.length === 0) {
            showFake(result, code, false);
        } else if (data[0].status === 'disponivel') {
            showGenuine(result, { name: data[0].produto });
        } else {
            showFake(result, code, true);
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.innerHTML = BTN_DEFAULT;
        result.className = 'synedica-verify-result show';
        result.innerHTML = '<div class="synedica-result-empty">' + SVG_WARN + 'Erro ao conectar. Verifique sua conexao e tente novamente.</div>';
    });
}

function showGenuine(el, p) {
    el.className = 'synedica-verify-result show';
    el.innerHTML =
        '<div class="synedica-result-genuine">' +
        '<div class="rv-header">' +
        '<div class="rv-icon-wrap">' + SVG_CHECK + '</div>' +
        '<div><div class="rv-title">Produto Autentico</div>' +
        '<div class="rv-subtitle">Verificado e aprovado</div></div>' +
        '</div>' +
        '<div class="rv-divider"></div>' +
        '<div class="rv-details">' + detail('Produto', escapeHtml(p.name || '-')) + detail('Status', 'Registrado') + '</div>' +
        '<div class="rv-badge">' + SVG_CHECK + ' Certificado pela Synedica</div>' +
        '</div>';
}

function showFake(el, code, knownFake) {
    el.className = 'synedica-verify-result show';
    var safeCode = escapeHtml(code);
    var msg = knownFake
        ? 'O codigo <strong>' + safeCode + '</strong> consta em nosso sistema como <strong>potencialmente falsificado</strong>. Nao utilize este produto e reporte imediatamente.'
        : 'O codigo <strong>' + safeCode + '</strong> <strong>nao foi encontrado</strong> em nossa base de dados. Pode ser um produto falsificado ou com codigo invalido.';

    el.innerHTML =
        '<div class="synedica-result-fake">' +
        '<div class="rv-header">' +
        '<div class="rv-icon-wrap">' + SVG_WARN + '</div>' +
        '<div><div class="rv-title">Atencao: Risco de Falsificacao</div>' +
        '<div class="rv-subtitle">Codigo nao verificado</div></div>' +
        '</div>' +
        '<div class="rv-divider"></div>' +
        '<div class="rv-body">' + msg + '</div>' +
        '<div class="rv-actions">' +
        '<a href="https://wa.me/556692109858?text=Ol%C3%A1!%20Encontrei%20um%20produto%20com%20c%C3%B3digo%20suspeito%3A%20' + encodeURIComponent(safeCode) + '%20e%20gostaria%20de%20reportar." target="_blank" rel="noopener noreferrer" class="rv-action-btn primary">Reportar pelo WhatsApp</a>' +
        '</div></div>';
}

function synedicaResellerVerify() {
    var now = Date.now();
    if (now - _resellerLastTs < 3000) return;
    _resellerLastTs = now;

    var input  = document.getElementById('synedica-reseller-input');
    var btn    = document.getElementById('synedica-reseller-btn');
    var result = document.getElementById('synedica-reseller-result');
    var query  = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (!query) {
        result.innerHTML = '<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:12px;padding:16px 20px;color:#856404;font-size:0.93rem">Por favor, insira o site ou nome da loja.</div>';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" style="animation:sv-spin 0.8s linear infinite;width:16px;height:16px;vertical-align:middle;margin-right:6px" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-dasharray="28 56"/></svg> Verificando...';
    result.innerHTML = '';

    fetch(SUPABASE_URL + '/rest/v1/rpc/verificar_revendedor', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_query: query })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Verificar';

        if (data && data.length > 0) {
            result.innerHTML =
                '<div class="rs-ok">' +
                '<div class="rs-result-icon" style="background:#1F994E">' + SVG_CHECK + '</div>' +
                '<div><div class="rs-result-title" style="color:#4ade80">Revendedor Oficial Synedica</div>' +
                '<div class="rs-result-sub" style="color:#86efac"><strong style="color:#fff">' + escapeHtml(data[0].nome || query) + '</strong> é um revendedor autorizado e verificado pela Synedica.</div></div></div>';
        } else {
            result.innerHTML =
                '<div class="rs-fail">' +
                '<div class="rs-result-icon" style="background:#ef4444">' + SVG_WARN + '</div>' +
                '<div><div class="rs-result-title" style="color:#fca5a5">Nao encontrado como Revendedor Oficial</div>' +
                '<div class="rs-result-sub" style="color:#fca5a5">Este site ou loja nao consta em nossa lista de revendedores autorizados. Tenha cuidado ao realizar compras.</div>' +
                '<a href="https://wa.me/556692109858?text=Ol%C3%A1!%20Quero%20verificar%20se%20a%20loja%20' + encodeURIComponent(escapeHtml(query)) + '%20%C3%A9%20revendedora%20oficial%20Synedica." target="_blank" rel="noopener noreferrer" class="rs-report-btn">Reportar ao Suporte</a>' +
                '</div></div>';
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Verificar';
        result.innerHTML = '<div class="rs-warn">Erro ao conectar. Verifique sua conexao e tente novamente.</div>';
    });
}

function detail(label, value) {
    return '<div class="rv-detail-item"><div class="rv-detail-label">' + label + '</div><div class="rv-detail-value">' + value + '</div></div>';
}

var _s = document.createElement('style');
_s.textContent = '@keyframes sv-spin { to { transform: rotate(360deg); } }';
document.head.appendChild(_s);

document.addEventListener('DOMContentLoaded', function() {
    var input = document.getElementById('synedica-code-input');
    if (!input) return;

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') synedicaVerify();
    });

    input.addEventListener('input', function() {
        var raw = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        var built = '';
        for (var i = 0; i < raw.length && built.length < 7; i++) {
            var c = raw[i];
            if (built.length < 2) { if (/[A-Z]/.test(c)) built += c; }
            else { if (/[0-9]/.test(c)) built += c; }
        }
        this.value = built;
        var r = document.getElementById('synedica-verify-result');
        if (r) { r.className = 'synedica-verify-result'; r.innerHTML = ''; }
    });
});

// Auto-verificacao via URL (ex: ?codigo=AB12345 ou ?code=AB12345)
(function () {
    function initAutoVerifyFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var codeParam = (params.get('codigo') || params.get('code') || '').trim().toUpperCase();

        if (codeParam && /^[A-Z]{2}[0-9]{5}$/.test(codeParam)) {
            var input = document.getElementById('synedica-code-input');
            var verifySection = document.getElementById('synedica-verify-section');

            if (input) {
                input.value = codeParam;

                // Rola suavemente ate o verificador
                if (verifySection) {
                    setTimeout(function () {
                        verifySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }

                // Dispara a checagem no banco de dados
                setTimeout(function () {
                    if (typeof synedicaVerify === 'function') {
                        synedicaVerify();
                    } else {
                        var btn = document.getElementById('synedica-verify-btn');
                        if (btn) btn.click();
                    }
                }, 600);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoVerifyFromUrl);
    } else {
        initAutoVerifyFromUrl();
    }
})();

