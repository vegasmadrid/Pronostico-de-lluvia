<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Admin Menu
 */
function wrp_admin_menu() {
	add_menu_page(
		'Pronosticador de Lluvia',
		'Lluvia Bodas',
		'manage_options',
		'wrp-settings',
		'wrp_settings_page',
		'dashicons-cloud',
		30
	);

	add_submenu_page(
		'wrp-settings',
		'Configuración',
		'Configuración',
		'manage_options',
		'wrp-settings',
		'wrp_settings_page'
	);

	add_submenu_page(
		'wrp-settings',
		'Leads de Parejas',
		'Leads',
		'manage_options',
		'wrp-leads',
		'wrp_leads_page'
	);
}
add_action( 'admin_menu', 'wrp_admin_menu' );

/**
 * Register Settings
 */
function wrp_register_settings() {
	register_setting( 'wrp_settings_group', 'wrp_google_maps_api_key' );
	register_setting( 'wrp_settings_group', 'wrp_privacy_policy_page' );
}
add_action( 'admin_init', 'wrp_register_settings' );

/**
 * Settings Page Content
 */
function wrp_settings_page() {
	?>
	<div class="wrap">
		<h1>Configuración del Pronosticador de Lluvia</h1>
		<form method="post" action="options.php">
			<?php
			settings_fields( 'wrp_settings_group' );
			do_settings_sections( 'wrp_settings_group' );
			?>
			<table class="form-table">
				<tr valign="top">
					<th scope="row">Google Maps API Key</th>
					<td>
						<input type="text" name="wrp_google_maps_api_key" value="<?php echo esc_attr( get_option( 'wrp_google_maps_api_key' ) ); ?>" class="regular-text" />
						<p class="description">Necesaria para el autocompletado de lugares.</p>
					</td>
				</tr>
				<tr valign="top">
					<th scope="row">Página de Política de Privacidad</th>
					<td>
						<?php
						wp_dropdown_pages( array(
							'name'              => 'wrp_privacy_policy_page',
							'selected'          => get_option( 'wrp_privacy_policy_page' ),
							'show_option_none'  => '-- Seleccionar página --',
							'option_none_value' => '0',
						) );
						?>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

/**
 * Leads Page Content
 */
function wrp_leads_page() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'wrp_leads';
	$leads = $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC" );

	?>
	<div class="wrap">
		<h1>Leads de Parejas</h1>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th>Fecha/Hora</th>
					<th>Novia</th>
					<th>Novio</th>
					<th>Email</th>
					<th>Teléfono</th>
					<th>Fecha Boda</th>
					<th>Lugar</th>
					<th>Predicción</th>
				</tr>
			</thead>
			<tbody>
				<?php if ( $leads ) : ?>
					<?php foreach ( $leads as $lead ) : ?>
						<tr>
							<td><?php echo esc_html( $lead->created_at ); ?></td>
							<td><?php echo esc_html( $lead->bride_name ); ?></td>
							<td><?php echo esc_html( $lead->groom_name ); ?></td>
							<td><?php echo esc_html( $lead->email ); ?></td>
							<td><?php echo esc_html( $lead->phone ); ?></td>
							<td><?php echo esc_html( $lead->wedding_date . ' ' . $lead->wedding_time ); ?></td>
							<td><?php echo esc_html( $lead->wedding_place ); ?></td>
							<td><?php echo esc_html( $lead->prediction ); ?></td>
						</tr>
					<?php endforeach; ?>
				<?php else : ?>
					<tr>
						<td colspan="8">No se han encontrado leads.</td>
					</tr>
				<?php endif; ?>
			</tbody>
		</table>
	</div>
	<?php
}
