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
};

document.addEventListener("DOMContentLoaded", function () {
  const addQuestionButton = document.getElementById("addQuestionButton");
  const addGroupButton = document.getElementById("addGroupButton");
  const addQuestionRow = document.getElementById("addQuestionRow");
  const addGroupRow = document.getElementById("addGroupRow");

  addQuestionButton.addEventListener("click", function () {
    addQuestionRow.classList.remove("hidden");
    addGroupRow.classList.add("hidden");
  });

  addGroupButton.addEventListener("click", function () {
    addGroupRow.classList.remove("hidden");
    addQuestionRow.classList.add("hidden");
  });
});

function toggleGroup(groupId) {
  const groupQuestions = document.getElementById(`group-questions-${groupId}`);
  const toggleIcon = document.querySelector(`#group-${groupId} .toggle-icon`);

  if (groupQuestions.classList.contains('hidden')) {
    groupQuestions.classList.remove('hidden');
    toggleIcon.textContent = '-';
  } else {
    groupQuestions.classList.add('hidden');
    toggleIcon.textContent = '+';
  }
}

window.digiquali.sheet.closeAllGroups = function () {
  console.log('coucou')
  const groupQuestions = document.querySelectorAll('.group-question');

  groupQuestions.forEach(group => {
    group.closest('tbody').classList.add('hidden');
  });

  const toggleIcons = document.querySelectorAll('.toggle-icon');

  toggleIcons.forEach(icon => {
    icon.textContent = '+';
  });
}
