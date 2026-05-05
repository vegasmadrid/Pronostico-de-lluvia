<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Assets with Unique Handles
 */
function wrp_register_assets() {
	wp_register_style( 'wrp-main-style', WRP_URL . 'assets/css/style.css', array(), '1.3.1' );
	wp_register_script( 'wrp-main-script', WRP_URL . 'assets/js/script.js', array( 'jquery' ), '1.3.1', true );
}
add_action( 'wp_enqueue_scripts', 'wrp_register_assets' );

/**
 * Shortcode to display the predictor
 */
function wrp_shortcode() {
	wp_enqueue_style( 'wrp-main-style' );
	wp_enqueue_script( 'wrp-main-script' );

	$api_key = get_option( 'wrp_google_maps_api_key' );
	if ( $api_key ) {
		wp_enqueue_script( 'wrp-google-maps', "https://maps.googleapis.com/maps/api/js?key={$api_key}&libraries=places&callback=wrpInitAutocomplete", array(), null, true );
	}

	$ajax_data = array(
		'ajax_url' => admin_url( 'admin-ajax.php' ),
		'nonce'    => wp_create_nonce( 'wrp_nonce' ),
	);

	$privacy_page_id = get_option( 'wrp_privacy_policy_page' );
	$privacy_url = $privacy_page_id ? get_permalink( $privacy_page_id ) : '#';

	ob_start();
	?>
	<div id="wrp-container" class="wrp-container">
		<noscript><div style="color:red; padding:20px; text-align:center;">Este predictor requiere JavaScript.</div></noscript>

		<script type="text/javascript">
			var wrp_ajax = <?php echo json_encode( $ajax_data ); ?>;
		</script>

		<form id="wrp-form" onsubmit="return false;">
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
					<input type="tel" id="phone" name="phone" pattern="[0-9]{9}" placeholder="600111222" required>
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
					<input type="text" id="wedding_place" name="wedding_place" placeholder="Escribe el lugar o finca..." required autocomplete="off">
					<input type="hidden" id="lat" name="lat" value="">
					<input type="hidden" id="lng" name="lng" value="">
					<p id="wrp-place-error" style="color: #e74c3c; font-size: 13px; margin-top: 5px; display: none; font-weight: bold;">⚠️ Selecciona un lugar de la lista sugerida.</p>
				</div>
				<div class="wrp-field full-width checkbox-field">
					<input type="checkbox" id="privacy" name="privacy" required>
					<label for="privacy">Acepto la <a href="<?php echo esc_url( $privacy_url ); ?>" target="_blank">política de privacidad</a>.</label>
				</div>
			</div>
			<button type="button" id="wrp-submit-btn" onclick="if(window.wrpHandleClick) { window.wrpHandleClick(event); } else { alert('El sistema aún se está cargando, espera un segundo...'); }">Calcular Probabilidades</button>
		</form>

		<div id="wrp-loading" style="display: none;">
			<div class="wrp-animation">
				<div class="cloud cloud1"></div>
				<div class="cloud cloud2"></div>
				<div class="cloud cloud3"></div>
			</div>
			<div id="wrp-messages">Iniciando análisis de precisión...</div>
		</div>

		<div id="wrp-result" style="display: none;"></div>

		<div id="wrp-error-notice" style="display: none; background: #fdf2f2; border: 1px solid #f8b4b4; color: #9b2c2c; padding: 15px; margin-top: 20px; border-radius: 5px; text-align: center;">
			<p id="wrp-error-message"></p>
			<button type="button" id="wrp-retry-btn" class="wrp-reload-btn">Intentar de nuevo</button>
		</div>
	</div>
	<?php
	return ob_get_clean();
}
add_shortcode( 'wedding_rain_predictor', 'wrp_shortcode' );
