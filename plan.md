
# Plan d'évolution de l'application ISO Manager

## 1. Pilotage Opérationnel & Suivi

*   **Météo des Projets (Flash Report) :** [FAIT]
    *   Permettre la saisie d'une météo (Soleil, Nuageux, Pluie, Orage) et d'un commentaire flash.
*   **Gestion des Jalons Clés (Milestones) :** [FAIT]
    *   Ajout de dates clés intermédiaires au sein d'un projet.
    *   Visualisation sur la Timeline.
*   **Gestion des Dépendances :** [FAIT]
    *   Lier les projets entre eux (Fin-Début).
    *   Identification du chemin critique.
*   **Diagramme de Gantt Avancé :** [EN COURS]
    *   **Objectif :** Visualisation granulaire des tâches et sous-tâches au sein des projets.
    *   **Fonctionnalités :**
        *   Vue hiérarchique (Projet > Phase > Tâche).
        *   Visualisation des dépendances (liens entre tâches).
        *   Zoom temporel (Mois / Semaine / Jour).
        *   Indicateurs de progression visuels.
        *   Chemin critique intra-projet.
    *   **UX/Design :** Interface fluide "Split View" (Liste à gauche, Graphique à droite), connecteurs courbes (Bézier), palette de couleurs moderne et apaisante.

## 2. Gestion Financière Avancée

*   **Courbe en S (S-Curve) :** [FAIT]
    *   Graphique comparatif Budget Planifié vs Réalisé cumulé.
*   **Jauges Budgétaires :** [FAIT]
    *   Suivi consommation MOA/MOE.

## 3. Gestion des Risques & Conformité

*   **Score de Criticité Projet (Scoring) :** [FAIT]
    *   Calcul automatique d'un score (ex: Impact * Urgence / Effort).
*   **Matrice de Couverture des Risques :** [FAIT]
    *   Croisement Risques Majeurs vs Projets.

## 4. Collaboration & Gestion des Ressources

*   **Plan de Charge des Ressources (Capacity Planning) :**
    *   Histogramme empilé des charges par Chef de Projet.
    *   Visualisation des surcharges.
*   **Centralisation des Preuves :**
    *   Section liens documentaires (SharePoint, Jira, Drive) dans la fiche projet.
    *   Centralisation des livrables clés.
