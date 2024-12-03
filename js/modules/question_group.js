
/**
 * Initialise l'objet "questionGroup" ainsi que la méthode "init" obligatoire pour la bibliothèque EoxiaJS.
 *
 * @since   1.1.0
 * @version 1.1.0
 */
window.digiquali.questionGroup = {};

/**
 * La méthode appelée automatiquement par la bibliothèque EoxiaJS.
 *
 * @since   1.1.0
 * @version 1.1.0
 *
 * @return {void}
 */
window.digiquali.questionGroup.init = function() {
  window.digiquali.questionGroup.event();
};

/**
 * La méthode contenant tous les événements pour le questionGroup.
 *
 * @since   1.1.0
 * @version 1.1.0
 *
 * @return {void}
 */
window.digiquali.questionGroup.event = function() {
  $( document ).on( 'click', '.clicked-photo-preview', window.digiquali.questionGroup.previewPhoto );
  $( document ).on( 'click', '.ui-dialog-titlebar-close', window.digiquali.questionGroup.closePreviewPhoto );
  $( document ).on( 'click', '#show_photo', window.digiquali.questionGroup.showPhoto );
  $( document ).on( 'click', '.answer-picto .item, .wpeo-table .item', window.digiquali.questionGroup.selectAnswerPicto );
};

/**
 * Add border on preview photo.
 *
 * @since   1.1.0
 * @version 1.1.0
 *
 * @param  {MouseEvent} event Les attributs lors du clic.
 * @return {void}
 */
window.digiquali.questionGroup.previewPhoto = function ( event ) {
  if ($(this).hasClass('photo-ok')) {
    $("#dialogforpopup").attr('style', 'border: 10px solid #47e58e')
  } else if ($(this).hasClass('photo-ko'))  {
    $("#dialogforpopup").attr('style', 'border: 10px solid #e05353')
  }
};

/**
 * Close preview photo.
 *
 * @since   1.1.0
 * @version 1.1.0
 *
 * @param  {MouseEvent} event Les attributs lors du clic.
 * @return {void}
 */
window.digiquali.questionGroup.closePreviewPhoto = function ( event ) {
  $("#dialogforpopup").attr('style', 'border:')
};

/**
 * Show photo for questionGroup.
 *
 * @since   1.3.0
 * @version 1.3.0
 *
 * @return {void}
 */
window.digiquali.questionGroup.showPhoto = function() {
  let photo = $(this).closest('.questionGroup-table').find('.linked-medias')

  if (photo.hasClass('hidden')) {
    photo.attr('style', '')
    photo.removeClass('hidden')
  } else {
    photo.attr('style', 'display:none')
    photo.addClass('hidden')
  }
};

/**
 * Lors du clic sur un picto de réponse, remplace le contenu du toggle et met l'image du picto sélectionné.
 *
 * @since   1.0.0
 * @version 1.0.0
 *
 * @param  {MouseEvent} event [description]
 * @return {void}
 */
window.digiquali.questionGroup.selectAnswerPicto = function( event ) {
  var element = $(this).closest('.wpeo-dropdown');
  $(this).closest('.content').removeClass('active');
  element.find('.dropdown-toggle span').hide();
  element.find('.dropdown-toggle.button-picto').html($(this).closest('.wpeo-tooltip-event').html());
  element.find('.input-hidden-picto').val($(this).data('label'));
};
