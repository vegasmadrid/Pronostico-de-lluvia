// Export to window to be accessible by Google Maps callback
window.wrpInitAutocomplete = function() {
    console.log("WRP: Initializing Autocomplete");
    const input = document.getElementById('wedding_place');
    if (!input) return;

    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'es' }
    });

    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        console.log("WRP: Place selected", place);

        if (!place.geometry) {
            document.getElementById('lat').value = '';
            document.getElementById('lng').value = '';
            return;
        }

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('lng').value = place.geometry.location.lng();
        jQuery('#wrp-place-error').hide();
    });
};

jQuery(document).ready(function($) {
    console.log("WRP: Script ready");

    const $form = $('#wrp-form');
    const $loading = $('#wrp-loading');
    const $result = $('#wrp-result');
    const $messages = $('#wrp-messages');
    const $errorNotice = $('#wrp-error-notice');
    const $errorMessage = $('#wrp-error-message');

    const scientificMessages = [
        "Iniciando conexión con estaciones meteorológicas...",
        "Analizando perturbaciones troposféricas mediante modelos de regresión histórica...",
        "Sincronizando con bases de datos climatológicas de los últimos 200 años...",
        "Calculando vectores de probabilidad hídrica mediante IA avanzada...",
        "Procesando microclimas locales en un radio de 10km...",
        "Finalizando correlación de datos geoespaciales..."
    ];

    $form.on('submit', function(e) {
        console.log("WRP: Form submitted");
        e.preventDefault();
        e.stopPropagation();

        const lat = $('#lat').val();
        const lng = $('#lng').val();

        if (!lat || !lng) {
            console.log("WRP: Missing coordinates");
            $('#wrp-place-error').fadeIn();
            $('#wedding_place').focus();
            return false;
        }

        const formData = $(this).serialize();
        console.log("WRP: Data serialized, starting animation");

        $errorNotice.hide();
        $form.fadeOut(400, function() {
            $loading.fadeIn();
            cycleMessages(0);

            console.log("WRP: Sending AJAX to", wrp_ajax.ajax_url);
            $.ajax({
                url: wrp_ajax.ajax_url,
                type: 'POST',
                data: formData + '&action=wrp_predict_rain&nonce=' + wrp_ajax.nonce,
                dataType: 'json',
                success: function(response) {
                    console.log("WRP: AJAX success", response);
                    if (response.success) {
                        setTimeout(function() {
                            showResult(response.data);
                        }, 4500);
                    } else {
                        showError(response.data || 'Error desconocido del servidor');
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("WRP: AJAX Error", textStatus, errorThrown);
                    showError('Error de conexión con el servidor. Por favor, comprueba tu internet o inténtalo más tarde.');
                }
            });
        });

        return false;
    });

    $('#wrp-retry').on('click', function() {
        $errorNotice.hide();
        $form.fadeIn();
    });

    function showError(msg) {
        $loading.hide();
        $errorMessage.text(msg);
        $errorNotice.fadeIn();
    }

    function cycleMessages(index) {
        if (index >= scientificMessages.length || !$loading.is(':visible')) return;

        $messages.fadeOut(300, function() {
            $(this).text(scientificMessages[index]).fadeIn(300);
            setTimeout(function() {
                cycleMessages(index + 1);
            }, 900);
        });
    }

    function showResult(data) {
        console.log("WRP: Displaying result", data);
        let html = '';
        if (data.prediction === 'no_rain') {
            html = `
                <div class="wrp-result-card no-rain">
                    <div class="wrp-result-icon">☀️</div>
                    <div class="wrp-result-title">¡Buenas noticias!</div>
                    <p>Nuestro modelo predictivo avanzado indica una <strong>probabilidad de lluvia inferior al 5%</strong> para el día y lugar de vuestra boda.</p>
                    <p><em>Basado en el análisis de ${data.historical_points} puntos de datos históricos reales.</em></p>
                    <button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Realizar otra consulta</button>
                </div>
            `;
        } else {
            html = `
                <div class="wrp-result-card rain">
                    <div class="wrp-result-icon">🌦️</div>
                    <div class="wrp-result-title">Pronóstico Incierto</div>
                    <p>Existe una <strong>probabilidad moderada de precipitaciones</strong>. Os recomendamos tener un plan B preparado para asegurar que el día sea perfecto.</p>
                    <p><em>Análisis de precisión geoespacial completado.</em></p>
                    <button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Realizar otra consulta</button>
                </div>
            `;
        }

        $loading.fadeOut(400, function() {
            $result.html(html).fadeIn();
            $('html, body').animate({
                scrollTop: $("#wrp-container").offset().top - 40
            }, 600);
        });
    }
});
