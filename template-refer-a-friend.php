<?php
defined('ABSPATH') || exit;
/* Template Name: Refer a Friend */

$root = get_template_directory_uri();
$site_content = get_fields('option');

get_header();
?>

<?php if(is_user_logged_in()){ ?>

<section id="banner-refer-friend" style="background:url('<?php the_field('background_image'); ?>') no-repeat; background-size:cover;">
    <div class="banner-row">
        <div class="banner-left">
            <div class="banner-step-2">
                <div class="banner-above-titles-v2"><?php the_field('banner_above_title'); ?></div>
                <div class="banner-titles-v2"><?php the_field('banner_title'); ?></div>
                <div class="banner-description-v2"><?php the_field('banner_content'); ?></div>
                <div class="banner-underline"></div>
                <div class="button-text-below"><?php the_field('text_below_line'); ?></div>
                <div class="yotpo-box">
                    <input type="text" id="referred-customers-input" class="input-text" placeholder="Your friends' emails (separated by commas)">
                    <a href="#" id="referred-customers-send-btn" class="k-button k-button--primary">Send</a>
                </div>
            </div>
            <div class="banner-step-3" style="display: none;">
                <div class="banner-titles-v3">Thanks for referring</div>
                <div class="banner-above-titles-v3">Remind your friends to check their emails</div>
                <div class="yotpo-box">
                    <a id="step-1" href="#" class="k-button k-button--primary">Refer More Friends</a>
                </div>
            </div>
        </div>
        <div class="banner-right">
            <div class="check-rewards-title"><?php the_field('check_rewards_title'); ?></div>
            <div class="check-rewards-subtitle"><?php the_field('check_rewards_subtitle'); ?></div>
            <div class="check-rewards-table">
                <table>
                    <tr>
                        <td>EMAIL</td>
                        <td>STATUS</td>
                    <tr>
                    <tr>
                        <td>friend1@gmail.com</td>
                        <td>invited</td>
                    </tr>
                    <tr>
                        <td>friend2@gmail.com</td>
                        <td>invited</td>
                    </tr>
                    <tr>
                        <td>friend3@gmail.com</td>
                        <td>purchased ($15 earned)</td>
                    </tr>
                    <tr>
                        <td>friend4@gmail.com</td>
                        <td>purchased ($15 earned)</td>
                    </tr>
                    <tr>
                        <td>friend1@gmail.com</td>
                        <td>invited</td>
                    </tr>
                    <tr>
                        <td>friend2@gmail.com</td>
                        <td>invited</td>
                    </tr>
                    <tr>
                        <td>friend3@gmail.com</td>
                        <td>purchased ($15 earned)</td>
                    </tr>
                    <tr>
                        <td>friend4@gmail.com</td>
                        <td>purchased ($15 earned)</td>
                    </tr>
                </table>
            </div>
            <div class="banner-underline"></div>
            <div class="check-rewards-below-table"><?php the_field('text_below_table_i'); ?></div>
            <div class="check-rewards-below-table-2"><?php the_field('text_below_table_ii'); ?></div>
            <div class="yotpo-box">
                <a href="" class="k-button k-button--primary">Shop Now</a>
            </div>
        </div>
    </div>
</section>

<?php }else{ ?>

<section id="banner-refer-friend" style="background:url('<?php the_field('background_image_i'); ?>') no-repeat; background-size:cover;">
    <div class="banner-step-1">
        <div class="banner-above-titles-v3"><?php the_field('banner_above_title_i'); ?></div>
        <div class="banner-titles-v3"><?php the_field('banner_title_i'); ?></div>
        <div class="banner-description-v3"><?php the_field('banner_content_i'); ?></div>
        <div class="banner-underline"></div>
        <div class="button-text-below"><?php the_field('text_below_line_i'); ?></div>
        <div class="yotpo-box">
            <input id="customers-input" type="text" class="input-text" placeholder="Your email">
            <a href="#" id="customers-send-btn" class="k-button k-button--primary">Next</a>
        </div>
    </div>
    <div class="banner-step-2" style="display: none;">
        <div class="banner-above-titles-v2"><?php the_field('banner_above_title'); ?></div>
        <div class="banner-titles-v2"><?php the_field('banner_title'); ?></div>
        <div class="banner-description-v2"><?php the_field('banner_content'); ?></div>
        <div class="banner-underline"></div>
        <div class="button-text-below"><?php the_field('text_below_line'); ?></div>
        <div class="yotpo-box">
            <input type="text" id="referred-customers-input" class="input-text" placeholder="Your friends' emails (separated by commas)">
            <a href="#" id="referred-customers-send-btn" class="k-button k-button--primary">Send</a>
        </div>
    </div>
    <div class="banner-step-3" style="display: none;">
        <div class="banner-titles-v3">Thanks for referring</div>
        <div class="banner-above-titles-v3">Remind your friends to check their emails</div>
        <div class="yotpo-box">
            <a href="#" id="thank-you-back" class="k-button k-button--primary">Refer More Friends</a>
        </div>
    </div>
</section>

<?php } ?>

<script>
    var $ = jQuery.noConflict();
</script>
<script>

    var step_1 = $('.banner-step-1');
    var step_2 = $('.banner-step-2');
    var step_3 = $('.banner-step-3');

    // --

    $('#customers-send-btn').on('click', function(e) {

        e.preventDefault();

        var onSuccess = function() {
            step_1.hide();
            step_2.show();
            step_3.hide();
        }

        var onError = function(err, log=true) {
            alert('Oops! It looks like we\'re having trouble finding what you\'re looking for. Please try again later.');
            if(log){
                console.log('-- identifyReferrer Error');
                console.log(err);
            }
        }

        try {
            swellAPI.identifyReferrer($('#customers-input').val(), onSuccess, onError);
        } catch(err) {
            console.log('-- identifyReferrer Exception');
            console.log(err);
            onError(err, false);
        }

    });

    // --

    $('#referred-customers-send-btn').on('click', function(e) {

        e.preventDefault();

        var onSuccess = function() {
            step_1.hide();
            step_2.hide();
            step_3.show();
        }

        var onError = function(err, log=true) {
            alert('Oops! It looks like we\'re having trouble finding what you\'re looking for. Please try again later.');
            if(log){
                console.log('-- sendReferralEmails Error');
                console.log(err);
            }
        }

        var emails = $('#referred-customers-input').val().split(',');

        try {
            swellAPI.sendReferralEmails(emails, onSuccess, onError);
        } catch(err) {
            console.log('-- sendReferralEmails Exception');
            console.log(err);
            onError(err, false);
        }

    });

    // --

    $('#thank-you-back').on('click', function(e){

        step_1.show();
        step_2.hide();
        step_3.hide();

    });

</script>

<?php get_footer(lp); ?>