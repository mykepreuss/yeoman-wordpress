
<?php
/**
 * Plugin Name: Grunt Sitemap Generator
 * Plugin URI: http://www.github.com/lgladdy
 * Description: Generate a JSON list of every page on a site so it can be used with grunt and uncss. Create a folder in /wp-content called mu-plugins, and drop this code into that folder, as grunt-sitemap.php
 * Author: Liam Gladdy
 * Author URI: http://gladdy.co.uk
 * Version: 1.0
 */

add_action('template_redirect','show_sitemap');

function show_sitemap() {
  if (isset($_GET['show_sitemap'])) {
    $the_query = new WP_Query(array('post_type' => 'any', 'posts_per_page' => '-1', 'post_status' => 'publish'));
    $urls = array();
    while ($the_query->have_posts()) {
      $the_query->the_post();
      $urls[] = get_permalink();
    }
    die(json_encode($urls));
  }
}