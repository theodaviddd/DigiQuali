/**
 * Initialise l'objet "sheet" ainsi que la méthode "init" obligatoire pour la bibliothèque EoxiaJS.
 *
 * @since   1.3.0
 * @version 1.3.0
 */
window.digiquali.sheet = {};

/**
 * La méthode appelée automatiquement par la bibliothèque EoxiaJS.
 *
 * @since   1.3.0
 * @version 1.3.0
 *
 * @return {void}
 */
window.digiquali.sheet.init = function() {
	window.digiquali.sheet.event();
};

/**
 * La méthode contenant tous les événements pour la fiche modèle.
 *
 * @since   1.3.0
 * @version 1.3.0
 *
 * @return {void}
 */
window.digiquali.sheet.event = function() {

  $( document ).on( 'click', '.toggle-group-in-tree', window.digiquali.sheet.toggleGroupInTree );
  $( document ).on( 'click', '#addQuestionButton, #addGroupButton', window.digiquali.sheet.buttonActions );
  $(document).on('mouseenter', '.sheet-move-line.ui-sortable-handle', window.digiquali.sheet.draganddrop);
};

/**
 * Show or hide the add question or group row
 *
 * @since   20.1.0
 * @version 20.1.0
 */
window.digiquali.sheet.buttonActions = function() {
  const addQuestionRow = $('#addQuestionRow');
  const addGroupRow = $('#addGroupRow');

  if ($(this).attr('id') === 'addQuestionButton') {
    addQuestionRow.removeClass('hidden');
    addGroupRow.addClass('hidden');
  } else {
    addGroupRow.removeClass('hidden');
    addQuestionRow.addClass('hidden');
  }
}

/**
 * Show or hide the sub-questions of a group
 *
 * @since   20.1.0
 * @version 20.1.0
 * @param groupId
 */
window.digiquali.sheet.toggleGroup = function(groupId) {
  const groupQuestions = $(`.group-question-${groupId}`);
  const toggleIcon = $(`#group-${groupId} .toggle-icon`);

  groupQuestions.each(function () {
    const question = $(this);
    const isHidden = question.toggleClass('hidden').hasClass('hidden');
    toggleIcon.text(isHidden ? '+' : '-');
  });
}

/**
 * Close all groups
 *
 * @since   20.1.0
 * @version 20.1.0
 */
window.digiquali.sheet.closeAllGroups = function () {
  const groupQuestions = $('.group-question');
  const toggleIcons = $('.toggle-icon');

  groupQuestions.addClass('hidden');
  toggleIcons.text('+');
}

/**
 * Show or hide the sub-questions of a group
 *
 * @since   20.1.0
 * @version 20.1.0
 */
window.digiquali.sheet.toggleGroupInTree = function () {
  let subQuestions = $(this).closest('.group-item').next()[0];
  $(this).toggleClass('fa-chevron-up fa-chevron-down');

  if (subQuestions && subQuestions.classList.contains("sub-questions")) {
    subQuestions.classList.toggle("collapsed");
  }
}

/**
 * Grey out the question or group selected
 *
 * @since   20.1.0
 * @version 20.1.0
 */
window.digiquali.sheet.greyOut = function () {
  const questionGroups = $('.group-item');
  const questions = $('.question-item');
  const sheets = $('.sheet-header');

  questionGroups.removeClass('selected');
  questions.removeClass('selected');
  sheets.removeClass('selected');
}

/**
 * Drag and drop on move-line action
 *
 * @since   20.1.0
 * @version 20.1.0
 *
 * @return {void}
 */
window.digiquali.sheet.draganddrop = function () {
  $(this).css('cursor', 'pointer');

  $('#tablelines tbody').sortable({
    handle: '.sheet-move-line',
    connectWith:'#tablelines tbody .line-row',
    tolerance:'intersect',
    over:function(){
      $(this).css('cursor', 'grabbing');
    },
    stop: function() {
      $(this).css('cursor', 'default');
      let token = $('.fiche').find('input[name="token"]').val();

      let separator = '&'
      if (document.URL.match(/action=/)) {
        document.URL = document.URL.split(/\?/)[0]
        separator = '?'
      }
      let lineOrder = [];
      $('.line-row').each(function(  ) {
        lineOrder.push($(this).attr('id'));
      });

      window.saturne.loader.display($('.side-nav .question-list'));

      $.ajax({
        url: document.URL + separator + "action=moveLine&token=" + token,
        type: "POST",
        data: JSON.stringify({
          order: lineOrder
        }),
        processData: false,
        contentType: false,
        success: function (resp) {
          $('.side-nav .question-list').html($(resp).find('.side-nav .question-list'));
          window.saturne.loader.remove($('.side-nav .question-list'));
        },
        error: function() {}
      });
    }
  });
};
