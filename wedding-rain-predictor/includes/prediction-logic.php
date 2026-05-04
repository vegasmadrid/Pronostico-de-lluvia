<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Predict rain based on location, date and time.
 * This is deterministic: same inputs -> same output.
 * Consistent spatially: nearby locations (rounded) -> same output.
 */
function wrp_get_prediction( $lat, $lng, $date, $time ) {
	// 1. Round coordinates to ~11km precision (0.1 degree)
	// This ensures consistency for nearby locations.
	$rounded_lat = round( $lat, 1 );
	$rounded_lng = round( $lng, 1 );

	// 2. Create a unique string for hashing
	$input_string = $rounded_lat . '|' . $rounded_lng . '|' . $date . '|' . substr($time, 0, 2); // rounded to the hour

	// 3. Generate a hash and convert to a number 0-99
	$hash = md5( $input_string );
	$hash_int = hexdec( substr( $hash, 0, 8 ) );
	$score = $hash_int % 100;

	// 4. Get monthly probability (Rainy days in Madrid/Toledo average)
	// Historical rainy days/month approx:
	// Jan: 6, Feb: 5, Mar: 6, Apr: 7, May: 7, Jun: 3, Jul: 2, Aug: 2, Sep: 3, Oct: 7, Nov: 7, Dec: 7
	// We want 90% "No Rain" in summer.
	$month = (int) date( 'm', strtotime( $date ) );

	$rain_threshold = 10; // Default: 10% chance of rain (90% No Rain)

	switch ( $month ) {
		case 6: case 7: case 8: case 9:
			$rain_threshold = 5; // Summer: 5% rain chance (95% No Rain)
			break;
		case 4: case 5: case 10: case 11:
			$rain_threshold = 15; // Spring/Autumn: 15% rain (85% No Rain)
			break;
		case 1: case 2: case 3: case 12:
			$rain_threshold = 20; // Winter: 20% rain (80% No Rain)
			break;
	}

	// 5. Determine result
	if ( $score < $rain_threshold ) {
		return 'rain';
	} else {
		return 'no_rain';
	}
}

if ( ! function_exists( 'wrp_get_mock_data_points' ) ) {
/**
 * Just a helper to return a "credible" number of data points
 */
function wrp_get_mock_data_points() {
	return number_format( rand( 1450000, 2800000 ), 0, ',', '.' );
}
}
