<?php
/* Copyright (C) 2024 EVARISK <technique@evarisk.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 *   	\file       view/sheet/sheet_stats.php
 *		\ingroup    digiquali
 *		\brief      Page to show sheet statistics
 */

// Load DigiQuali environment
if (file_exists('../digiquali.main.inc.php')) {
	require_once __DIR__ . '/../digiquali.main.inc.php';
} elseif (file_exists('../../digiquali.main.inc.php')) {
	require_once __DIR__ . '/../../digiquali.main.inc.php';
} else {
	die('Include of digiquali main fails');
}

// Libraries
require_once DOL_DOCUMENT_ROOT . '/categories/class/categorie.class.php';

require_once __DIR__ . '/../../class/sheet.class.php';
require_once __DIR__ . '/../../class/question.class.php';
require_once __DIR__ . '/../../class/questiongroup.class.php';
require_once __DIR__ . '/../../class/control.class.php';
require_once __DIR__ . '/../../class/answer.class.php';
require_once __DIR__ . '/../../lib/digiquali_sheet.lib.php';

// Global variables definitions
global $conf, $db, $hookmanager, $langs, $user;

// Load translation files required by the page
saturne_load_langs(["other", "product", 'bills', 'orders']);

// Get parameters
$id                  = GETPOST('id', 'int');
$ref                 = GETPOST('ref', 'alpha');
$action              = GETPOST('action', 'aZ09');
$contextpage         = GETPOST('contextpage', 'aZ') ?GETPOST('contextpage', 'aZ') : 'sheetstats'; // To manage different context of search

// Initialize technical objects
$object = new Sheet($db);
$control = new Control($db);
$controlLine = new ControlLine($db);
$answer = new Answer($db);
$extrafields = new ExtraFields($db);

// View objects
$form = new Form($db);

$hookmanager->initHooks(array('sheetstats', 'globalcard')); // Note that conf->hooks_modules contains array

// Fetch optionals attributes and labels
$extrafields->fetch_name_optionals_label($object->table_element);

// Load object
include DOL_DOCUMENT_ROOT.'/core/actions_fetchobject.inc.php'; // Must be include, not include_once.

$permissiontoread = $user->rights->digiquali->sheet->read;

// Security check - Protection if external user
saturne_check_access($permissiontoread, $object);

/*
 * View
 */

$title = $langs->trans('Sheet') . ' - ' . $langs->trans('Statistics');
$help_url = 'FR:Module_Digiquali#Fiche_modèle';

saturne_header(0, '', $title, $help_url);

$linkback = '<a href="' . DOL_URL_ROOT . '/custom/digiquali/view/sheet/sheet_list.php' . (!empty($socid) ? '?socid=' . $socid : '') . '">' . $langs->trans("BackToList") . '</a>';

$morehtmlref = '<div class="refidno">';
$morehtmlref .= $object->ref;
$morehtmlref .= '</div>';

$head = sheet_prepare_head($object);
dol_fiche_head($head, 'stats', $title, -1, $object->picto);

dol_banner_tab($object, 'ref', $linkback, 1, 'ref', 'ref', $morehtmlref, '', 1, '');

print '<div class="fiche sheet-stats-container">';

// Get all controls related to this sheet using the direct fk_sheet relationship
$filter = ['fk_sheet' => $object->id];
$controls = $control->fetchAll('', '', 0, 0, $filter);

// Stats variables
$nb_controls = is_array($controls) ? count($controls) : 0;
$last_control_date = '';
$avg_verdict = 0;

// Calculate statistics if controls exist
if ($nb_controls > 0) {
    $verdict_sum = 0;
    $latest_date = 0;

    foreach ($controls as $control_obj) {
        // Get the latest control date
        $control_date = $db->jdate($control_obj->date_creation);
        if ($control_date > $latest_date) {
            $latest_date = $control_date;
            $last_control_date = dol_print_date($control_date, 'dayhour');
        }

        // Sum verdicts for average calculation
        if (!empty($control_obj->verdict)) {
            $verdict_sum += $control_obj->verdict;
        }
    }

    // Calculate average verdict
    $avg_verdict = $nb_controls > 0 ? $verdict_sum / $nb_controls : 0;
}

// First section - Global statistics
print '<div class="stats-section">';
print '<div class="stats-title">' . $langs->trans("GlobalStatistics") . '</div>';
print '<div class="stats-content">';

print '<div class="stat-card">';
print '<div class="stat-value">' . $nb_controls . '</div>';
print '<div class="stat-label">' . $langs->trans("NumberOfControls") . '</div>';
print '</div>';

if (!empty($last_control_date)) {
    print '<div class="stat-card">';
    print '<div class="stat-value">' . $last_control_date . '</div>';
    print '<div class="stat-label">' . $langs->trans("LastControlDate") . '</div>';
    print '</div>';
}

if ($nb_controls > 0) {
    print '<div class="stat-card">';
    print '<div class="stat-value">' . round($avg_verdict * 100) . '%</div>';
    print '<div class="stat-label">' . $langs->trans("AverageVerdictScore") . '</div>';
    print '</div>';
}

print '</div>';
print '</div>';


// Get questions for this sheet using the dedicated function
$questionsAndGroups = $object->fetchQuestionsAndGroups();
$questions = [];
$questionAnswersStats = [];
// Extract questions from the result (filtering out question groups)
if (is_array($questionsAndGroups) && !empty($questionsAndGroups)) {
    foreach($questionsAndGroups as $questionOrGroup) {
        if ($questionOrGroup->element == 'questiongroup') {
            $groupQuestions = $questionOrGroup->fetchQuestionsOrderedByPosition();
            if (is_array($groupQuestions) && !empty($groupQuestions)) {
                foreach($groupQuestions as $groupQuestion) {
                    $groupQuestion->fk_question_group = $questionOrGroup->id;
                    $questions[] = $groupQuestion;
                }
            }
        } else {
            $questionOrGroup->fk_question_group = 0;
            $questions[] = $questionOrGroup;
        }
    }
}
// // ce qu'il faut :
// $questionAnswerStats = [
//     'question_id' => [
//      'answer_1_id' => [
//          'position' => 'position',
//          'nb_answers' => 'nb_answers'
//      ]
// ];



// pour récupérer le nombre d'answers c'est : récupérer les controldet qui ont comme fk_control un des controles qui a comme fk_sheet la sheet sur laquelle on est.
// ensuite pour chaque control det on vient incrémenter le nombre de fois qu'on a vu cette réponse pour cette question

foreach ($questions as $question) {
    $possibleAnswers = $answer->fetchAll('ASC', 'position', 0, 0,  ['customsql' => 't.status > ' . Answer::STATUS_DELETED . ' AND t.fk_question = ' . $question->id]);
    if (!empty($possibleAnswers)) {
        foreach ($possibleAnswers as $possibleAnswer) {
            $questionAnswerStats[$question->id][$possibleAnswer->position] = [
                'nb_answers' => 0,
            ];
        }
    }
}

foreach ($controls as $control) {
    $control->fetchLines();
    foreach ($control->lines as $controlAnswer) {
        if ($controlAnswer->answer > 0) {
            $questionAnswerStats[$controlAnswer->fk_question][$controlAnswer->answer]['nb_answers'] += 1;
        }
    }
}


// If we have questions and controls, get statistics for each question
if (!empty($questions) && !empty($controls)) {

    // Second section - Question statistics
    print '<div class="stats-section">';
    print '<div class="stats-title">' . $langs->trans("QuestionsStatistics") . '</div>';
    print '<div class="stats-content">';

    print '<table class="question-stats-table">';
    print '<thead>';
    print '<tr class="liste_titre">';
    print '<th>' . $langs->trans("Question") . '</th>';
    print '<th>' . $langs->trans("Type") . '</th>';
    print '<th>' . $langs->trans("AnswersStatistics") . '</th>';
    print '</tr>';
    print '</thead>';
    print '<tbody>';

        //tableau ici

    foreach ($questions as $question) {
        print '<tr>';
        print '<td>' . $question->getNomUrl(1) . '</td>';
        print '<td>' . $langs->trans($question->type) . '</td>';
        if (!empty($questionAnswerStats[$question->id])) {
                foreach ($questionAnswerStats[$question->id] as $answerPosition => $answerStats) {
                    print '<td>';
                        print $answerPosition . ' : ' . $answerStats['nb_answers'];
                        print '</td>';

                }

        }

        print '</tr>';

    }

    print '</tbody>';
    print '</table>';

    print '</div>';
    print '</div>';
} else {
    print '<div class="stats-section">';
    print '<div class="stats-title">' . $langs->trans("QuestionsStatistics") . '</div>';
    print '<div class="stats-content">';
    print $langs->trans("NoQuestionsLinked");
    print '</div>';
    print '</div>';
}

print '</div>';

print dol_get_fiche_end();

// End of page
llxFooter();
$db->close();
