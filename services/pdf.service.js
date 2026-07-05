import { api } from '../backend/api.js';

export class PDFService {
    constructor() {
        this.jsPDF = window.jspdf.jsPDF;
    }

    // Helper: Format date in French
    formatDate(dateStr) {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    // Helper: Add header to PDF
    addHeader(doc, title) {
        doc.setFontSize(20);
        doc.setTextColor(99, 102, 241);
        doc.text('Digital Hub OS', 105, 20, { align: 'center' });
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 105, 35, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);
    }

    // Helper: Add footer to PDF
    addFooter(doc, pageNumber = null) {
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('Document généré par Digital Hub OS', 105, 280, { align: 'center' });
        if (pageNumber) {
            doc.text(`Page ${pageNumber}`, 190, 280, { align: 'right' });
        }
    }

    // 1. Contrat de prestation de service du formateur
    generateTrainerContract(trainerId) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Contrat de Prestation de Service');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('ENTRE LES SOUSSIGNÉS :', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Le formateur :`, 20, y);
        y += 8;
        doc.text(`Nom : ${trainer.firstName} ${trainer.lastName}`, 25, y);
        y += 8;
        doc.text(`Email : ${trainer.email}`, 25, y);
        y += 8;
        doc.text(`Téléphone : ${trainer.phone}`, 25, y);
        y += 8;
        doc.text(`Spécialité : ${trainer.specialty}`, 25, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('OBJET DU CONTRAT :', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Le présent contrat a pour objet de définir les conditions dans lesquelles le formateur', 20, y);
        y += 7;
        doc.text('assure les sessions de formation au sein de Digital Hub OS pour la cohorte 2026.', 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('OBLIGATIONS DU FORMATEUR :', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const obligations = [
            'Assurer les sessions de formation selon le planning établi',
            'Préparer et fournir les supports pédagogiques nécessaires',
            'Évaluer les étudiants et fournir les rapports de fin de module',
            'Respecter les horaires établis (16h-19h, du lundi au vendredi)',
            'Maintenir un niveau de qualité pédagogique élevé'
        ];
        obligations.forEach(obs => {
            doc.text(`• ${obs}`, 25, y);
            y += 7;
        });
        y += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RÉMUNÉRATION :', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('La rémunération sera calculée sur la base des heures effectuées selon le tarif', 20, y);
        y += 7;
        doc.text('conventionné. Un décompte détaillé sera fourni à la fin de chaque module.', 20, y);
        y += 20;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('DURÉE :', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Le présent contrat est conclu pour la durée de la formation de la cohorte 2026.', 20, y);
        y += 7;
        doc.text('Il prend effet à compter de la date de signature.', 20, y);
        y += 30;

        doc.setFontSize(11);
        doc.text('Fait à Bamako, le ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 20;

        doc.text('Signature du formateur : ___________________', 20, y);
        doc.text('Signature Digital Hub OS : ___________________', 110, y);

        this.addFooter(doc);
        doc.save(`Contrat_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 2. Fiche de renseignements du formateur
    generateTrainerInfoSheet(trainerId) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Fiche de Renseignements');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('INFORMATIONS PERSONNELLES', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const info = [
            ['Nom complet :', `${trainer.firstName} ${trainer.lastName}`],
            ['Email :', trainer.email],
            ['Téléphone :', trainer.phone],
            ['Spécialité :', trainer.specialty],
            ['ID Formateur :', trainer.id]
        ];

        info.forEach(([label, value]) => {
            doc.setFont(undefined, 'bold');
            doc.text(label, 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(value, 70, y);
            y += 10;
        });

        y += 15;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('MODULES ASSIGNÉS', 20, y);
        y += 15;

        const modules = api.trainers.getModules(trainerId);
        if (modules.length === 0) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text('Aucun module assigné', 20, y);
        } else {
            modules.forEach(mod => {
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                doc.text(`Module ${mod.order} : ${mod.name}`, 20, y);
                y += 7;
                doc.text(`Durée : ${mod.duration} jours`, 25, y);
                y += 7;
                doc.text(`Description : ${mod.description}`, 25, y);
                y += 12;
            });
        }

        this.addFooter(doc);
        doc.save(`Fiche_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 3. Charte d'engagement
    generateEngagementCharter(trainerId) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Charte d\'Engagement');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('CHARTE D\'ENGAGEMENT PÉDAGOGIQUE', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Je soussigné(e), ' + trainer.firstName + ' ' + trainer.lastName + ', formateur chez Digital Hub OS,', 20, y);
        y += 7;
        doc.text('m\'engage à respecter les principes suivants :', 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('QUALITÉ PÉDAGOGIQUE', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const qualityPoints = [
            'Préparer soigneusement chaque session de formation',
            'Adapter mon enseignement au niveau des apprenants',
            'Utiliser des méthodes pédagogiques variées et interactives',
            'Fournir des supports de cours clairs et complets',
            'Être disponible pour répondre aux questions des étudiants'
        ];
        qualityPoints.forEach(point => {
            doc.text('• ' + point, 25, y);
            y += 7;
        });
        y += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('ASSIDUITÉ ET PONCTUALITÉ', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const attendancePoints = [
            'Être présent à tous les cours selon le planning établi',
            'Arriver à l\'heure (16h) et respecter les horaires',
            'Prévenir en cas d\'empêchement dans les plus brefs délais',
            'Rattraper les sessions manquées si nécessaire'
        ];
        attendancePoints.forEach(point => {
            doc.text('• ' + point, 25, y);
            y += 7;
        });
        y += 10;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('PROFESSIONNALISME', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const proPoints = [
            'Maintenir une attitude professionnelle en tout temps',
            'Respecter les règles de confidentialité',
            'Collaborer avec l\'équipe pédagogique',
            'Participer aux réunions de coordination',
            'Accepter les retours constructifs'
        ];
        proPoints.forEach(point => {
            doc.text('• ' + point, 25, y);
            y += 7;
        });
        y += 20;

        doc.setFontSize(11);
        doc.text('Date : ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 15;
        doc.text('Signature : ___________________', 20, y);

        this.addFooter(doc);
        doc.save(`Charte_Engagement_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 4. Planning du formateur
    generateTrainerSchedule(trainerId) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const modules = api.trainers.getModules(trainerId);
        if (modules.length === 0) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Planning du Formateur');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Formateur : ${trainer.firstName} ${trainer.lastName}`, 20, y);
        y += 15;

        modules.forEach(mod => {
            const scheduleEntries = api.schedule.getByModule(mod.id);
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Module ${mod.order} : ${mod.name}`, 20, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`Durée : ${mod.duration} jours | Horaires : 16h-19h`, 20, y);
            y += 10;

            if (scheduleEntries.length > 0) {
                scheduleEntries.forEach(entry => {
                    const dateObj = new Date(entry.date + 'T00:00:00');
                    const dayName = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                    doc.text(`${dayName} : ${entry.startTime} - ${entry.endTime}`, 25, y);
                    y += 7;
                });
            } else {
                doc.text('Aucune date planifiée', 25, y);
                y += 7;
            }
            y += 10;

            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });

        this.addFooter(doc);
        doc.save(`Planning_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 5. Fiche de présence
    generateAttendanceSheet(date) {
        const students = api.students.getAll().filter(s => s.status === 'active');
        const attendance = api.attendance.getByDate(date);
        const scheduleEntry = api.schedule.getByDate(date);

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Fiche de Présence');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Date : ' + this.formatDate(date), 20, y);
        y += 10;

        if (scheduleEntry) {
            const module = api.modules.getById(scheduleEntry.moduleId);
            const trainer = module ? api.trainers.getById(module.trainerId) : null;
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Module : ${module ? module.name : 'Non défini'}`, 20, y);
            y += 7;
            doc.text(`Formateur : ${trainer ? trainer.firstName + ' ' + trainer.lastName : 'Non défini'}`, 20, y);
            y += 7;
            doc.text(`Horaires : ${scheduleEntry.startTime} - ${scheduleEntry.endTime}`, 20, y);
        }
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('LISTE DES ÉTUDIANTS', 20, y);
        y += 15;

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Nom', 20, y);
        doc.text('Email', 70, y);
        doc.text('Présence', 130, y);
        y += 10;

        doc.setFont(undefined, 'normal');
        students.forEach(student => {
            const status = attendance[student.id] || 'Non marqué';
            doc.text(`${student.firstName} ${student.lastName}`, 20, y);
            doc.text(student.email, 70, y);
            doc.text(status, 130, y);
            y += 8;

            if (y > 260) {
                doc.addPage();
                y = 20;
            }
        });

        this.addFooter(doc);
        doc.save(`Presence_${date}.pdf`);
    }

    // 6. Calcul des honoraires
    generateHonorariesCalculation(trainerId, hourlyRate = 15000) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const modules = api.trainers.getModules(trainerId);
        let totalHours = 0;

        modules.forEach(mod => {
            const scheduleEntries = api.schedule.getByModule(mod.id);
            totalHours += scheduleEntries.length * 3; // 3 hours per session
        });

        const totalAmount = totalHours * hourlyRate;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Calcul des Honoraires');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Formateur : ${trainer.firstName} ${trainer.lastName}`, 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Taux horaire : ${hourlyRate.toLocaleString('fr-FR')} FCFA/h`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('DÉTAIL DES HEURES', 20, y);
        y += 15;

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Module', 20, y);
        doc.text('Sessions', 80, y);
        doc.text('Heures', 110, y);
        doc.text('Montant', 140, y);
        y += 10;

        doc.setFont(undefined, 'normal');
        modules.forEach(mod => {
            const scheduleEntries = api.schedule.getByModule(mod.id);
            const hours = scheduleEntries.length * 3;
            const amount = hours * hourlyRate;

            doc.text(mod.name, 20, y);
            doc.text(scheduleEntries.length.toString(), 80, y);
            doc.text(hours.toString(), 110, y);
            doc.text(amount.toLocaleString('fr-FR') + ' FCFA', 140, y);
            y += 8;
        });

        y += 15;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL', 20, y);
        doc.text(totalHours.toString() + ' h', 110, y);
        doc.text(totalAmount.toLocaleString('fr-FR') + ' FCFA', 140, y);
        y += 20;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Document généré le ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);

        this.addFooter(doc);
        doc.save(`Honoraires_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 7. Remise des supports pédagogiques
    generateTeachingMaterialsReceipt(trainerId, moduleId) {
        const trainer = api.trainers.getById(trainerId);
        const module = api.modules.getById(moduleId);
        if (!trainer || !module) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Remise des Supports Pédagogiques');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('RECONNAISSANCE DE REMISE', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Je soussigné(e), ' + trainer.firstName + ' ' + trainer.lastName + ', certifie avoir remis', 20, y);
        y += 7;
        doc.text('les supports pédagogiques suivants pour le module :', 20, y);
        y += 10;

        doc.setFont(undefined, 'bold');
        doc.text(module.name, 20, y);
        y += 15;

        doc.setFont(undefined, 'normal');
        doc.text('Supports fournis :', 20, y);
        y += 10;
        const materials = [
            'Présentation PowerPoint',
            'Support de cours écrit',
            'Exercices pratiques',
            'Corrigés des exercices',
            'Ressources complémentaires'
        ];
        materials.forEach(mat => {
            doc.text('☐ ' + mat, 25, y);
            y += 7;
        });
        y += 15;

        doc.text('Date de remise : ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 15;
        doc.text('Signature du formateur : ___________________', 20, y);
        y += 10;
        doc.text('Signature du responsable : ___________________', 20, y);

        this.addFooter(doc);
        doc.save(`Supports_${module.name.replace(/\s+/g, '_')}.pdf`);
    }

    // 8. Rapport de fin de module
    generateModuleReport(moduleId) {
        const module = api.modules.getById(moduleId);
        if (!module) return null;

        const trainer = api.trainers.getById(module.trainerId);
        const scheduleEntries = api.schedule.getByModule(moduleId);
        const students = api.students.getAll().filter(s => s.status === 'active');

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Rapport de Fin de Module');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('INFORMATIONS GÉNÉRALES', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Module : ${module.name}`, 20, y);
        y += 7;
        doc.text(`Formateur : ${trainer ? trainer.firstName + ' ' + trainer.lastName : 'Non assigné'}`, 20, y);
        y += 7;
        doc.text(`Durée prévue : ${module.duration} jours`, 20, y);
        y += 7;
        doc.text(`Sessions effectuées : ${scheduleEntries.length}`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('CONTENU DU MODULE', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(module.description, 20, y, { maxWidth: 170 });
        y += 20;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('STATISTIQUES', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre d'étudiants : ${students.length}`, 20, y);
        y += 7;
        doc.text(`Taux de participation : À calculer`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('OBSERVATIONS DU FORMATEUR', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Niveau global des étudiants : ___________________', 20, y);
        y += 10;
        doc.text('Points forts observés : ___________________', 20, y);
        y += 10;
        doc.text('Axes d\'amélioration : ___________________', 20, y);
        y += 10;
        doc.text('Suggestions pour les modules suivants : ___________________', 20, y);
        y += 20;

        doc.text('Date du rapport : ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 15;
        doc.text('Signature du formateur : ___________________', 20, y);

        this.addFooter(doc);
        doc.save(`Rapport_${module.name.replace(/\s+/g, '_')}.pdf`);
    }

    // 9. Évaluation du formateur
    generateTrainerEvaluation(trainerId, moduleId) {
        const trainer = api.trainers.getById(trainerId);
        const module = api.modules.getById(moduleId);
        if (!trainer || !module) return null;

        const doc = new this.jsPDF();
        this.addHeader(doc, 'Évaluation du Formateur');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('FORMATEUR ÉVALUÉ', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`Nom : ${trainer.firstName} ${trainer.lastName}`, 20, y);
        y += 7;
        doc.text(`Module : ${module.name}`, 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('CRITÈRES D\'ÉVALUATION', 20, y);
        y += 15;

        const criteria = [
            ['Qualité pédagogique', '/5'],
            ['Clarté des explications', '/5'],
            ['Interaction avec les étudiants', '/5'],
            'Gestion du temps',
            ['Pertinence des exemples', '/5'],
            ['Qualité des supports', '/5'],
            ['Disponibilité', '/5'],
            ['Adaptabilité', '/5']
        ];

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Critère', 20, y);
        doc.text('Note', 120, y);
        y += 10;

        doc.setFont(undefined, 'normal');
        criteria.forEach(([criterion, max]) => {
            doc.text(criterion, 20, y);
            doc.text('___ ' + (max || ''), 120, y);
            y += 8;
        });
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('COMMENTAIRES', 20, y);
        y += 15;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Points forts :', 20, y);
        y += 10;
        doc.text('Points à améliorer :', 20, y);
        y += 10;
        doc.text('Recommandations :', 20, y);
        y += 20;

        doc.text('Date de l\'évaluation : ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 15;
        doc.text('Signature de l\'évaluateur : ___________________', 20, y);

        this.addFooter(doc);
        doc.save(`Evaluation_${trainer.firstName}_${trainer.lastName}.pdf`);
    }

    // 10. Attestation de collaboration
    generateCollaborationCertificate(trainerId) {
        const trainer = api.trainers.getById(trainerId);
        if (!trainer) return null;

        const modules = api.trainers.getModules(trainerId);
        const doc = new this.jsPDF();
        this.addHeader(doc, 'Attestation de Collaboration');

        let y = 60;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('ATTESTATION DE COLLABORATION', 20, y);
        y += 20;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Je soussigné(e), responsable de Digital Hub OS, atteste par la présente que :', 20, y);
        y += 15;

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`${trainer.firstName} ${trainer.lastName}`, 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Formateur spécialisé en ${trainer.specialty}`, 20, y);
        y += 15;

        doc.text('A collaboré avec notre établissement pour la formation de la cohorte 2026.', 20, y);
        y += 10;
        doc.text('Modules enseignés :', 20, y);
        y += 10;

        modules.forEach(mod => {
            doc.text(`• Module ${mod.order} : ${mod.name} (${mod.duration} jours)`, 25, y);
            y += 8;
        });
        y += 15;

        doc.text('Cette collaboration s\'est déroulée dans le cadre de notre programme de formation', 20, y);
        y += 7;
        doc.text('professionnelle et a fait l\'objet d\'une prestation de qualité.', 20, y);
        y += 20;

        doc.text('Fait à Bamako, le ' + this.formatDate(new Date().toISOString().split('T')[0]), 20, y);
        y += 20;

        doc.text('Signature du responsable : ___________________', 20, y);
        y += 10;
        doc.text('Cachet de l\'établissement : ___________________', 20, y);

        this.addFooter(doc);
        doc.save(`Attestation_${trainer.firstName}_${trainer.lastName}.pdf`);
    }
}
