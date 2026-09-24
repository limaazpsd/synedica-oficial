(function () {
    if (localStorage.getItem('synd_lgpd_ok')) return;

    var banner = document.createElement('div');
    banner.id = 'synd-lgpd';
    banner.innerHTML =
        '<div style="max-width:820px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
        '<p style="margin:0;flex:1;min-width:220px;font-size:13px;line-height:1.5;color:#ccc">' +
        'Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, medir o desempenho do site e exibir anúncios relevantes. ' +
        'Ao continuar navegando, você concorda com nossa ' +
        '<a href="https://synedicaoficial.com/privacidade" style="color:#4ade80;text-decoration:underline">Política de Privacidade</a> ' +
        'em conformidade com a LGPD.' +
        '</p>' +
        '<button id="synd-lgpd-ok" style="flex-shrink:0;background:#1F994E;color:#fff;border:none;border-radius:8px;padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap">Entendi e aceito</button>' +
        '</div>';

    banner.style.cssText = [
        'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:99999',
        'background:rgba(15,15,15,0.97)', 'padding:14px 20px',
        'display:flex', 'justify-content:center', 'align-items:center',
        'box-shadow:0 -2px 16px rgba(0,0,0,0.4)', 'border-top:1px solid #222'
    ].join(';');

    document.body.appendChild(banner);

    document.getElementById('synd-lgpd-ok').addEventListener('click', function () {
        localStorage.setItem('synd_lgpd_ok', '1');
        banner.remove();
    });
})();
