(function($) {
    "use strict";

    console.log("WRP: Script Loading v1.2.1");

    window.wrpInitAutocomplete = function() {
        console.log("WRP: Autocomplete Init");
        const input = document.getElementById('wedding_place');
        if (!input) {
            console.error("WRP: wedding_place input not found");
            return;
        }

        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.error("WRP: Google Maps library not loaded");
            return;
        }

        try {
            const autocomplete = new google.maps.places.Autocomplete(input, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'es' }
            });

            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();
                console.log("WRP: Place changed", place);
                if (!place.geometry) {
                    $('#lat').val('');
                    $('#lng').val('');
                    return;
                }
                $('#lat').val(place.geometry.location.lat());
                $('#lng').val(place.geometry.location.lng());
                $('#wrp-place-error').hide();
            });
        } catch (e) {
            console.error("WRP: Error initializing autocomplete", e);
        }
    };

    $(document).ready(function() {
        console.log("WRP: Document Ready");

        const $container = $('#wrp-container');
        if (!$container.length) {
            console.error("WRP: Container not found");
            return;
        }

        const $form = $('#wrp-form');
        const $submitBtn = $('#wrp-submit-btn');
        const $loading = $('#wrp-loading');
        const $result = $('#wrp-result');
        const $messages = $('#wrp-messages');
        const $errorNotice = $('#wrp-error-notice');
        const $errorMessage = $('#wrp-error-message');

        const scientificMessages = [
            "Conectando con satélites meteorológicos...",
            "Analizando modelos de regresión histórica...",
            "Sincronizando datos climatológicos (200 años)...",
            "Calculando vectores de probabilidad mediante IA...",
            "Procesando microclimas locales...",
            "Finalizando correlación geoespacial..."
        ];

        $submitBtn.on('click', function(e) {
            console.log("WRP: Button Clicked");
            e.preventDefault();

            // Validate fields
            let firstInvalid = null;
            $form.find('[required]').each(function() {
                const $el = $(this);
                let invalid = false;
                if ($el.is(':checkbox')) {
                    if (!$el.is(':checked')) invalid = true;
                } else {
                    if (!$el.val()) invalid = true;
                }

                if (invalid) {
                    $el.css('border-color', 'red');
                    if (!firstInvalid) firstInvalid = $el;
                } else {
                    $el.css('border-color', '#ddd');
                }
            });

            if (firstInvalid) {
                alert('Por favor, rellena todos los campos obligatorios.');
                firstInvalid.focus();
                return;
            }

            const lat = $('#lat').val();
            const lng = $('#lng').val();

            if (!lat || !lng) {
                console.log("WRP: Coordinates missing");
                $('#wrp-place-error').fadeIn();
                $('#wedding_place').focus();
                return;
            }

            console.log("WRP: Validation passed, starting AJAX");
            $submitBtn.prop('disabled', true).text('Procesando...');

            $form.fadeOut(400, function() {
                $loading.fadeIn();
                cycleMessages(0);

                $.ajax({
                    url: wrp_ajax.ajax_url,
                    type: 'POST',
                    data: $form.serialize() + '&action=wrp_predict_rain&nonce=' + wrp_ajax.nonce,
                    dataType: 'json',
                    success: function(response) {
                        console.log("WRP: Response received", response);
                        if (response.success) {
                            setTimeout(function() {
                                showResult(response.data);
                            }, 4000);
                        } else {
                            showError(response.data || 'Error en el servidor');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error("WRP: AJAX Error", status, error);
                        showError('Error de conexión. Por favor, inténtalo de nuevo.');
                    }
                });
            });
        });

        $('#wrp-retry-btn').on('click', function() {
            $errorNotice.hide();
            $submitBtn.prop('disabled', false).text('Calcular Probabilidades');
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
            let html = '';
            if (data.prediction === 'no_rain') {
                html = `
                    <div class="wrp-result-card no-rain">
                        <div class="wrp-result-icon">☀️</div>
                        <div class="wrp-result-title">¡Buenas noticias!</div>
                        <p>Nuestro modelo predictivo indica una <strong>probabilidad de lluvia inferior al 5%</strong>.</p>
                        <p><em>Basado en el análisis de ${data.historical_points} puntos de datos.</em></p>
                        <button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Nueva consulta</button>
                    </div>
                `;
            } else {
                html = `
                    <div class="wrp-result-card rain">
                        <div class="wrp-result-icon">🌦️</div>
                        <div class="wrp-result-title">Pronóstico Incierto</div>
                        <p>Existe una <strong>probabilidad moderada de precipitaciones</strong>.</p>
                        <p><em>Análisis de precisión geoespacial completado.</em></p>
                        <button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Nueva consulta</button>
                    </div>
                `;
            }

            $loading.fadeOut(400, function() {
                $result.html(html).fadeIn();
                $('html, body').animate({
                    scrollTop: $container.offset().top - 20
                }, 500);
            });
        }
    });

})(jQuery);
