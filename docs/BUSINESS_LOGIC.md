# Digital Hub SN - Logique Métier

## Contexte
- **Étudiants** : 50 maximum
- **Cohorte** : Unique (Cohorte 2026)
- **Modules** : Séquentiels (ordre strict)
- **Durée formation** : 1 mois (30 jours)
- **Horaires** : 16h–19h, Lundi–Vendredi uniquement

---

## 1. Progression des Modules

### Règles
- Les modules sont suivis **séquentiellement** selon leur champ `order`
- Chaque module a une durée en jours (champ `duration`)
- La progression est automatique : un module commence quand le précédent est terminé
- Pas de chevauchement de modules

### Implémentation
```javascript
// Module structure
{
  id: string,
  name: string,
  order: number,        // Ordre séquentiel (1, 2, 3...)
  duration: number,     // Durée en jours ouvrés
  trainerId: string,    // Formateur assigné
  description: string,
  color: string
}
```

### Logique de progression
1. Les modules sont triés par `order` croissant
2. Le module 1 commence au jour 1 de la formation
3. Le module N commence après la fin du module N-1
4. La fin d'un module = date de début + durée (en jours ouvrés)

---

## 2. Détermination du Module Actif

### Définition
Le **module actif** est le module en cours d'enseignement à la date du jour.

### Algorithme
```javascript
function getActiveModule(today, schedule, modules) {
  // Trouver l'entrée de planning pour aujourd'hui
  const todayEntry = schedule.find(s => s.date === today);
  if (!todayEntry) return null;
  
  // Retourner le module correspondant
  return modules.find(m => m.id === todayEntry.moduleId);
}
```

### Cas particuliers
- **Avant le début** : Aucun module actif
- **Après la fin** : Aucun module actif
- **Week-end** : Le module actif reste celui du vendredi précédent

---

## 3. Génération du Planning Automatique (30 jours)

### Règles
- Le planning couvre **exactement 30 jours** à partir de la date de début
- Seuls les **jours ouvrés** (Lun-Ven) sont inclus
- Chaque jour = 1 session de 3h (16h-19h)
- Les modules sont assignés séquentiellement selon leur durée

### Algorithme
```javascript
function generateSchedule(startDate, modules) {
  const schedule = [];
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  let currentDate = new Date(startDate);
  let moduleIndex = 0;
  let daysInCurrentModule = 0;
  
  // Générer 30 jours de planning
  for (let day = 0; day < 30; day++) {
    const dayOfWeek = currentDate.getDay(); // 1=Mon, ..., 5=Fri, 0=Sun, 6=Sat
    
    // Uniquement les jours ouvrés (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Vérifier si on a épuisé le module actuel
      if (moduleIndex < sortedModules.length) {
        const currentModule = sortedModules[moduleIndex];
        
        schedule.push({
          id: generateId(),
          date: currentDate.toISOString().split('T')[0],
          moduleId: currentModule.id,
          startTime: '16:00',
          endTime: '19:00'
        });
        
        daysInCurrentModule++;
        
        // Passer au module suivant si durée atteinte
        if (daysInCurrentModule >= currentModule.duration) {
          moduleIndex++;
          daysInCurrentModule = 0;
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return schedule;
}
```

### Contraintes
- Si la durée totale des modules < 30 jours, les jours restants sont vides
- Si la durée totale > 30 jours, les modules sont tronqués
- La date de début est toujours un **lundi**

---

## 4. Gestion de la Présence Quotidienne

### Structure des données
```javascript
// Attendance par date
{
  "2026-07-04": {
    "studentId1": "present",
    "studentId2": "absent",
    "studentId3": "late"
  }
}
```

### Statuts possibles
- `present` : Étudiant présent à temps
- `absent` : Étudiant absent
- `late` : Étudiant en retard

### Logique métier
1. **Initialisation** : Chaque jour, les présences sont vides par défaut
2. **Marquage** : Les présences sont marquées manuellement pour chaque étudiant
3. **Calcul du taux** : Taux de présence = (présents / total enregistrements) × 100
4. **Filtrage** : Seuls les étudiants actifs sont comptabilisés

### Fonctions clés
```javascript
// Marquer tous les étudiants présents (raccourci)
function markAllPresent(date, activeStudentIds) {
  const attendance = {};
  activeStudentIds.forEach(id => {
    attendance[id] = 'present';
  });
  return attendance;
}

// Calculer les statistiques
function getAttendanceStats(attendanceData, activeStudentIds) {
  let totalPresent = 0;
  let totalRecords = 0;
  
  Object.values(attendanceData).forEach(dayData => {
    Object.entries(dayData).forEach(([studentId, status]) => {
      if (activeStudentIds.includes(studentId)) {
        totalRecords++;
        if (status === 'present') totalPresent++;
      }
    });
  });
  
  return {
    rate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
    totalPresent,
    totalRecords
  };
}
```

---

## 5. Association Formateur → Module

### Règles
- Chaque module a **exactement un formateur** assigné
- Un formateur peut enseigner **plusieurs modules**
- L'association est stockée dans le champ `trainerId` du module

### Structure
```javascript
// Module avec formateur
{
  id: string,
  name: string,
  order: number,
  duration: number,
  trainerId: string,  // Référence vers le formateur
  description: string,
  color: string
}

// Formateur disponible
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  specialty: string
}
```

### Logique d'assignation
1. Lors de la création d'un module, un formateur doit être sélectionné
2. Le formateur assigné est affiché dans le planning
3. Le formateur peut être modifié ultérieurement

### Validation
- Un module ne peut pas être créé sans `trainerId`
- Le `trainerId` doit correspondre à un formateur existant

---

## 6. Vue d'Ensemble du Flux

### Initialisation
1. Créer les formateurs
2. Créer les modules (avec formateurs assignés)
3. Générer le planning automatique (30 jours)
4. Créer les 50 étudiants

### Quotidien
1. Identifier le module actif via la date du jour
2. Afficher le planning du jour avec le formateur
3. Enregistrer les présences des étudiants
4. Calculer les statistiques de présence

### Modifications
- **Ajout de module** : Régénère le planning
- **Modification de module** : Régénère le planning
- **Suppression de module** : Régénère le planning
- **Changement de formateur** : Met à jour le module sans régénérer le planning

---

## 7. Contraintes et Invariants

### Invariants
- Le nombre total d'étudiants ≤ 50
- Les modules ont un `order` unique et séquentiel
- Le planning ne contient que des jours ouvrés (Lun-Ven)
- Chaque entrée de planning a un `moduleId` valide
- Chaque module a un `trainerId` valide

### Contraintes
- La formation dure 30 jours maximum
- Les horaires sont fixes : 16h-19h
- Pas de cours le week-end
- Les modules ne peuvent pas se chevaucher

---

## 8. Services Backend

### ModulesService
- `getAll()` : Retourne les modules triés par ordre
- `getActiveModule(date)` : Retourne le module actif pour une date
- `create(module)` : Crée un module et régénère le planning
- `update(id, fields)` : Met à jour un module et régénère le planning
- `delete(id)` : Supprime un module et régénère le planning

### ScheduleService
- `generate(startDate, modules)` : Génère le planning sur 30 jours
- `getAll()` : Retourne le planning trié par date
- `getByDate(date)` : Retourne l'entrée de planning pour une date
- `getWeeks()` : Retourne les semaines du planning

### AttendanceService
- `getByDate(date)` : Retourne les présences pour une date
- `setStatus(date, studentId, status)` : Met à jour un statut
- `markAllPresent(date, studentIds)` : Marque tous présents
- `getStats(studentIds)` : Calcule les statistiques globales

### TrainersService
- `getAll()` : Retourne tous les formateurs
- `getById(id)` : Retourne un formateur
- `getByModule(moduleId)` : Retourne le formateur d'un module
