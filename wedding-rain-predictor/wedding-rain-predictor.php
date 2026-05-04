<?php
/**
 * Plugin Name: Wedding Rain Predictor
 * Plugin URI: https://example.com/wedding-rain-predictor
 * Description: Un predictor de lluvia "mágico" para bodas que capta leads.
 * Version: 1.0.0
 * Author: Jules
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WRP_PATH', plugin_dir_path( __FILE__ ) );
define( 'WRP_URL', plugin_dir_url( __FILE__ ) );

/**
 * Activation Hook: Create leads table.
 */
function wrp_activate() {
	global $wpdb;
	$table_name = $wpdb->prefix . 'wrp_leads';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
		bride_name varchar(100) NOT NULL,
		groom_name varchar(100) NOT NULL,
		email varchar(100) NOT NULL,
		phone varchar(20) NOT NULL,
		wedding_date date NOT NULL,
		wedding_time time NOT NULL,
		wedding_place varchar(255) NOT NULL,
		lat decimal(10, 8) DEFAULT NULL,
		lng decimal(11, 8) DEFAULT NULL,
		prediction varchar(20) NOT NULL,
		created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
		PRIMARY KEY  (id)
	) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );
}
register_activation_hook( __FILE__, 'wrp_activate' );

// Include necessary files
require_once WRP_PATH . 'includes/admin-settings.php';
require_once WRP_PATH . 'includes/shortcode.php';
require_once WRP_PATH . 'includes/ajax-handler.php';
require_once WRP_PATH . 'includes/prediction-logic.php';
