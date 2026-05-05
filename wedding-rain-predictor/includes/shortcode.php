<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shortcode to display the predictor
 */
function wrp_shortcode() {
	wp_enqueue_style( 'wrp-style' );
	wp_enqueue_script( 'wrp-script' );

	$api_key = get_option( 'wrp_google_maps_api_key' );
	if ( $api_key ) {
		// Use a unique callback to avoid conflicts
		wp_enqueue_script( 'google-maps', "https://maps.googleapis.com/maps/api/js?key={$api_key}&libraries=places&callback=wrpInitAutocomplete", array(), null, true );
	}

	$privacy_page_id = get_option( 'wrp_privacy_policy_page' );
	$privacy_url = $privacy_page_id ? get_permalink( $privacy_page_id ) : '#';

	ob_start();
	?>
	<div id="wrp-container" class="wrp-container">
		<form id="wrp-form" method="post" action="" onsubmit="return false;">
			<h2 class="wrp-title">Pronóstico de Lluvia para vuestra Boda</h2>
			<div class="wrp-grid">
				<div class="wrp-field">
					<label for="bride_name">Nombre de la Novia</label>
					<input type="text" id="bride_name" name="bride_name" required>
				</div>
				<div class="wrp-field">
					<label for="groom_name">Nombre del Novio</label>
					<input type="text" id="groom_name" name="groom_name" required>
				</div>
				<div class="wrp-field">
					<label for="email">Email de contacto</label>
					<input type="email" id="email" name="email" required>
				</div>
				<div class="wrp-field">
					<label for="phone">Teléfono (España)</label>
					<input type="tel" id="phone" name="phone" pattern="[0-9]{9}" placeholder="600111222" required title="Introduce un número de 9 dígitos">
				</div>
				<div class="wrp-field">
					<label for="wedding_date">Fecha de la Boda</label>
					<input type="date" id="wedding_date" name="wedding_date" required min="<?php echo date('Y-m-d'); ?>">
				</div>
				<div class="wrp-field">
					<label for="wedding_time">Hora del evento</label>
					<input type="time" id="wedding_time" name="wedding_time" required>
				</div>
				<div class="wrp-field full-width">
					<label for="wedding_place">Lugar de la celebración</label>
					<input type="text" id="wedding_place" name="wedding_place" placeholder="Escribe el nombre del lugar o finca..." required autocomplete="off">
					<input type="hidden" id="lat" name="lat">
					<input type="hidden" id="lng" name="lng">
					<p id="wrp-place-error" style="color: #e74c3c; font-size: 12px; margin-top: 5px; display: none;">Debes seleccionar un lugar de la lista sugerida por Google.</p>
				</div>
				<div class="wrp-field full-width checkbox-field">
					<input type="checkbox" id="privacy" name="privacy" required>
					<label for="privacy">Acepto la <a href="<?php echo esc_url( $privacy_url ); ?>" target="_blank">política de privacidad</a> para recibir el pronóstico.</label>
				</div>
			</div>
			<button type="submit" id="wrp-submit">Calcular Probabilidades</button>
		</form>

		<div id="wrp-loading" style="display: none;">
			<div class="wrp-animation">
				<div class="cloud cloud1"></div>
				<div class="cloud cloud2"></div>
				<div class="cloud cloud3"></div>
			</div>
			<div id="wrp-messages">Iniciando análisis de precisión...</div>
		</div>

		<div id="wrp-result" style="display: none;">
			<!-- Result will be injected here -->
		</div>

		<div id="wrp-error-notice" style="display: none; background: #fdf2f2; border: 1px solid #f8b4b4; color: #9b2c2c; padding: 15px; margin-top: 20px; border-radius: 5px; text-align: center;">
			<p id="wrp-error-message"></p>
			<button type="button" id="wrp-retry" style="margin-top: 10px; cursor: pointer;">Intentar de nuevo</button>
		</div>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'wedding_rain_predictor', 'wrp_shortcode' );

/**
 * Register Assets
 */
function wrp_register_assets() {
	wp_register_style( 'wrp-style', WRP_URL . 'assets/css/style.css' );
	wp_register_script( 'wrp-script', WRP_URL . 'assets/js/script.js', array( 'jquery' ), '1.1.0', true );
	wp_localize_script( 'wrp-script', 'wrp_ajax', array(
		'ajax_url' => admin_url( 'admin-ajax.php' ),
		'nonce'    => wp_create_nonce( 'wrp_nonce' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'wrp_register_assets' );
