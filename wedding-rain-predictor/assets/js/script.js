(function($) {
    "use strict";

    console.log("WRP: Script Loading v1.3.0");

    $(document).ready(function() {
        $('#wrp-debug-status').text('Script Status: Active').show();
        console.log("WRP: Initializing...");
    });

    window.wrpInitAutocomplete = function() {
        console.log("WRP: Autocomplete Init");
        var input = document.getElementById('wedding_place');
        if (!input) return;

        try {
            var autocomplete = new google.maps.places.Autocomplete(input, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'es' }
            });

            autocomplete.addListener('place_changed', function() {
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    $('#lat').val('');
                    $('#lng').val('');
                    return;
                }
                $('#lat').val(place.geometry.location.lat());
                $('#lng').val(place.geometry.location.lng());
                $('#wrp-place-error').hide();
                console.log("WRP: Place updated", place.geometry.location.lat(), place.geometry.location.lng());
            });
        } catch (e) {
            console.error("WRP: Google Maps Error", e);
        }
    };

    window.wrpHandleClick = function(e) {
        console.log("WRP: Click Handled");
        if (e) e.preventDefault();

        var $form = $('#wrp-form');
        var $submitBtn = $('#wrp-submit-btn');
        var $loading = $('#wrp-loading');
        var $result = $('#wrp-result');
        var $messages = $('#wrp-messages');
        var $errorNotice = $('#wrp-error-notice');
        var $errorMessage = $('#wrp-error-message');

        // Validation
        var allValid = true;
        $form.find('[required]').each(function() {
            var $el = $(this);
            if ($el.is(':checkbox')) {
                if (!$el.is(':checked')) allValid = false;
            } else {
                if (!$el.val()) allValid = false;
            }
        });

        if (!allValid) {
            alert('Por favor, rellena todos los campos obligatorios.');
            return;
        }

        var lat = $('#lat').val();
        var lng = $('#lng').val();

        if (!lat || !lng) {
            $('#wrp-place-error').fadeIn();
            $('#wedding_place').focus();
            return;
        }

        $submitBtn.prop('disabled', true).text('Procesando...');

        $form.fadeOut(400, function() {
            $loading.fadeIn();

            var scientificMessages = [
                "Conectando con satélites...",
                "Analizando registros históricos...",
                "Sincronizando datos climatológicos...",
                "Calculando probabilidades mediante IA...",
                "Procesando microclimas locales...",
                "Finalizando correlación..."
            ];

            function cycleMessages(index) {
                if (index >= scientificMessages.length || !$loading.is(':visible')) return;
                $messages.fadeOut(300, function() {
                    $(this).text(scientificMessages[index]).fadeIn(300);
                    setTimeout(function() { cycleMessages(index + 1); }, 900);
                });
            }
            cycleMessages(0);

            $.ajax({
                url: wrp_ajax.ajax_url,
                type: 'POST',
                data: $form.serialize() + '&action=wrp_predict_rain&nonce=' + wrp_ajax.nonce,
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        setTimeout(function() {
                            $loading.fadeOut(400, function() {
                                var data = response.data;
                                var html = '';
                                if (data.prediction === 'no_rain') {
                                    html = '<div class="wrp-result-card no-rain"><div class="wrp-result-icon">☀️</div><div class="wrp-result-title">¡Buenas noticias!</div><p>Nuestro modelo indica una <strong>probabilidad de lluvia inferior al 5%</strong>.</p><p><em>Análisis de '+data.historical_points+' puntos históricos.</em></p><button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Nueva consulta</button></div>';
                                } else {
                                    html = '<div class="wrp-result-card rain"><div class="wrp-result-icon">🌦️</div><div class="wrp-result-title">Pronóstico Incierto</div><p>Existe una <strong>probabilidad moderada de precipitaciones</strong>.</p><p><em>Análisis completado.</em></p><button type="button" onclick="window.location.reload()" class="wrp-reload-btn">Nueva consulta</button></div>';
                                }
                                $result.html(html).fadeIn();
                                $('html, body').animate({ scrollTop: $('#wrp-container').offset().top - 20 }, 500);
                            });
                        }, 4000);
                    } else {
                        showError(response.data || 'Error del servidor');
                    }
                },
                error: function() {
                    showError('Error de conexión.');
                }
            });
        });

        function showError(msg) {
            $loading.hide();
            $errorMessage.text(msg);
            $errorNotice.fadeIn();
        }
    };

    // Attach to button only if the onclick attribute failed (extra safety)
    $(document).ready(function() {
        var $btn = $('#wrp-submit-btn');
        if ($btn.length && !$btn.attr('onclick')) {
            $btn.on('click', window.wrpHandleClick);
        }

        $('#wrp-retry-btn').on('click', function() {
            $('#wrp-error-notice').hide();
            $('#wrp-submit-btn').prop('disabled', false).text('Calcular Probabilidades');
            $('#wrp-form').fadeIn();
        });
    });

})(jQuery);
