import { IsoChapter, IsoMeasure } from '../../types';

export const technologicalControls: Omit<IsoMeasure, 'id'>[] = [
  // TECHNOLOGICAL CONTROLS (8.x)
  {
    code: '8.1',
    title: 'Terminaux des utilisateurs',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Protéger les informations sur les terminaux des utilisateurs.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_actifs', 'Configuration_sécurisée'],
      domains: ['Protection'],
      measure: "Il convient que les informations stockées, traitées ou accessibles via les terminaux des utilisateurs soient protégées.",
      objective: "Protéger les informations de l'organisation contre les risques introduits par les terminaux des utilisateurs.",
      recommendations: `<p>Il convient d'établir une politique spécifique à une thématique pour protéger les informations sur les terminaux des utilisateurs, qui tienne compte des risques liés à l'utilisation des terminaux des utilisateurs.</p><p>Cette politique doit prendre en compte :</p><ul><li>L'utilisation de la cryptographie (chiffrement) pour les disques durs des terminaux.</li><li>Les exigences pour la connexion aux réseaux.</li><li>Les restrictions sur l'installation de logiciels.</li><li>Les règles pour le transfert et le stockage d'informations de l'organisation sur des dispositifs non organisationnels.</li><li>La sauvegarde des informations.</li></ul>`,
      extraInfo: `<p>Les terminaux des utilisateurs incluent les ordinateurs portables, les ordinateurs de bureau, les smartphones, les tablettes, etc. Ces dispositifs sont souvent exposés à des environnements non contrôlés et nécessitent donc des mesures de protection robustes.</p>`
    }
  },
  {
    code: '8.2',
    title: 'Droits d\'accès à privilèges',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Limiter et contrôler l'attribution et l'utilisation des droits d'accès à privilèges.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_identités_et_des_accès'],
      domains: ['Protection'],
      measure: "Il convient que l'attribution et l'utilisation des droits d'accès à privilèges soient limitées et gérées.",
      objective: "Gérer l'accès aux comptes à privilèges pour empêcher l'utilisation non autorisée.",
      recommendations: `<p>Il convient de mettre en œuvre des mesures de sécurité pour gérer les droits d'accès à privilèges, en se basant sur le principe du moindre privilège.</p><p>Les lignes directrices suivantes doivent être prises en compte :</p><ul><li>Identifier tous les accès à privilèges requis pour chaque système ou processus.</li><li>Attribuer les droits d'accès à privilèges à des ID utilisateurs distincts de ceux utilisés pour les activités régulières.</li><li>Utiliser un processus d'autorisation formel pour l'attribution des droits à privilèges.</li><li>Conserver un enregistrement de tous les droits à privilèges accordés.</li><li>Réviser régulièrement les droits d'accès à privilèges et les supprimer lorsqu'ils ne sont plus nécessaires.</li><li>Utiliser des systèmes de gestion des accès à privilèges (PAM) lorsque cela est possible.</li></ul>`,
      extraInfo: `<p>Les droits d'accès à privilèges sont ceux qui permettent aux utilisateurs de contourner les contrôles de sécurité du système. Leur compromission peut avoir des conséquences graves pour l'organisation.</p>`
    }
  },
  {
    code: '8.3',
    title: 'Restriction de l\'accès à l\'information',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Restreindre l'accès à l'information et aux fonctions des applications conformément à la politique de contrôle d'accès.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_identités_et_des_accès', 'Sécurité_des_applications'],
      domains: ['Protection'],
      measure: "Il convient que l'accès à l'information et aux autres actifs associés soit limité conformément à la politique spécifique à la thématique du contrôle d'accès (voir 5.15).",
      objective: "Empêcher l'accès non autorisé à l'information.",
      recommendations: `<p>Il convient de restreindre l'accès à l'information, aux systèmes, aux applications et aux services en se basant sur les exigences métier et de sécurité.</p><p>Des mécanismes de restriction d'accès doivent être mis en œuvre, tels que :</p><ul><li>Des menus d'applications limitant les fonctions disponibles.</li><li>Des vues de base de données restreignant l'accès à certaines données.</li><li>Des permissions de système de fichiers contrôlant l'accès aux fichiers et répertoires.</li></ul><p>Il convient que l'accès physique et logique soit restreint pour les terminaux, les ports, les services réseau et autres ressources informatiques.</p>`,
      extraInfo: `<p>Le principe du besoin d'en connaître doit être appliqué pour s'assurer que les utilisateurs n'ont accès qu'aux informations nécessaires à l'accomplissement de leurs tâches.</p>`
    }
  },
  {
    code: '8.4',
    title: 'Accès au code source',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Gérer et contrôler de manière sécurisée l'accès au code source.",
    details: {
        type: ['Préventive'],
        properties: ['Confidentialité', 'Intégrité'],
        concepts: ['Protéger'],
        capabilities: ['Sécurité_des_applications', 'Gestion_des_actifs'],
        domains: ['Protection'],
        measure: "Il convient de gérer l'accès au code source, aux outils de développement et aux bibliothèques logicielles.",
        objective: "Empêcher l'introduction de fonctionnalités non autorisées et non intentionnelles dans le logiciel et éviter la compromission du code source.",
        recommendations: `<p>Il convient d'établir une politique spécifique à la thématique concernant l'accès au code source.</p><p>Les lignes directrices suivantes doivent être prises en compte :</p><ul><li>Le code source ne doit pas être stocké dans des systèmes opérationnels.</li><li>L'accès au code source doit être limité aux personnes autorisées sur la base du besoin d'en connaître.</li><li>Un journal d'audit de tous les accès au code source doit être maintenu.</li><li>Les modifications du code source doivent être suivies via un système de contrôle de version.</li><li>La mise à jour des bibliothèques de programmes sources doit être un processus contrôlé.</li></ul>`,
        extraInfo: `<p>Le code source est un actif critique. Sa protection est essentielle pour maintenir l'intégrité et la sécurité des applications développées par l'organisation.</p>`
    }
  },
  { 
    code: '8.5',
    title: 'Authentification sécurisée',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Assurer que les processus d'authentification sont sécurisés pour vérifier l'identité des utilisateurs.",
    details: {
        type: ['Préventive'],
        properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
        concepts: ['Protéger'],
        capabilities: ['Gestion_des_identités_et_des_accès'],
        domains: ['Protection'],
        measure: "Il convient que des mécanismes d'authentification sécurisés soient mis en œuvre pour vérifier l'identité déclarée des entités.",
        objective: "Assurer que les entités sont bien celles qu'elles prétendent être et empêcher les accès non autorisés.",
        recommendations: `<p>Il convient de mettre en œuvre des mécanismes d'authentification sécurisés pour toutes les entités (utilisateurs, systèmes, services) qui accèdent aux informations et autres actifs associés de l'organisation.</p><p>Les mécanismes d'authentification doivent être proportionnels aux risques associés à l'accès. Il convient de prendre en compte les éléments suivants :</p><ol type="a"><li>L'utilisation de l'authentification multifacteur (MFA) pour les accès à des informations sensibles ou critiques, ou pour les accès à distance.</li><li>La protection des informations d'authentification (voir 5.17).</li><li>La mise en œuvre de politiques de mots de passe robustes si les mots de passe sont utilisés.</li><li>L'utilisation de techniques d'authentification basées sur des certificats ou des jetons matériels lorsque cela est approprié.</li><li>La journalisation et la surveillance des tentatives d'authentification, réussies et échouées, pour détecter les activités suspectes (voir 8.15, 8.16).</li><li>La limitation du nombre de tentatives d'authentification infructueuses pour prévenir les attaques par force brute.</li><li>La mise en place de procédures sécurisées pour la récupération ou la réinitialisation des informations d'authentification.</li></ol>`,
        extraInfo: `<p>L'authentification sécurisée est un pilier fondamental du contrôle d'accès. Elle complète la gestion des identités (5.16) et la gestion des informations d'authentification (5.17). Des mécanismes d'authentification faibles peuvent être exploités par des attaquants pour obtenir un accès non autorisé aux systèmes et aux données. L'ISO/IEC 29115 fournit un cadre pour l'assurance de l'authentification.</p>`
    }
  },
  {
    code: '8.6',
    title: 'Dimensionnement',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Assurer la disponibilité des ressources (IT, humaines, installations) en surveillant et ajustant leur dimensionnement.",
    details: {
        type: ['Préventive', 'Détective'],
        properties: ['Intégrité', 'Disponibilité'],
        concepts: ['Identifier', 'Protéger', 'Détecter'],
        capabilities: ['Continuité'],
        domains: ['Gouvernance_et_Écosystème', 'Protection'],
        measure: "Il convient que l'utilisation des ressources soit surveillée et ajustée selon les besoins de dimensionnement actuels et prévus.",
        objective: "Assurer les besoins en termes de moyens de traitement de l'information, de ressources humaines, de bureaux et autres installations.",
        recommendations: `<p>Il convient d'identifier le dimensionnement nécessaire des moyens de traitement de l'information, des ressources humaines, des bureaux et autres installations, en tenant compte du niveau de criticité métier des systèmes et processus concernés.</p><p>Il convient d'appliquer une optimisation et une surveillance des systèmes pour assurer et, si nécessaire, améliorer leur disponibilité et leur efficacité.</p><p>Il convient que l'organisation soumette les systèmes et les services à des tests de résistance afin de s'assurer de la disponibilité de systèmes ayant un dimensionnement suffisant pour répondre aux exigences de performance pendant les pics d'utilisation.</p><p>Il convient de mettre en place des moyens de détection pour signaler les problèmes en temps voulu.</p><p>Il convient que les projections des besoins de dimensionnement futurs tiennent compte des nouveaux besoins métier et systèmes, et des tendances actuelles et prévues en termes de capacités de traitement de l'information de l'organisation.</p><p>Il convient de porter une attention particulière aux ressources pour lesquelles les délais d'approvisionnement sont longs ou les coûts élevés. Par conséquent, il convient que les managers et les propriétaires de produits ou services surveillent l'utilisation des ressources clés du système.</p><p>Il convient que les managers utilisent les informations relatives aux capacités pour identifier et éviter d'éventuelles limitations de ressources et la dépendance à l'égard du personnel clé, ce qui peut représenter une menace pour la sécurité du système ou pour les services, et qu'ils planifient l'action appropriée.</p><p>Fournir un dimensionnement suffisant peut être réalisé en augmentant la capacité ou en réduisant la demande. Il convient de prendre en considération ce qui suit pour augmenter la capacité:</p><ol><li>embaucher du nouveau personnel;</li><li>obtenir de nouvelles installations ou de nouveaux espaces;</li><li>acquérir des systèmes de traitement, de mémoire et de stockage plus performants;</li><li>utiliser l'informatique en nuage, dont les caractéristiques inhérentes répondent directement aux problèmes de dimensionnement. L'informatique en nuage possède l'élasticité et la flexibilité qui permettent l'augmentation et la réduction rapides et à la demande des ressources disponibles pour des applications et services spécifiques.</li></ol><p>Il convient de prendre en considération ce qui suit les éléments suivants pour réduire la demande sur les ressources de l'organisation:</p><ol><li>suppression des données obsolètes (espace disque);</li><li>élimination des documents papier qui ont atteint leur durée de conservation (libération d'espace sur les étagères);</li><li>mise hors service d'applications, de systèmes, de bases de données ou d'environnements;</li><li>optimisation des processus batch et des plannings;</li><li>optimisation des codes des applications ou des requêtes de bases de données;</li><li>refus ou restriction de la bande passante pour les services gourmands en ressources, s'ils ne sont pas critiques (par exemple, diffusion vidéo).</li></ol><p>Il convient d'envisager un plan documenté de gestion du dimensionnement pour les systèmes critiques.</p>`,
        extraInfo: "<p>Pour plus d'informations sur l'élasticité et la flexibilité de l'informatique en nuage, voir l'ISO/IEC TS 23167.</p>"
    }
  },
  {
      code: '8.7',
      title: 'Protection contre les programmes malveillants',
      chapter: IsoChapter.TECHNOLOGICAL,
      description: "Mettre en œuvre une protection contre les programmes malveillants et sensibiliser les utilisateurs.",
      details: {
          type: ['Préventive', 'Détective', 'Corrective'],
          properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
          concepts: ['Protéger', 'Détecter'],
          capabilities: ['Sécurité_système_et_réseau', 'Protection_des_informations'],
          domains: ['Protection', 'Défense'],
          measure: "Il convient qu'une protection contre les programmes malveillants soit mise en œuvre et renforcée par une sensibilisation appropriée des utilisateurs.",
          objective: "S'assurer que les informations et autres actifs associés sont protégés contre les programmes malveillants.",
          recommendations: `<p>Il convient que la protection contre les programmes malveillants soit basée sur des logiciels de détection des programmes malveillants et de réparation, une sensibilisation à la sécurité de l'information, et des moyens appropriés de gestion des changements et d'accès aux systèmes. L'utilisation de logiciels de détection de programmes malveillants et de réparation seulement n'est pas suffisante en général. Il convient de prendre en considération les recommandations suivantes:</p><ol type="a"><li>mettre en œuvre des règles et des mesures de sécurité qui empêchent ou détectent l'utilisation de logiciels non autorisés [par exemple, application allowlisting (c'est-à-dire utilisation d'une liste indiquant les applications autorisées)] (voir 8.19 et 8.32);</li><li>mettre en œuvre des mesures de sécurité qui empêchent ou détectent l'utilisation de sites web connus ou suspectés pour leur caractère malveillant (par exemple, blocklisting);</li><li>réduire les vulnérabilités qui peuvent être exploitées par des programmes malveillants [par exemple, à travers la gestion des vulnérabilités techniques (voir 8.8 et 8.19)];</li><li>procéder régulièrement à une validation automatique des logiciels et du contenu des données des systèmes, en particulier pour les systèmes qui gèrent des processus métier critiques; mener des investigations sur la présence de tout fichier non approuvé ou de modifications non autorisées;</li><li>mettre en place des mesures de protection contre les risques associés à l'obtention de fichiers et de logiciels soit depuis ou via des réseaux externes, soit sur tout autre support;</li><li>installer et mettre à jour régulièrement des logiciels de détection des programmes malveillants et de réparation pour analyser les ordinateurs et les supports de stockage électroniques. Réaliser des analyses régulières qui incluent: <ol><li>l'analyse de toute donnée reçue sur les réseaux ou via toute forme de support de stockage électronique, pour s'assurer de l'absence de programme malveillant avant utilisation;</li><li>l'analyse des pièces jointes aux courriers électroniques et aux messages instantanés, et des fichiers téléchargés pour s'assurer de l'absence de programmes malveillants avant utilisation. Réaliser cette analyse en différents endroits (par exemple, sur les serveurs de messagerie électronique, les ordinateurs de bureau) et au moment d'accéder au réseau de l'organisation;</li><li>l'analyse des pages web au moment d'y accéder pour s'assurer de l'absence de programmes malveillants;</li></ol></li><li>déterminer l'emplacement et la configuration des outils de détection des programmes malveillants et de réparation en fonction des résultats de l'appréciation du risque et en tenant en considération: <ol><li>les principes de défense en profondeur là où ils seraient les plus efficaces. Par exemple, cela peut mener à la détection de programmes malveillants au niveau d'une passerelle réseau (dans différents protocoles d'application tels que courrier électronique, transfert de fichiers et Internet) ainsi que des terminaux finaux des utilisateurs et des serveurs;</li><li>les techniques de contournement des attaquants (par exemple, l'utilisation de fichiers chiffrés) pour introduire des programmes malveillants ou l'utilisation de protocoles de chiffrement pour transmettre des programmes malveillants;</li></ol></li><li>veiller à assurer la protection contre l'introduction de programmes malveillants pendant les procédures de maintenance et d'urgence, qui peuvent contourner les mesures de sécurité habituelles contre les programmes malveillants;</li><li>mettre en œuvre un processus permettant d'autoriser la désactivation temporaire ou permanente de certaines ou de toutes les mesures de protection contre les programmes malveillants, y compris des autorités d'approbation des exceptions, des justifications documentées et les dates de révision. Cela peut s'avérer nécessaire lorsque la protection contre les programmes malveillants entraîne une perturbation des activités normales;</li><li>élaborer des plans de continuité d'activité appropriés permettant la reprise après des attaques par programmes malveillants, incluant la sauvegarde de tous les logiciels et données importants (y compris sauvegarde en ligne aussi bien que hors connexion) et les mesures de reprise (voir 8.13);</li><li>isoler les environnements lorsque des conséquences graves peuvent se produire;</li><li>définir des procédures et des responsabilités pour gérer la protection des systèmes contre les programmes malveillants, y compris la formation à leur utilisation, la déclaration et la reprise après des attaques par programmes malveillants;</li><li>assurer la sensibilisation ou la formation (voir 6.3) de tous les utilisateurs sur la manière d'identifier et, éventuellement, d'atténuer la réception, l'envoi ou l'installation de courriers électroniques, fichiers ou programmes infectés par des programmes malveillants;</li><li>mettre en œuvre des procédures pour collecter régulièrement des informations sur les nouveaux programmes malveillants, telles que l'abonnement à des listes de diffusion ou la consultation de sites web pertinents;</li><li>vérifier que les informations relatives aux programmes malveillants, telles que les bulletins d'alerte, proviennent de sources reconnues et réputées (par exemple, sites Internet fiables ou fournisseurs de logiciels de détection de programmes malveillants) et qu'elle sont correctes et informatives.</li></ol>`,
          extraInfo: "<p>Il n'est pas toujours possible d'installer des logiciels de protection contre les programmes malveillants sur certains systèmes (par exemple certains systèmes de contrôle industriel).</p>"
      }
  },
  {
      code: '8.8',
      title: 'Gestion des vulnérabilités techniques',
      chapter: IsoChapter.TECHNOLOGICAL,
      description: "Identifier, évaluer et traiter les vulnérabilités techniques des systèmes d'information.",
      details: {
          type: ['Préventive'],
          properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
          concepts: ['Identifier', 'Protéger'],
          capabilities: ['Gestion_des_menaces_et_des_vulnérabilités'],
          domains: ['Gouvernance_et_Écosystème', 'Protection', 'Défense'],
          measure: "Il convient d'obtenir des informations sur les vulnérabilités techniques des systèmes d'information utilisés, d'évaluer l'exposition de l'organisation à ces vulnérabilités et de prendre les mesures appropriées.",
          objective: "Empêcher l'exploitation des vulnérabilités techniques.",
          recommendations: `<strong>Identification des vulnérabilités techniques</strong><p>Il convient que l'organisation dispose d'un inventaire précis des actifs (voir 5.9 à 5.14) comme prérequis pour une gestion efficace des vulnérabilités techniques; il convient que l'inventaire inclue les fournisseurs de logiciels, les noms de logiciels, les numéros de versions, l'état d'utilisation en cours (par exemple, quels logiciels sont installés sur quels systèmes) et la ou les personnes au sein de l'organisation qui sont responsables des logiciels. Afin d'identifier les vulnérabilités techniques, il convient que l'organisation envisage de:</p><ol type="a"><li>définir et établir les rôles et les responsabilités associés à la gestion des vulnérabilités techniques, notamment la surveillance des vulnérabilités, l'appréciation du risque associé aux vulnérabilités, les mises à jour, le suivi des actifs, ainsi que toute fonction de coordination nécessaire;</li><li>pour les logiciels et autres technologies (selon la liste de l'inventaire des actifs, voir 5.9), déterminer les ressources d'information qui seront utilisées pour identifier les vulnérabilités techniques importantes et sensibiliser sur ces vulnérabilités. Mettre à jour la liste des ressources d'informations en fonction des changements effectués dans l'inventaire ou lorsque d'autres ressources nouvelles ou utiles sont identifiées;</li><li>demander aux fournisseurs des systèmes d'information (y compris de leurs composants) d'assurer la déclaration des vulnérabilités, leur traitement et leur publication, y compris les exigences des contrats applicables (voir 5.20);</li><li>utiliser des outils d'analyse des vulnérabilités adaptés aux technologies utilisées afin d'identifier les vulnérabilités et de vérifier si l'application de correctifs visant à résoudre les vulnérabilités a été efficace;</li><li>mener des tests de pénétration planifiés, documentés et répétés ou des évaluations de vulnérabilités réalisés par des personnes compétentes et autorisées pour renforcer l'identification de vulnérabilités. Prendre des précautions dans la mesure où ces activités peuvent entraîner une compromission de la sécurité du système;</li><li>suivre le l'utilisation des bibliothèques et des codes source externes issus de parties tierces pour détecter les vulnérabilités. Il convient d'intégrer ce point dans le codage sécurisé (voir 8.28).</li></ol>`,
          extraInfo: "<p>La gestion des vulnérabilités techniques peut être considérée comme une sous-fonction de la gestion des changements.</p>"
      }
  },
  {
      code: '8.9',
      title: 'Gestion des configurations',
      chapter: IsoChapter.TECHNOLOGICAL,
      description: "Définir, documenter, mettre en œuvre, surveiller et réviser les configurations de sécurité.",
      details: {
          type: ['Préventive'],
          properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
          concepts: ['Protéger'],
          capabilities: ['Configuration_sécurisée'],
          domains: ['Protection'],
          measure: "Il convient que les configurations, y compris les configurations de sécurité, du matériel, des logiciels, des services et des réseaux, soient définies, documentées, mises en œuvre, surveillées et révisées.",
          objective: "S'assurer que le matériel, les logiciels, les services et les réseaux fonctionnent correctement avec les paramètres de sécurité requis, et que la configuration n'est pas altérée par des changements non autorisés ou incorrects.",
          recommendations: `<strong>Généralités</strong><p>Il convient que l'organisation définisse et mette en œuvre des processus et des outils pour appliquer les configurations définies (y compris les configurations de sécurité) pour le matériel, les logiciels, les services (par exemple, services en nuage) et les réseaux, pour les nouveaux systèmes installés ainsi que pour les systèmes opérationnels tout au long de leur durée de vie. Il convient de mettre en place des fonctions, responsabilités et procédures pour assurer un contrôle satisfaisant de tous les changements de configuration.</p><strong>Modèles standard</strong><p>Il convient de définir des modèles standard pour la configuration sécurisée du matériel, des logiciels, des services et des réseaux:</p><ol type="a"><li>en utilisant les recommandations disponibles publiquement (par exemple, les modèles prédéfinis des fournisseurs et d'organisations de sécurité indépendantes);</li><li>en tenant compte du niveau de protection nécessaire afin de déterminer un niveau de sécurité suffisant;</li><li>en appuyant la politique de sécurité de l'information de l'organisation, ses politiques spécifiques à une thématique, les normes et autres exigences de sécurité;</li><li>en prenant en considération la faisabilité et l'applicabilité des configurations de sécurité dans le contexte de l'organisation.</li></ol>`,
          extraInfo: "<p>La documentation des systèmes contient souvent des détails relatifs à la configuration du matériel et des logiciels.</p>"
      }
  },
  {
      code: '8.10',
      title: 'Suppression des informations',
      chapter: IsoChapter.TECHNOLOGICAL,
      description: "Supprimer les informations des systèmes, terminaux ou supports lorsqu'elles ne sont plus nécessaires.",
      details: {
          type: ['Préventive'],
          properties: ['Confidentialité'],
          concepts: ['Protéger'],
          capabilities: ['Protection_des_informations', 'Réglementation_et_conformité'],
          domains: ['Protection'],
          measure: "Il convient que les informations stockées dans les systèmes d'information, les terminaux ou tout autre support de stockage soient supprimées lorsqu'elles ne sont plus nécessaires.",
          objective: "Empêcher l'exposition inutile des informations sensibles et se conformer aux exigences légales, statutaires, réglementaires et contractuelles relatives à la suppression d'informations.",
          recommendations: `<strong>Généralités</strong><p>Il convient de ne pas conserver les informations sensibles plus longtemps qu'elles ne sont nécessaires afin de réduire les risques de divulgation indésirable. Lors de la suppression d'informations de systèmes, d'applications et de services, il convient de prendre en considération ce qui suit:</p><ol type="a"><li>sélectionner une méthode de suppression (par exemple, écrasement électronique ou effacement cryptographique) conformément aux exigences métier et en tenant compte des lois et réglementations pertinentes;</li><li>enregistrer les résultats de la suppression comme preuve;</li><li>en cas de recours à des fournisseurs de services de suppression d'information, obtenir une preuve de la suppression des informations de leur part.</li></ol><p>Lorsque de tierces parties stockent les informations de l'organisation pour le compte de cette dernière, il convient que l'organisation envisage l'inclusion d'exigences relatives à la suppression des informations dans les accords avec les tierces parties à appliquer pendant et à la fin de ces services.</p><strong>Méthodes de suppression</strong><p>Conformément à la politique spécifique à la thématique de la conservation des données de l'organisation et en tenant compte la législation et des réglementations pertinentes, il convient de supprimer les informations sensibles qui ne sont plus nécessaires:</p><ol type="a"><li>en configurant les systèmes pour détruire les informations de manière sécurisée lorsqu'elles ne sont plus nécessaires (par exemple, après une période définie selon la politique spécifique à la thématique de la conservation des données ou suite à une demande d'accès);</li><li>en supprimant les versions, copies et fichiers temporaires obsolètes, quel que soit leur emplacement;</li><li>en utilisant des logiciels de suppression sécurisée approuvés pour supprimer définitivement les informations afin de contribuer à assurer que les informations ne peuvent pas être récupérées à l'aide d'outils de récupération spécialisés ou d'outils informatiques judiciaires;</li><li>en recourant à des fournisseurs de services de suppression sécurisée approuvés et certifiés;</li><li>en utilisant des mécanismes d'élimination adaptés au type de support de stockage à éliminer (par exemple, démagnétisation des disques durs et autres supports de stockage magnétiques).</li></ol><p>Lorsque des services en nuage sont utilisés, il convient que l'organisation vérifie si la méthode de suppression fournie par le fournisseur de services en nuage est acceptable et, si c'est le cas, il convient que l'organisation l'utilise ou qu'elle demande au fournisseur de services en nuage de supprimer les informations. Il convient que ces processus de suppression soient automatisés conformément aux politiques spécifiques à une thématique, lorsqu'elles sont disponibles et applicables.</p><p>Selon la sensibilité des informations supprimées, des journaux peuvent tracer ou vérifier que ces processus de suppression ont bien eu lieu.</p><p>Pour éviter l'exposition involontaire des informations sensibles lorsque des équipements sont renvoyés aux fournisseurs, il convient de protéger les informations sensibles en retirant les moyens de stockage auxiliaire (par exemple, les disques durs) et la mémoire avant que les équipements ne quittent les locaux de l'organisation.</p><p>Étant donné que la suppression sécurisée de certains terminaux (par exemple, smartphones) peut seulement être réalisée à travers la destruction ou en utilisant les fonctions intégrées dans ces terminaux (par exemple, restauration des réglages d'usine), il convient que l'organisation choisisse la méthode appropriée selon la classification des informations détenues par ces terminaux.</p><p>Il convient d'appliquer les mesures de sécurité décrites en 7.14 pour détruire physiquement le support de stockage et en même temps supprimer les informations qu'il contient.</p><p>Un document officiel attestant de la suppression des informations est utile lors de l'analyse de la cause d'un possible événement de fuite d'informations.</p>`,
          extraInfo: "<p>Des informations relatives à la suppression des données de l'utilisateur dans les services en nuage sont disponibles dans l'ISO/IEC 27017.</p><p>Des informations relatives à la suppression des DCP sont disponibles dans l'ISO/IEC 27555.</p>"
      }
  },
  {
    code: '8.11',
    title: 'Masquage des données',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Utiliser le masquage des données pour limiter l'exposition des données sensibles.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité'],
      concepts: ['Protéger'],
      capabilities: ['Protection_des_informations'],
      domains: ['Protection'],
      measure: "Il convient d'utiliser le masquage des données conformément à la politique spécifique à la thématique du contrôle d'accès de l'organisation et d'autres politiques spécifiques à une thématique associées, ainsi qu'aux exigences métier, tout en prenant en compte la législation applicable.",
      objective: "Limiter l'exposition des données sensibles, y compris les DCP, et se conformer aux exigences légales, statutaires, réglementaires et contractuelles.",
      recommendations: `<p>Lorsque la protection des données sensibles (par exemple, les DCP) est un sujet de préoccupation, il convient que l'organisation envisage de dissimuler ces données en utilisant des techniques telles que le masquage des données, la pseudonymisation ou l'anonymisation.</p><p>Les techniques de pseudonymisation ou d'anonymisation peuvent dissimuler les DCP, déguiser la véritable identité des personnes concernées ou d'autres informations sensibles, et rompre le lien entre les DCP et l'identité de la personne concernée ou le lien entre d'autres informations sensibles.</p><p>Lors de l'utilisation de techniques de pseudonymisation ou d'anonymisation, il convient de vérifier que les données ont été pseudonymisées ou anonymisées de manière appropriée. Il convient que l'anonymisation des données prenne en compte tous les éléments des informations sensibles pour être efficace.</p><p>D'autres techniques de masquage des données sont:</p><ol type="a"><li>chiffrement (nécessitant que les utilisateurs autorisés disposent d'une clé);</li><li>annulation ou suppression de caractères (pour empêcher les utilisateurs non autorisés de visualiser les messages en entier);</li><li>modification des chiffres et des dates;</li><li>substitution (remplacement d'une valeur par une autre pour masquer les données sensibles);</li><li>remplacement des valeurs par leur hachage.</li></ol><p>Il convient de prendre en considération ce qui suit lors de la mise en œuvre de techniques de masquage des données:</p><ol type="a"><li>ne pas accorder à tous les utilisateurs l'accès à toutes les données; par conséquent, concevoir des requêtes et des masques afin de n'afficher que les données minimales requises à l'utilisateur;</li><li>il existe des cas où il convient que certaines données ne soient pas visibles par l'utilisateur pour certains enregistrements parmi un ensemble de données; dans ce cas, concevoir et mettre en œuvre un système d'obfuscation des données;</li><li>lorsque des données sont brouillées, donner à la personne concernée la possibilité d'exiger que les utilisateurs ne puissent pas savoir si ces données sont brouillées (brouillage du brouillage);</li><li>toute exigence légale ou réglementaire (par exemple, exigeant le masquage des informations de cartes de paiement pendant le traitement ou le stockage).</li></ol>`,
      extraInfo: "<p>L'anonymisation modifie les DCP de façon irréversible. La pseudonymisation remplace les informations d'identification par un alias. Des informations supplémentaires sur les techniques de dé-identification sont disponibles dans l'ISO/IEC 20889.</p>"
    }
  },
  {
    code: '8.12',
    title: 'Prévention de la fuite de données',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Appliquer des mesures pour détecter et prévenir la divulgation et l'extraction non autorisées d'informations.",
    details: {
      type: ['Préventive', 'Détective'],
      properties: ['Confidentialité'],
      concepts: ['Protéger', 'Détecter'],
      capabilities: ['Protection_des_informations'],
      domains: ['Protection', 'Défense'],
      measure: "Il convient que des mesures de prévention de la fuite de données soient appliquées aux systèmes, aux réseaux et à tous les autres terminaux qui traitent, stockent ou transmettent des informations sensibles.",
      objective: "Détecter et empêcher la divulgation et l'extraction non autorisées d'informations par des personnes ou des systèmes.",
      recommendations: `<p>Il convient que l'organisation prenne en considération ce qui suit pour réduire le risque de fuite de données:</p><ol type="a"><li>identifier et classifier les informations à protéger contre les fuites (par exemple, informations personnelles, modèles de tarification et conceptions de produits);</li><li>surveiller les canaux de fuite de données (par exemple, messagerie électronique, transferts de fichiers, terminaux mobiles et supports de stockage portables);</li><li>agir pour empêcher la fuite d'informations (par exemple, mettre en quarantaine les courriers électroniques contenant des informations sensibles).</li></ol><p>Il convient d'utiliser des outils de prévention de la fuite de données pour:</p><ol type="a"><li>identifier et surveiller les informations sensibles exposées au risque de divulgation non autorisée;</li><li>détecter la divulgation d'informations sensibles;</li><li>bloquer les actions de l'utilisateur ou les transmissions réseau qui exposent les informations sensibles.</li></ol>`,
      extraInfo: "<p>La prévention de la fuite de données implique intrinsèquement la surveillance des communications et activités en ligne du personnel, ce qui soulève des questions d'ordre juridique qu'il convient de prendre en considération.</p>"
    }
  },
  {
    code: '8.13',
    title: 'Sauvegarde des informations',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Effectuer des sauvegardes régulières des informations, logiciels et systèmes et les tester.",
    details: {
      type: ['Corrective'],
      properties: ['Intégrité', 'Disponibilité'],
      concepts: ['Rétablir'],
      capabilities: ['Continuité'],
      domains: ['Protection'],
      measure: "Il convient que des copies de sauvegarde de l'information, des logiciels et des systèmes soient conservées et testées régulièrement selon la politique spécifique à la thématique de la sauvegarde qui a été convenue.",
      objective: "Permettre la récupération en cas de perte de données ou de systèmes.",
      recommendations: `<p>Il convient de définir une politique spécifique à la thématique de la sauvegarde pour répondre aux exigences de l'organisation en termes de conservation des données et de sécurité de l'information.</p><p>Lors de la conception d'un plan de sauvegarde, il convient de prendre en considération les éléments suivants:</p><ul><li>produire des enregistrements exacts et complets des copies de sauvegarde ainsi que des procédures de restauration documentées;</li><li>intégrer les exigences métier de l'organisation (par exemple, l'objectif de point de reprise) et la criticité des informations dans l'étendue et la fréquence des sauvegardes;</li><li>conserver les sauvegardes dans un lieu distant sûr et sécurisé;</li><li>apporter aux informations sauvegardées un niveau approprié de protection physique et environnementale;</li><li>tester régulièrement les supports de sauvegarde pour assurer qu'il est possible de les utiliser en cas d'urgence;</li><li>protéger les sauvegardes par des moyens de chiffrement selon les risques identifiés.</li></ul>`,
      extraInfo: "<p>Pour des informations supplémentaires sur la sécurité du stockage, notamment l'aspect de conservation, voir l'ISO/IEC 27040.</p>"
    }
  },
  {
    code: '8.14',
    title: 'Redondance des moyens de traitement de l\'information',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Mettre en œuvre une redondance suffisante des moyens de traitement de l'information pour répondre aux exigences de disponibilité.",
    details: {
      type: ['Préventive'],
      properties: ['Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Continuité', 'Gestion_des_actifs'],
      domains: ['Protection', 'Résilience'],
      measure: "Il convient que les moyens de traitement de l'information soient mis en œuvre avec suffisamment de redondance pour répondre aux exigences de disponibilité.",
      objective: "Assurer le fonctionnement continu des moyens de traitement de l'information.",
      recommendations: `<p>Il convient que l'organisation identifie les exigences relatives à la disponibilité des services métier et des systèmes d'information et qu'elle conçoive et mette en œuvre une architecture de systèmes avec une redondance appropriée.</p><p>Il convient que l'organisation prenne en considération ce qui suit lors de la mise en œuvre de systèmes redondants:</p><ul><li>conclure un contrat avec deux ou plusieurs fournisseurs de réseaux et de moyens de traitement de l'information critiques;</li><li>utiliser des réseaux redondants;</li><li>utiliser deux centres de données séparés géographiquement, avec des systèmes en miroir;</li><li>utiliser des sources d'alimentation physiquement redondantes;</li><li>disposer de composants dupliqués dans les systèmes (par exemple, CPU, disques durs, mémoires).</li></ul>`,
      extraInfo: "<p>Il existe une relation étroite entre la redondance et la préparation des TIC pour la continuité d'activité (voir 5.30). La mise en œuvre de redondances peut introduire des risques impactant l'intégrité ou la confidentialité qui doivent être pris en considération.</p>"
    }
  },
  {
    code: '8.15',
    title: 'Journalisation',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Générer, conserver, protéger et analyser les journaux des activités, exceptions, pannes et autres événements pertinents.",
    details: {
      type: ['Détective'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Détecter'],
      capabilities: ['Gestion_des_événements_de_sécurité_de_l\'information'],
      domains: ['Protection', 'Défense'],
      measure: "Il convient que les journaux qui enregistrent les activités, les exceptions, les pannes et autres événements pertinents soient générés, conservés, protégés et analysés.",
      objective: "Enregistrer les événements, générer des preuves, assurer l'intégrité des informations de journalisation, empêcher les accès non autorisés, identifier les événements de sécurité de l'information qui peuvent engendrer un incident de sécurité de l'information et assister les investigations.",
      recommendations: `<strong>Généralités</strong><p>Il convient que les journaux d'événements incluent pour chaque événement, si possible:</p><ul><li>les identifiants des utilisateurs;</li><li>les activités du système;</li><li>les dates, heures et détails des événements pertinents (par exemple, les ouvertures et fermetures de session);</li><li>l'identité du terminal, l'identifiant du système et son emplacement;</li><li>les adresses et protocoles réseau.</li></ul><strong>Protection des journaux</strong><p>Il convient que les utilisateurs, y compris ceux dotés de droits d'accès privilégiés, n'aient pas l'autorisation de supprimer ou de désactiver les journaux de leurs propres activités. Des mesures de sécurité doivent viser à protéger le moyen de journalisation contre les modifications non autorisées.</p><strong>Analyse des journaux</strong><p>Il convient que l'analyse des journaux inclue l'analyse et l'interprétation des événements de sécurité de l'information afin de permettre l'identification des activités ou comportements anormaux qui peuvent représenter des indicateurs de compromission.</p>`,
      extraInfo: "<p>Les journaux de systèmes contiennent souvent une quantité importante d'informations. L'utilisation d'outils d'audit appropriés ou d'un SIEM peut être envisagée pour faciliter l'identification des événements significatifs. Les journaux d'événements peuvent contenir des données sensibles et des données à caractère personnel; des mesures de protection de la vie privée appropriées doivent être prises (voir 5.34).</p>"
    }
  },
  {
    code: '8.16',
    title: 'Activités de surveillance',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Surveiller les réseaux, systèmes et applications pour détecter les comportements anormaux et prendre les mesures appropriées.",
    details: {
      type: ['Détective', 'Corrective'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Détecter', 'Répondre'],
      capabilities: ['Gestion_des_événements_de_sécurité_de_l\'information'],
      domains: ['Défense'],
      measure: "Il convient de surveiller les réseaux, systèmes et applications pour détecter les comportements anormaux et de prendre les mesures appropriées pour évaluer les éventuels incidents de sécurité de l'information.",
      objective: "Détecter les comportements anormaux et les éventuels incidents de sécurité de l'information.",
      recommendations: `<p>Il convient de déterminer le périmètre et le niveau de surveillance conformément aux exigences métier et de sécurité de l'information. Il convient que l'organisation établisse une base de référence des comportements normaux et qu'elle surveille la présence d'anomalies par rapport à cette base de référence.</p><p>Il convient de prendre en considération l'inclusion de ce qui suit dans le système de surveillance:</p><ul><li>trafic entrant et sortant des réseaux, systèmes et applications;</li><li>accès aux systèmes, aux serveurs, aux équipements réseau, etc.;</li><li>fichiers de configuration système et réseau de niveau critique ou administrateur;</li><li>journaux générés par des outils de sécurité (par exemple, antivirus, IDS, pare-feu);</li><li>utilisation des ressources (par exemple, CPU, disques durs, mémoire, bande passante).</li></ul><p>Il convient d'utiliser une surveillance continue via un outil de surveillance. Il convient que le logiciel de surveillance automatisée soit configuré pour générer des alertes sur la base de seuils prédéfinis.</p>`,
      extraInfo: "<p>La surveillance de la sécurité peut être améliorée par l'exploitation de systèmes de renseignements sur les menaces (voir 5.7), l'apprentissage machine et la réalisation d'une série d'évaluations de sécurité techniques (par exemple, tests de pénétration).</p>"
    }
  },
  {
    code: '8.17',
    title: 'Synchronisation des horloges',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Synchroniser les horloges des systèmes de traitement de l'information avec des sources de temps approuvées.",
    details: {
      type: ['Détective'],
      properties: ['Intégrité'],
      concepts: ['Protéger', 'Détecter'],
      capabilities: ['Gestion_des_événements_de_sécurité_de_l\'information'],
      domains: ['Protection', 'Défense'],
      measure: "Il convient que les horloges des systèmes de traitement de l'information utilisés par l'organisation soient synchronisées avec des sources de temps approuvées.",
      objective: "Permettre la corrélation et l'analyse d'événements de sécurité et autres données enregistrées, assister les investigations sur les incidents de sécurité de l'information.",
      recommendations: `<p>Il convient que les exigences externes et internes pour la représentation du temps, la synchronisation fiable et la précision soient documentées et mises en œuvre.</p><p>Il convient qu'une heure de référence standard à utiliser au sein de l'organisation soit définie et prise en considérations par tous les systèmes.</p><p>Il convient qu'une horloge synchronisée à un signal radio diffusant l'heure depuis une horloge atomique nationale ou un système de positionnement mondial (GPS) soit utilisée comme horloge de référence pour les systèmes de journalisation. Il convient que des protocoles tels que le protocole de temps réseau (NTP) soient utilisés pour assurer la synchronisation.</p>`,
      extraInfo: "<p>Le paramétrage correct des horloges des ordinateurs est important pour assurer l'exactitude des journaux d'événements qui peuvent être nécessaires dans le cadre d'investigations ou utilisés comme preuves dans des affaires judiciaires. Des journaux d'audit inexacts peuvent entraver ces investigations.</p>"
    }
  },
  {
    code: '8.18',
    title: 'Utilisation de programmes utilitaires à privilèges',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Limiter et contrôler étroitement l'utilisation des programmes utilitaires pouvant contourner les mesures de sécurité.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_système_et_réseau', 'Configuration_sécurisée', 'Sécurité_des_applications'],
      domains: ['Protection'],
      measure: "Il convient que l'utilisation de programmes utilitaires ayant la capacité de contourner les mesures de sécurité des systèmes et des applications soit limitée et contrôlée étroitement.",
      objective: "S'assurer que l'utilisation de programmes utilitaires ne nuise pas aux mesures de sécurité de l'information des systèmes et des applications.",
      recommendations: `<p>Il convient que les lignes directrices suivantes concernant l'utilisation des programmes utilitaires soient prises en considération:</p><ul><li>limiter l'utilisation des programmes utilitaires à un nombre minimal acceptable d'utilisateurs de confiance autorisés;</li><li>utiliser des procédures d'identification, d'authentification et d'autorisation pour les programmes utilitaires;</li><li>ne pas mettre de programmes utilitaires à la disposition des utilisateurs qui ont accès à des applications installées sur des systèmes nécessitant une séparation des tâches;</li><li>supprimer ou désactiver tous les programmes utilitaires inutilisés;</li><li>journaliser toutes les utilisations des programmes utilitaires.</li></ul>`,
      extraInfo: "<p>La plupart des systèmes d'information disposent d'un ou de plusieurs programmes utilitaires qui peuvent avoir la capacité de contourner les mesures de sécurité des systèmes et des applications, par exemple les diagnostics, l'application de correctifs, les antivirus, les outils de défragmentation de disques, les débogueurs, les outils de sauvegarde et les outils réseau.</p>"
    }
  },
  {
    code: '8.19',
    title: 'Installation de logiciels sur les systèmes opérationnels',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Gérer de manière sécurisée l'installation de logiciels sur les systèmes opérationnels.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Configuration_sécurisée', 'Sécurité_des_applications'],
      domains: ['Protection'],
      measure: "Il convient de mettre en œuvre des procédures et des mesures pour gérer de manière sécurisée l'installation de logiciels sur les systèmes opérationnels.",
      objective: "Assurer l'intégrité des systèmes opérationnels et empêcher l'exploitation des vulnérabilités techniques.",
      recommendations: `<p>Il convient de prendre en considération les lignes directrices suivantes pour gérer de manière sécurisée les changements et l'installation de logiciels sur des systèmes opérationnels:</p><ul><li>faire installer les mises à jour de logiciels opérationnels seulement par des administrateurs formés, après autorisation;</li><li>s'assurer que seuls les codes exécutables approuvés sont installés sur les systèmes opérationnels;</li><li>installer et mettre à jour les logiciels seulement après des tests approfondis et réussis;</li><li>utiliser un système de contrôle des configurations afin de garder le contrôle de tous les logiciels;</li><li>définir une stratégie de retour en arrière avant d'appliquer des changements;</li><li>tenir un journal d'audit de toutes les mises à jour des logiciels opérationnels.</li></ul>`,
      extraInfo: "<p>Les logiciels fournis par des fournisseurs et utilisés dans des systèmes opérationnels bénéficient d'une maintenance assurée par le fournisseur. Il convient que l'organisation prenne en considération les risques associés à l'utilisation de logiciels qui ne bénéficient plus de maintenance.</p>"
    }
  },
  {
    code: '8.20',
    title: 'Sécurité des réseaux',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Sécuriser, gérer et contrôler les réseaux pour protéger les informations.",
    details: {
      type: ['Préventive', 'Détective'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger', 'Détecter'],
      capabilities: ['Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que les réseaux et les terminaux réseau soient sécurisés, gérés et contrôlés pour protéger les informations des systèmes et des applications.",
      objective: "Protéger les informations dans les réseaux et les moyens de traitement de l'information support contre les compromission via le réseau.",
      recommendations: `<p>Il convient de mettre en œuvre des mesures de sécurité pour assurer la sécurité des informations dans les réseaux. En particulier, il convient de prendre en considération les éléments suivants:</p><ul><li>définir les responsabilités et les procédures de gestion des équipements et des terminaux réseau;</li><li>séparer la responsabilité opérationnelle des réseaux et les activités sur les systèmes TIC, si nécessaire;</li><li>définir des mesures de sécurité pour préserver la confidentialité et l'intégrité des données transitant sur des réseaux publics ou sans fil;</li><li>assurer une journalisation et une surveillance appropriées;</li><li>authentifier les systèmes sur le réseau;</li><li>restreindre et filtrer la connexion des systèmes au réseau (par exemple, en utilisant des pare-feu);</li><li>désactiver les protocoles réseau vulnérables.</li></ul>`,
      extraInfo: "<p>Des informations supplémentaires sur la sécurité des réseaux sont disponibles dans la série ISO/IEC 27033.</p>"
    }
  },
  {
    code: '8.21',
    title: 'Sécurité des services réseau',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Identifier, mettre en œuvre et surveiller les mécanismes de sécurité et les niveaux de service des services réseau.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que les mécanismes de sécurité, les niveaux de service et les exigences de services des services réseau soient identifiés, mis en œuvre et surveillés.",
      objective: "Assurer la sécurité lors de l'utilisation des services réseau.",
      recommendations: `<p>Il convient que les mesures de sécurité nécessaires à certains services, les niveaux de service et les exigences de services, soient identifiés et mis en œuvre par les fournisseurs de services réseau internes ou externes.</p><p>Il convient que la capacité du fournisseur de services réseau à gérer les services convenus de façon sécurisée soit déterminée et régulièrement contrôlée.</p><p>Il convient que les règles relatives à l'utilisation des réseaux et des services réseau soient définies et appliquées de façon à couvrir les points suivants: les réseaux et services autorisés, les exigences d'authentification, les procédures d'autorisation, la gestion du réseau, et la surveillance de l'utilisation des services réseau.</p>`,
      extraInfo: "<p>Les services réseau incluent la fourniture de connexions, des services de réseaux privés et des solutions de sécurité réseau gérées, tels que les pare-feu et les systèmes de détection d'intrusions.</p>"
    }
  },
  {
    code: '8.22',
    title: 'Cloisonnement des réseaux',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Cloisonner les réseaux de l'organisation en domaines de sécurité distincts.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que les groupes de services d'information, d'utilisateurs et de systèmes d'information soient cloisonnés dans les réseaux de l'organisation.",
      objective: "Diviser le réseau en périmètres de sécurité et contrôler le trafic entre eux en fonction des besoins métier.",
      recommendations: `<p>Il convient que l'organisation envisage de gérer la sécurité des grands réseaux en les divisant en domaines réseau distincts. Les domaines peuvent être choisis selon les niveaux de confiance (par exemple, domaine d'accès public, domaine de postes de travail, domaine de serveurs), selon les services administratifs (par exemple, ressources humaines, financier) ou selon certaines combinaisons.</p><p>Il convient de bien définir le périmètre de chaque domaine. Si l'accès entre des domaines réseau est autorisé, il convient de le contrôler au niveau du périmètre en utilisant une passerelle (par exemple, pare-feu, routeur filtrant).</p><p>Les réseaux sans fil nécessitent un traitement particulier. Il convient d'envisager de traiter tous les accès sans fil comme des connexions externes et d'isoler ces accès des réseaux internes.</p>`,
      extraInfo: "<p>Les réseaux s'étendent souvent au-delà des frontières de l'organisation. Ces extensions peuvent augmenter le risque d'accès non autorisés aux systèmes d'information de l'organisation.</p>"
    }
  },
  {
    code: '8.23',
    title: 'Filtrage web',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Gérer l'accès aux sites web externes pour réduire l'exposition aux contenus malveillants.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que l'accès aux sites web externes soit géré pour réduire l'exposition aux contenus malveillants.",
      objective: "Protéger les systèmes contre la compromission des programmes malveillants et empêcher l'accès aux ressources web non autorisées.",
      recommendations: `<p>Il convient que l'organisation réduise les risques que son personnel accède à des sites web contenant des informations illégales ou connus pour contenir des virus ou du contenu de hameçonnage. Une technique pour réaliser cela consiste à bloquer les adresses IP ou les domaines du ou des sites web concernés.</p><p>Il convient que l'organisation identifie les types de sites web auxquels il convient que le personnel ait accès ou non. Il convient que l'organisation envisage le blocage des accès aux types de sites web suivants:</p><ul><li>sites web comportant une fonction de téléchargement d'informations, sauf si cela est autorisé;</li><li>sites web connus pour être malveillants ou suspectés de l'être;</li><li>serveurs de commande et de contrôle;</li><li>sites web partageant du contenu illégal.</li></ul>`,
      extraInfo: "<p>Le filtrage web peut comporter un ensemble de techniques, telles que les signatures, l'heuristique, la liste des sites web ou domaines acceptables, la liste des sites web ou domaines interdits et la configuration personnalisée.</p>"
    }
  },
  {
    code: '8.24',
    title: 'Utilisation de la cryptographie',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Définir et mettre en œuvre des règles pour l'utilisation efficace de la cryptographie et la gestion des clés.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Configuration_sécurisée'],
      domains: ['Protection'],
      measure: "Il convient que des règles pour l'utilisation efficace de la cryptographie, notamment la gestion des clés cryptographiques, soient définies et mises en œuvre.",
      objective: "Assurer l'utilisation correcte et efficace de la cryptographie afin de protéger la confidentialité, l'authenticité ou l'intégrité des informations.",
      recommendations: `<strong>Généralités</strong><p>Une politique spécifique à la thématique de l'utilisation de la cryptographie doit être définie. Elle doit couvrir l'identification du niveau de protection requis, l'approche de gestion des clés, les fonctions et responsabilités, et les normes à adopter.</p><strong>Gestion des clés</strong><p>Une gestion de clés appropriée nécessite des processus sécurisés pour la génération, le stockage, l'archivage, la récupération, la distribution, le retrait et la destruction des clés cryptographiques.</p><p>Il convient qu'un système de gestion des clés repose sur un ensemble convenu de normes, de procédures et de méthodes sécurisées.</p>`,
      extraInfo: "<p>La cryptographie peut être utilisée pour la confidentialité (chiffrement), l'intégrité/authenticité (signatures électroniques), la non-répudiation et l'authentification. La série ISO/IEC 11770 fournit des informations supplémentaires sur la gestion des clés.</p>"
    }
  },
  {
    code: '8.25',
    title: 'Cycle de vie de développement sécurisé',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Définir et appliquer des règles pour le développement sécurisé des logiciels et des systèmes.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient de définir et d'appliquer des règles pour le développement sécurisé des logiciels et des systèmes.",
      objective: "S'assurer que la sécurité de l'information est conçue et mise en œuvre au cours du cycle de vie de développement sécurisé des logiciels et des systèmes.",
      recommendations: `<p>Pour le développement sécurisé, il convient de prendre en considération les aspects suivants:</p><ul><li>la séparation des environnements de développement, de test et de production (voir 8.31);</li><li>les recommandations sur la sécurité dans le cycle de vie de développement des logiciels;</li><li>les exigences de sécurité dans les phases de spécifications et de conception;</li><li>les points de contrôle de la sécurité dans les projets;</li><li>les tests de la sécurité et du système (voir 8.29);</li><li>des répertoires sécurisés pour les codes source et les configurations;</li><li>la sécurité dans le contrôle des versions (voir 8.32).</li></ul>`,
      extraInfo: "<p>Les développements peuvent aussi avoir lieu au sein d'applications telles que les applications bureautiques, de scripts, les navigateurs et les bases de données.</p>"
    }
  },
  {
    code: '8.26',
    title: 'Exigences de sécurité des applications',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Identifier, spécifier et approuver les exigences de sécurité lors du développement ou de l'acquisition d'applications.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection', 'Défense'],
      measure: "Il convient que les exigences de sécurité de l'information soient identifiées, spécifiées et approuvées lors du développement ou de l'acquisition d'applications.",
      objective: "S'assurer que toutes les exigences de sécurité de l'information sont identifiées et traitées lors du développement ou de l'acquisition d'applications.",
      recommendations: `<p>Il convient que les exigences de sécurité des applications incluent, si applicable:</p><ul><li>le niveau de confiance dans l'identité des entités (authentification);</li><li>la nécessité de séparer l'accès et les niveaux d'accès aux données et aux fonctions;</li><li>la résilience contre les attaques malveillantes (par exemple, injections SQL);</li><li>les exigences légales, statutaires et réglementaires;</li><li>la protection de la vie privée;</li><li>la protection des données pendant leur traitement, en transit et au repos;</li><li>les contrôles des données d'entrée et de sortie;</li><li>le traitement des messages d'erreur.</li></ul>`,
      extraInfo: "<p>Les applications accessibles via les réseaux sont exposées à un ensemble de menaces. Par conséquent, des appréciations des risques détaillées et la détermination minutieuse des mesures de sécurité sont indispensables. Plus d'informations sur la sécurité des applications sont disponibles dans la série ISO/IEC 27034.</p>"
    }
  },
  {
    code: '8.27',
    title: 'Principes d\'ingénierie et d\'architecture des système sécurisés',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Établir, documenter et appliquer des principes d'ingénierie des systèmes sécurisés.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que des principes d'ingénierie des systèmes sécurisés soient établis, documentés, tenus à jour et appliqués à toutes les activités de développement de systèmes d'information.",
      objective: "S'assurer que les systèmes d'information sont conçus, mis en œuvre et exploités de manière sécurisée au cours du cycle de vie de développement.",
      recommendations: `<p>Il convient de concevoir la sécurité dans toutes les couches de l'architecture (métier, données, applications et technologies). Il convient que les principes d'ingénierie de sécurité prennent en compte:</p><ul><li>l'application des principes des architectures de sécurité, tels que "sécurité dès la conception", "défense en profondeur", "moindre privilège";</li><li>l'analyse de la conception orientée sécurité pour permettre d'identifier les vulnérabilités;</li><li>le durcissement des systèmes.</li></ul><p>Il convient que l'organisation prenne en considération les principes du type "confiance zéro" (zero trust) tels que: supposer la compromission, ne jamais faire confiance et toujours vérifier, chiffrer de bout en bout, et utiliser l'authentification forte.</p>`,
      extraInfo: "<p>Les principes d'ingénierie de sécurité peuvent être appliqués à la conception ou à la configuration d'un ensemble de techniques, telles que la tolérance aux pannes, le cloisonnement (virtualisation) et l'inviolabilité.</p>"
    }
  },
  {
    code: '8.28',
    title: 'Codage sécurisé',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Appliquer des principes de codage sécurisé au développement de logiciels.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient d'appliquer des principes de codage sécurisé au développement de logiciels.",
      objective: "S'assurer que les logiciels sont développés de manière sécurisée afin de réduire le nombre d'éventuelles vulnérabilités de sécurité de l'information dans les logiciels.",
      recommendations: `<strong>Généralités</strong><p>Il convient de définir des processus à l'échelle de l'organisation pour s'assurer de la bonne gouvernance du codage sécurisé.</p><strong>Planification et prérequis du codage</strong><p>Il convient que la planification et les prérequis avant le codage incluent: la configuration des outils de développement, la qualification des développeurs, une conception sécurisée, et des normes de codage.</p><strong>Pendant le codage</strong><p>Il convient de prendre en considération pendant le codage: les pratiques spécifiques aux langages, l'utilisation de techniques de programmation sécurisées (programmation en binôme, révision par des pairs), et l'interdiction de techniques non sécurisées (mots de passe en dur).</p><strong>Révision et maintenance</strong><p>Après que le code est devenu opérationnel, il convient de déployer les mises à jour de façon sécurisée, de traiter les vulnérabilités déclarées, et de protéger le code source.</p>`,
      extraInfo: "<p>Les applications web sont sujettes à un ensemble de vulnérabilités qui sont introduites par les faiblesses de la conception et du codage, telles que les attaques par injection SQL et les attaques XSS. Plus d'informations sur l'évaluation de la sécurité des TIC sont disponibles dans la série ISO/IEC 15408.</p>"
    }
  },
  {
    code: '8.29',
    title: 'Tests de sécurité dans le développement et l\'acceptation',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Définir et mettre en œuvre des processus pour les tests de sécurité tout au long du cycle de vie de développement.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Identifier'],
      capabilities: ['Sécurité_des_applications', 'Assurance_de_sécurité_de_l\'information', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que des processus pour les tests de sécurité soient définis et mis en œuvre au cours du cycle de vie de développement.",
      objective: "Valider le respect des exigences de sécurité de l'information lorsque des applications ou des codes sont déployés dans l'environnement.",
      recommendations: `<p>Il convient que les nouveaux systèmes d'information, les mises à niveau et les nouvelles versions soient testés et vérifiés minutieusement. Il convient que les tests de sécurité incluent les tests:</p><ul><li>des fonctions de sécurité (par exemple, l'authentification);</li><li>du codage sécurisé (voir 8.28);</li><li>des configurations sécurisées (voir 8.9).</li></ul><p>L'organisation peut tirer profit des outils automatisés, tels que les outils d'analyse de codes ou les scanneurs de vulnérabilités. Il convient de réaliser des tests dans un environnement de test ressemblant le plus possible à l'environnement opérationnel cible (voir 8.31).</p>`,
      extraInfo: "<p>Plusieurs environnements de test peuvent être mis en place pour différents types de tests (par exemple, tests fonctionnels et de performance). Ces environnements peuvent être virtuels.</p>"
    }
  },
  {
    code: '8.30',
    title: 'Développement externalisé',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Diriger, contrôler et vérifier les activités relatives au développement externalisé.",
    details: {
      type: ['Préventive', 'Détective'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Identifier', 'Protéger', 'Détecter'],
      capabilities: ['Sécurité_système_et_réseau', 'Sécurité_des_applications', 'Sécurité_des_relations_fournisseurs'],
      domains: ['Gouvernance_et_Écosystème', 'Protection'],
      measure: "Il convient que l'organisation dirige, contrôle et vérifie les activités relatives au développement externalisé des systèmes.",
      objective: "S'assurer que les mesures de sécurité de l'information requises par l'organisation sont mises en œuvre dans le cadre du développement externalisé des systèmes.",
      recommendations: `<p>Lorsque le développement des systèmes est externalisé, il convient que l'organisation communique et se mette d'accord sur les exigences et les attentes. Il convient de prendre en considération les points suivants:</p><ul><li>les accords de licence, la propriété du code et les droits de propriété intellectuelle;</li><li>les exigences contractuelles pour la conception, le codage et les pratiques de tests sécurisés;</li><li>les tests d'acceptation pour assurer la qualité et l'exactitude des livrables;</li><li>la fourniture de preuves montrant que des tests suffisants ont été réalisés pour protéger contre la présence de contenus malveillants;</li><li>le droit contractuel de procéder à un audit des processus et des contrôles de développement.</li></ul>`,
      extraInfo: "<p>Plus d'informations sur les relations avec les fournisseurs sont disponibles dans la série ISO/IEC 27036.</p>"
    }
  },
  {
    code: '8.31',
    title: 'Séparation des environnements de développement, de test et opérationnels',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Séparer et sécuriser les environnements de développement, de test et opérationnels.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient de séparer et de sécuriser les environnements de développement, de test et opérationnels.",
      objective: "Protéger l'environnement opérationnel et les données correspondantes contre les compromissions qui pourraient être dues aux activités de développement et de test.",
      recommendations: `<p>Il convient de déterminer et de mettre en œuvre le niveau de séparation nécessaire entre les environnements. Il convient de prendre en considération les éléments suivants:</p><ul><li>séparer de façon adéquate les systèmes de développement et de production;</li><li>définir, documenter et mettre en œuvre les règles et autorisations pour le déploiement de logiciels;</li><li>tester les modifications dans un environnement de test avant de les appliquer aux systèmes opérationnels;</li><li>ne pas réaliser de tests dans des environnements opérationnels sauf circonstances exceptionnelles;</li><li>rendre inaccessibles les compilateurs et autres outils de développement depuis les systèmes opérationnels;</li><li>ne pas copier d'informations sensibles dans les environnements de développement et de test.</li></ul>`,
      extraInfo: "<p>Les activités de développement et de test peuvent entraîner des changements involontaires aux logiciels ou aux informations si elles partagent le même environnement informatique. La séparation réduit les risques de changements accidentels ou d'accès non autorisé aux logiciels en production et aux données opérationnelles.</p>"
    }
  },
  {
    code: '8.32',
    title: 'Gestion des changements',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Soumettre les changements aux moyens de traitement et aux systèmes d'information à des procédures de gestion des changements.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_des_applications', 'Sécurité_système_et_réseau'],
      domains: ['Protection'],
      measure: "Il convient que les changements apportés aux moyens de traitement de l'information et aux systèmes d'information soient soumis à des procédures de gestion des changements.",
      objective: "Préserver la sécurité de l'information lors de l'exécution des changements.",
      recommendations: `<p>Il convient que l'introduction de nouveaux systèmes et de changements importants suivent un processus formel de documentation, de spécification, de tests, de contrôle qualité et de mise en œuvre gérée.</p><p>Il convient que les procédures de contrôle des changements incluent:</p><ul><li>la planification et l'évaluation des impacts potentiels des changements;</li><li>l'autorisation des changements;</li><li>la communication des changements aux parties intéressées;</li><li>les tests et l'acceptation des tests relatifs aux changements;</li><li>les considérations d'urgence et de secours, y compris les procédures de repli;</li><li>le maintien à jour des enregistrements des changements.</li></ul>`,
      extraInfo: "<p>Le contrôle inapproprié des changements apportés aux moyens de traitement de l'information et aux systèmes d'information représente une cause courante des défaillances du système ou de sécurité. Il est recommandé de tester les composants TIC dans un environnement séparé (voir 8.31).</p>"
    }
  },
  {
    code: '8.33',
    title: 'Informations de test',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Sélectionner, protéger et gérer de manière appropriée les informations de test.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité'],
      concepts: ['Protéger'],
      capabilities: ['Protection_des_informations'],
      domains: ['Protection'],
      measure: "Il convient que les informations de test soient sélectionnées, protégées et gérées de manière appropriée.",
      objective: "Assurer la pertinence des tests et la protection des informations opérationnelles utilisées pour les tests.",
      recommendations: `<p>Il convient que les informations sensibles (y compris les données à caractère personnel) ne soient pas copiées dans les environnements de développement et de test.</p><p>Il convient que les recommandations suivantes soient appliquées afin protéger les copies d'informations opérationnelles lorsqu'elles sont utilisées à des fins de tests:</p><ul><li>appliquer les mêmes procédures de contrôle d'accès aux environnements de test qu'aux environnements opérationnels;</li><li>obtenir une nouvelle autorisation à chaque fois que des informations opérationnelles sont copiées dans un environnement de test;</li><li>protéger les informations sensibles en les supprimant ou en les masquant (voir 8.11);</li><li>supprimer correctement (voir 8.10) les informations opérationnelles de l'environnement de test immédiatement après la fin des tests.</li></ul>`,
      extraInfo: "<p>Les tests de systèmes et d'acceptation peuvent nécessiter des volumes importants d'informations de test qui soient aussi proches que possible des informations opérationnelles.</p>"
    }
  },
  {
    code: '8.34',
    title: 'Protection des systèmes d\'information pendant les tests d\'audit',
    chapter: IsoChapter.TECHNOLOGICAL,
    description: "Planifier et convenir des tests d'audit pour minimiser l'impact sur les systèmes opérationnels.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_système_et_réseau', 'Protection_des_informations'],
      domains: ['Gouvernance_et_Écosystème', 'Protection'],
      measure: "Il convient que les tests d'audit et autres activités d'assurance impliquant l'évaluation des systèmes opérationnels soient planifiés et convenus entre le testeur et le niveau approprié du management.",
      objective: "Minimiser l'impact des activités d'audit et autres activités d'assurance sur les systèmes opérationnels et les processus métier.",
      recommendations: `<p>Il convient de prendre en considération les lignes directrices suivantes:</p><ul><li>convenir des demandes d'audit pour l'accès aux systèmes et aux données avec le management;</li><li>convenir et contrôler le périmètre des tests d'audit techniques;</li><li>limiter les tests d'audit à un accès en lecture seule aux logiciels et aux données;</li><li>autoriser les accès autres qu'en lecture seule seulement pour les copies isolées de fichiers système;</li><li>exécuter les tests d'audit qui peuvent impacter la disponibilité du système en dehors des heures de travail;</li><li>surveiller et journaliser tous les accès à des fins d'audit et de test.</li></ul>`,
      extraInfo: "<p>Les tests d'audit et autres activités d'assurance peuvent également avoir lieu sur des systèmes de développement et de test, dans lesquels ces tests peuvent impacter, par exemple, l'intégrité du code ou mener à la divulgation d'informations sensibles.</p>"
    }
  }
];
