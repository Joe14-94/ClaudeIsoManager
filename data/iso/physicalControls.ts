import { IsoChapter, IsoMeasure } from '../../types';

export const physicalControls: Omit<IsoMeasure, 'id'>[] = [
  // PHYSICAL CONTROLS (7.x)
  {
    code: '7.1',
    title: 'Périmètres de sécurité physique',
    chapter: IsoChapter.PHYSICAL,
    description: "Définir et utiliser des périmètres de sécurité pour protéger les zones contenant des informations sensibles.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection'],
      measure: "Il convient de définir et d'utiliser des périmètres de sécurité pour protéger les zones qui contiennent des informations et autres actifs associés sensibles ou critiques.",
      objective: "Empêcher l'accès physique non autorisé, les dommages et l'interférence avec les informations et autres actifs associés de l'organisation.",
      recommendations: `<p>Il convient de prendre en compte les lignes directrices suivantes lors de la conception et de la mise en œuvre de périmètres de sécurité physique:</p><ul><li>La force et le type de chaque périmètre doivent être déterminés en fonction des exigences de sécurité des actifs à l'intérieur du périmètre et des résultats de l'appréciation du risque.</li><li>Un périmètre peut être un mur et une porte verrouillable, ou il peut être constitué d'un ensemble de mesures de sécurité.</li><li>Les périmètres doivent être clairement définis, et l'emplacement et la force de chaque périmètre dépendent des risques que l'on souhaite prévenir.</li><li>Plusieurs périmètres peuvent être mis en œuvre pour fournir des couches de protection supplémentaires.</li><li>La protection physique peut être obtenue en créant des barrières physiques autour des locaux de l'organisation et en utilisant des systèmes de contrôle d'entrée électronique.</li><li>Des mesures doivent être mises en œuvre sur le périmètre pour empêcher l'observation non autorisée des informations sensibles.</li></ul>`,
      extraInfo: `<p>Le concept de périmètres de sécurité s'applique non seulement aux bâtiments mais aussi aux actifs spécifiques à l'intérieur d'un bâtiment.</p><p>Par exemple, une salle de serveurs est un périmètre de sécurité physique à l'intérieur d'un bâtiment qui est lui-même un périmètre de sécurité physique.</p>`
    }
  },
  {
    code: '7.2',
    title: 'Entrée physique',
    chapter: IsoChapter.PHYSICAL,
    description: "Sécuriser les entrées physiques et contrôler l'accès aux zones sécurisées.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection'],
      measure: "Il convient de sécuriser les zones sécurisées avec des contrôles d'entrée et des points d'accès appropriés.",
      objective: "Assurer que seul le personnel autorisé a accès aux locaux, bâtiments, salles, et aux informations et autres actifs associés de l'organisation.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte:</p><ul><li>Les visiteurs des zones sécurisées doivent être supervisés ou autorisés avant l'accès. Leur heure d'arrivée et de départ doit être enregistrée.</li><li>L'accès aux zones contenant des informations et autres actifs associés sensibles ou critiques doit être limité aux personnes autorisées uniquement.</li><li>Les droits d'accès physique doivent être gérés par un processus formel (voir 5.18).</li><li>Tous les membres du personnel et les autres parties intéressées doivent être informés des procédures de contrôle d'entrée physique.</li><li>Un contact physique ou visuel doit être maintenu avec les visiteurs.</li><li>Le personnel des services d'urgence (par exemple, pompiers, police) doit se voir accorder l'accès lorsque nécessaire en cas d'urgence.</li></ul>`,
      extraInfo: `<p>L'utilisation de systèmes de contrôle d'accès physique peut fournir un moyen efficace de contrôle et de surveillance, permettant la collecte de données d'audit.</p>`
    }
  },
  {
    code: '7.3',
    title: 'Sécurisation des bureaux, des salles et des installations',
    chapter: IsoChapter.PHYSICAL,
    description: "Concevoir et mettre en œuvre la sécurité physique des bureaux, salles et installations.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection'],
      measure: "Il convient de concevoir et de mettre en œuvre la sécurité physique des bureaux, des salles et des installations.",
      objective: "Empêcher l'accès physique non autorisé, les dommages et l'interférence avec les informations et autres actifs associés de l'organisation dans les bureaux, les salles et les installations.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte pour la sécurisation des bureaux, des salles et des installations:</p><ul><li>Les installations clés doivent être situées de manière à éviter l'accès par le public.</li><li>Les bâtiments doivent être discrets et donner le minimum d'indication sur leur fonction.</li><li>Les répertoires et les panneaux d'information internes identifiant les zones sensibles ne doivent pas être visibles depuis les zones accessibles au public.</li><li>Les installations de traitement d'informations sensibles doivent être positionnées pour réduire les risques d'être surveillées depuis l'extérieur du périmètre.</li><li>Les portes et fenêtres des salles doivent être verrouillées lorsqu'elles sont sans surveillance et une protection renforcée (par exemple, des barreaux) doit être envisagée pour les fenêtres et les portes, en particulier au rez-de-chaussée.</li></ul>`,
      extraInfo: `<p>Les mesures de sécurité physique peuvent également être requises par les compagnies d'assurance.</p>`
    }
  },
  {
    code: '7.4',
    title: 'Surveillance de la sécurité physique',
    chapter: IsoChapter.PHYSICAL,
    description: "Surveiller en permanence les locaux pour détecter les accès physiques non autorisés.",
    details: {
      type: ['Détective', 'Corrective'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Détecter', 'Répondre'],
      capabilities: ['Sécurité_physique'],
      domains: ['Défense'],
      measure: "Il convient de surveiller en permanence les locaux pour détecter les accès physiques non autorisés.",
      objective: "Détecter et dissuader les accès physiques non autorisés.",
      recommendations: `<p>Il convient que les locaux soient surveillés pour détecter les activités non autorisées. La surveillance peut être réalisée par des patrouilles de gardes ou des systèmes de surveillance et d'alarme.</p><p>Les systèmes de surveillance, tels que les caméras de télévision en circuit fermé (CCTV) et les systèmes de détection d'intrusion, doivent être installés de manière à ce que la couverture de surveillance soit complète, sans angle mort, et que la surveillance soit enregistrée et stockée pendant une période définie.</p><p>Il convient que les systèmes de surveillance et d'alarme soient protégés contre les altérations et les dysfonctionnements.</p><p>Il convient que les alarmes soient transmises à un point de surveillance qui est constamment surveillé et où des procédures sont en place pour répondre aux alarmes.</p>`,
      extraInfo: `<p>La date, l'heure et l'identité des personnes entrant ou sortant des zones protégées doivent être enregistrées.</p><p>Ces informations doivent être conservées et protégées conformément aux exigences légales et de protection de la vie privée (voir 5.31, 5.34).</p>`
    }
  },
  {
    code: '7.5',
    title: 'Protection contre les menaces physiques et environnementales',
    chapter: IsoChapter.PHYSICAL,
    description: "Concevoir et mettre en œuvre une protection contre les menaces physiques et environnementales.",
    details: {
      type: ['Préventive'],
      properties: ['Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Résilience'],
      measure: "Il convient de concevoir et de mettre en œuvre une protection contre les menaces physiques et environnementales, telles que les catastrophes naturelles et autres menaces physiques intentionnelles ou non intentionnelles pour l'infrastructure.",
      objective: "Empêcher ou réduire l'impact des événements physiques et environnementaux.",
      recommendations: `<p>Une appréciation du risque doit être menée pour identifier les menaces des catastrophes naturelles (par exemple, inondation, foudre, tremblement de terre) et autres menaces physiques et environnementales (par exemple, incendie, explosion, troubles civils, rayonnement, contamination chimique).</p><p>Des mesures de sécurité appropriées doivent être mises en œuvre pour protéger contre les menaces identifiées.</p><p>L'avis de spécialistes sur la protection contre ces menaces doit être obtenu pour s'assurer que les mesures de sécurité sont adéquates et efficaces.</p>`,
      extraInfo: `<p>Cette mesure de sécurité concerne la protection des personnes, des informations et des installations critiques de l'organisation.</p>`
    }
  },
  {
    code: '7.6',
    title: 'Travail dans des zones sécurisées',
    chapter: IsoChapter.PHYSICAL,
    description: "Établir et mettre en œuvre des procédures pour le travail dans des zones sécurisées.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection'],
      measure: "Il convient d'établir et de mettre en œuvre des procédures pour le travail dans des zones sécurisées.",
      objective: "Empêcher les dommages, le vol, la compromission ou l'accès non autorisé aux informations et autres actifs associés.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte:</p><ul><li>Le personnel ne doit être informé de l'existence et de l'objet d'une zone sécurisée que sur la base du besoin d'en connaître.</li><li>Le travail sans surveillance dans les zones sécurisées doit être évité si possible pour des raisons de sécurité et pour empêcher les activités malveillantes.</li><li>Les zones sécurisées vacantes doivent être physiquement verrouillées et périodiquement vérifiées.</li><li>Le personnel de support des tiers ne doit avoir accès aux zones sécurisées que lorsque cela est nécessaire et autorisé. Cet accès doit être surveillé.</li><li>Les activités de maintenance et de réparation dans les zones sécurisées doivent être contrôlées.</li></ul>`,
      extraInfo: `<p>Des zones de livraison et de chargement et d'autres points où des personnes ou des objets non autorisés peuvent entrer dans les locaux doivent être contrôlés et, si possible, isolés des installations de traitement de l'information pour éviter les accès non autorisés.</p>`
    }
  },
  {
    code: '7.7',
    title: 'Bureau propre et écran propre',
    chapter: IsoChapter.PHYSICAL,
    description: "Établir et appliquer des règles de bureau propre pour les papiers et les supports amovibles, et des règles d'écran propre pour les équipements.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité'],
      concepts: ['Protéger'],
      capabilities: ['Protection_des_informations'],
      domains: ['Protection'],
      measure: "Il convient d'établir et d'appliquer des règles de bureau propre pour les papiers et les supports de stockage amovibles, et des règles d'écran propre pour les moyens de traitement de l'information.",
      objective: "Réduire les risques d'accès non autorisé, de perte et de dommage aux informations et autres actifs associés.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte pour une politique de bureau propre et d'écran propre:</p><ul><li>Les informations sensibles ou critiques, sur papier ou sur support de stockage électronique, doivent être verrouillées (idéalement dans un coffre-fort ou une armoire ignifugée) lorsqu'elles ne sont pas utilisées.</li><li>Les ordinateurs et les terminaux doivent être configurés pour se verrouiller après une période d'inactivité.</li><li>Les informations sensibles ne doivent pas être laissées visibles sur les écrans sans surveillance.</li><li>Les photocopieurs et les imprimantes doivent être sécurisés.</li><li>Les documents imprimés contenant des informations sensibles doivent être retirés de l'imprimante immédiatement.</li></ul>`,
      extraInfo: `<p>Une politique de bureau propre et d'écran propre peut réduire le risque de vol, de fraude et de violation de la sécurité de l'information par des personnes non autorisées ayant accès aux installations en dehors des heures de bureau.</p>`
    }
  },
  {
    code: '7.8',
    title: 'Emplacement et protection des équipements',
    chapter: IsoChapter.PHYSICAL,
    description: "Placer et protéger les équipements pour réduire les risques liés aux menaces et dangers environnementaux.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection', 'Résilience'],
      measure: "Il convient que les équipements soient placés et protégés de manière à réduire les risques liés aux menaces et dangers environnementaux, et aux possibilités d'accès non autorisé.",
      objective: "Empêcher la perte, les dommages, le vol ou la compromission des équipements et l'interruption des activités de l'organisation.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte pour protéger les équipements:</p><ul><li>Les équipements doivent être positionnés de manière à minimiser les accès non nécessaires.</li><li>Les éléments nécessitant une protection spéciale (par exemple, les serveurs) doivent être isolés pour réduire le niveau général de protection requis.</li><li>Les zones de traitement de l'information doivent être protégées contre le tabagisme, la nourriture et les boissons.</li><li>Les conditions environnementales, telles que la température et l'humidité, doivent être surveillées pour s'assurer qu'elles n'affectent pas le fonctionnement des équipements.</li><li>La protection contre la foudre doit être mise en œuvre pour tous les bâtiments et les lignes d'alimentation et de communication.</li></ul>`,
      extraInfo: `<p>La protection des équipements est un élément important de la continuité d'activité. La co-implantation d'équipements détenus par différentes organisations peut nécessiter une considération supplémentaire pour la sécurité des équipements et pour s'assurer qu'il n'y a pas d'interférence entre les équipements.</p>`
    }
  },
  {
    code: '7.9',
    title: 'Sécurité des actifs hors des locaux',
    chapter: IsoChapter.PHYSICAL,
    description: "Protéger les actifs situés en dehors des locaux de l'organisation.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique', 'Gestion_des_actifs'],
      domains: ['Protection'],
      measure: "Il convient de protéger les actifs hors des locaux de l'organisation.",
      objective: "Empêcher la perte, les dommages, le vol ou la compromission des actifs hors des locaux de l'organisation.",
      recommendations: `<p>L'utilisation d'actifs hors des locaux de l'organisation doit être autorisée par la direction.</p><p>Les risques de travailler avec des actifs hors des locaux doivent être identifiés et des mesures de sécurité appropriées doivent être mises en œuvre.</p><p>Il convient de tenir compte des lignes directrices suivantes:</p><ul><li>Les équipements et les supports de stockage ne doivent pas être laissés sans surveillance dans des lieux publics.</li><li>Les informations de l'organisation doivent être stockées et traitées conformément à la politique de classification de l'information (voir 5.12).</li><li>Les sauvegardes des informations et des logiciels doivent être effectuées régulièrement.</li><li>Les lois et réglementations sur la protection des données, les droits de propriété intellectuelle et les licences logicielles doivent être respectées.</li></ul>`,
      extraInfo: `<p>Les actifs hors des locaux peuvent inclure des équipements et des supports de stockage utilisés pour le télétravail ou transportés hors des locaux.</p>`
    }
  },
  {
    code: '7.10',
    title: 'Supports de stockage',
    chapter: IsoChapter.PHYSICAL,
    description: "Gérer les supports de stockage pour prévenir la divulgation, la modification, la suppression ou la destruction non autorisée d'informations.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_actifs'],
      domains: ['Protection'],
      measure: "Il convient de gérer les supports de stockage pour prévenir la divulgation, la modification, la suppression ou la destruction non autorisée d'informations.",
      objective: "Assurer la sécurité des informations sur les supports de stockage.",
      recommendations: `<p>Des procédures doivent être mises en œuvre pour la gestion des supports amovibles, notamment:</p><ul><li>Les supports contenant des informations sensibles doivent être stockés dans un environnement sécurisé.</li><li>Un système de journalisation doit être maintenu pour enregistrer la manipulation des supports.</li><li>Les supports amovibles doivent être marqués physiquement avec leur classification de sécurité.</li><li>Tous les supports doivent être vérifiés pour les logiciels malveillants avant utilisation.</li><li>La mise au rebut sécurisée des supports amovibles qui ne sont plus nécessaires doit être effectuée.</li></ul><p>Les supports endommagés contenant des informations sensibles doivent être évalués pour déterminer s'ils peuvent être réparés ou s'ils doivent être détruits de manière sécurisée.</p>`,
      extraInfo: `<p>Les supports de stockage incluent les disques durs, les disques SSD, les bandes, les CD, les DVD, les clés USB et autres dispositifs de stockage amovibles.</p>`
    }
  },
  {
    code: '7.11',
    title: 'Utilitaires',
    chapter: IsoChapter.PHYSICAL,
    description: "Protéger les installations de traitement de l'information contre les pannes de courant et autres interruptions causées par des défaillances des utilitaires.",
    details: {
      type: ['Préventive'],
      properties: ['Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Résilience'],
      measure: "Il convient que les installations de traitement de l'information soient protégées contre les pannes de courant et autres interruptions causées par des défaillances des utilitaires de support.",
      objective: "Empêcher la perte, les dommages ou la compromission des informations et autres actifs associés et l'interruption des activités de l'organisation en raison de défaillances des utilitaires de support.",
      recommendations: `<p>Les utilitaires de support tels que l'électricité, l'approvisionnement en eau, les égouts, le chauffage, la ventilation et la climatisation doivent être adéquats pour les systèmes qu'ils desservent.</p><p>Les utilitaires doivent être inspectés régulièrement pour s'assurer de leur bon fonctionnement.</p><p>Une alimentation électrique sans coupure (UPS) et un générateur de secours doivent être disponibles pour les systèmes essentiels.</p><p>Les plans d'urgence doivent être en place pour faire face aux pannes des utilitaires de support.</p>`,
      extraInfo: `<p>Les utilitaires de support sont des éléments essentiels de l'infrastructure d'une organisation. Leur défaillance peut causer des interruptions significatives des activités.</p>`
    }
  },
  {
    code: '7.12',
    title: 'Sécurité du câblage',
    chapter: IsoChapter.PHYSICAL,
    description: "Protéger le câblage d'alimentation et de télécommunication contre l'interception, l'interférence ou les dommages.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Sécurité_physique'],
      domains: ['Protection'],
      measure: "Il convient que le câblage d'alimentation et de télécommunication transportant des données ou prenant en charge des services d'information importants soit protégé contre l'interception, l'interférence ou les dommages.",
      objective: "Empêcher l'interception, l'interférence ou les dommages au câblage et l'interruption des activités de l'organisation.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte pour la sécurité du câblage:</p><ul><li>Les câbles d'alimentation et de télécommunication doivent être protégés contre les dommages.</li><li>Les câbles doivent être installés conformément aux spécifications du fabricant.</li><li>Le câblage réseau doit être protégé contre l'accès non autorisé.</li><li>Le câblage doit être étiqueté pour indiquer son objectif et sa destination.</li><li>La séparation du câblage d'alimentation et de communication doit être maintenue pour éviter les interférences.</li><li>Les câbles transportant des données sensibles ou critiques doivent être protégés physiquement (par exemple, par des conduits) ou par l'utilisation de fibres optiques.</li></ul>`,
      extraInfo: `<p>Le câblage est un élément critique de l'infrastructure de communication. Les dommages ou l'interception du câblage peuvent entraîner une perte de disponibilité et de confidentialité de l'information.</p>`
    }
  },
  {
    code: '7.13',
    title: 'Maintenance des équipements',
    chapter: IsoChapter.PHYSICAL,
    description: "Effectuer la maintenance des équipements correctement pour assurer leur disponibilité et leur intégrité continues.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité', 'Intégrité', 'Disponibilité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_actifs'],
      domains: ['Protection', 'Résilience'],
      measure: "Il convient que les équipements soient correctement entretenus pour assurer leur disponibilité et leur intégrité continues.",
      objective: "Assurer le fonctionnement correct et sécurisé des équipements.",
      recommendations: `<p>Les lignes directrices suivantes doivent être prises en compte pour la maintenance des équipements:</p><ul><li>La maintenance des équipements doit être effectuée conformément aux spécifications du fabricant.</li><li>Seul le personnel de maintenance autorisé doit effectuer les réparations et l'entretien des équipements.</li><li>Les enregistrements de toutes les maintenances, qu'elles soient préventives ou correctives, doivent être tenus à jour.</li><li>Les exigences de sécurité de l'information doivent être respectées lors des activités de maintenance.</li><li>Les équipements envoyés pour maintenance doivent être évalués pour les risques de sécurité et des mesures de sécurité appropriées doivent être appliquées.</li></ul>`,
      extraInfo: `<p>Une maintenance inadéquate peut entraîner des défaillances des équipements, des interruptions de service et des violations de la sécurité. Les exigences de maintenance doivent être définies dans les contrats avec les fournisseurs de maintenance.</p>`
    }
  },
  {
    code: '7.14',
    title: 'Élimination sécurisée ou réutilisation des équipements',
    chapter: IsoChapter.PHYSICAL,
    description: "Vérifier que tous les équipements contenant des supports de stockage sont effacés ou détruits de manière sécurisée avant leur élimination ou réutilisation.",
    details: {
      type: ['Préventive'],
      properties: ['Confidentialité'],
      concepts: ['Protéger'],
      capabilities: ['Gestion_des_actifs'],
      domains: ['Protection'],
      measure: "Il convient que les équipements contenant des supports de stockage soient vérifiés pour s'assurer que toutes les données sensibles et les logiciels sous licence ont été supprimés ou écrasés de manière sécurisée avant leur élimination ou leur réutilisation.",
      objective: "Empêcher la divulgation d'informations sensibles à partir d'équipements mis au rebut ou réutilisés.",
      recommendations: `<p>Des procédures doivent être mises en œuvre pour assurer l'élimination ou la réutilisation sécurisée des équipements. Ces procédures doivent prendre en compte la sensibilité des informations sur les supports de stockage.</p><p>Les supports de stockage contenant des informations sensibles doivent être physiquement détruits ou effacés de manière sécurisée à l'aide de techniques qui rendent la récupération des données impossible.</p><p>Un enregistrement des équipements mis au rebut doit être conservé.</p><p>Le processus d'élimination doit être effectué par du personnel autorisé.</p>`,
      extraInfo: `<p>La suppression simple des fichiers ne supprime pas de manière permanente les données. Des outils spécialisés sont nécessaires pour effacer de manière sécurisée les données des supports de stockage. Des informations supplémentaires sur la désinfection des supports sont disponibles dans la publication spéciale NIST 800-88.</p>`
    }
  },
];
