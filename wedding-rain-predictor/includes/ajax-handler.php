<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle AJAX request for rain prediction
 */
function wrp_predict_rain_callback() {
	check_ajax_referer( 'wrp_nonce', 'nonce' );

	$bride_name    = sanitize_text_field( $_POST['bride_name'] );
	$groom_name    = sanitize_text_field( $_POST['groom_name'] );
	$email         = sanitize_email( $_POST['email'] );
	$phone         = sanitize_text_field( $_POST['phone'] );
	$wedding_date  = sanitize_text_field( $_POST['wedding_date'] );
	$wedding_time  = sanitize_text_field( $_POST['wedding_time'] );
	$wedding_place = sanitize_text_field( $_POST['wedding_place'] );
	$lat           = floatval( $_POST['lat'] );
	$lng           = floatval( $_POST['lng'] );

	if ( empty( $email ) || ! is_email( $email ) ) {
		wp_send_json_error( 'Email no válido' );
	}

	// Calculate prediction
	$prediction = wrp_get_prediction( $lat, $lng, $wedding_date, $wedding_time );

	// Save lead to database
	global $wpdb;
	$table_name = $wpdb->prefix . 'wrp_leads';

	$wpdb->insert(
		$table_name,
		array(
			'bride_name'    => $bride_name,
			'groom_name'    => $groom_name,
			'email'         => $email,
			'phone'         => $phone,
			'wedding_date'  => $wedding_date,
			'wedding_time'  => $wedding_time,
			'wedding_place' => $wedding_place,
			'lat'           => $lat,
			'lng'           => $lng,
			'prediction'    => $prediction,
		)
	);

	// Send email to admin
	$admin_email = get_option( 'admin_email' );
	$subject = "Nuevo Lead: Pronóstico Lluvia - $bride_name y $groom_name";
	$message = "Has recibido un nuevo lead desde el pronosticador de lluvia:\n\n";
	$message .= "Novia: $bride_name\n";
	$message .= "Novio: $groom_name\n";
	$message .= "Email: $email\n";
	$message .= "Teléfono: $phone\n";
	$message .= "Fecha: $wedding_date\n";
	$message .= "Hora: $wedding_time\n";
	$message .= "Lugar: $wedding_place\n";
	$message .= "Predicción: " . ( $prediction === 'rain' ? 'Lluvia' : 'No Lluvia' ) . "\n";

	wp_mail( $admin_email, $subject, $message );

	// Return result
	wp_send_json_success( array(
		'prediction'        => $prediction,
		'historical_points' => wrp_get_mock_data_points()
	) );
}
add_action( 'wp_ajax_wrp_predict_rain', 'wrp_predict_rain_callback' );
add_action( 'wp_ajax_nopriv_wrp_predict_rain', 'wrp_predict_rain_callback' );
