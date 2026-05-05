(function($) {
    "use strict";

    console.log("WRP: Script Loading");

    window.wrpInitAutocomplete = function() {
        console.log("WRP: Autocomplete Init");
        const input = document.getElementById('wedding_place');
        if (!input) return;

        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'es' }
        });

        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                $('#lat').val('');
                $('#lng').val('');
                return;
            }
            $('#lat').val(place.geometry.location.lat());
            $('#lng').val(place.geometry.location.lng());
            $('#wrp-place-error').hide();
            console.log("WRP: Place selected & coordinates set");
        });
    };

    $(document).ready(function() {
        console.log("WRP: Document Ready");

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

        // Main action on button click
        $submitBtn.on('click', function(e) {
            console.log("WRP: Button Clicked");
            e.preventDefault();

            // Basic validation check (since we are not using 'submit')
            const requiredFields = $form.find('[required]');
            let allValid = true;

            requiredFields.each(function() {
                if (!$(this).val() || ($(this).is(':checkbox') && !$(this).is(':checked'))) {
                    allValid = false;
                    $(this).css('border-color', 'red');
                } else {
                    $(this).css('border-color', '#ddd');
                }
            });

            if (!allValid) {
                alert('Por favor, rellena todos los campos obligatorios y acepta la política de privacidad.');
                return;
            }

            const lat = $('#lat').val();
            const lng = $('#lng').val();

            if (!lat || !lng) {
                console.log("WRP: Missing Lat/Lng");
                $('#wrp-place-error').fadeIn();
                $('html, body').animate({
                    scrollTop: $('#wedding_place').offset().top - 100
                }, 500);
                return;
            }

            const formData = $form.serialize();

            $form.fadeOut(400, function() {
                $loading.fadeIn();
                cycleMessages(0);

                $.ajax({
                    url: wrp_ajax.ajax_url,
                    type: 'POST',
                    data: formData + '&action=wrp_predict_rain&nonce=' + wrp_ajax.nonce,
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            setTimeout(function() {
                                showResult(response.data);
                            }, 4000);
                        } else {
                            showError(response.data || 'Error en el servidor');
                        }
                    },
                    error: function() {
                        showError('Error de conexión. Revisa tu internet.');
                    }
                });
            });
        });

        $('#wrp-retry-btn').on('click', function() {
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
                    scrollTop: $("#wrp-container").offset().top - 20
                }, 500);
            });
        }
    });

})(jQuery);
