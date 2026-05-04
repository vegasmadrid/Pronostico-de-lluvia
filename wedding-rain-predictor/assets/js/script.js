function initWRPAutocomplete() {
    const input = document.getElementById('wedding_place');
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'es' }
    });

    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('lng').value = place.geometry.location.lng();
    });
}

jQuery(document).ready(function($) {
    const $form = $('#wrp-form');
    const $loading = $('#wrp-loading');
    const $result = $('#wrp-result');
    const $messages = $('#wrp-messages');

    const scientificMessages = [
        "Iniciando conexión con estaciones meteorológicas...",
        "Analizando perturbaciones troposféricas mediante modelos de regresión histórica...",
        "Sincronizando con bases de datos climatológicas de los últimos 200 años...",
        "Calculando vectores de probabilidad hídrica mediante IA avanzada...",
        "Procesando microclimas locales en un radio de 10km...",
        "Finalizando correlación de datos geoespaciales..."
    ];

    $form.on('submit', function(e) {
        e.preventDefault();

        const formData = $(this).serialize();

        $form.fadeOut(400, function() {
            $loading.fadeIn();
            cycleMessages(0);

            $.ajax({
                url: wrp_ajax.ajax_url,
                type: 'POST',
                data: formData + '&action=wrp_predict_rain&nonce=' + wrp_ajax.nonce,
                success: function(response) {
                    if (response.success) {
                        setTimeout(function() {
                            showResult(response.data);
                        }, 5000); // Artificial delay for the "scientific" feel
                    } else {
                        alert('Error: ' + response.data);
                        $loading.hide();
                        $form.show();
                    }
                },
                error: function() {
                    alert('Error de conexión');
                    $loading.hide();
                    $form.show();
                }
            });
        });
    });

    function cycleMessages(index) {
        if (index >= scientificMessages.length) return;

        $messages.fadeOut(400, function() {
            $(this).text(scientificMessages[index]).fadeIn();
            setTimeout(function() {
                cycleMessages(index + 1);
            }, 800);
        });
    }

    function showResult(data) {
        let html = '';
        if (data.prediction === 'no_rain') {
            html = `
                <div class="wrp-result-card no-rain">
                    <div class="wrp-result-icon">☀️</div>
                    <div class="wrp-result-title">¡Buenas noticias!</div>
                    <p>Nuestro modelo predictivo avanzado indica una <strong>probabilidad de lluvia inferior al 5%</strong> para el día y lugar de vuestra boda.</p>
                    <p><em>Basado en el análisis de ${data.historical_points} puntos de datos históricos.</em></p>
                    <button onclick="window.location.reload()" style="margin-top:20px; cursor:pointer;">Realizar otra consulta</button>
                </div>
            `;
        } else {
            html = `
                <div class="wrp-result-card rain">
                    <div class="wrp-result-icon">🌦️</div>
                    <div class="wrp-result-title">Pronóstico Incierto</div>
                    <p>Existe una <strong>probabilidad moderada de precipitaciones</strong>. Os recomendamos tener un plan B preparado para asegurar que el día sea perfecto.</p>
                    <p><em>Análisis de precisión geoespacial completado.</em></p>
                    <button onclick="window.location.reload()" style="margin-top:20px; cursor:pointer;">Realizar otra consulta</button>
                </div>
            `;
        }

        $loading.fadeOut(400, function() {
            $result.html(html).fadeIn();
        });
    }
});
